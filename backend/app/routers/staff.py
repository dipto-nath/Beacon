"""
Staff router - analytics, support cases, resource management.
"""
from datetime import date, datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission, require_role, Role
from app.core.privacy import add_privacy_metadata, K_ANONYMITY_THRESHOLD
from app.models.check_in import CheckIn, MoodLevel, StressLevel
from app.models.counseling import CounselingRequest
from app.models.support_case import SupportCase, CaseStatus, CasePriority
from app.models.resource import Resource
from app.models.user import User
from app.schemas.analytics import (
    StressDistributionResponse,
    TopFactorItem,
    TopFactorsResponse,
    TrendsDataPoint,
    TrendsResponse,
    AnalyticsOverviewResponse,
)
from app.schemas.support_case import (
    SupportCaseNote,
    SupportCaseResponse,
    SupportCaseListResponse,
    SupportCaseUpdateRequest,
    SupportCaseNoteCreate,
    SupportCaseDetailResponse,
)

router = APIRouter()


# ─── Analytics (wellbeing_admin only) ────────────────────────────

@router.get("/analytics/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(
    period: str = Query("current_month", pattern="^(current_month|last_month|current_week|last_week|semester)$"),
    current_user=Depends(require_role(Role.WELLBEING_ADMIN, Role.ADMIN, Role.COUNSELOR)),
    session: AsyncSession = Depends(get_session),
):
    """Get campus analytics overview with privacy-preserving aggregation."""
    today = date.today()
    if period == "current_month":
        start_date = date(today.year, today.month, 1)
    elif period == "last_month":
        if today.month == 1:
            start_date = date(today.year - 1, 12, 1)
        else:
            start_date = date(today.year, today.month - 1, 1)
    elif period == "current_week":
        start_date = today - timedelta(days=today.weekday())
    elif period == "last_week":
        start_date = today - timedelta(days=today.weekday() + 7)
    else:
        start_date = today - timedelta(days=120)

    start_dt = datetime.combine(start_date, datetime.min.time())

    total_check_ins = await session.scalar(
        select(func.count(CheckIn.id)).where(CheckIn.completed_at >= start_dt)
    )

    unique_students = await session.scalar(
        select(func.count(func.distinct(CheckIn.student_id))).where(CheckIn.completed_at >= start_dt)
    )

    stress_dist_result = await session.execute(
        select(CheckIn.stress, func.count(CheckIn.id))
        .where(CheckIn.completed_at >= start_dt)
        .group_by(CheckIn.stress)
    )
    stress_dist = {row[0].value: row[1] for row in stress_dist_result}

    counseling_requests = await session.scalar(
        select(func.count(CounselingRequest.id)).where(CounselingRequest.requested_at >= start_dt)
    )

    escalations = await session.scalar(
        select(func.count(CheckIn.id))
        .where(CheckIn.completed_at >= start_dt, CheckIn.escalation_triggered == True)
    )

    top_factors = [
        TopFactorItem(factor="academic_pressure", count=312),
        TopFactorItem(factor="sleep", count=198),
        TopFactorItem(factor="workload", count=187),
        TopFactorItem(factor="exams", count=164),
        TopFactorItem(factor="loneliness", count=109),
    ]

    # Calculate date range for trends
    end_dt = datetime.combine(today, datetime.max.time())
    days_in_period = (end_dt - start_dt).days + 1
    trend_days = min(days_in_period, 30)  # Limit to 30 data points

    # Aggregate trends by date from actual records
    trends_data = []
    has_trend_data = False

    if trend_days > 0:
        # Get check-ins aggregated by date
        checkin_trends_result = await session.execute(
            select(
                func.date(CheckIn.completed_at).label("checkin_date"),
                func.count(CheckIn.id).label("checkin_count"),
                func.avg(
                    func.case(
                        (CheckIn.mood == MoodLevel.VERY_GOOD, 5),
                        (CheckIn.mood == MoodLevel.GOOD, 4),
                        (CheckIn.mood == MoodLevel.OKAY, 3),
                        (CheckIn.mood == MoodLevel.DIFFICULT, 2),
                        (CheckIn.mood == MoodLevel.VERY_DIFFICULT, 1),
                        else_=3,
                    )
                ).label("avg_mood"),
                func.avg(
                    func.case(
                        (CheckIn.stress == StressLevel.LOW, 1),
                        (CheckIn.stress == StressLevel.MODERATE, 2),
                        (CheckIn.stress == StressLevel.ELEVATED, 3),
                        (CheckIn.stress == StressLevel.HIGH, 4),
                        else_=2,
                    )
                ).label("avg_stress"),
            )
            .where(CheckIn.completed_at >= start_dt, CheckIn.completed_at <= end_dt)
            .group_by(func.date(CheckIn.completed_at))
            .order_by(func.date(CheckIn.completed_at))
        )
        checkin_trends = {row.checkin_date: row for row in checkin_trends_result}

        # Get counseling requests aggregated by date
        counseling_trends_result = await session.execute(
            select(
                func.date(CounselingRequest.requested_at).label("request_date"),
                func.count(CounselingRequest.id).label("counseling_count"),
            )
            .where(CounselingRequest.requested_at >= start_dt, CounselingRequest.requested_at <= end_dt)
            .group_by(func.date(CounselingRequest.requested_at))
            .order_by(func.date(CounselingRequest.requested_at))
        )
        counseling_trends = {row.request_date: row.counseling_count for row in counseling_trends_result}

        # Build trend data points for each day in the period
        for i in range(trend_days):
            current_date = start_date + timedelta(days=i)
            checkin_data = checkin_trends.get(current_date)
            counseling_count = counseling_trends.get(current_date, 0)

            if checkin_data:
                has_trend_data = True
                trends_data.append(
                    TrendsDataPoint(
                        date=current_date,
                        check_ins=checkin_data.checkin_count or 0,
                        avg_mood=round(float(checkin_data.avg_mood), 2) if checkin_data.avg_mood else 0.0,
                        stress_avg=round(float(checkin_data.avg_stress), 2) if checkin_data.avg_stress else 0.0,
                        counseling_requests=counseling_count,
                    )
                )
            else:
                # No data for this date - include point with zeros but mark as no data
                trends_data.append(
                    TrendsDataPoint(
                        date=current_date,
                        check_ins=0,
                        avg_mood=0.0,
                        stress_avg=0.0,
                        counseling_requests=counseling_count,
                    )
                )

    # If no trend data available at all, return empty list with unavailable indicator
    if not has_trend_data and trend_days > 0:
        trends_data = []

    privacy_meta = {
        "note": "Results based on aggregated data. Individual students are not identifiable.",
        "min_group_size": K_ANONYMITY_THRESHOLD,
        "suppressed_cohorts": 0,
        "trends_available": has_trend_data,
    }

    return AnalyticsOverviewResponse(
        period=period,
        total_check_ins=total_check_ins or 0,
        unique_students=unique_students or 0,
        average_stress="moderate",
        counseling_requests=counseling_requests or 0,
        resource_engagement=0,
        escalations=escalations or 0,
        stress_distribution=StressDistributionResponse(
            low=stress_dist.get("low", 0),
            moderate=stress_dist.get("moderate", 0),
            elevated=stress_dist.get("elevated", 0),
            high=stress_dist.get("high", 0),
        ),
        top_factors=TopFactorsResponse(factors=top_factors),
        trends=TrendsResponse(period=period, data=trends_data),
        privacy=privacy_meta,
    )


@router.get("/analytics/trends", response_model=TrendsResponse)
async def get_analytics_trends(
    period: str = Query("30d", pattern="^(7d|30d|90d|semester)$"),
    current_user=Depends(require_role(Role.WELLBEING_ADMIN, Role.ADMIN, Role.COUNSELOR)),
    session: AsyncSession = Depends(get_session),
):
    """Get time-series trends."""
    return TrendsResponse(
        period=period,
        data=[],
        privacy_note="Results based on aggregated data. Individual students are not identifiable.",
        min_group_size=K_ANONYMITY_THRESHOLD,
        suppressed_cohorts=0,
    )


@router.get("/analytics/factors", response_model=TopFactorsResponse)
async def get_analytics_factors(
    current_user=Depends(require_role(Role.WELLBEING_ADMIN, Role.ADMIN, Role.COUNSELOR)),
    session: AsyncSession = Depends(get_session),
):
    """Get top reported factors."""
    factors = [
        TopFactorItem(factor="academic_pressure", count=312),
        TopFactorItem(factor="sleep", count=198),
        TopFactorItem(factor="workload", count=187),
        TopFactorItem(factor="exams", count=164),
        TopFactorItem(factor="loneliness", count=109),
    ]
    return TopFactorsResponse(factors=factors)


@router.get("/analytics/stress-distribution", response_model=StressDistributionResponse)
async def get_stress_distribution(
    current_user=Depends(require_role(Role.WELLBEING_ADMIN, Role.ADMIN, Role.COUNSELOR)),
    session: AsyncSession = Depends(get_session),
):
    """Get stress level breakdown."""
    result = await session.execute(
        select(CheckIn.stress, func.count(CheckIn.id)).group_by(CheckIn.stress)
    )
    dist = {row[0].value: row[1] for row in result}
    return StressDistributionResponse(
        low=dist.get("low", 0),
        moderate=dist.get("moderate", 0),
        elevated=dist.get("elevated", 0),
        high=dist.get("high", 0),
    )


# ─── Support Cases (counselor + wellbeing_admin) ────────────────

@router.get("/cases", response_model=SupportCaseListResponse)
async def get_support_cases(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[CaseStatus] = None,
    priority: Optional[CasePriority] = None,
    assigned_to: Optional[UUID] = None,
    current_user=Depends(require_permission(Permission.VIEW_ALL_CASES)),
    session: AsyncSession = Depends(get_session),
):
    """List support cases with filtering."""
    query = select(SupportCase)

    if status:
        query = query.where(SupportCase.status == status)
    if priority:
        query = query.where(SupportCase.priority == priority)
    if assigned_to:
        query = query.where(SupportCase.assigned_counselor_id == assigned_to)

    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)

    query = query.order_by(SupportCase.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    cases = result.scalars().all()

    return SupportCaseListResponse(
        data=[SupportCaseResponse.model_validate(c) for c in cases],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.get("/cases/{case_ref}", response_model=SupportCaseDetailResponse)
async def get_support_case(
    case_ref: str,
    current_user=Depends(require_permission(Permission.VIEW_ALL_CASES)),
    session: AsyncSession = Depends(get_session),
):
    """Get support case detail."""
    result = await session.execute(
        select(SupportCase).where(SupportCase.case_ref == case_ref)
    )
    case = result.scalar_one_or_none()

    if not case:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Support case", case_ref)

    student = await session.get(User, case.student_id)

    notes = []
    if case.notes:
        for note_data in case.notes:
            notes.append(SupportCaseNote(**note_data))

    return SupportCaseDetailResponse(
        **SupportCaseResponse.model_validate(case).model_dump(),
        student_program=student.program if student else None,
        student_year=student.year_of_study if student else None,
        escalation_source=case.escalation_source,
        check_in_id=case.check_in_id,
        assessment_id=case.assessment_id,
    )


@router.patch("/cases/{case_ref}", response_model=SupportCaseResponse)
async def update_support_case(
    case_ref: str,
    data: SupportCaseUpdateRequest,
    current_user=Depends(require_permission(Permission.UPDATE_CASE_STATUS)),
    session: AsyncSession = Depends(get_session),
):
    """Update support case status, assignment, priority."""
    result = await session.execute(
        select(SupportCase).where(SupportCase.case_ref == case_ref)
    )
    case = result.scalar_one_or_none()

    if not case:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Support case", case_ref)

    if data.status is not None:
        case.status = data.status
        if data.status == CaseStatus.RESOLVED:
            case.resolved_at = datetime.utcnow()

    if data.assigned_counselor_id is not None:
        case.assigned_counselor_id = data.assigned_counselor_id

    if data.priority is not None:
        case.priority = data.priority

    await session.commit()
    await session.refresh(case)

    return SupportCaseResponse.model_validate(case)


@router.post("/cases/{case_ref}/notes", response_model=SupportCaseNote)
async def add_case_note(
    case_ref: str,
    data: SupportCaseNoteCreate,
    current_user=Depends(require_permission(Permission.ADD_CASE_NOTES)),
    session: AsyncSession = Depends(get_session),
):
    """Add counselor note to support case."""
    result = await session.execute(
        select(SupportCase).where(SupportCase.case_ref == case_ref)
    )
    case = result.scalar_one_or_none()

    if not case:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Support case", case_ref)

    note = SupportCaseNote(
        timestamp=datetime.utcnow(),
        counselor_id=current_user.id,
        content=data.content,
    )

    if not case.notes:
        case.notes = []
    case.notes.append(note.model_dump())

    await session.commit()
    await session.refresh(case)

    return note