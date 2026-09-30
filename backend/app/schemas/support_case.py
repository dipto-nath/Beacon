"""
Support case schemas for staff.
"""
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.support_case import CaseStatus, CasePriority, EscalationSource


class SupportCaseNote(BaseModel):
    timestamp: datetime
    counselor_id: UUID
    content: str


class SupportCaseResponse(BaseModel):
    case_ref: str
    received_at: datetime
    priority: CasePriority
    reason: str
    status: CaseStatus
    assigned_to: Optional[str] = None
    last_updated: datetime
    notes: Optional[List[SupportCaseNote]] = None

    model_config = ConfigDict(from_attributes=True)


class SupportCaseListResponse(BaseModel):
    data: List[SupportCaseResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class SupportCaseUpdateRequest(BaseModel):
    status: Optional[CaseStatus] = None
    assigned_counselor_id: Optional[UUID] = None
    priority: Optional[CasePriority] = None


class SupportCaseNoteCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class SupportCaseDetailResponse(SupportCaseResponse):
    student_program: Optional[str] = None
    student_year: Optional[int] = None
    escalation_source: EscalationSource
    check_in_id: Optional[UUID] = None
    assessment_id: Optional[UUID] = None