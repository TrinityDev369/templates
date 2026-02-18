"""Snapshot API router for KG backup and restore"""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, status

from app.models.snapshot import SnapshotCreate, SnapshotResponse, SnapshotDetail, RestoreResponse

router = APIRouter()


async def _get_project(db, slug: str) -> dict:
    """Get project by slug."""
    row = await db.fetch_one(
        "SELECT id, graph_name FROM public.projects WHERE slug = %s",
        (slug,),
    )
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found",
        )
    return dict(row)


@router.post("/snapshots", response_model=SnapshotResponse, status_code=status.HTTP_201_CREATED)
async def create_snapshot(slug: str, body: SnapshotCreate, request: Request):
    """Create a snapshot of the current graph state."""
    db = request.app.state.db
    project = await _get_project(db, slug)
    snapshot_service = request.app.state.snapshot

    result = await snapshot_service.create(
        project_id=project["id"],
        graph_name=project["graph_name"],
        label=body.label,
        trigger=body.trigger,
    )
    return SnapshotResponse(**result)


@router.get("/snapshots", response_model=list[SnapshotResponse])
async def list_snapshots(slug: str, request: Request, limit: int = 20):
    """List snapshots for a project."""
    db = request.app.state.db
    project = await _get_project(db, slug)
    snapshot_service = request.app.state.snapshot

    rows = await snapshot_service.list(project["id"], limit=limit)
    return [SnapshotResponse(**r) for r in rows]


@router.get("/snapshots/{snapshot_id}", response_model=SnapshotDetail)
async def get_snapshot(slug: str, snapshot_id: UUID, request: Request):
    """Get a snapshot with full graph data."""
    snapshot_service = request.app.state.snapshot
    result = await snapshot_service.get(snapshot_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Snapshot '{snapshot_id}' not found",
        )
    return SnapshotDetail(**result)


@router.delete("/snapshots/{snapshot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_snapshot(slug: str, snapshot_id: UUID, request: Request):
    """Delete a snapshot."""
    snapshot_service = request.app.state.snapshot
    deleted = await snapshot_service.delete(snapshot_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Snapshot '{snapshot_id}' not found",
        )
    return None


@router.post("/snapshots/{snapshot_id}/restore", response_model=RestoreResponse)
async def restore_snapshot(slug: str, snapshot_id: UUID, request: Request):
    """Restore graph from a snapshot."""
    db = request.app.state.db
    project = await _get_project(db, slug)
    snapshot_service = request.app.state.snapshot

    try:
        result = await snapshot_service.restore(
            snapshot_id=snapshot_id,
            graph_name=project["graph_name"],
            project_id=project["id"],
        )
        return RestoreResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Restore failed: {str(e)}",
        )
