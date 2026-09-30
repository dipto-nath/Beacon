"""
Recommendations router.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission
from app.models.recommendation import Recommendation
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationListResponse,
    DismissRecommendationRequest,
    ClickRecommendationRequest,
)

router = APIRouter()


@router.get("", response_model=RecommendationListResponse)
async def get_recommendations(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    include_dismissed: bool = Query(False),
    current_user=Depends(require_permission(Permission.VIEW_OWN_RECOMMENDATIONS)),
    session: AsyncSession = Depends(get_session),
):
    """Get personalized recommendations."""
    query = select(Recommendation).where(Recommendation.student_id == current_user.id)

    if not include_dismissed:
        query = query.where(Recommendation.dismissed == False)

    # Filter out expired
    from datetime import datetime, timezone
    query = query.where(
        (Recommendation.expires_at == None) | (Recommendation.expires_at > datetime.now(timezone.utc))
    )

    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)

    query = query.order_by(Recommendation.generated_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    recommendations = result.scalars().all()

    return RecommendationListResponse(
        data=[RecommendationResponse.model_validate(r) for r in recommendations],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.post("/{recommendation_id}/dismiss", response_model=RecommendationResponse)
async def dismiss_recommendation(
    recommendation_id: UUID,
    _: DismissRecommendationRequest,
    current_user=Depends(require_permission(Permission.DISMISS_RECOMMENDATION)),
    session: AsyncSession = Depends(get_session),
):
    """Dismiss a recommendation."""
    result = await session.execute(
        select(Recommendation).where(
            Recommendation.id == recommendation_id,
            Recommendation.student_id == current_user.id,
        )
    )
    recommendation = result.scalar_one_or_none()

    if not recommendation:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Recommendation", str(recommendation_id))

    recommendation.dismissed = True
    await session.commit()
    await session.refresh(recommendation)

    return RecommendationResponse.model_validate(recommendation)


@router.post("/{recommendation_id}/click", response_model=RecommendationResponse)
async def click_recommendation(
    recommendation_id: UUID,
    _: ClickRecommendationRequest,
    current_user=Depends(require_permission(Permission.VIEW_OWN_RECOMMENDATIONS)),
    session: AsyncSession = Depends(get_session),
):
    """Track recommendation click."""
    result = await session.execute(
        select(Recommendation).where(
            Recommendation.id == recommendation_id,
            Recommendation.student_id == current_user.id,
        )
    )
    recommendation = result.scalar_one_or_none()

    if not recommendation:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Recommendation", str(recommendation_id))

    recommendation.clicked = True
    await session.commit()
    await session.refresh(recommendation)

    return RecommendationResponse.model_validate(recommendation)