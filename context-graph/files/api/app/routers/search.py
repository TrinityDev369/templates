"""Search API router"""

import asyncio

from fastapi import APIRouter, HTTPException, Request

from app.models.search import SearchRequest, SearchResponse, FanoutSearchResponse, ProjectSearchStats
from app.services.graph import GraphService
from app.services.search import SearchService
from app.services.embedding import EmbeddingService
from app.config import get_settings
from app.routers.utils import get_graph_name

router = APIRouter()
fanout_router = APIRouter()


@router.post("", response_model=SearchResponse)
async def search(slug: str, search_request: SearchRequest, request: Request):
    """
    Hybrid search combining vector similarity and graph traversal.

    Modes:
    - hybrid: Combines vector and graph search (default)
    - vector: Only vector similarity search
    - graph: Only graph text matching
    """
    db = request.app.state.db
    vector = request.app.state.vector
    graph_name = await get_graph_name(db, slug)

    settings = get_settings()
    graph = GraphService(db)
    embedding = EmbeddingService(settings)

    search_service = SearchService(
        db=db,
        graph=graph,
        vector=vector,
        embedding=embedding,
    )

    return await search_service.search(
        project_slug=slug,
        graph_name=graph_name,
        request=search_request,
    )


@fanout_router.post("", response_model=FanoutSearchResponse)
async def fanout_search(search_request: SearchRequest, request: Request):
    """
    Fan-out search across ALL projects.

    Queries every project in parallel and returns merged, deduplicated results
    sorted by score descending. Each result is tagged with its source project.
    """
    db = request.app.state.db
    vector = request.app.state.vector

    # Load all projects
    rows = await db.fetch_all("SELECT slug, graph_name FROM public.projects")
    if not rows:
        return FanoutSearchResponse(
            results=[], total=0, projects_searched=0, project_stats=[]
        )

    settings = get_settings()
    graph = GraphService(db)
    embedding_service = EmbeddingService(settings)
    search_service = SearchService(
        db=db, graph=graph, vector=vector, embedding=embedding_service
    )

    # Pre-compute embedding once for all projects to avoid redundant API calls
    query_embedding = None
    if search_request.mode in ("hybrid", "vector"):
        query_embedding = await embedding_service.embed_text(search_request.query)

    # Fan out searches to all projects
    async def search_project(slug: str, graph_name: str):
        try:
            response = await search_service.search(
                project_slug=slug,
                graph_name=graph_name,
                request=search_request,
                embedding=query_embedding,
            )
            # Tag each result with its source project
            for r in response.results:
                r.project = slug
            return slug, response.results
        except Exception:
            return slug, []

    tasks = [
        search_project(row["slug"], row["graph_name"]) for row in rows
    ]
    project_results = await asyncio.gather(*tasks)

    # Merge and deduplicate by ID
    seen_ids: set[str] = set()
    merged: list = []
    project_stats: list[ProjectSearchStats] = []

    for slug, results in project_results:
        count = 0
        for r in results:
            if r.id not in seen_ids:
                seen_ids.add(r.id)
                merged.append(r)
                count += 1
        project_stats.append(ProjectSearchStats(project=slug, result_count=count))

    # Sort by score descending and apply limit
    merged.sort(key=lambda r: r.score, reverse=True)
    merged = merged[: search_request.limit]

    return FanoutSearchResponse(
        results=merged,
        total=len(merged),
        projects_searched=len(rows),
        project_stats=project_stats,
    )
