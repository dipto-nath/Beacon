"""
Resources router.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission, require_role, Role
from app.models.resource import Resource, ResourceCategory
from app.schemas.resource import (
    ResourceResponse,
    ResourceListResponse,
    ResourceCreate,
    ResourceUpdate,
    ResourceViewTrack,
)

router = APIRouter()


@router.get("", response_model=ResourceListResponse)
async def get_resources(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[ResourceCategory] = None,
    search: Optional[str] = None,
    type: Optional[str] = None,
    current_user=Depends(require_permission(Permission.VIEW_RESOURCES)),
    session: AsyncSession = Depends(get_session),
):
    """List resources with filtering and search."""
    query = select(Resource).where(Resource.is_active == True)

    if category:
        query = query.where(Resource.category == category)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Resource.title.ilike(search_term),
                Resource.description.ilike(search_term),
                Resource.content.ilike(search_term),
            )
        )

    if type:
        query = query.where(Resource.type == type)

    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)

    query = query.order_by(Resource.published_at.desc().nullslast()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    resources = result.scalars().all()

    return ResourceListResponse(
        data=[ResourceResponse.model_validate(r) for r in resources],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: UUID,
    current_user=Depends(require_permission(Permission.VIEW_RESOURCES)),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific resource by ID."""
    result = await session.execute(
        select(Resource).where(Resource.id == resource_id, Resource.is_active == True)
    )
    resource = result.scalar_one_or_none()

    if not resource:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Resource", str(resource_id))

    return ResourceResponse.model_validate(resource)


@router.get("/slug/{slug}", response_model=ResourceResponse)
async def get_resource_by_slug(
    slug: str,
    current_user=Depends(require_permission(Permission.VIEW_RESOURCES)),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific resource by slug."""
    result = await session.execute(
        select(Resource).where(Resource.slug == slug, Resource.is_active == True)
    )
    resource = result.scalar_one_or_none()

    if not resource:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Resource", slug)

    return ResourceResponse.model_validate(resource)


@router.post("/{resource_id}/view", status_code=status.HTTP_204_NO_CONTENT)
async def track_resource_view(
    resource_id: UUID,
    _: ResourceViewTrack,
    current_user=Depends(require_permission(Permission.VIEW_RESOURCES)),
    session: AsyncSession = Depends(get_session),
):
    """Track resource view for engagement metrics."""
    result = await session.execute(
        select(Resource).where(Resource.id == resource_id)
    )
    resource = result.scalar_one_or_none()

    if resource:
        resource.view_count += 1
        await session.commit()

    return


# Staff-only endpoints
@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    data: ResourceCreate,
    current_user=Depends(require_role(Role.WELLBEING_ADMIN, Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """Create a new resource (staff only)."""
    from slugify import slugify
    slug = slugify(data.title)
    
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while True:
        result = await session.execute(select(Resource).where(Resource.slug == slug))
        if not result.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    resource = Resource(
        **data.model_dump(),
        slug=slug,
        created_by=current_user.id,
    )

    session.add(resource)
    await session.commit()
    await session.refresh(resource)

    return ResourceResponse.model_validate(resource)


@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: UUID,
    data: ResourceUpdate,
    current_user=Depends(require_role(Role.WELLBEING_ADMIN, Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """Update a resource (staff only)."""
    result = await session.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()

    if not resource:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Resource", str(resource_id))

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resource, field, value)

    await session.commit()
    await session.refresh(resource)

    return ResourceResponse.model_validate(resource)


@router.patch("/{resource_id}/publish", response_model=ResourceResponse)
async def publish_resource(
    resource_id: UUID,
    is_active: bool = True,
    current_user=Depends(require_role(Role.WELLBEING_ADMIN, Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """Publish or unpublish a resource (staff only)."""
    result = await session.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()

    if not resource:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Resource", str(resource_id))

    resource.is_active = is_active
    if is_active and not resource.published_at:
        from datetime import datetime, timezone
        resource.published_at = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(resource)

    return ResourceResponse.model_validate(resource)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: UUID,
    current_user=Depends(require_role(Role.WELLBEING_ADMIN, Role.ADMIN)),
    session: AsyncSession = Depends(get_session),
):
    """Archive a resource (staff only)."""
    result = await session.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()

    if not resource:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Resource", str(resource_id))

    # Soft delete - just mark as inactive
    resource.is_active = False
    await session.commit()

    return