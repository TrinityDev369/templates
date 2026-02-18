"""Knowledge (entities/relationships) API router"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

from app.models.entity import (
    EntityCreate,
    EntityResponse,
    EntityListResponse,
    EntityUpdate,
    RelationshipCreate,
    Relationship,
    RelationshipListResponse,
    ConnectionResponse,
    BatchCreateRequest,
    BatchCreateResponse,
    BatchDeleteRequest,
    UpsertResponse,
    DeduplicateRequest,
    DeduplicateResponse,
    DuplicateGroup,
)
from app.models.search import CypherRequest, CypherResponse
from app.services.graph import GraphService
from app.routers.utils import get_graph_name, normalize_label, has_dangerous_keywords

router = APIRouter()


@router.get("/entities", response_model=EntityListResponse)
async def list_entities(
    slug: str,
    request: Request,
    type: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
):
    """List entities in the project graph."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    offset = (page - 1) * page_size

    entities = await graph.list_entities(
        graph_name=graph_name,
        entity_type=type,
        limit=page_size,
        offset=offset,
    )

    return EntityListResponse(
        entities=[
            EntityResponse(
                id=str(e.get("id", "")),
                name=e.get("name", ""),
                type=normalize_label(e.get("type", "Unknown")),
                properties=e.get("properties", {}),
                connections=[],
            )
            for e in entities
        ],
        total=len(entities),  # TODO: Get actual total count
        page=page,
        page_size=page_size,
    )


@router.post("/entities", response_model=EntityResponse, status_code=status.HTTP_201_CREATED)
async def create_entity(slug: str, entity: EntityCreate, request: Request):
    """Create a new entity in the graph."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    result = await graph.create_entity(graph_name, entity)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create entity"
        )

    return EntityResponse(
        id=str(result.get("id", "")),
        name=result.get("name", entity.name),
        type=entity.type,
        properties=entity.properties,
        connections=[],
    )


@router.get("/entities/find")
async def find_entity(
    slug: str,
    request: Request,
    name: str = "",
    type: Optional[str] = None,
):
    """Find entities by exact name match (case-insensitive)."""
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'name' query parameter is required"
        )

    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    results = await graph.find_entity_by_name(graph_name, name, entity_type=type)

    return {
        "entities": [
            {
                "id": str(r.get("id", "")),
                "name": r.get("name", ""),
                "type": normalize_label(r.get("type", "Unknown")),
                "properties": r.get("properties", {}),
                "connections": [
                    c for c in r.get("connections", [])
                    if c.get("name")
                ],
            }
            for r in results
        ],
        "total": len(results),
    }


@router.delete("/entities/batch")
async def batch_delete_entities(slug: str, batch: BatchDeleteRequest, request: Request):
    """Delete multiple entities and their relationships."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    # Auto-snapshot before destructive operation
    snapshot_service = request.app.state.snapshot
    project = await db.fetch_one("SELECT id FROM public.projects WHERE slug = %s", (slug,))
    if project:
        await snapshot_service.create(
            project_id=project["id"],
            graph_name=graph_name,
            label=f"Auto before batch_delete ({len(batch.entity_ids)} entities)",
            trigger="auto_pre_batch_delete",
        )

    graph = GraphService(db)
    result = await graph.batch_delete(graph_name, batch.entity_ids)

    return result


@router.post("/entities/deduplicate", response_model=DeduplicateResponse)
async def deduplicate_entities(slug: str, dedup: DeduplicateRequest, request: Request):
    """Find and optionally merge duplicate entities."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    duplicates = await graph.find_duplicates(graph_name, entity_type=dedup.entity_type)

    groups = []
    for dup in duplicates:
        entities = dup.get("duplicates", [])
        if not entities:
            continue
        # Keep the one with lowest ID (oldest)
        sorted_entities = sorted(entities, key=lambda e: int(str(e.get("id", 0))))
        groups.append(DuplicateGroup(
            name=dup.get("name", ""),
            type=normalize_label(dup.get("type", "Unknown")),
            entities=sorted_entities,
            recommended_keep=str(sorted_entities[0].get("id", "")),
        ))

    merged_count = 0
    if not dedup.dry_run and groups:
        # Auto-snapshot before destructive merge
        snapshot_service = request.app.state.snapshot
        project = await db.fetch_one("SELECT id FROM public.projects WHERE slug = %s", (slug,))
        if project:
            await snapshot_service.create(
                project_id=project["id"],
                graph_name=graph_name,
                label=f"Auto before deduplicate ({sum(len(g.entities) - 1 for g in groups)} duplicates)",
                trigger="auto_pre_deduplicate",
            )
        for group in groups:
            keep_id = group.recommended_keep
            remove_ids = [str(e.get("id", "")) for e in group.entities if str(e.get("id", "")) != keep_id]
            if remove_ids:
                await graph.merge_duplicates(graph_name, keep_id, remove_ids)
                merged_count += len(remove_ids)

    total_duplicates = sum(len(g.entities) - 1 for g in groups)

    return DeduplicateResponse(
        duplicate_groups=groups,
        total_duplicates=total_duplicates,
        merged=merged_count,
    )


@router.get("/entities/{entity_id}", response_model=EntityResponse)
async def get_entity(slug: str, entity_id: str, request: Request):
    """Get an entity with its connections."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    result = await graph.get_entity(graph_name, entity_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity '{entity_id}' not found"
        )

    # Parse the result (flat columns from Cypher RETURN)
    connections = result.get("connections", [])

    return EntityResponse(
        id=str(result.get("id", entity_id)),
        name=result.get("name", ""),
        type=normalize_label(result.get("type", "Unknown")),
        properties=result.get("properties", {}),
        connections=[
            ConnectionResponse(
                id=str(c.get("id", "")),
                name=c.get("name", ""),
                type=normalize_label(c.get("type", "Unknown")),
                relationship=c.get("relationship", ""),
                direction=c.get("direction", "outgoing"),
            )
            for c in connections
            if c.get("name")
        ],
    )


@router.delete("/entities/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entity(slug: str, entity_id: str, request: Request):
    """Delete an entity and its relationships."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    success = await graph.delete_entity(graph_name, entity_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity '{entity_id}' not found"
        )

    return None


# ============================================================================
# v2 Endpoints — Batch, Update, Upsert, Find, Deduplicate
# ============================================================================


@router.patch("/entities/{entity_id}", response_model=EntityResponse)
async def update_entity(slug: str, entity_id: str, update: EntityUpdate, request: Request):
    """Update an entity's properties (partial patch)."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)

    # Build updates dict from provided fields
    updates = {}
    if update.name is not None:
        updates["name"] = update.name
    if update.description is not None:
        updates["description"] = update.description
    if update.properties is not None:
        updates.update(update.properties)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided"
        )

    result = await graph.update_entity(graph_name, entity_id, updates)

    if not result:
        # The graph service may return empty on no-op updates.
        # Try fetching the current entity before raising 404.
        existing = await graph.get_entity(graph_name, entity_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entity '{entity_id}' not found"
            )
        node = existing.get("n", {})
        props = node.get("properties", {}) or {}
        return EntityResponse(
            id=entity_id,
            name=node.get("name", ""),
            type=props.get("type", "Concept"),
            properties=props,
            connections=[],
        )

    props = result.get("properties", {}) or {}
    return EntityResponse(
        id=str(result.get("id", entity_id)),
        name=result.get("name", ""),
        type=props.get("type", "Concept"),
        properties=props,
        connections=[],
    )


@router.post("/batch", response_model=BatchCreateResponse, status_code=status.HTTP_201_CREATED)
async def batch_create(slug: str, batch: BatchCreateRequest, request: Request):
    """Create multiple entities and relationships in a single atomic operation."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    result = await graph.batch_create(graph_name, batch.entities, batch.relationships)

    return BatchCreateResponse(
        entities_created=result.get("entities_created", []),
        relationships_created=result.get("relationships_created", []),
        errors=result.get("errors", []),
    )


@router.put("/entities", response_model=UpsertResponse)
async def upsert_entity(slug: str, entity: EntityCreate, request: Request, description: Optional[str] = None):
    """Create an entity or update if one with same name+type exists."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    result, created = await graph.upsert_entity(graph_name, entity, description)

    return UpsertResponse(
        id=str(result.get("id", "")),
        name=result.get("name", entity.name),
        type=entity.type,
        properties=result.get("properties", {}),
        created=created,
        merged_properties=result.get("merged_properties", []),
    )


@router.get("/entities/{entity_id}/relationships")
async def get_entity_relationships(
    slug: str,
    entity_id: str,
    request: Request,
    direction: str = "all",
    type: Optional[str] = None,
):
    """List all relationships for a specific entity."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    results = await graph.get_entity_relationships(
        graph_name, entity_id, direction=direction, rel_type=type
    )

    return {
        "relationships": [
            {
                "id": str(r.get("id", "")),
                "type": r.get("type", ""),
                "direction": r.get("direction", ""),
                "other_id": str(r.get("other_id", "")),
                "other_name": r.get("other_name", ""),
                "other_type": normalize_label(r.get("other_type", "Unknown")),
                "properties": r.get("properties", {}),
            }
            for r in results
        ],
        "total": len(results),
    }


@router.get("/relationships", response_model=RelationshipListResponse)
async def list_relationships(
    slug: str,
    request: Request,
    limit: int = 100,
):
    """List relationships in the project graph."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    relationships = await graph.list_relationships(graph_name, limit=limit)

    return RelationshipListResponse(
        relationships=[
            Relationship(
                id=str(r.get("id", "")),
                source_id=str(r.get("source_id", "")),
                target_id=str(r.get("target_id", "")),
                type=r.get("type", "RELATED_TO"),
                properties=r.get("properties", {}),
            )
            for r in relationships
        ],
        total=len(relationships),
    )


@router.post("/relationships", response_model=Relationship, status_code=status.HTTP_201_CREATED)
async def create_relationship(slug: str, rel: RelationshipCreate, request: Request):
    """Create a relationship between entities."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)
    result = await graph.create_relationship(graph_name, rel)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create relationship"
        )

    return Relationship(
        id=str(result.get("id", "")),
        source_id=rel.source_id,
        target_id=rel.target_id,
        type=rel.type,
        properties=rel.properties,
    )


@router.post("/query/cypher", response_model=CypherResponse)
async def execute_cypher(slug: str, query: CypherRequest, request: Request):
    """Execute a raw Cypher query."""
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    # Security: word-boundary keyword check (safe against substrings like 'dataset')
    if has_dangerous_keywords(query.query):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query contains restricted mutation keywords. Use specific endpoints for mutations."
        )

    try:
        results = await db.execute_cypher(graph_name, query.query)

        return CypherResponse(
            results=results,
            columns=list(results[0].keys()) if results else [],
            row_count=len(results),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cypher query error: {str(e)}"
        )
