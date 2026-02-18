"""Snapshot models for KG backup and restore"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SnapshotCreate(BaseModel):
    label: Optional[str] = None
    trigger: str = "manual"


class SnapshotResponse(BaseModel):
    id: UUID
    project_id: UUID
    label: Optional[str] = None
    trigger: str
    entity_count: int
    relationship_count: int
    created_at: datetime


class SnapshotDetail(SnapshotResponse):
    graph_data: dict = Field(default_factory=dict)


class RestoreResponse(BaseModel):
    snapshot_id: UUID
    entities_restored: int
    relationships_restored: int
    pre_restore_snapshot_id: Optional[UUID] = None
