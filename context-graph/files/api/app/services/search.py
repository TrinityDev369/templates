"""Hybrid search service combining vector and graph search"""

import time
from typing import Optional

import structlog

from app.services.database import Database
from app.services.graph import GraphService
from app.services.vector import VectorService
from app.services.embedding import EmbeddingService
from app.models.search import SearchRequest, SearchResponse, SearchResult, SearchStats
from app.models.entity import EntityType
from app.utils import normalize_label

log = structlog.get_logger()


class SearchService:
    """Hybrid search combining vector similarity and graph traversal."""

    def __init__(
        self,
        db: Database,
        graph: GraphService,
        vector: VectorService,
        embedding: EmbeddingService,
    ):
        self.db = db
        self.graph = graph
        self.vector = vector
        self.embedding = embedding

    async def search(
        self,
        project_slug: str,
        graph_name: str,
        request: SearchRequest,
        embedding: Optional[list[float]] = None,
    ) -> SearchResponse:
        """Execute hybrid search.

        Args:
            project_slug: Project slug for vector collection lookup.
            graph_name: AGE graph name.
            request: Search parameters.
            embedding: Pre-computed query embedding. When provided the vector
                search path re-uses it instead of calling the embedding service
                again. Useful for fan-out searches where the same query is sent
                to many projects.
        """
        start_time = time.time()

        results: list[SearchResult] = []
        vector_hits = 0
        graph_hits = 0

        # Vector search
        if request.mode in ("hybrid", "vector"):
            vector_results = await self._vector_search(
                project_slug=project_slug,
                query=request.query,
                limit=request.limit,
                entity_types=request.filters.entity_types if request.filters else None,
                embedding=embedding,
            )
            results.extend(vector_results)
            vector_hits = len(vector_results)

        # Graph search
        if request.mode in ("hybrid", "graph"):
            graph_results = await self._graph_search(
                graph_name=graph_name,
                query=request.query,
                limit=request.limit,
                entity_types=request.filters.entity_types if request.filters else None,
            )
            results.extend(graph_results)
            graph_hits = len(graph_results)

        # Deduplicate and sort by score
        seen_ids = set()
        unique_results = []
        for r in sorted(results, key=lambda x: x.score, reverse=True):
            if r.id not in seen_ids:
                seen_ids.add(r.id)
                unique_results.append(r)

        # Limit final results
        unique_results = unique_results[: request.limit]

        elapsed_ms = int((time.time() - start_time) * 1000)

        return SearchResponse(
            results=unique_results,
            stats=SearchStats(
                vector_hits=vector_hits,
                graph_hits=graph_hits,
                total_time_ms=elapsed_ms,
            ),
        )

    async def _vector_search(
        self,
        project_slug: str,
        query: str,
        limit: int,
        entity_types: Optional[list[EntityType]] = None,
        embedding: Optional[list[float]] = None,
    ) -> list[SearchResult]:
        """Search using vector similarity."""
        try:
            # Re-use pre-computed embedding when available
            query_vector = embedding if embedding is not None else await self.embedding.embed_text(query)

            # Search Qdrant
            results = await self.vector.search(
                project_slug=project_slug,
                query_vector=query_vector,
                limit=limit,
            )

            return [
                SearchResult(
                    id=f"chunk_{r['id']}",
                    type="chunk",
                    label="Chunk",
                    name=f"Chunk {r.get('chunk_index', 0)}",
                    content=r["content"][:500],  # Truncate for response
                    score=r["score"],
                    source="vector",
                    connections=[],
                )
                for r in results
            ]
        except Exception as e:
            log.error("Vector search failed", error=str(e))
            return []

    async def _graph_search(
        self,
        graph_name: str,
        query: str,
        limit: int,
        entity_types: Optional[list[EntityType]] = None,
    ) -> list[SearchResult]:
        """Search using graph text matching."""
        try:
            # Build type filter
            type_filter = ""
            if entity_types:
                type_labels = "|".join(entity_types)
                type_filter = f":{type_labels}"

            # Search by name containing query (case-insensitive)
            # Note: Simplified query to avoid AGE column name parsing issues
            cypher = f"""
                MATCH (n{type_filter})
                WHERE toLower(n.name) CONTAINS toLower('{query}')
                   OR toLower(n.description) CONTAINS toLower('{query}')
                RETURN id(n) as id, n.name as entity_name, labels(n) as entity_type, n.description as description
                LIMIT {limit}
            """

            results = await self.db.execute_cypher(graph_name, cypher)

            return [
                SearchResult(
                    id=str(r.get("id", "")),
                    type="entity",
                    label=normalize_label(r.get("entity_type", "Unknown")),
                    name=r.get("entity_name", ""),
                    content=r.get("description", "") or r.get("entity_name", ""),
                    score=1.0,  # Graph matches are exact
                    source="graph",
                    connections=[],  # Simplified - no connections in basic search
                )
                for r in results
                if r.get("entity_name")
            ]
        except Exception as e:
            log.error("Graph search failed", error=str(e))
            return []
