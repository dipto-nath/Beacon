"""
Mood analytics schemas.
"""
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MoodDataPoint(BaseModel):
    date: date
    mood_score: float
    stress_score: float
    label: Optional[str] = None


class MoodSummaryResponse(BaseModel):
    period: str
    data_points: List[MoodDataPoint]
    avg_mood: float
    avg_stress: float
    check_in_count: int
    streak_days: int


class MoodPattern(BaseModel):
    pattern: str
    description: str
    confidence: float
    ai_assisted: bool = True


class MoodPatternsResponse(BaseModel):
    patterns: List[MoodPattern]
    data_points_analyzed: int
    disclaimer: str = "These are observed patterns, not clinical findings."