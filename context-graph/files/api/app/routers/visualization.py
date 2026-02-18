"""Visualization API router for graph data"""

from typing import Optional

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.services.graph import GraphService
from app.routers.utils import get_graph_name, normalize_label

router = APIRouter()


class GraphNode(BaseModel):
    """Node for visualization."""
    id: str
    label: str
    type: str
    properties: dict
    color: Optional[str] = None


class GraphEdge(BaseModel):
    """Edge for visualization."""
    id: str
    source: str
    target: str
    type: str
    properties: dict = {}


class GraphStats(BaseModel):
    """Graph statistics."""
    node_count: int
    edge_count: int
    types: dict


class GraphVisualizationResponse(BaseModel):
    """Full graph visualization response."""
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    stats: GraphStats


# Entity type colors
TYPE_COLORS = {
    "Component": "#7C3AED",
    "DesignToken": "#10B981",
    "Contract": "#F59E0B",
    "Requirement": "#3B82F6",
    "Person": "#EC4899",
    "Concept": "#8B5CF6",
    "Feature": "#06B6D4",
    "Document": "#64748B",
    "API": "#EF4444",
    "Chunk": "#9CA3AF",
}


@router.get("/graph", response_model=GraphVisualizationResponse)
async def get_visualization_graph(
    slug: str,
    request: Request,
    focus: Optional[str] = None,
    depth: int = 2,
    types: Optional[str] = None,
    limit: int = 500,
):
    """
    Get graph data for visualization.

    Args:
        focus: Entity ID to center the view on (for local graph)
        depth: How many hops from focus node (default: 2)
        types: Comma-separated entity types to include
        limit: Maximum nodes to return (default: 500)
    """
    db = request.app.state.db
    graph_name = await get_graph_name(db, slug)

    graph = GraphService(db)

    # Parse type filter early for use in queries
    type_filter = types.split(",") if types else None

    if focus:
        # Get local neighborhood
        data = await graph.get_local_graph(graph_name, focus, depth=depth)
    elif type_filter:
        # Get filtered graph by types - fetch more to ensure we get all matching
        data = await graph.get_full_graph(graph_name, limit=limit * 3, types=type_filter)
    else:
        # Get full graph
        data = await graph.get_full_graph(graph_name, limit=limit)

    # Transform to visualization format
    nodes = []
    for n in data.get("nodes", []):
        node_type = normalize_label(n.get("type", "Unknown"))

        # Skip if type filter specified and not matching
        if type_filter and node_type not in type_filter:
            continue

        nodes.append(
            GraphNode(
                id=str(n.get("id", "")),
                label=n.get("name", ""),
                type=node_type,
                properties=n.get("properties", {}),
                color=TYPE_COLORS.get(node_type, "#6B7280"),
            )
        )

    edges = []
    node_ids = {n.id for n in nodes}
    for e in data.get("edges", []):
        source = str(e.get("source", ""))
        target = str(e.get("target", ""))

        # Only include edges where both nodes are in our filtered set
        if source in node_ids and target in node_ids:
            edges.append(
                GraphEdge(
                    id=str(e.get("id", "")),
                    source=source,
                    target=target,
                    type=e.get("type", "RELATED_TO"),
                    properties=e.get("properties", {}),
                )
            )

    # Count types
    type_counts = {}
    for n in nodes:
        type_counts[n.type] = type_counts.get(n.type, 0) + 1

    return GraphVisualizationResponse(
        nodes=nodes,
        edges=edges,
        stats=GraphStats(
            node_count=len(nodes),
            edge_count=len(edges),
            types=type_counts,
        ),
    )


@router.get("/graph/local/{entity_id}", response_model=GraphVisualizationResponse)
async def get_local_graph(
    slug: str,
    entity_id: str,
    request: Request,
    depth: int = 2,
):
    """Get local neighborhood of an entity."""
    return await get_visualization_graph(
        slug=slug,
        request=request,
        focus=entity_id,
        depth=depth,
    )
