"""
Support case model for escalation workflow.
"""
import enum
from typing import Optional
from datetime import datetime
from typing import Dict, Any, List, Optional
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


class CaseStatus(str, enum.Enum):
    NEW = "new"
    REVIEWING = "reviewing"
    CONTACTED = "contacted"
    SCHEDULED = "scheduled"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class CasePriority(str, enum.Enum):
    STANDARD = "standard"
    ELEVATED = "elevated"
    URGENT = "urgent"


class EscalationSource(str, enum.Enum):
    AUTOMATED = "automated"
    MANUAL = "manual"
    STUDENT_INITIATED = "student_initiated"


class SupportCase(Base):
    __tablename__ = "support_cases"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    case_ref: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)  # BEC-YYYYMMDD-NNN
    check_in_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("check_ins.id"), nullable=True)
    assessment_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=True)
    student_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    priority: Mapped[CasePriority] = mapped_column(Enum(CasePriority), default=CasePriority.STANDARD, nullable=False)
    status: Mapped[CaseStatus] = mapped_column(Enum(CaseStatus), default=CaseStatus.NEW, nullable=False)
    reason_summary: Mapped[str] = mapped_column(Text, nullable=False)  # General, no PII
    assigned_counselor_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)  # [{timestamp, counselor_id, content}]
    escalation_source: Mapped[EscalationSource] = mapped_column(Enum(EscalationSource), default=EscalationSource.AUTOMATED, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student: Mapped["User"] = relationship("User", foreign_keys=[student_id])
    assigned_counselor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_counselor_id])
    check_in: Mapped[Optional["CheckIn"]] = relationship("CheckIn", foreign_keys=[check_in_id])
    assessment: Mapped[Optional["Assessment"]] = relationship("Assessment", foreign_keys=[assessment_id])

    __table_args__ = (
        Index("ix_support_cases_status_priority", "status", "priority"),
        Index("ix_support_cases_assigned", "assigned_counselor_id", "status"),
        Index("ix_support_cases_student", "student_id"),
    )

    def __repr__(self) -> str:
        return f"<SupportCase(case_ref={self.case_ref}, priority={self.priority.value}, status={self.status.value})>"