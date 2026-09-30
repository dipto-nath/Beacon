"""
Assessments router.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission
from app.models.assessment import Assessment, AssessmentType
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentResponse,
    AssessmentDetailResponse,
    AssessmentListResponse,
)

router = APIRouter()


@router.post("", response_model=AssessmentDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    data: AssessmentCreate,
    current_user=Depends(require_permission(Permission.CREATE_ASSESSMENT)),
    session: AsyncSession = Depends(get_session),
):
    """Submit a periodic assessment."""
    assessment = Assessment(
        student_id=current_user.id,
        assessment_type=data.assessment_type,
        responses=data.responses,
        support_level="self_guided",  # Will be computed by service
    )

    session.add(assessment)
    await session.commit()
    await session.refresh(assessment)

    return AssessmentDetailResponse.model_validate(assessment)


@router.get("", response_model=AssessmentListResponse)
async def get_assessments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_permission(Permission.VIEW_OWN_ASSESSMENTS)),
    session: AsyncSession = Depends(get_session),
):
    """Get assessment history with pagination."""
    query = select(Assessment).where(Assessment.student_id == current_user.id)

    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)

    query = query.order_by(Assessment.completed_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    assessments = result.scalars().all()

    return AssessmentListResponse(
        data=[AssessmentResponse.model_validate(a) for a in assessments],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.get("/latest", response_model=AssessmentDetailResponse)
async def get_latest_assessment(
    current_user=Depends(require_permission(Permission.VIEW_OWN_ASSESSMENTS)),
    session: AsyncSession = Depends(get_session),
):
    """Get most recent assessment result."""
    result = await session.execute(
        select(Assessment)
        .where(Assessment.student_id == current_user.id)
        .order_by(Assessment.completed_at.desc())
        .limit(1)
    )
    assessment = result.scalar_one_or_none()

    if not assessment:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Assessment", "latest")

    return AssessmentDetailResponse.model_validate(assessment)


@router.get("/{assessment_id}", response_model=AssessmentDetailResponse)
async def get_assessment(
    assessment_id: UUID,
    current_user=Depends(require_permission(Permission.VIEW_OWN_ASSESSMENTS)),
    session: AsyncSession = Depends(get_session),
):
    """Get a single assessment by ID."""
    result = await session.execute(
        select(Assessment).where(
            Assessment.id == assessment_id,
            Assessment.student_id == current_user.id,
        )
    )
    assessment = result.scalar_one_or_none()

    if not assessment:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Assessment", str(assessment_id))

    return AssessmentDetailResponse.model_validate(assessment)