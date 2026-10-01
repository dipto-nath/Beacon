"""
Counseling and appointment schemas.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.counseling import CounselingRequestStatus, SessionMode, AppointmentStatus


class CounselingRequestCreate(BaseModel):
    preferred_mode: SessionMode = SessionMode.EITHER
    preferred_times: List[str] = Field(default_factory=list)  # ISO datetime strings
    reason: Optional[str] = Field(None, max_length=1000)


class CounselingRequestResponse(BaseModel):
    id: UUID
    student_id: UUID
    requested_at: datetime
    preferred_mode: SessionMode
    preferred_times: List[str]
    reason: Optional[str] = None
    status: CounselingRequestStatus
    assigned_counselor_id: Optional[UUID] = None
    appointment_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CounselingRequestListResponse(BaseModel):
    data: List[CounselingRequestResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class CounselorProfileResponse(BaseModel):
    id: UUID
    name: str
    title: str
    specializations: List[str]
    availability: str  # available, limited, unavailable
    next_slot: Optional[str] = None
    mode: List[SessionMode]


class AppointmentResponse(BaseModel):
    id: UUID
    counselor_id: UUID
    counselor_name: str
    student_id: UUID
    student_name: Optional[str] = None
    date: datetime
    time: str
    duration: int
    mode: SessionMode
    status: AppointmentStatus
    location: Optional[str] = None
    meeting_link: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AppointmentListResponse(BaseModel):
    data: List[AppointmentResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class AppointmentCancelRequest(BaseModel):
    reason: Optional[str] = Field(None, max_length=500)


# Staff schemas
class CounselingRequestAssignRequest(BaseModel):
    counselor_id: UUID


class AppointmentUpdateRequest(BaseModel):
    status: Optional[AppointmentStatus] = None
    scheduled_at: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=2000)