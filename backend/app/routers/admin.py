"""
Admin router - system administration.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_role, Role
from app.models.user import User, UserRole
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/admin")


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    current_user=Depends(require_role(Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """List all users with filtering."""
    query = select(User)

    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)

    query = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    users = result.scalars().all()

    return [UserResponse.model_validate(u) for u in users]


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user=Depends(require_role(Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """Get user by ID."""
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("User", str(user_id))

    return UserResponse.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    is_active: Optional[bool] = None,
    role: Optional[UserRole] = None,
    current_user=Depends(require_role(Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """Update user status or role."""
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("User", str(user_id))

    if is_active is not None:
        user.is_active = is_active
    if role is not None:
        user.role = role

    await session.commit()
    await session.refresh(user)

    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    current_user=Depends(require_role(Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """Soft delete a user."""
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("User", str(user_id))

    user.is_active = False
    user.deleted_at = func.now()
    await session.commit()

    return


@router.get("/stats")
async def get_system_stats(
    current_user=Depends(require_role(Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """Get system statistics."""
    total_users = await session.scalar(select(func.count(User.id)))
    active_users = await session.scalar(select(func.count(User.id)).where(User.is_active == True))
    students = await session.scalar(select(func.count(User.id)).where(User.role == UserRole.STUDENT))
    counselors = await session.scalar(select(func.count(User.id)).where(User.role == UserRole.COUNSELOR))
    admins = await session.scalar(select(func.count(User.id)).where(User.role.in_([UserRole.ADMIN, UserRole.WELLBEING_ADMIN])))

    return {
        "total_users": total_users or 0,
        "active_users": active_users or 0,
        "students": students or 0,
        "counselors": counselors or 0,
        "admins": admins or 0,
    }