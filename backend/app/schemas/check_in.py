"""
Check-in schemas.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict

from app.models.check_in import MoodLevel, StressLevel, EnergyLevel, SleepQuality, SupportLevel, CheckInTag


class CheckInCreate(BaseModel):
    mood: MoodLevel
    stress: StressLevel
    energy: EnergyLevel
    sleep: SleepQuality
    tags: List[CheckInTag] = Field(default_factory=list)
    note: Optional[str] = Field(None, max_length=2000)


class CheckInUpdate(BaseModel):
    note: Optional[str] = Field(None, max_length=2000)


class CheckInResponse(BaseModel):
    id: UUID
    student_id: UUID
    completed_at: datetime
    mood: MoodLevel
    stress: StressLevel
    energy: EnergyLevel
    sleep: SleepQuality
    tags: List[CheckInTag]
    note: Optional[str] = None
    support_level: SupportLevel
    escalated: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CheckInListResponse(BaseModel):
    data: List[CheckInResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class CheckInStreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_check_in_date: Optional[datetime] = None


# Internal schema (includes distress_score - STAFF ONLY)
class CheckInInternalResponse(CheckInResponse):
    distress_score: Optional[float] = None
    escalation_reason: Optional[str] = None