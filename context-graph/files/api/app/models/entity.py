"""Entity and relationship models"""

from datetime import datetime
from typing import Optional, Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


EntityType = Literal[
    # Codebase entities
    "Module", "File", "Function", "Class",
    # Design entities
    "Component", "DesignToken",
    # Business entities
    "Contract", "Requirement", "Person", "Concept", "Feature",
    "Document", "API", "Chunk", "Client", "Project", "Task",
    # Execution entities
    "Workflow", "Agent", "Run"
]

RelationshipType = Literal[
    # Codebase relationships
    "IMPORTS", "EXPORTS", "CALLS", "CONTAINS", "EXTENDS",
    # Semantic relationships
    "USES", "DEFINES", "REQUIRES", "REFERENCES", "IMPLEMENTS",
    "DEPENDS_ON", "RELATED_TO",
    # Business relationships
    "CREATED_BY", "OWNS", "WORKS_ON", "MANAGES"
]


class EntityBase(BaseModel):
    """Base entity fields."""

    name: str = Field(..., min_length=1, max_length=500)
    type: EntityType
    properties: dict = Field(default_factory=dict)


class EntityCreate(EntityBase):
    """Create entity request."""

    pass


class Entity(EntityBase):
    """Entity from graph."""

    id: str  # AGE graph ID
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EntityResponse(BaseModel):
    """Entity API response with connections."""

    id: str
    name: str
    type: EntityType
    properties: dict
    connections: list["ConnectionResponse"] = []


class ConnectionResponse(BaseModel):
    """Connected entity summary."""

    id: str
    name: str
    type: EntityType
    relationship: str
    direction: Literal["outgoing", "incoming"]


class RelationshipBase(BaseModel):
    """Base relationship fields."""

    source_id: str
    target_id: str
    type: RelationshipType
    properties: dict = Field(default_factory=dict)


class RelationshipCreate(RelationshipBase):
    """Create relationship request."""

    pass


class Relationship(RelationshipBase):
    """Relationship from graph."""

    id: str

    class Config:
        from_attributes = True


class EntityListResponse(BaseModel):
    """List of entities response."""

    entities: list[EntityResponse]
    total: int
    page: int
    page_size: int


class RelationshipListResponse(BaseModel):
    """List of relationships response."""

    relationships: list[Relationship]
    total: int


# ============================================================================
# v2 Models — Batch, Upsert, Update, Deduplication
# ============================================================================


class EntityUpdate(BaseModel):
    """Partial entity update."""

    name: Optional[str] = None
    description: Optional[str] = None
    properties: Optional[dict] = None


class BatchEntityCreate(BaseModel):
    """Entity with optional ref for batch operations."""

    name: str = Field(..., min_length=1, max_length=500)
    type: EntityType
    description: Optional[str] = None
    properties: dict = Field(default_factory=dict)
    ref: Optional[str] = None


class BatchRelationshipCreate(BaseModel):
    """Relationship that can reference entities by ref or ID."""

    from_ref: str = Field(..., alias="from")
    to_ref: str = Field(..., alias="to")
    type: RelationshipType
    properties: dict = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class BatchCreateRequest(BaseModel):
    """Batch create entities + relationships."""

    entities: list[BatchEntityCreate] = []
    relationships: list[BatchRelationshipCreate] = []

    @model_validator(mode="after")
    def validate_limits(self):
        if len(self.entities) > 100:
            raise ValueError("Maximum 100 entities per batch")
        if len(self.relationships) > 500:
            raise ValueError("Maximum 500 relationships per batch")
        return self


class BatchCreateResponse(BaseModel):
    """Batch create result."""

    entities_created: list[dict] = []
    relationships_created: list[dict] = []
    errors: list[str] = []


class BatchDeleteRequest(BaseModel):
    """Batch delete request."""

    entity_ids: list[str]


class UpsertResponse(BaseModel):
    """Upsert result."""

    id: str
    name: str
    type: str
    properties: dict
    created: bool
    merged_properties: list[str] = []


class DeduplicateRequest(BaseModel):
    """Deduplication request."""

    entity_type: Optional[str] = None
    dry_run: bool = True


class DuplicateGroup(BaseModel):
    """Group of duplicate entities."""

    name: str
    type: str
    entities: list[dict]
    recommended_keep: str


class DeduplicateResponse(BaseModel):
    """Deduplication result."""

    duplicate_groups: list[DuplicateGroup] = []
    total_duplicates: int = 0
    merged: int = 0


# Forward reference update
EntityResponse.model_rebuild()
