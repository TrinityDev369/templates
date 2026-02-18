---
name: context-graph
description: |
  Context Graph - persistent semantic memory across domain graphs.
  Use this skill when:
  (1) Starting a task - search the right graph before asking questions
  (2) Discovering patterns, gotchas, or important decisions worth preserving
  (3) Exploring relationships between services, people, workflows, or code
  (4) Building awareness - understanding how entities connect across domains
  The context graph is the foundation layer for agent knowledge - always check it first.
---

# Context Graph

Persistent memory with semantic search and graph traversal across domain-specific graphs.

**CLI:** `kg <command>` — all operations go through the `kg` CLI (`bin/kg.mjs`).

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

## CLI Commands

### Read

```bash
# List all graphs
kg projects

# Cross-graph search (searches all graphs)
kg search "auth middleware"

# Scoped search (single graph)
kg search "auth" --project=codebase --limit=5

# Search with specific mode
kg search "deployment" --project=knowledge --mode=vector

# List entities (optionally by type)
kg list --project=codebase --type=Module

# Graph statistics
kg stats --project=codebase

# Entity neighborhood — relationships in/out
kg focus "Auth System" --project=codebase
kg focus 844424930132006 --project=codebase
```

### Write

```bash
# Create/upsert entity (prevents duplicates)
kg add "CVA Pattern" --type=Concept --project=knowledge --description="Use CVA for component variants"

# Create relationship between entities
kg connect <from-id> <to-id> --type=DEPENDS_ON --project=codebase

# Ingest document for RAG chunking
kg ingest specs/my-feature.md --project=knowledge
```

### Power

```bash
# Raw Cypher query (read-only)
kg cypher "MATCH (n) RETURN labels(n)[0] as type, count(n) ORDER BY count(n) DESC" --project=codebase
```

### JSON Output

All commands support `--json` for programmatic use:

```bash
kg projects --json
kg search "auth" --json --limit=3
kg list --project=codebase --type=Module --json
```

## Agent Workflow

### Start of task — search the right graph:

```bash
# Business context
kg search "client onboarding" --project=agency

# Code context
kg search "authentication" --project=codebase

# Patterns and learnings
kg search "deployment pattern" --project=knowledge

# Don't know which graph? Cross-graph search:
kg search "my topic"
```

### During work — note patterns, decisions, gotchas:

```bash
# Record a new pattern
kg add "Lazy Init Pattern" --type=Concept --project=knowledge \
  --description="Defer expensive init to first call, not module load"

# Connect it to related code
kg connect <pattern-id> <module-id> --type=IMPLEMENTS --project=codebase
```

### End of task — explore what changed:

```bash
# Check entity neighborhood
kg focus "Auth System" --project=codebase

# Verify new entities
kg list --project=knowledge --type=Concept --limit=10
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

## Codebase Graph

The context graph can map your entire codebase structure - files, functions, imports, and dependencies.

For codebase population strategies and AST extraction, see [references/codebase-graph.md](references/codebase-graph.md).
