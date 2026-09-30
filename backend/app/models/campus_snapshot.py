"""
Campus snapshot model for aggregated analytics (no PII).
"""
import enum
from typing import Optional
from datetime import datetime
from typing import Dict, Any, Optional
from uuid import uuid4, UUID as PyUUID

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SnapshotPeriod(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class CampusSnapshot(Base):
    __tablename__ = "campus_snapshots"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    snapshot_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    university_id: Mapped[Optional[PyUUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=True)
    period: Mapped[SnapshotPeriod] = mapped_column(Enum(SnapshotPeriod), nullable=False)

    total_check_ins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unique_students_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_mood_score: Mapped[Optional[float]] = mapped_column(nullable=True)
    avg_stress_score: Mapped[Optional[float]] = mapped_column(nullable=True)
    stress_distribution: Mapped[Dict[str, int]] = mapped_column(JSON, default=dict, nullable=False)
    counseling_request_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    escalation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    top_factors: Mapped[Dict[str, int]] = mapped_column(JSON, default=dict, nullable=False)
    resource_engagement_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    min_group_size_met: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Time-series data for trends
    trends_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_campus_snapshots_date_period", "snapshot_date", "period", unique=True),
        Index("ix_campus_snapshots_university", "university_id", "snapshot_date"),
    )

    def __repr__(self) -> str:
        return f"<CampusSnapshot(date={self.snapshot_date}, period={self.period.value}, students={self.unique_students_count})>"