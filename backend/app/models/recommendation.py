"""
Recommendation model for personalized recommendations.
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
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, is_sqlite


# Use JSON for SQLite, ARRAY for PostgreSQL
if is_sqlite:
    from sqlalchemy import JSON
    ArrayType = JSON
else:
    from sqlalchemy.dialects.postgresql import ARRAY
    ArrayType = ARRAY


class RecommendationType(str, enum.Enum):
    EXERCISE = "exercise"
    TECHNIQUE = "technique"
    RESOURCE = "resource"
    SOCIAL = "social"
    PROFESSIONAL = "professional"


class RecommendationSource(str, enum.Enum):
    RULE_BASED = "rule_based"
    LLM = "llm"
    HYBRID = "hybrid"


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    type: Mapped[RecommendationType] = mapped_column(Enum(RecommendationType), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[RecommendationSource] = mapped_column(Enum(RecommendationSource), default=RecommendationSource.RULE_BASED, nullable=False)
    tags: Mapped[List[str]] = mapped_column(ArrayType, default=list, nullable=False)
    resource_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("resources.id"), nullable=True)
    dismissed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    clicked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ai_assisted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    student: Mapped["User"] = relationship("User", back_populates="recommendations")
    resource: Mapped[Optional["Resource"]] = relationship("Resource")

    __table_args__ = (
        Index("ix_recommendations_student_generated", "student_id", "generated_at"),
        Index("ix_recommendations_student_active", "student_id", "dismissed", "expires_at"),
    )

    def __repr__(self) -> str:
        return f"<Recommendation(id={self.id}, student_id={self.student_id}, title={self.title})>"