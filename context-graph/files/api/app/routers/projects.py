"""Projects API router"""

import re
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, status
from psycopg.types.json import Jsonb

from app.models.project import ProjectCreate, ProjectResponse, ProjectListResponse
from app.services.graph import GraphService

router = APIRouter()


def slugify(name: str) -> str:
    """Convert name to URL-safe slug."""
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


@router.get("", response_model=ProjectListResponse)
async def list_projects(request: Request):
    """List all projects."""
    db = request.app.state.db

    rows = await db.fetch_all(
        "SELECT * FROM public.projects ORDER BY created_at ASC"
    )

    projects = []
    for row in rows:
        projects.append(
            ProjectResponse(
                id=row["id"],
                name=row["name"],
                slug=row["slug"],
                graph_name=row["graph_name"],
                description=row["description"],
                settings=row["settings"] or {},
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )
        )

    return ProjectListResponse(projects=projects, total=len(projects))


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate, request: Request):
    """Create a new project with its graph namespace."""
    db = request.app.state.db
    vector = request.app.state.vector

    # Generate slug if not provided
    slug = project.slug or slugify(project.name)
    graph_name = f"project_{slug.replace('-', '_')}"

    # Check if slug exists
    existing = await db.fetch_one(
        "SELECT id FROM public.projects WHERE slug = %s",
        (slug,)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Project with slug '{slug}' already exists"
        )

    # Create project record
    row = await db.fetch_one(
        """
        INSERT INTO public.projects (name, slug, graph_name, description, settings)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
        """,
        (project.name, slug, graph_name, project.description, Jsonb(project.settings) if project.settings else None)
    )

    # Create AGE graph
    graph_service = GraphService(db)
    await graph_service.create_graph(graph_name)

    # Create Qdrant collection
    await vector.create_collection(slug)

    return ProjectResponse(
        id=row["id"],
        name=row["name"],
        slug=row["slug"],
        graph_name=row["graph_name"],
        description=row["description"],
        settings=row["settings"] or {},
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


@router.get("/{slug}", response_model=ProjectResponse)
async def get_project(slug: str, request: Request):
    """Get a project by slug."""
    db = request.app.state.db

    row = await db.fetch_one(
        "SELECT * FROM public.projects WHERE slug = %s",
        (slug,)
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found"
        )

    # Get graph stats
    graph_service = GraphService(db)
    try:
        stats = await graph_service.get_graph_stats(row["graph_name"])
    except Exception:
        stats = None

    return ProjectResponse(
        id=row["id"],
        name=row["name"],
        slug=row["slug"],
        graph_name=row["graph_name"],
        description=row["description"],
        settings=row["settings"] or {},
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        stats=stats,
    )


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(slug: str, request: Request):
    """Delete a project and its graph."""
    db = request.app.state.db
    vector = request.app.state.vector

    row = await db.fetch_one(
        "SELECT * FROM public.projects WHERE slug = %s",
        (slug,)
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found"
        )

    # Drop AGE graph
    graph_service = GraphService(db)
    await graph_service.drop_graph(row["graph_name"])

    # Delete Qdrant collection
    await vector.delete_collection(slug)

    # Delete project record (cascades to documents, chunks)
    await db.execute(
        "DELETE FROM public.projects WHERE slug = %s",
        (slug,)
    )

    return None
