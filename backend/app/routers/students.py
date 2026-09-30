"""
Students router - general student endpoints.
"""
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission
from app.models.user import User
from app.schemas.auth import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(require_permission(Permission.VIEW_OWN_CHECK_INS)),
):
    """Get current student's profile."""
    return UserResponse.model_validate(current_user)