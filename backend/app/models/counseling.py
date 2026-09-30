"""
Counseling request and appointment models.
"""
import enum
from typing import Optional
from datetime import datetime
from typing import Dict, Any, List, Optional
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
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CounselingRequestStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWING = "reviewing"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SessionMode(str, enum.Enum):
    ONLINE = "online"
    IN_PERSON = "in_person"
    EITHER = "either"


class AppointmentStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class CounselingRequest(Base):
    __tablename__ = "counseling_requests"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    preferred_mode: Mapped[SessionMode] = mapped_column(Enum(SessionMode), default=SessionMode.EITHER, nullable=False)
    preferred_times: Mapped[List[str]] = mapped_column(ARRAY(String), default=list, nullable=False)  # ISO datetime strings
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Encrypted
    status: Mapped[CounselingRequestStatus] = mapped_column(Enum(CounselingRequestStatus), default=CounselingRequestStatus.PENDING, nullable=False)
    assigned_counselor_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    appointment_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student: Mapped["User"] = relationship("User", back_populates="counseling_requests", foreign_keys=[student_id])
    assigned_counselor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_counselor_id])
    appointment: Mapped[Optional["Appointment"]] = relationship("Appointment", foreign_keys=[appointment_id])

    __table_args__ = (
        Index("ix_counseling_requests_student_status", "student_id", "status"),
        Index("ix_counseling_requests_counselor_status", "assigned_counselor_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<CounselingRequest(id={self.id}, student_id={self.student_id}, status={self.status.value})>"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    counselor_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    student_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(default=50, nullable=False)
    mode: Mapped[SessionMode] = mapped_column(Enum(SessionMode), nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(Enum(AppointmentStatus), default=AppointmentStatus.UPCOMING, nullable=False)
    meeting_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # Encrypted
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Counselor-only, encrypted
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cancellation_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    counselor: Mapped["User"] = relationship("User", back_populates="appointments", foreign_keys=[counselor_id])
    student: Mapped["User"] = relationship("User", back_populates="appointments", foreign_keys=[student_id])

    __table_args__ = (
        Index("ix_appointments_counselor_scheduled", "counselor_id", "scheduled_at"),
        Index("ix_appointments_student_scheduled", "student_id", "scheduled_at"),
        Index("ix_appointments_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Appointment(id={self.id}, counselor_id={self.counselor_id}, student_id={self.student_id}, scheduled={self.scheduled_at})>"