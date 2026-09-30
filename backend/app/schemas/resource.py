"""
Resource schemas.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.resource import ResourceCategory, ResourceType


class ResourceResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    category: ResourceCategory
    type: ResourceType
    description: str
    content: str
    read_time_seconds: Optional[int] = None
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    is_active: bool
    view_count: int
    tags: List[str]

    model_config = ConfigDict(from_attributes=True)


class ResourceListResponse(BaseModel):
    data: List[ResourceResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: ResourceCategory
    type: ResourceType
    description: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    read_time_seconds: Optional[int] = Field(None, ge=0)
    author: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[ResourceCategory] = None
    type: Optional[ResourceType] = None
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = Field(None, min_length=1)
    read_time_seconds: Optional[int] = Field(None, ge=0)
    author: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ResourceViewTrack(BaseModel):
    pass  # No body needed, just track the view