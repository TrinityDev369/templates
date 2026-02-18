"""Snapshot service for KG backup and restore"""

import json
from typing import Optional
from uuid import UUID

import structlog

from app.services.database import Database
from app.services.graph import GraphService

log = structlog.get_logger()

MAX_SNAPSHOTS_PER_PROJECT = 20


class SnapshotService:
    """Service for creating, listing, and restoring KG snapshots."""

    def __init__(self, db: Database, graph: GraphService):
        self.db = db
        self.graph = graph

    async def ensure_table(self) -> None:
        """Create the kg_snapshots table if it doesn't exist."""
        await self.db.execute("""
            CREATE TABLE IF NOT EXISTS public.kg_snapshots (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID NOT NULL REFERENCES public.projects(id),
                label TEXT,
                trigger TEXT NOT NULL DEFAULT 'manual',
                graph_data JSONB NOT NULL,
                entity_count INT NOT NULL DEFAULT 0,
                relationship_count INT NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        """)
        await self.db.execute("""
            CREATE INDEX IF NOT EXISTS idx_kg_snapshots_project
                ON public.kg_snapshots(project_id, created_at DESC)
        """)

    async def export_all(self, graph_name: str) -> dict:
        """Export all entities and relationships from a graph."""
        entities = await self.graph.list_entities(graph_name, limit=100000)
        relationships = await self.graph.list_relationships(graph_name, limit=100000)

        return {
            "entities": [
                {
                    "age_id": str(e.get("id", "")),
                    "name": e.get("name", ""),
                    "type": e.get("type", ["Unknown"])[0] if isinstance(e.get("type"), list) else str(e.get("type", "Unknown")),
                    "properties": e.get("properties", {}),
                }
                for e in entities
            ],
            "relationships": [
                {
                    "age_id": str(r.get("id", "")),
                    "source_id": str(r.get("source_id", "")),
                    "target_id": str(r.get("target_id", "")),
                    "type": r.get("type", "RELATED_TO"),
                    "properties": r.get("properties", {}),
                    "source_name": r.get("source_name", ""),
                    "target_name": r.get("target_name", ""),
                }
                for r in relationships
            ],
        }

    async def create(
        self,
        project_id: UUID,
        graph_name: str,
        label: Optional[str] = None,
        trigger: str = "manual",
    ) -> dict:
        """Create a snapshot of the current graph state."""
        graph_data = await self.export_all(graph_name)
        entity_count = len(graph_data["entities"])
        relationship_count = len(graph_data["relationships"])

        row = await self.db.fetch_one(
            """
            INSERT INTO public.kg_snapshots (project_id, label, trigger, graph_data, entity_count, relationship_count)
            VALUES (%s, %s, %s, %s::jsonb, %s, %s)
            RETURNING id, project_id, label, trigger, entity_count, relationship_count, created_at
            """,
            (str(project_id), label, trigger, json.dumps(graph_data), entity_count, relationship_count),
        )

        log.info(
            "Snapshot created",
            snapshot_id=str(row["id"]),
            entities=entity_count,
            relationships=relationship_count,
            trigger=trigger,
        )

        # Prune old snapshots beyond limit
        await self._prune(project_id)

        return dict(row)

    async def list(self, project_id: UUID, limit: int = 20) -> list[dict]:
        """List snapshots for a project, newest first."""
        rows = await self.db.fetch_all(
            """
            SELECT id, project_id, label, trigger, entity_count, relationship_count, created_at
            FROM public.kg_snapshots
            WHERE project_id = %s
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (str(project_id), limit),
        )
        return [dict(r) for r in rows]

    async def get(self, snapshot_id: UUID) -> Optional[dict]:
        """Get a snapshot with full graph data."""
        row = await self.db.fetch_one(
            """
            SELECT id, project_id, label, trigger, graph_data, entity_count, relationship_count, created_at
            FROM public.kg_snapshots
            WHERE id = %s
            """,
            (str(snapshot_id),),
        )
        return dict(row) if row else None

    async def delete(self, snapshot_id: UUID) -> bool:
        """Delete a snapshot."""
        row = await self.db.fetch_one(
            "DELETE FROM public.kg_snapshots WHERE id = %s RETURNING id",
            (str(snapshot_id),),
        )
        return row is not None

    async def restore(self, snapshot_id: UUID, graph_name: str, project_id: UUID) -> dict:
        """Restore a graph from a snapshot.

        Strategy:
        1. Auto-snapshot current state as safety net
        2. Drop and recreate the graph
        3. Recreate entities, building old->new ID map
        4. Recreate relationships using the ID map
        """
        snapshot = await self.get(snapshot_id)
        if not snapshot:
            raise ValueError(f"Snapshot {snapshot_id} not found")

        graph_data = snapshot["graph_data"]
        if isinstance(graph_data, str):
            graph_data = json.loads(graph_data)

        # 1. Safety snapshot of current state
        pre_snapshot = await self.create(
            project_id=project_id,
            graph_name=graph_name,
            label=f"Auto pre-restore from {snapshot_id}",
            trigger="auto_pre_restore",
        )

        # 2. Drop and recreate graph
        await self.graph.drop_graph(graph_name)
        await self.graph.create_graph(graph_name)

        # 3. Recreate entities, build ID map
        from app.models.entity import EntityCreate

        old_to_new: dict[str, str] = {}
        entities_restored = 0

        for entity_data in graph_data.get("entities", []):
            props = entity_data.get("properties", {}) or {}
            # Remove 'name' from properties since it's a top-level field
            props.pop("name", None)

            entity = EntityCreate(
                name=entity_data["name"],
                type=entity_data["type"],
                properties=props,
            )
            result = await self.graph.create_entity(graph_name, entity)
            new_id = str(result.get("id", ""))
            old_to_new[entity_data["age_id"]] = new_id
            entities_restored += 1

        # 4. Recreate relationships using ID map
        from app.models.entity import RelationshipCreate

        relationships_restored = 0
        for rel_data in graph_data.get("relationships", []):
            new_source = old_to_new.get(rel_data["source_id"])
            new_target = old_to_new.get(rel_data["target_id"])
            if not new_source or not new_target:
                log.warning(
                    "Skipping relationship - missing entity",
                    source=rel_data["source_id"],
                    target=rel_data["target_id"],
                )
                continue

            rel = RelationshipCreate(
                source_id=new_source,
                target_id=new_target,
                type=rel_data["type"],
                properties=rel_data.get("properties") or {},
            )
            await self.graph.create_relationship(graph_name, rel)
            relationships_restored += 1

        log.info(
            "Graph restored from snapshot",
            snapshot_id=str(snapshot_id),
            entities=entities_restored,
            relationships=relationships_restored,
        )

        return {
            "snapshot_id": snapshot_id,
            "entities_restored": entities_restored,
            "relationships_restored": relationships_restored,
            "pre_restore_snapshot_id": pre_snapshot["id"],
        }

    async def _prune(self, project_id: UUID) -> None:
        """Delete oldest snapshots beyond MAX_SNAPSHOTS_PER_PROJECT."""
        await self.db.execute(
            """
            DELETE FROM public.kg_snapshots
            WHERE id IN (
                SELECT id FROM public.kg_snapshots
                WHERE project_id = %s
                ORDER BY created_at DESC
                OFFSET %s
            )
            """,
            (str(project_id), MAX_SNAPSHOTS_PER_PROJECT),
        )
