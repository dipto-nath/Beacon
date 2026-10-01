"""
Check-ins router.
"""
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.exceptions import CheckInLimitError, NotFoundError
from app.core.permissions import require_permission, Permission
from app.models.check_in import CheckIn, SupportLevel
from app.schemas.check_in import (
    CheckInCreate,
    CheckInUpdate,
    CheckInResponse,
    CheckInListResponse,
    CheckInStreakResponse,
    CheckInInsightResponse,
)
from app.services.ai import generate_insight_from_checkins

router = APIRouter()


@router.get("/insight", response_model=CheckInInsightResponse)
async def get_insight(
    current_user=Depends(require_permission(Permission.VIEW_OWN_CHECK_INS)),
    session: AsyncSession = Depends(get_session),
):
    """Get AI-generated insight based on recent check-ins."""
    result = await session.execute(
        select(CheckIn)
        .where(CheckIn.student_id == current_user.id)
        .order_by(CheckIn.completed_at.desc())
        .limit(7)
    )
    check_ins = list(result.scalars().all())
    
    insight_text = generate_insight_from_checkins(check_ins)
    return CheckInInsightResponse(insight=insight_text)


@router.post("", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
async def create_check_in(
    data: CheckInCreate,
    current_user=Depends(require_permission(Permission.CREATE_CHECK_IN)),
    session: AsyncSession = Depends(get_session),
):
    """Submit a daily check-in."""
    today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
    today_end = today_start + timedelta(days=1)

    result = await session.execute(
        select(CheckIn).where(
            and_(
                CheckIn.student_id == current_user.id,
                CheckIn.completed_at >= today_start,
                CheckIn.completed_at < today_end,
            )
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise CheckInLimitError()

    check_in = CheckIn(
        student_id=current_user.id,
        mood=data.mood,
        stress=data.stress,
        energy=data.energy,
        sleep=data.sleep,
        tags=data.tags,
        note=data.note,
        support_level=SupportLevel.SELF_GUIDED,
    )

    session.add(check_in)
    await session.commit()
    await session.refresh(check_in)

    return CheckInResponse.model_validate(check_in)


@router.get("", response_model=CheckInListResponse)
async def get_check_ins(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user=Depends(require_permission(Permission.VIEW_OWN_CHECK_INS)),
    session: AsyncSession = Depends(get_session),
):
    """Get check-in history with pagination and date filtering."""
    query = select(CheckIn).where(CheckIn.student_id == current_user.id)

    if start_date:
        start_dt = datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        query = query.where(CheckIn.completed_at >= start_dt)

    if end_date:
        end_dt = datetime.combine(end_date, datetime.max.time()).replace(tzinfo=timezone.utc)
        query = query.where(CheckIn.completed_at <= end_dt)

    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)

    query = query.order_by(CheckIn.completed_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    check_ins = result.scalars().all()

    return CheckInListResponse(
        data=[CheckInResponse.model_validate(ci) for ci in check_ins],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.get("/streak", response_model=CheckInStreakResponse)
async def get_streak(
    current_user=Depends(require_permission(Permission.VIEW_OWN_CHECK_INS)),
    session: AsyncSession = Depends(get_session),
):
    """Get current and longest check-in streak."""
    result = await session.execute(
        select(CheckIn.completed_at)
        .where(CheckIn.student_id == current_user.id)
        .order_by(CheckIn.completed_at.desc())
    )
    check_ins = result.scalars().all()

    if not check_ins:
        return CheckInStreakResponse(current_streak=0, longest_streak=0)

    dates = [ci.date() for ci in check_ins]
    current_streak = 0
    longest_streak = 0
    temp_streak = 1

    today = date.today()
    yesterday = today - timedelta(days=1)

    if dates[0] == today or dates[0] == yesterday:
        current_streak = 1
        for i in range(1, len(dates)):
            if dates[i-1] - dates[i] == timedelta(days=1):
                current_streak += 1
            else:
                break

    for i in range(1, len(dates)):
        if dates[i-1] - dates[i] == timedelta(days=1):
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1

    longest_streak = max(longest_streak, temp_streak, current_streak)

    return CheckInStreakResponse(
        current_streak=current_streak,
        longest_streak=longest_streak,
        last_check_in_date=dates[0] if dates else None,
    )


@router.get("/{check_in_id}", response_model=CheckInResponse)
async def get_check_in(
    check_in_id: UUID,
    current_user=Depends(require_permission(Permission.VIEW_OWN_CHECK_INS)),
    session: AsyncSession = Depends(get_session),
):
    """Get a single check-in by ID."""
    result = await session.execute(
        select(CheckIn).where(
            and_(CheckIn.id == check_in_id, CheckIn.student_id == current_user.id)
        )
    )
    check_in = result.scalar_one_or_none()

    if not check_in:
        raise NotFoundError("Check-in", str(check_in_id))

    return CheckInResponse.model_validate(check_in)


@router.patch("/{check_in_id}", response_model=CheckInResponse)
async def update_check_in(
    check_in_id: UUID,
    data: CheckInUpdate,
    current_user=Depends(require_permission(Permission.VIEW_OWN_CHECK_INS)),
    session: AsyncSession = Depends(get_session),
):
    """Update check-in note (only note can be updated)."""
    result = await session.execute(
        select(CheckIn).where(
            and_(CheckIn.id == check_in_id, CheckIn.student_id == current_user.id)
        )
    )
    check_in = result.scalar_one_or_none()

    if not check_in:
        raise NotFoundError("Check-in", str(check_in_id))

    if data.note is not None:
        check_in.note = data.note
        await session.commit()
        await session.refresh(check_in)

    return CheckInResponse.model_validate(check_in)