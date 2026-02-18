"""Vector database service using Qdrant"""

from typing import Optional
from uuid import UUID, uuid4

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
import structlog

from app.config import Settings

log = structlog.get_logger()


class VectorService:
    """Service for Qdrant vector operations."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
        )
        self.dimension = settings.embedding_dimensions

    def _collection_name(self, project_slug: str) -> str:
        """Get collection name for a project."""
        return f"project_{project_slug}_chunks"

    async def create_collection(self, project_slug: str) -> bool:
        """Create a vector collection for a project."""
        collection_name = self._collection_name(project_slug)

        try:
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=self.dimension,
                    distance=Distance.COSINE,
                ),
            )
            log.info("Vector collection created", collection=collection_name)
            return True
        except Exception as e:
            if "already exists" in str(e):
                log.info("Vector collection exists", collection=collection_name)
                return True
            log.error("Failed to create collection", error=str(e))
            raise

    async def delete_collection(self, project_slug: str) -> bool:
        """Delete a vector collection."""
        collection_name = self._collection_name(project_slug)

        try:
            self.client.delete_collection(collection_name=collection_name)
            log.info("Vector collection deleted", collection=collection_name)
            return True
        except Exception as e:
            log.error("Failed to delete collection", error=str(e))
            return False

    async def upsert_chunks(
        self,
        project_slug: str,
        chunks: list[dict],
        vectors: list[list[float]],
    ) -> int:
        """Insert or update chunks with their embeddings."""
        collection_name = self._collection_name(project_slug)

        points = []
        for chunk, vector in zip(chunks, vectors):
            point_id = str(chunk.get("id", uuid4()))
            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "chunk_id": str(chunk["id"]),
                        "document_id": str(chunk["document_id"]),
                        "content": chunk["content"],
                        "content_type": chunk.get("content_type", "general"),
                        "chunk_index": chunk.get("chunk_index", 0),
                        "metadata": chunk.get("metadata", {}),
                    },
                )
            )

        self.client.upsert(collection_name=collection_name, points=points)
        log.info("Chunks upserted", collection=collection_name, count=len(points))
        return len(points)

    async def search(
        self,
        project_slug: str,
        query_vector: list[float],
        limit: int = 10,
        content_types: Optional[list[str]] = None,
    ) -> list[dict]:
        """Search for similar chunks."""
        collection_name = self._collection_name(project_slug)

        # Build filter if content types specified
        query_filter = None
        if content_types:
            query_filter = Filter(
                should=[
                    FieldCondition(
                        key="content_type",
                        match=MatchValue(value=ct),
                    )
                    for ct in content_types
                ]
            )

        results = self.client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=limit,
            query_filter=query_filter,
            with_payload=True,
        )

        return [
            {
                "id": str(r.id),
                "score": r.score,
                "content": r.payload.get("content", ""),
                "document_id": r.payload.get("document_id"),
                "content_type": r.payload.get("content_type"),
                "chunk_index": r.payload.get("chunk_index"),
                "metadata": r.payload.get("metadata", {}),
            }
            for r in results
        ]

    async def delete_by_document(self, project_slug: str, document_id: UUID) -> int:
        """Delete all chunks for a document."""
        collection_name = self._collection_name(project_slug)

        # Use scroll to find all points for this document, then delete
        points_to_delete = []
        offset = None

        while True:
            results, offset = self.client.scroll(
                collection_name=collection_name,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(
                            key="document_id",
                            match=MatchValue(value=str(document_id)),
                        )
                    ]
                ),
                limit=100,
                offset=offset,
                with_payload=False,
            )

            points_to_delete.extend([r.id for r in results])

            if offset is None:
                break

        if points_to_delete:
            self.client.delete(
                collection_name=collection_name,
                points_selector=points_to_delete,
            )

        log.info("Chunks deleted", document_id=str(document_id), count=len(points_to_delete))
        return len(points_to_delete)

    async def delete_points(self, project_slug: str, point_ids: list[str]) -> int:
        """Delete specific points by ID."""
        if not point_ids:
            return 0

        collection_name = self._collection_name(project_slug)

        try:
            self.client.delete(
                collection_name=collection_name,
                points_selector=point_ids,
            )
            log.info("Points deleted", collection=collection_name, count=len(point_ids))
            return len(point_ids)
        except Exception as e:
            log.error("Failed to delete points", error=str(e))
            raise

    async def get_collection_info(self, project_slug: str) -> dict:
        """Get collection statistics."""
        collection_name = self._collection_name(project_slug)

        try:
            info = self.client.get_collection(collection_name=collection_name)
            return {
                "name": collection_name,
                "vectors_count": info.vectors_count,
                "points_count": info.points_count,
                "status": info.status.name,
            }
        except Exception:
            return {"name": collection_name, "exists": False}
