"""
User model with field-level encryption for PII.
"""
import enum
from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    COUNSELOR = "counselor"
    WELLBEING_ADMIN = "wellbeing_admin"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    student_id_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    program: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    year_of_study: Mapped[Optional[int]] = mapped_column(nullable=True)
    university_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sso_subject: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    consent_version: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    consent_given_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    check_ins: Mapped[list["CheckIn"]] = relationship("CheckIn", back_populates="student", lazy="dynamic")
    assessments: Mapped[list["Assessment"]] = relationship("Assessment", back_populates="student", lazy="dynamic")
    mood_entries: Mapped[list["MoodEntry"]] = relationship("MoodEntry", back_populates="student", lazy="dynamic")
    recommendations: Mapped[list["Recommendation"]] = relationship("Recommendation", back_populates="student", lazy="dynamic")
    counseling_requests: Mapped[list["CounselingRequest"]] = relationship("CounselingRequest", back_populates="student", lazy="dynamic")
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="student", lazy="dynamic")
    consent_records: Mapped[list["ConsentRecord"]] = relationship("ConsentRecord", back_populates="student", lazy="dynamic")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="actor", lazy="dynamic")

    __table_args__ = (
        Index("ix_users_email_active", "email", "is_active"),
        Index("ix_users_role_active", "role", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role.value})>"