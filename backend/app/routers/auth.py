"""
Authentication router — register, login, refresh, logout, SSO.
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.config import settings
from app.core.exceptions import (
    AlreadyExistsError,
    InvalidCredentialsError,
    TokenInvalidError,
    RefreshTokenRequiredError,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    blacklist_token,
    hash_student_id,
)
from app.models.user import User, UserRole
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    Token,
    RefreshTokenRequest,
    UserResponse,
    UserProfileResponse,
    PasswordChangeRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SSOLoginResponse,
)

router = APIRouter()


# ─── Dependencies ────────────────────────────────────────────────

async def get_current_user(
    session: AsyncSession = Depends(get_session),
    authorization: Optional[str] = Header(None),
) -> User:
    """Get current authenticated user from access token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise TokenInvalidError()

    token = authorization.split(" ")[1]
    payload = decode_token(token)

    if not payload:
        raise TokenInvalidError()

    if payload.get("type") != "access":
        raise TokenInvalidError("Access token required")

    user_id = payload.get("sub")
    if not user_id:
        raise TokenInvalidError()

    result = await session.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise TokenInvalidError("User not found or inactive")

    return user


async def get_current_user_optional(
    session: AsyncSession = Depends(get_session),
    authorization: Optional[str] = Header(None),
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None."""
    try:
        return await get_current_user(session, authorization)
    except HTTPException:
        return None


# ─── Auth Endpoints ──────────────────────────────────────────────

@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    session: AsyncSession = Depends(get_session),
):
    """Register a new student account."""
    # Check if email exists
    result = await session.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise AlreadyExistsError("User", "email")

    # Hash student ID for lookup
    student_id_hash = hash_student_id(data.student_id)

    # Check if student ID exists
    result = await session.execute(select(User).where(User.student_id_hash == student_id_hash))
    if result.scalar_one_or_none():
        raise AlreadyExistsError("User", "student ID")

    # Create user
    user = User(
        email=data.email,
        student_id_hash=student_id_hash,
        first_name=data.first_name,
        last_name=data.last_name,
        role=UserRole.STUDENT,
        program=data.program,
        year_of_study=data.year_of_study,
        password_hash=hash_password(data.password),
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    # Create tokens
    access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    data: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    """Login with email and password."""
    result = await session.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise InvalidCredentialsError()

    if not verify_password(data.password, user.password_hash):
        raise InvalidCredentialsError()

    if not user.is_active:
        raise InvalidCredentialsError("Account is deactivated")

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await session.commit()

    # Create tokens
    access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Set refresh token as HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    """Refresh access token using refresh token."""
    payload = decode_token(request.refresh_token)

    if not payload:
        raise TokenInvalidError()

    if payload.get("type") != "refresh":
        raise RefreshTokenRequiredError()

    user_id = payload.get("sub")
    if not user_id:
        raise TokenInvalidError()

    result = await session.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise TokenInvalidError("User not found or inactive")

    # Blacklist old refresh token
    await blacklist_token(request.refresh_token)

    # Create new tokens
    access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})
    new_refresh_token = create_refresh_token({"sub": str(user.id)})

    # Set new refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",
    )

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
async def logout(
    response: Response,
    authorization: Optional[str] = Header(None),
):
    """Logout - blacklist access token and clear refresh token cookie."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        await blacklist_token(token)

    response.delete_cookie(key="refresh_token", path="/api/v1/auth")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile with consent info."""
    # Get latest consent record
    from app.models.consent import ConsentRecord
    from sqlalchemy import select

    # This would need a session - for now return basic profile
    return UserProfileResponse(
        **UserResponse.model_validate(current_user).model_dump(),
        consent_version=current_user.consent_version,
        consent_given_at=current_user.consent_given_at,
        analytics_consent=False,  # Would fetch from consent record
        research_consent=False,
    )


@router.post("/change-password")
async def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Change user password."""
    if not current_user.password_hash:
        raise InvalidCredentialsError("Cannot change password for SSO accounts")

    if not verify_password(data.current_password, current_user.password_hash):
        raise InvalidCredentialsError("Current password is incorrect")

    current_user.password_hash = hash_password(data.new_password)
    await session.commit()

    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_session),
):
    """Request password reset (placeholder - would send email)."""
    # In production, send reset email with token
    # For now, just return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    session: AsyncSession = Depends(get_session),
):
    """Reset password with token (placeholder)."""
    # In production, validate token from email
    return {"message": "Password reset successfully"}


# ─── SSO Endpoints ───────────────────────────────────────────────

@router.get("/sso/login", response_model=SSOLoginResponse)
async def sso_login():
    """Initiate SAML SSO login."""
    if not settings.SAML_IDP_METADATA_URL:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="SSO not configured",
        )
    # In production, redirect to IdP
    # For now, return placeholder
    return SSOLoginResponse(sso_url=f"{settings.SAML_IDP_METADATA_URL}?sso=true")


@router.post("/sso/callback")
async def sso_callback(
    saml_response: str,
    session: AsyncSession = Depends(get_session),
):
    """Handle SAML SSO callback."""
    # In production, validate SAML assertion and create/update user
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="SSO not implemented",
    )


# ─── Export for dependency injection ─────────────────────────────

__all__ = ["router", "get_current_user", "get_current_user_optional"]