"""
Privacy and data control schemas.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PrivacyPermissionItem(BaseModel):
    data_type: str
    student: str
    counselor: str
    analytics: str


class PrivacySummaryResponse(BaseModel):
    data_held: List[PrivacyPermissionItem]
    consent_status: dict
    last_export: Optional[datetime] = None
    account_created: datetime


class ConsentUpdateRequest(BaseModel):
    analytics_consent: Optional[bool] = None
    research_consent: Optional[bool] = None


class ConsentStatusResponse(BaseModel):
    version: str
    given_at: datetime
    analytics_consent: bool
    research_consent: bool
    revoked_at: Optional[datetime] = None


class DataExportRequest(BaseModel):
    include_check_ins: bool = True
    include_assessments: bool = True
    include_mood: bool = True
    include_counseling: bool = True
    include_appointments: bool = True
    format: str = "json"  # json, csv


class DataExportResponse(BaseModel):
    job_id: UUID
    status: str  # pending, processing, completed, failed
    created_at: datetime
    download_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class DataDeletionRequest(BaseModel):
    confirm: bool = Field(..., description="Must be true to confirm deletion")
    reason: Optional[str] = Field(None, max_length=500)


class DataDeletionResponse(BaseModel):
    message: str
    deleted_items: List[str]
    retained_items: List[str]
    retention_reasons: dict