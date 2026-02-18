"""Search models"""

from typing import Optional, Literal
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.entity import EntityType


SearchMode = Literal["hybrid", "vector", "graph"]


class SearchFilters(BaseModel):
    """Search filters."""

    entity_types: Optional[list[EntityType]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class SearchRequest(BaseModel):
    """Search request."""

    query: str = Field(..., min_length=1)
    mode: SearchMode = "hybrid"
    filters: Optional[SearchFilters] = None
    limit: int = Field(default=10, ge=1, le=100)


class SearchResultConnection(BaseModel):
    """Connection in search result."""

    id: str
    name: str
    relationship: str


class SearchResult(BaseModel):
    """Single search result."""

    id: str
    type: Literal["entity", "chunk"]
    label: str  # Entity type or "Chunk"
    name: str
    content: str
    score: float
    source: Literal["vector", "graph"]
    connections: list[SearchResultConnection] = []
    project: Optional[str] = None


class SearchStats(BaseModel):
    """Search statistics."""

    vector_hits: int
    graph_hits: int
    total_time_ms: int


class SearchResponse(BaseModel):
    """Search response."""

    results: list[SearchResult]
    stats: SearchStats


class ProjectSearchStats(BaseModel):
    """Per-project stats in fan-out search."""

    project: str
    result_count: int


class FanoutSearchResponse(BaseModel):
    """Fan-out search response across all projects."""

    results: list[SearchResult]
    total: int
    projects_searched: int
    project_stats: list[ProjectSearchStats]


class CypherRequest(BaseModel):
    """Raw Cypher query request."""

    query: str = Field(..., min_length=1)


class CypherResponse(BaseModel):
    """Cypher query response."""

    results: list[dict]
    columns: list[str]
    row_count: int
