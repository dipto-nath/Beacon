"""
Assessment model for formal self-assessments.
"""
import enum
from typing import Optional
from datetime import datetime
from typing import Dict, Any, Optional
from uuid import uuid4

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AssessmentType(str, enum.Enum):
    PERIODIC = "periodic"
    INTAKE = "intake"


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    assessment_type: Mapped[AssessmentType] = mapped_column(Enum(AssessmentType), default=AssessmentType.PERIODIC, nullable=False)
    responses: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)  # Encrypted at rest
    support_level: Mapped[str] = mapped_column(String(30), nullable=False)  # SupportLevel enum
    distress_score: Mapped[Optional[float]] = mapped_column(nullable=True)  # INTERNAL ONLY
    reviewed_by: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student: Mapped["User"] = relationship("User", back_populates="assessments", foreign_keys=[student_id])
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by])

    __table_args__ = (
        Index("ix_assessments_student_completed", "student_id", "completed_at"),
        Index("ix_assessments_type", "assessment_type"),
    )

    def __repr__(self) -> str:
        return f"<Assessment(id={self.id}, student_id={self.student_id}, type={self.assessment_type.value})>"