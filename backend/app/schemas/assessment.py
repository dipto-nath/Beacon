"""
Assessment schemas.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.assessment import AssessmentType


class AssessmentCreate(BaseModel):
    assessment_type: AssessmentType = AssessmentType.PERIODIC
    responses: Dict[str, Any]


class AssessmentResponse(BaseModel):
    id: UUID
    student_id: UUID
    completed_at: datetime
    assessment_type: AssessmentType
    support_level: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentDetailResponse(AssessmentResponse):
    responses: Dict[str, Any]


class AssessmentListResponse(BaseModel):
    data: List[AssessmentResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


# Internal schema for staff (includes distress_score)
class AssessmentInternalResponse(AssessmentDetailResponse):
    distress_score: Optional[float] = None
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None