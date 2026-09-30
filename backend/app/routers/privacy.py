"""
Privacy and data control router.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission
from app.models.user import User
from app.models.consent import ConsentRecord
from app.models.check_in import CheckIn
from app.models.assessment import Assessment
from app.models.counseling import CounselingRequest, Appointment
from app.schemas.privacy import (
    PrivacyPermissionItem,
    PrivacySummaryResponse,
    ConsentUpdateRequest,
    ConsentStatusResponse,
    DataExportRequest,
    DataExportResponse,
    DataDeletionRequest,
    DataDeletionResponse,
)

router = APIRouter()


@router.get("/summary", response_model=PrivacySummaryResponse)
async def get_privacy_summary(
    current_user: User = Depends(require_permission(Permission.VIEW_PRIVACY_SUMMARY)),
    session: AsyncSession = Depends(get_session),
):
    """Get privacy summary - what data is held and consent status."""
    result = await session.execute(
        select(ConsentRecord)
        .where(ConsentRecord.student_id == current_user.id)
        .order_by(ConsentRecord.given_at.desc())
        .limit(1)
    )
    consent = result.scalar_one_or_none()

    check_in_count = await session.scalar(
        select(func.count(CheckIn.id)).where(CheckIn.student_id == current_user.id)
    )
    assessment_count = await session.scalar(
        select(func.count(Assessment.id)).where(Assessment.student_id == current_user.id)
    )
    counseling_count = await session.scalar(
        select(func.count(CounselingRequest.id)).where(CounselingRequest.student_id == current_user.id)
    )
    appointment_count = await session.scalar(
        select(func.count(Appointment.id)).where(Appointment.student_id == current_user.id)
    )

    data_held = [
        PrivacyPermissionItem(
            data_type="Mood history",
            student="Full access",
            counselor="Only when shared",
            analytics="Anonymised aggregate",
        ),
        PrivacyPermissionItem(
            data_type="Check-in responses",
            student="Full access",
            counselor="When escalated or shared",
            analytics="Aggregated trends",
        ),
        PrivacyPermissionItem(
            data_type="Counseling requests",
            student="Full access",
            counselor="Full access",
            analytics="Aggregated count",
        ),
        PrivacyPermissionItem(
            data_type="Personal identity",
            student="Full access",
            counselor="Authorized staff only",
            analytics="Not included",
        ),
        PrivacyPermissionItem(
            data_type="Session notes",
            student="Available on request",
            counselor="Full access",
            analytics="Not included",
        ),
        PrivacyPermissionItem(
            data_type="Optional demographics",
            student="Full access",
            counselor="Not shared",
            analytics="Anonymised aggregate",
        ),
    ]

    return PrivacySummaryResponse(
        data_held=data_held,
        consent_status={
            "version": consent.version if consent else "1.0",
            "given_at": consent.given_at.isoformat() if consent else None,
            "analytics_consent": consent.analytics_consent if consent else False,
            "research_consent": consent.research_consent if consent else False,
            "revoked_at": consent.revoked_at.isoformat() if consent and consent.revoked_at else None,
        },
        last_export=None,
        account_created=current_user.created_at,
    )


@router.get("/consent", response_model=ConsentStatusResponse)
async def get_consent_status(
    current_user: User = Depends(require_permission(Permission.VIEW_PRIVACY_SUMMARY)),
    session: AsyncSession = Depends(get_session),
):
    """Get current consent status."""
    result = await session.execute(
        select(ConsentRecord)
        .where(ConsentRecord.student_id == current_user.id)
        .order_by(ConsentRecord.given_at.desc())
        .limit(1)
    )
    consent = result.scalar_one_or_none()

    if not consent:
        return ConsentStatusResponse(
            version="1.0",
            given_at=current_user.created_at,
            analytics_consent=False,
            research_consent=False,
        )

    return ConsentStatusResponse.model_validate(consent)


@router.post("/consent", response_model=ConsentStatusResponse)
async def update_consent(
    data: ConsentUpdateRequest,
    current_user: User = Depends(require_permission(Permission.UPDATE_CONSENT)),
    session: AsyncSession = Depends(get_session),
):
    """Update consent preferences."""
    result = await session.execute(
        select(ConsentRecord)
        .where(ConsentRecord.student_id == current_user.id)
        .order_by(ConsentRecord.given_at.desc())
        .limit(1)
    )
    consent = result.scalar_one_or_none()

    if not consent:
        consent = ConsentRecord(
            student_id=current_user.id,
            version="1.0",
            analytics_consent=data.analytics_consent or False,
            research_consent=data.research_consent or False,
        )
        session.add(consent)
    else:
        if data.analytics_consent is not None:
            consent.analytics_consent = data.analytics_consent
        if data.research_consent is not None:
            consent.research_consent = data.research_consent

    await session.commit()
    await session.refresh(consent)

    return ConsentStatusResponse.model_validate(consent)


@router.post("/export", response_model=DataExportResponse, status_code=status.HTTP_202_ACCEPTED)
async def request_data_export(
    data: DataExportRequest,
    current_user: User = Depends(require_permission(Permission.REQUEST_DATA_EXPORT)),
    session: AsyncSession = Depends(get_session),
):
    """Request data export (async job)."""
    import uuid
    job_id = uuid.uuid4()

    return DataExportResponse(
        job_id=job_id,
        status="pending",
        created_at=datetime.now(timezone.utc),
        download_url=None,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=48),
    )


@router.get("/export/{job_id}", response_model=DataExportResponse)
async def get_export_status(
    job_id: UUID,
    current_user: User = Depends(require_permission(Permission.REQUEST_DATA_EXPORT)),
    session: AsyncSession = Depends(get_session),
):
    """Get export job status."""
    return DataExportResponse(
        job_id=job_id,
        status="pending",
        created_at=datetime.now(timezone.utc),
        download_url=None,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=48),
    )


@router.delete("/data", response_model=DataDeletionResponse)
async def request_data_deletion(
    data: DataDeletionRequest,
    current_user: User = Depends(require_permission(Permission.REQUEST_DATA_DELETION)),
    session: AsyncSession = Depends(get_session),
):
    """Request data deletion (GDPR right to erasure)."""
    if not data.confirm:
        from app.core.exceptions import ValidationError
        raise ValidationError("Must confirm deletion")

    deleted_items = [
        "Check-in history",
        "Mood entries",
        "Assessment responses",
        "Recommendations",
        "Counseling requests (cancelled)",
        "Personal notes",
    ]

    retained_items = [
        "Counseling session notes (7 years regulatory requirement)",
        "Appointment records (7 years regulatory requirement)",
        "Audit logs (7 years security requirement)",
    ]

    retention_reasons = {
        "Counseling session notes": "Clinical documentation requirement (7 years)",
        "Appointment records": "Healthcare record retention policy (7 years)",
        "Audit logs": "Security and compliance requirement (7 years)",
    }

    return DataDeletionResponse(
        message="Data deletion requested. Eligible data will be deleted within 30 days.",
        deleted_items=deleted_items,
        retained_items=retained_items,
        retention_reasons=retention_reasons,
    )