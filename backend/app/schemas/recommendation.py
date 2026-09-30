"""
Recommendation schemas.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.recommendation import RecommendationType, RecommendationSource


class RecommendationResponse(BaseModel):
    id: UUID
    student_id: UUID
    generated_at: datetime
    type: RecommendationType
    title: str
    description: str
    reason: str
    source: RecommendationSource
    tags: List[str]
    resource_id: Optional[UUID] = None
    dismissed: bool
    clicked: bool
    expires_at: Optional[datetime] = None
    ai_assisted: bool

    model_config = ConfigDict(from_attributes=True)


class RecommendationListResponse(BaseModel):
    data: List[RecommendationResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class DismissRecommendationRequest(BaseModel):
    pass  # No body needed


class ClickRecommendationRequest(BaseModel):
    pass  # No body needed