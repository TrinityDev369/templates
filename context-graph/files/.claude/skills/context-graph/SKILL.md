---
name: context-graph
description: |
  Context Graph - persistent semantic memory across 8 domain graphs.
  Use this skill when:
  (1) Starting a task - search the right graph before asking questions
  (2) Discovering patterns, gotchas, or important decisions worth preserving
  (3) Exploring relationships between services, people, workflows, or code
  (4) Building awareness - understanding how entities connect across domains
  The context graph is the foundation layer for agent knowledge - always check it first.
---

# Context Graph

Persistent memory with semantic search and graph traversal across 8 domain-specific graphs.

## Graph Domains

| Graph | Slug | Purpose | Primary Types |
|-------|------|---------|---------------|
| **Agency** | `agency` | Clients, contracts, services, personas | Client, Person, Project, Contract, Invoice, Module |
| **Knowledge** | `knowledge` | Concepts, docs, patterns, learnings | Concept, Document, Chunk, Requirement |
| **Codebase** | `codebase` | Code structure, files, APIs | Module, File, Function, Class, API |
| **Content** | `content` | Blog posts, media, published docs | Article, Feature, Document |
| **Templates** | `templates` | Reusable patterns, skills, automations | Template, Skill, Workflow |
| **Design** | `design-system` | UI components, tokens | Component, DesignToken |
| **Execution** | `execution` | Agent runtime, tasks, workflows | Agent, Task, Workflow |
| **Meta** | `meta` | Schemas, migrations, system docs | Schema, Document |

**Default:** Queries without `project` parameter go to `agency`. Always specify the graph slug for other graphs.

## MCP Tools (Preferred)

Use MCP tools directly for 2.5x faster, structured access:

| Tool | Purpose |
|------|---------|
| `mcp__knowledge__kg_health` | Check API status |
| `mcp__knowledge__kg_search` | Hybrid search (vector + graph) |
| `mcp__knowledge__kg_list_entities` | List entities by type |
| `mcp__knowledge__kg_get_entity` | Get entity with connections |
| `mcp__knowledge__kg_find_entity` | Find by exact name |
| `mcp__knowledge__kg_create_entity` | Create new entity |
| `mcp__knowledge__kg_upsert_entity` | Create or update (prevents duplicates) |
| `mcp__knowledge__kg_batch_create` | Bulk create entities + relationships |
| `mcp__knowledge__kg_create_relationship` | Connect entities |
| `mcp__knowledge__kg_entity_relationships` | List entity connections |
| `mcp__knowledge__kg_list_projects` | List graph namespaces |
| `mcp__knowledge__kg_ingest_document` | Ingest docs for RAG |
| `mcp__knowledge__kg_cypher` | Raw Cypher queries |
| `mcp__knowledge__kg_visualize` | Get graph data for visualization |
| `mcp__knowledge__kg_deduplicate` | Find and merge duplicates |

## Agent Workflow

### Start of task — search the right graph:
```
# Business context (clients, services, workflows)
mcp__knowledge__kg_search
  query: "client onboarding"
  project: "agency"

# Code context
mcp__knowledge__kg_search
  query: "authentication"
  project: "codebase"

# Patterns and learnings
mcp__knowledge__kg_search
  query: "deployment pattern"
  project: "knowledge"
```

### During work — note patterns, decisions, gotchas.

### End of task — record learnings:
```
# Use upsert to avoid duplicates
mcp__knowledge__kg_upsert_entity
  name: "JWT Refresh Pattern"
  type: "Concept"
  description: "Rotate refresh tokens on each use, 15min access token TTL"
  project: "knowledge"

# Batch create for multiple entities + relationships
mcp__knowledge__kg_batch_create
  project: "agency"
  entities: [...]
  relationships: [...]
```

## Entity Types

| Category | Types |
|----------|-------|
| Codebase | `Module`, `File`, `Function`, `Class`, `API` |
| Design | `Component`, `DesignToken` |
| Knowledge | `Concept`, `Document`, `Chunk`, `Requirement` |
| Agency | `Client`, `Person`, `Project`, `Contract`, `Invoice` |
| Content | `Article`, `Feature` |
| Templates | `Template`, `Skill`, `Workflow` |
| Execution | `Agent`, `Task` |
| Meta | `Schema` |

Cross-graph types: `Document`, `Concept`, `Person`, `Project`, `Workflow`

For full type reference with per-graph mapping, see [references/entity-types.md](references/entity-types.md).

## Relationship Types

| Category | Types |
|----------|-------|
| Structural | `CONTAINS`, `IMPORTS`, `EXPORTS`, `EXTENDS` |
| Dependency | `USES`, `DEPENDS_ON`, `REQUIRES`, `CALLS` |
| Semantic | `IMPLEMENTS`, `DEFINES`, `REFERENCES`, `RELATED_TO` |
| Organizational | `CREATED_BY`, `OWNS`, `WORKS_ON`, `MANAGES` |

## CLI Reference (For Humans)

```bash
kg search "query" --project=agency
kg list --type=Workflow --project=agency
kg add "Name" --type=Concept --description="..."
kg connect <source-id> <target-id> --relationship=IMPLEMENTS
kg focus <entity-id> --depth=2
kg projects
```

## Codebase Graph

The context graph can map your entire codebase structure - files, functions, imports, and dependencies.

For codebase population strategies and AST extraction, see [references/codebase-graph.md](references/codebase-graph.md).
