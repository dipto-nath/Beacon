"""
Counseling router.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission, require_role, Role
from app.models.counseling import CounselingRequest, Appointment, CounselingRequestStatus, SessionMode, AppointmentStatus
from app.models.user import User
from app.schemas.counseling import (
    CounselingRequestCreate,
    CounselingRequestResponse,
    CounselingRequestListResponse,
    CounselorProfileResponse,
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentCancelRequest,
    CounselingRequestAssignRequest,
    AppointmentUpdateRequest,
)

router = APIRouter()


@router.get("/counselors", response_model=List[CounselorProfileResponse])
async def get_counselors(
    current_user=Depends(require_permission(Permission.VIEW_COUNSELORS)),
    session: AsyncSession = Depends(get_session),
):
    """List available counselors with next availability."""
    result = await session.execute(
        select(User)
        .where(User.role == "counselor", User.is_active == True)
        .order_by(User.first_name)
    )
    counselors = result.scalars().all()

    profiles = []
    for c in counselors:
        # Get next appointment
        next_appt = await session.execute(
            select(Appointment)
            .where(
                Appointment.counselor_id == c.id,
                Appointment.status == AppointmentStatus.UPCOMING,
                Appointment.scheduled_at > func.now(),
            )
            .order_by(Appointment.scheduled_at)
            .limit(1)
        )
        next_appt = next_appt.scalar_one_or_none()

        profiles.append(CounselorProfileResponse(
            id=c.id,
            name=f"{c.first_name} {c.last_name}",
            title=c.program or "Counselor",
            specializations=[],  # Would come from a specialization table
            availability="available" if not next_appt else "limited",
            next_slot=next_appt.scheduled_at.isoformat() if next_appt else None,
            mode=[SessionMode.ONLINE, SessionMode.IN_PERSON],
        ))

    return profiles


@router.post("/requests", response_model=CounselingRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_counseling_request(
    data: CounselingRequestCreate,
    current_user=Depends(require_permission(Permission.CREATE_COUNSELING_REQUEST)),
    session: AsyncSession = Depends(get_session),
):
    """Submit a counseling request."""
    request = CounselingRequest(
        student_id=current_user.id,
        preferred_mode=data.preferred_mode,
        preferred_times=data.preferred_times,
        reason=data.reason,
        status=CounselingRequestStatus.PENDING,
    )

    session.add(request)
    await session.commit()
    await session.refresh(request)

    return CounselingRequestResponse.model_validate(request)


@router.get("/requests", response_model=CounselingRequestListResponse)
async def get_counseling_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_permission(Permission.CREATE_COUNSELING_REQUEST)),
    session: AsyncSession = Depends(get_session),
):
    """Get own counseling requests."""
    query = select(CounselingRequest).where(CounselingRequest.student_id == current_user.id)

    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)

    query = query.order_by(CounselingRequest.requested_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    requests = result.scalars().all()

    return CounselingRequestListResponse(
        data=[CounselingRequestResponse.model_validate(r) for r in requests],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_counseling_request(
    request_id: UUID,
    current_user=Depends(require_permission(Permission.CREATE_COUNSELING_REQUEST)),
    session: AsyncSession = Depends(get_session),
):
    """Cancel a pending counseling request."""
    result = await session.execute(
        select(CounselingRequest).where(
            CounselingRequest.id == request_id,
            CounselingRequest.student_id == current_user.id,
        )
    )
    request = result.scalar_one_or_none()

    if not request:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Counseling request", str(request_id))

    if request.status != CounselingRequestStatus.PENDING:
        from app.core.exceptions import ValidationError
        raise ValidationError("Only pending requests can be cancelled")

    request.status = CounselingRequestStatus.CANCELLED
    await session.commit()

    return