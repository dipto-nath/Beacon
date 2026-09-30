"""
Consent record model for GDPR compliance.
"""
from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    given_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    ip_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    analytics_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    research_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    student: Mapped["User"] = relationship("User", back_populates="consent_records")

    __table_args__ = (
        Index("ix_consent_records_student_version", "student_id", "version"),
    )

    def __repr__(self) -> str:
        return f"<ConsentRecord(student_id={self.student_id}, version={self.version}, analytics={self.analytics_consent})>"