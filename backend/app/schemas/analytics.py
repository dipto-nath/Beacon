"""
Staff analytics schemas.
"""
from datetime import date, datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StressDistributionResponse(BaseModel):
    low: int
    moderate: int
    elevated: int
    high: int
    privacy_note: str = "Results based on aggregated data. Individual students are not identifiable."
    min_group_size: int = 10
    suppressed_cohorts: int = 0


class TopFactorItem(BaseModel):
    factor: str
    count: int


class TopFactorsResponse(BaseModel):
    factors: List[TopFactorItem]
    privacy_note: str = "Results based on aggregated data. Individual students are not identifiable."
    min_group_size: int = 10
    suppressed_cohorts: int = 0


class TrendsDataPoint(BaseModel):
    date: date
    check_ins: int
    avg_mood: float
    stress_avg: float
    counseling_requests: int


class TrendsResponse(BaseModel):
    period: str
    data: List[TrendsDataPoint]
    privacy_note: str = "Results based on aggregated data. Individual students are not identifiable."
    min_group_size: int = 10
    suppressed_cohorts: int = 0


class AnalyticsOverviewResponse(BaseModel):
    period: str
    total_check_ins: int
    unique_students: int
    average_stress: str
    counseling_requests: int
    resource_engagement: int
    escalations: int
    stress_distribution: StressDistributionResponse
    top_factors: TopFactorsResponse
    trends: TrendsResponse
    privacy: dict