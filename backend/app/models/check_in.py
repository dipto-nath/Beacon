"""
Check-in and mood models.
"""
import enum
from typing import Optional
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MoodLevel(str, enum.Enum):
    VERY_GOOD = "very_good"
    GOOD = "good"
    OKAY = "okay"
    DIFFICULT = "difficult"
    VERY_DIFFICULT = "very_difficult"


class StressLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    ELEVATED = "elevated"
    HIGH = "high"


class EnergyLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    STABLE = "stable"
    HIGH = "high"


class SleepQuality(str, enum.Enum):
    POOR = "poor"
    NEEDS_ATTENTION = "needs_attention"
    ADEQUATE = "adequate"
    GOOD = "good"


class SupportLevel(str, enum.Enum):
    SELF_GUIDED = "self_guided"
    ADDITIONAL = "additional"
    COUNSELOR = "counselor"
    URGENT = "urgent"


class CheckInTag(str, enum.Enum):
    ACADEMIC_PRESSURE = "academic_pressure"
    SLEEP = "sleep"
    RELATIONSHIPS = "relationships"
    FINANCIAL_STRESS = "financial_stress"
    FAMILY = "family"
    LONELINESS = "loneliness"
    EXAMS = "exams"
    WORKLOAD = "workload"
    SOMETHING_ELSE = "something_else"


class CheckIn(Base):
    __tablename__ = "check_ins"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    mood: Mapped[MoodLevel] = mapped_column(Enum(MoodLevel), nullable=False)
    stress: Mapped[StressLevel] = mapped_column(Enum(StressLevel), nullable=False)
    energy: Mapped[EnergyLevel] = mapped_column(Enum(EnergyLevel), nullable=False)
    sleep: Mapped[SleepQuality] = mapped_column(Enum(SleepQuality), nullable=False)
    tags: Mapped[List[CheckInTag]] = mapped_column(ARRAY(Enum(CheckInTag)), default=list, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    support_level: Mapped[SupportLevel] = mapped_column(Enum(SupportLevel), nullable=False)
    distress_score: Mapped[Optional[float]] = mapped_column(nullable=True)  # INTERNAL ONLY - never exposed to students
    escalation_triggered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    escalation_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # STAFF ONLY
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    student: Mapped["User"] = relationship("User", back_populates="check_ins")

    __table_args__ = (
        Index("ix_check_ins_student_completed", "student_id", "completed_at"),
        Index("ix_check_ins_support_level", "support_level"),
        Index("ix_check_ins_escalation", "escalation_triggered"),
    )

    def __repr__(self) -> str:
        return f"<CheckIn(id={self.id}, student_id={self.student_id}, mood={self.mood.value}, support_level={self.support_level.value})>"


class MoodEntry(Base):
    """Denormalized daily mood aggregate for fast analytics."""
    __tablename__ = "mood_entries"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    avg_mood_score: Mapped[float] = mapped_column(nullable=False)
    avg_stress_score: Mapped[float] = mapped_column(nullable=False)
    check_in_count: Mapped[int] = mapped_column(default=0, nullable=False)
    sleep_rating: Mapped[Optional[float]] = mapped_column(nullable=True)
    energy_rating: Mapped[Optional[float]] = mapped_column(nullable=True)
    top_tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list, nullable=False)

    # Relationships
    student: Mapped["User"] = relationship("User", back_populates="mood_entries")

    __table_args__ = (
        Index("ix_mood_entries_student_date", "student_id", "date", unique=True),
    )

    def __repr__(self) -> str:
        return f"<MoodEntry(student_id={self.student_id}, date={self.date}, mood={self.avg_mood_score})>"