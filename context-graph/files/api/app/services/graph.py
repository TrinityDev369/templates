"""Graph operations service using Apache AGE"""

import json
import logging
from typing import Any, Optional

import structlog

from app.services.database import Database
from app.models.entity import Entity, EntityCreate, Relationship, RelationshipCreate, BatchEntityCreate, BatchRelationshipCreate

log = structlog.get_logger()
logger = logging.getLogger(__name__)


def _validate_id(entity_id: str) -> int:
    """Validate and convert entity ID to integer, stripping any prefix."""
    cleaned = str(entity_id)
    # Strip entity_ or chunk_ prefix from search results
    for prefix in ("entity_", "chunk_"):
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
    try:
        return int(cleaned)
    except (ValueError, TypeError):
        raise ValueError(f"Invalid entity ID: {entity_id}")


def _serialize_value(value: Any) -> str:
    """Serialize a single value to AGE Cypher literal syntax."""
    if isinstance(value, str):
        escaped = value.replace("'", "\\'")
        return f"'{escaped}'"
    elif isinstance(value, bool):
        return str(value).lower()
    elif isinstance(value, (int, float)):
        return str(value)
    else:
        escaped = json.dumps(value).replace("'", "\\'")
        return f"'{escaped}'"


def to_cypher_map(props: dict[str, Any]) -> str:
    """Convert a Python dict to Apache AGE Cypher map syntax.

    AGE expects: {name: 'value', count: 42}
    Not JSON: {"name": "value", "count": 42}
    """
    parts = []
    for key, value in props.items():
        if value is None:
            continue
        parts.append(f"{key}: {_serialize_value(value)}")
    return "{" + ", ".join(parts) + "}"


class GraphService:
    """Service for Apache AGE graph operations."""

    def __init__(self, db: Database):
        self.db = db

    async def create_graph(self, graph_name: str) -> bool:
        """Create a new graph namespace."""
        try:
            await self.db.execute(
                "SELECT ag_catalog.create_graph(%s);",
                (graph_name,)
            )
            log.info("Graph created", graph_name=graph_name)
            return True
        except Exception as e:
            if "already exists" in str(e):
                log.info("Graph already exists", graph_name=graph_name)
                return True
            log.error("Failed to create graph", graph_name=graph_name, error=str(e))
            raise

    async def drop_graph(self, graph_name: str) -> bool:
        """Drop a graph namespace."""
        try:
            await self.db.execute(
                "SELECT ag_catalog.drop_graph(%s, true);",
                (graph_name,)
            )
            log.info("Graph dropped", graph_name=graph_name)
            return True
        except Exception as e:
            log.error("Failed to drop graph", graph_name=graph_name, error=str(e))
            return False

    async def create_entity(self, graph_name: str, entity: EntityCreate) -> dict:
        """Create a node in the graph."""
        props = {"name": entity.name, **entity.properties}
        props_cypher = to_cypher_map(props)

        cypher = f"""
            CREATE (n:{entity.type} {props_cypher})
            RETURN id(n) as id, n.name as name, labels(n) as type
        """

        results = await self.db.execute_cypher(graph_name, cypher)
        if results:
            log.info("Entity created", graph=graph_name, name=entity.name, type=entity.type)
            return results[0]
        return {}

    async def get_entity(self, graph_name: str, entity_id: str) -> Optional[dict]:
        """Get an entity by ID with its connections."""
        safe_id = _validate_id(entity_id)
        cypher = f"""
            MATCH (n)
            WHERE id(n) = {safe_id}
            OPTIONAL MATCH (n)-[r]-(connected)
            RETURN id(n) as id, n.name as name, labels(n) as type, properties(n) as properties, collect({{
                id: id(connected),
                name: connected.name,
                type: labels(connected),
                relationship: type(r),
                direction: CASE WHEN startNode(r) = n THEN 'outgoing' ELSE 'incoming' END
            }}) as connections
        """

        results = await self.db.execute_cypher(graph_name, cypher)
        return results[0] if results else None

    async def list_entities(
        self,
        graph_name: str,
        entity_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[dict]:
        """List entities in the graph."""
        type_filter = f":{entity_type}" if entity_type else ""

        cypher = f"""
            MATCH (n{type_filter})
            RETURN id(n) as id, n.name as name, labels(n) as type, properties(n) as properties
            ORDER BY n.name
            SKIP {offset}
            LIMIT {limit}
        """

        return await self.db.execute_cypher(graph_name, cypher)

    async def delete_entity(self, graph_name: str, entity_id: str) -> bool:
        """Delete an entity and its relationships."""
        safe_id = _validate_id(entity_id)
        cypher = f"""
            MATCH (n)
            WHERE id(n) = {safe_id}
            DETACH DELETE n
            RETURN count(*) as deleted
        """

        results = await self.db.execute_cypher(graph_name, cypher)
        return bool(results)

    async def create_relationship(self, graph_name: str, rel: RelationshipCreate) -> dict:
        """Create a relationship between entities."""
        safe_source = _validate_id(rel.source_id)
        safe_target = _validate_id(rel.target_id)
        props_cypher = to_cypher_map(rel.properties) if rel.properties else "{}"

        cypher = f"""
            MATCH (a), (b)
            WHERE id(a) = {safe_source} AND id(b) = {safe_target}
            CREATE (a)-[r:{rel.type} {props_cypher}]->(b)
            RETURN id(r) as id, type(r) as type
        """

        results = await self.db.execute_cypher(graph_name, cypher)
        if results:
            log.info("Relationship created", graph=graph_name, type=rel.type)
            return results[0]
        return {}

    async def list_relationships(self, graph_name: str, limit: int = 100) -> list[dict]:
        """List relationships in the graph."""
        cypher = f"""
            MATCH (a)-[r]->(b)
            RETURN id(r) as id, id(a) as source_id, id(b) as target_id,
                   type(r) as type, properties(r) as properties,
                   a.name as source_name, b.name as target_name
            LIMIT {limit}
        """

        return await self.db.execute_cypher(graph_name, cypher)

    async def get_local_graph(
        self,
        graph_name: str,
        entity_id: str,
        depth: int = 2
    ) -> dict:
        """Get local neighborhood of an entity."""
        safe_id = _validate_id(entity_id)
        cypher = f"""
            MATCH path = (start)-[*1..{depth}]-(connected)
            WHERE id(start) = {safe_id}
            WITH nodes(path) as ns, relationships(path) as rs
            UNWIND ns as n
            WITH collect(DISTINCT {{
                id: id(n),
                name: n.name,
                type: labels(n),
                properties: properties(n)
            }}) as nodes, rs
            UNWIND rs as r
            RETURN nodes, collect(DISTINCT {{
                id: id(r),
                source: id(startNode(r)),
                target: id(endNode(r)),
                type: type(r)
            }}) as edges
        """

        results = await self.db.execute_cypher(graph_name, cypher)
        if results:
            return results[0]
        return {"nodes": [], "edges": []}

    async def get_full_graph(
        self,
        graph_name: str,
        limit: int = 1000,
        types: list[str] | None = None
    ) -> dict:
        """Get full graph for visualization.

        Args:
            graph_name: Name of the graph
            limit: Maximum nodes to return
            types: Optional list of entity types to filter by
        """
        nodes = []

        if types:
            # Fetch nodes for each type separately (AGE requires label in MATCH pattern)
            for entity_type in types:
                type_cypher = f"""
                    MATCH (n:{entity_type})
                    RETURN id(n) as id, n.name as name, labels(n) as type, properties(n) as properties
                    ORDER BY n.name
                    LIMIT {limit}
                """
                type_nodes = await self.db.execute_cypher(graph_name, type_cypher)
                nodes.extend(type_nodes)
        else:
            # Get all nodes without type filter
            nodes_cypher = f"""
                MATCH (n)
                RETURN id(n) as id, n.name as name, labels(n) as type, properties(n) as properties
                LIMIT {limit}
            """
            nodes = await self.db.execute_cypher(graph_name, nodes_cypher)

        # Get edges between fetched nodes — filter in Cypher via WHERE
        # clause so only relevant edges are transferred from the database.
        node_ids = [str(n.get("id")) for n in nodes]
        if node_ids:
            id_list = ", ".join(node_ids)
            edges_cypher = f"""
                MATCH (a)-[r]->(b)
                WHERE id(a) IN [{id_list}] AND id(b) IN [{id_list}]
                RETURN id(r) as id, id(a) as source, id(b) as target, type(r) as type
                LIMIT {limit * 2}
            """
            edges = await self.db.execute_cypher(graph_name, edges_cypher)
        else:
            edges = []

        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {
                "node_count": len(nodes),
                "edge_count": len(edges),
            }
        }

    # ========================================================================
    # v2 Methods — Update, Batch, Upsert, Find, Relationships, Deduplicate
    # ========================================================================

    async def update_entity(self, graph_name: str, entity_id: str, updates: dict) -> dict:
        """Update entity properties using SET. Pass None values to remove properties."""
        safe_id = _validate_id(entity_id)
        set_clauses = []
        remove_clauses = []

        for key, value in updates.items():
            if value is None:
                remove_clauses.append(f"REMOVE n.{key}")
            else:
                set_clauses.append(f"n.{key} = {_serialize_value(value)}")

        mutation_parts = []
        if set_clauses:
            mutation_parts.append(f"SET {', '.join(set_clauses)}")
        if remove_clauses:
            mutation_parts.append(" ".join(remove_clauses))

        if mutation_parts:
            cypher = f"""
                MATCH (n)
                WHERE id(n) = {safe_id}
                {' '.join(mutation_parts)}
                RETURN id(n) as id, n.name as name, properties(n) as properties
            """
        else:
            # No changes, just fetch and return
            cypher = f"""
                MATCH (n)
                WHERE id(n) = {safe_id}
                RETURN id(n) as id, n.name as name, properties(n) as properties
            """

        results = await self.db.execute_cypher(graph_name, cypher)
        if results:
            log.info("Entity updated", graph=graph_name, entity_id=entity_id)
            return results[0]
        return {}

    async def batch_create(
        self,
        graph_name: str,
        entities: list[BatchEntityCreate],
        relationships: list[BatchRelationshipCreate],
    ) -> dict:
        """Create entities first, resolve refs, then create relationships."""
        ref_to_id: dict[str, str] = {}
        entities_created = []
        relationships_created = []
        errors = []

        # Phase 1: Create all entities
        for entity in entities:
            try:
                entity_create = EntityCreate(
                    name=entity.name,
                    type=entity.type,
                    properties={
                        **({"description": entity.description} if entity.description else {}),
                        **entity.properties,
                    },
                )
                result = await self.create_entity(graph_name, entity_create)
                entity_id = str(result.get("id", ""))
                if entity.ref:
                    ref_to_id[entity.ref] = entity_id
                entities_created.append({
                    "ref": entity.ref or "",
                    "id": entity_id,
                    "name": entity.name,
                })
            except Exception as e:
                errors.append(f"Entity '{entity.name}': {str(e)}")

        # Phase 2: Resolve refs in relationships and create
        for rel in relationships:
            try:
                resolved_source = ref_to_id.get(rel.from_ref, rel.from_ref)
                resolved_target = ref_to_id.get(rel.to_ref, rel.to_ref)
                rel_create = RelationshipCreate(
                    source_id=resolved_source,
                    target_id=resolved_target,
                    type=rel.type,
                    properties=rel.properties,
                )
                result = await self.create_relationship(graph_name, rel_create)
                relationships_created.append({
                    "id": str(result.get("id", "")),
                    "from": resolved_source,
                    "to": resolved_target,
                    "type": rel.type,
                })
            except Exception as e:
                errors.append(f"Relationship '{rel.from_ref}'->{rel.to_ref}': {str(e)}")

        return {
            "entities_created": entities_created,
            "relationships_created": relationships_created,
            "errors": errors,
        }

    async def upsert_entity(self, graph_name: str, entity: EntityCreate, description: Optional[str] = None) -> tuple[dict, bool]:
        """Create or merge entity by name+type. Returns (entity, created)."""
        escaped_name = entity.name.replace("'", "\\'")

        find_cypher = f"""
            MATCH (n:{entity.type})
            WHERE toLower(n.name) = toLower('{escaped_name}')
            RETURN id(n) as id, n.name as name, properties(n) as properties
        """
        existing = await self.db.execute_cypher(graph_name, find_cypher)

        if existing:
            # Merge properties
            entity_id = str(existing[0]["id"])
            existing_props = existing[0].get("properties", {}) or {}
            merged_props = {**existing_props, **entity.properties}
            if description:
                merged_props["description"] = description
            await self.update_entity(graph_name, entity_id, merged_props)
            merged_keys = [k for k in entity.properties if k in existing_props]
            return {
                "id": entity_id,
                "name": existing[0].get("name", entity.name),
                "properties": merged_props,
                "merged_properties": merged_keys,
            }, False
        else:
            # Create new
            props = {**entity.properties}
            if description:
                props["description"] = description
            entity_with_desc = EntityCreate(
                name=entity.name,
                type=entity.type,
                properties=props,
            )
            result = await self.create_entity(graph_name, entity_with_desc)
            return {
                "id": str(result.get("id", "")),
                "name": entity.name,
                "properties": props,
                "merged_properties": [],
            }, True

    async def find_entity_by_name(self, graph_name: str, name: str, entity_type: Optional[str] = None) -> list[dict]:
        """Find entities by exact name (case-insensitive)."""
        type_filter = f":{entity_type}" if entity_type else ""
        escaped_name = name.replace("'", "\\'")

        # First find matching entities
        find_cypher = f"""
            MATCH (n{type_filter})
            WHERE toLower(n.name) = toLower('{escaped_name}')
            RETURN id(n) as id, n.name as name, labels(n) as type, properties(n) as properties
        """
        entities = await self.db.execute_cypher(graph_name, find_cypher)

        # Then get connections for each entity
        results = []
        for entity in entities:
            entity_id = _validate_id(entity.get("id"))
            conn_cypher = f"""
                MATCH (n)-[r]-(connected)
                WHERE id(n) = {entity_id}
                RETURN id(connected) as conn_id, connected.name as conn_name,
                       labels(connected) as conn_type, type(r) as rel_type,
                       CASE WHEN startNode(r) = n THEN 'outgoing' ELSE 'incoming' END as direction
            """
            connections = await self.db.execute_cypher(graph_name, conn_cypher)
            results.append({
                **entity,
                "connections": [
                    {
                        "id": str(c.get("conn_id", "")),
                        "name": c.get("conn_name", ""),
                        "type": c.get("conn_type", "Unknown"),
                        "relationship": c.get("rel_type", ""),
                        "direction": c.get("direction", "outgoing"),
                    }
                    for c in connections
                ],
            })

        return results

    async def get_entity_relationships(
        self,
        graph_name: str,
        entity_id: str,
        direction: str = "all",
        rel_type: Optional[str] = None,
    ) -> list[dict]:
        """Get relationships for a specific entity."""
        safe_id = _validate_id(entity_id)
        type_filter = f":{rel_type}" if rel_type else ""

        if direction == "outgoing":
            pattern = f"(n)-[r{type_filter}]->(other)"
        elif direction == "incoming":
            pattern = f"(n)<-[r{type_filter}]-(other)"
        else:
            pattern = f"(n)-[r{type_filter}]-(other)"

        cypher = f"""
            MATCH {pattern}
            WHERE id(n) = {safe_id}
            RETURN id(r) as id, type(r) as type, properties(r) as properties,
                   id(other) as other_id, other.name as other_name, labels(other) as other_type,
                   CASE WHEN startNode(r) = n THEN 'outgoing' ELSE 'incoming' END as direction
        """
        return await self.db.execute_cypher(graph_name, cypher)

    async def batch_delete(self, graph_name: str, entity_ids: list[str]) -> dict:
        """Delete multiple entities and their relationships."""
        safe_ids = [str(_validate_id(eid)) for eid in entity_ids]
        id_list = ", ".join(safe_ids)
        cypher = f"""
            MATCH (n)
            WHERE id(n) IN [{id_list}]
            DETACH DELETE n
            RETURN count(*) as deleted_count
        """
        results = await self.db.execute_cypher(graph_name, cypher)
        return {"deleted": results[0].get("deleted_count", 0) if results else 0}

    async def find_duplicates(self, graph_name: str, entity_type: Optional[str] = None) -> list[dict]:
        """Find entities with duplicate name+type."""
        type_filter = f":{entity_type}" if entity_type else ""

        # Find all entities, group by name+type in Python (AGE map literals cause column conflicts)
        cypher = f"""
            MATCH (n{type_filter})
            RETURN id(n) as id, n.name as name, labels(n) as type, properties(n) as properties
            ORDER BY n.name
        """
        all_entities = await self.db.execute_cypher(graph_name, cypher)

        # Group by lower(name) + type
        groups: dict[str, list[dict]] = {}
        for e in all_entities:
            name = (e.get("name") or "").lower()
            etype = e.get("type", "")
            if isinstance(etype, list):
                etype = etype[0] if etype else ""
            key = f"{name}::{etype}"
            groups.setdefault(key, []).append(e)

        # Return only groups with duplicates
        return [
            {
                "name": entities[0].get("name", ""),
                "type": entities[0].get("type", "Unknown"),
                "duplicates": [
                    {"id": str(e.get("id", "")), "name": e.get("name", ""), "properties": e.get("properties", {})}
                    for e in entities
                ],
            }
            for entities in groups.values()
            if len(entities) > 1
        ]

    async def merge_duplicates(self, graph_name: str, keep_id: str, remove_ids: list[str]) -> dict:
        """Merge duplicate entities: re-point relationships, delete extras."""
        safe_keep = _validate_id(keep_id)
        for remove_id in remove_ids:
            safe_remove = _validate_id(remove_id)

            # Re-point outgoing relationships (preserving original type)
            try:
                # First get the relationships to re-point
                rels = await self.db.execute_cypher(graph_name, f"""
                    MATCH (old)-[r]->(target)
                    WHERE id(old) = {safe_remove} AND id(target) <> {safe_keep}
                    RETURN id(r) as rid, type(r) as rtype, properties(r) as rprops,
                           id(target) as tid
                """)
                for r in rels:
                    rtype = r.get("rtype", "RELATED_TO")
                    rprops = r.get("rprops") or {}
                    props_cypher = to_cypher_map(rprops) if rprops else "{}"
                    tid = _validate_id(r["tid"])
                    await self.db.execute_cypher(graph_name, f"""
                        MATCH (keeper), (target)
                        WHERE id(keeper) = {safe_keep} AND id(target) = {tid}
                        CREATE (keeper)-[nr:{rtype} {props_cypher}]->(target)
                        RETURN id(nr) as id
                    """)
                # Delete old outgoing rels
                if rels:
                    await self.db.execute_cypher(graph_name, f"""
                        MATCH (old)-[r]->(target)
                        WHERE id(old) = {safe_remove} AND id(target) <> {safe_keep}
                        DELETE r
                        RETURN count(*) as deleted
                    """)
            except Exception as e:
                logger.warning("Failed to re-point outgoing relationships for %s: %s", remove_id, e)

            # Re-point incoming relationships (preserving original type)
            try:
                rels = await self.db.execute_cypher(graph_name, f"""
                    MATCH (source)-[r]->(old)
                    WHERE id(old) = {safe_remove} AND id(source) <> {safe_keep}
                    RETURN id(r) as rid, type(r) as rtype, properties(r) as rprops,
                           id(source) as sid
                """)
                for r in rels:
                    rtype = r.get("rtype", "RELATED_TO")
                    rprops = r.get("rprops") or {}
                    props_cypher = to_cypher_map(rprops) if rprops else "{}"
                    sid = _validate_id(r["sid"])
                    await self.db.execute_cypher(graph_name, f"""
                        MATCH (source), (keeper)
                        WHERE id(source) = {sid} AND id(keeper) = {safe_keep}
                        CREATE (source)-[nr:{rtype} {props_cypher}]->(keeper)
                        RETURN id(nr) as id
                    """)
                if rels:
                    await self.db.execute_cypher(graph_name, f"""
                        MATCH (source)-[r]->(old)
                        WHERE id(old) = {safe_remove} AND id(source) <> {safe_keep}
                        DELETE r
                        RETURN count(*) as deleted
                    """)
            except Exception as e:
                logger.warning("Failed to re-point incoming relationships for %s: %s", remove_id, e)

            # Delete duplicate
            await self.delete_entity(graph_name, str(safe_remove))

        return {"kept": keep_id, "removed": remove_ids}

    async def get_graph_stats(self, graph_name: str) -> dict:
        """Get statistics about the graph."""
        stats_cypher = """
            MATCH (n)
            WITH labels(n) as type, count(*) as count
            RETURN type, count
        """

        edge_cypher = """
            MATCH ()-[r]->()
            RETURN count(r) as edge_count
        """

        type_counts = await self.db.execute_cypher(graph_name, stats_cypher)
        edge_result = await self.db.execute_cypher(graph_name, edge_cypher)

        node_count = sum(t.get("count", 0) for t in type_counts)
        edge_count = edge_result[0].get("edge_count", 0) if edge_result else 0

        return {
            "node_count": node_count,
            "edge_count": edge_count,
            "types": {t["type"]: t["count"] for t in type_counts if t.get("type")},
        }
