"""Project models"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base project fields."""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    settings: dict = Field(default_factory=dict)


class ProjectCreate(ProjectBase):
    """Create project request."""

    slug: Optional[str] = Field(None, pattern=r"^[a-z0-9-]+$", max_length=255)


class Project(ProjectBase):
    """Project database model."""

    id: UUID
    slug: str
    graph_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    """Project API response."""

    id: UUID
    name: str
    slug: str
    graph_name: str
    description: Optional[str]
    settings: dict
    created_at: datetime
    updated_at: datetime
    stats: Optional[dict] = None  # Node/edge counts


class ProjectListResponse(BaseModel):
    """List of projects response."""

    projects: list[ProjectResponse]
    total: int
