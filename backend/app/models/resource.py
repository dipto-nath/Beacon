"""
Resource model for the resource library.
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
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ResourceCategory(str, enum.Enum):
    STRESS = "stress"
    ACADEMIC = "academic"
    SLEEP = "sleep"
    RELATIONSHIPS = "relationships"
    LONELINESS = "loneliness"
    ANXIETY = "anxiety"
    FOCUS = "focus"
    BURNOUT = "burnout"
    CAMPUS = "campus"


class ResourceType(str, enum.Enum):
    ARTICLE = "article"
    AUDIO = "audio"
    GUIDE = "guide"
    CAMPUS = "campus"
    EXTERNAL = "external"


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False, index=True)
    category: Mapped[ResourceCategory] = mapped_column(Enum(ResourceCategory), nullable=False)
    type: Mapped[ResourceType] = mapped_column(Enum(ResourceType), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)  # Markdown, encrypted at rest
    read_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    author: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    created_by: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    creator: Mapped[Optional["User"]] = relationship("User")

    __table_args__ = (
        Index("ix_resources_category_active", "category", "is_active"),
        Index("ix_resources_published", "published_at"),
    )

    def __repr__(self) -> str:
        return f"<Resource(id={self.id}, title={self.title}, category={self.category.value})>"