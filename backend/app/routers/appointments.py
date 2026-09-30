"""
Appointments router.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission
from app.models.counseling import Appointment, AppointmentStatus
from app.schemas.counseling import (
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentCancelRequest,
)

router = APIRouter()


@router.get("", response_model=AppointmentListResponse)
async def get_appointments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[AppointmentStatus] = None,
    current_user=Depends(require_permission(Permission.VIEW_OWN_APPOINTMENTS)),
    session: AsyncSession = Depends(get_session),
):
    """Get own appointments."""
    query = select(Appointment).where(Appointment.student_id == current_user.id)

    if status_filter:
        query = query.where(Appointment.status == status_filter)

    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)

    query = query.order_by(Appointment.scheduled_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    appointments = result.scalars().all()

    # Build response with counselor names
    data = []
    for appt in appointments:
        counselor = await session.get(Appointment.counselor.property.mapper.class_, appt.counselor_id)
        data.append(AppointmentResponse(
            id=appt.id,
            counselor_id=appt.counselor_id,
            counselor_name=f"{counselor.first_name} {counselor.last_name}" if counselor else "Unknown",
            student_id=appt.student_id,
            date=appt.scheduled_at,
            time=appt.scheduled_at.strftime("%H:%M"),
            duration=appt.duration_minutes,
            mode=appt.mode,
            status=appt.status,
            location=appt.location,
            meeting_link=appt.meeting_link,
        ))

    return AppointmentListResponse(
        data=data,
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    current_user=Depends(require_permission(Permission.VIEW_OWN_APPOINTMENTS)),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific appointment."""
    result = await session.execute(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.student_id == current_user.id,
        )
    )
    appointment = result.scalar_one_or_none()

    if not appointment:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Appointment", str(appointment_id))

    counselor = await session.get(Appointment.counselor.property.mapper.class_, appointment.counselor_id)

    return AppointmentResponse(
        id=appointment.id,
        counselor_id=appointment.counselor_id,
        counselor_name=f"{counselor.first_name} {counselor.last_name}" if counselor else "Unknown",
        student_id=appointment.student_id,
        date=appointment.scheduled_at,
        time=appointment.scheduled_at.strftime("%H:%M"),
        duration=appointment.duration_minutes,
        mode=appointment.mode,
        status=appointment.status,
        location=appointment.location,
        meeting_link=appointment.meeting_link,
    )


@router.post("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: UUID,
    data: AppointmentCancelRequest,
    current_user=Depends(require_permission(Permission.CANCEL_OWN_APPOINTMENT)),
    session: AsyncSession = Depends(get_session),
):
    """Cancel an upcoming appointment."""
    result = await session.execute(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.student_id == current_user.id,
        )
    )
    appointment = result.scalar_one_or_none()

    if not appointment:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Appointment", str(appointment_id))

    if appointment.status != AppointmentStatus.UPCOMING:
        from app.core.exceptions import ValidationError
        raise ValidationError("Only upcoming appointments can be cancelled")

    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_at = func.now()
    appointment.cancellation_reason = data.reason

    await session.commit()
    await session.refresh(appointment)

    counselor = await session.get(Appointment.counselor.property.mapper.class_, appointment.counselor_id)

    return AppointmentResponse(
        id=appointment.id,
        counselor_id=appointment.counselor_id,
        counselor_name=f"{counselor.first_name} {counselor.last_name}" if counselor else "Unknown",
        student_id=appointment.student_id,
        date=appointment.scheduled_at,
        time=appointment.scheduled_at.strftime("%H:%M"),
        duration=appointment.duration_minutes,
        mode=appointment.mode,
        status=appointment.status,
        location=appointment.location,
        meeting_link=appointment.meeting_link,
    )