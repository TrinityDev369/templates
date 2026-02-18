"""Document models"""

from datetime import datetime
from typing import Optional, Literal
from uuid import UUID

from pydantic import BaseModel, Field


ContentType = Literal["design_token", "contract", "component", "spec", "note", "general"]


class DocumentBase(BaseModel):
    """Base document fields."""

    filename: Optional[str] = None
    content_type: ContentType = "general"
    source_url: Optional[str] = None
    metadata: dict = Field(default_factory=dict)


class DocumentCreate(DocumentBase):
    """Create document request."""

    raw_content: str = Field(..., min_length=1)


class Document(DocumentBase):
    """Document database model."""

    id: UUID
    project_id: UUID
    raw_content: str
    processed: bool = False
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    """Document API response."""

    id: UUID
    filename: Optional[str]
    content_type: ContentType
    source_url: Optional[str]
    metadata: dict
    processed: bool
    processed_at: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime
    chunk_count: Optional[int] = None
    entity_count: Optional[int] = None


class DocumentListResponse(BaseModel):
    """List of documents response."""

    documents: list[DocumentResponse]
    total: int


class ProcessDocumentResponse(BaseModel):
    """Document processing result."""

    document_id: UUID
    chunks_created: int
    entities_extracted: int
    relationships_created: int
    duration_ms: int
