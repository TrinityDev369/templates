---
name: context-engineer
description: |
  Inspect, diagnose, and optimize agent context for maximum signal density.
  Identifies context-bloat (too much), context-rot (stale), and context-overfit
  (domain bleeding into agent personality). Manages three context layers:
  (1) Static context files (.claude/context/) — what agents always know,
  (2) Context bundles — dense topical chapters matched per-task via scoring,
  (3) Context graph (KG) — institutional memory agents discover on demand.
  Use when: auditing agent context quality, creating/updating context bundles,
  restructuring .claude/context/ files, seeding the knowledge graph,
  diagnosing why agents lack necessary context or carry too much noise,
  or optimizing context-to-token ratio for swarm agents.
  Triggers on: "context audit", "context health", "bundle", "context-bloat",
  "context-rot", "agent context", "context engineering", "knowledge graph seed".
---

# Context Engineer

Inspect, diagnose, and optimize the context agents receive. Maximize signal density. Eliminate noise.

## Principles

### Three Context Pathologies

1. **Context-bloat** -- Too much context loaded, drowning signal in noise. Token waste. Agents slow down, lose focus, hallucinate from irrelevant material.
2. **Context-rot** -- Stale context referencing deleted files, renamed modules, old patterns, or deprecated conventions. Agents follow ghost instructions.
3. **Context-overfit** -- Domain knowledge bleeding into agent personality. A spiritual SaaS app should not make the coding agent spiritual. Domain knowledge belongs in the KG, not in agent instructions.

### The Separation Principle

- **Codebase context** = technical only (how the code works, patterns, conventions, architecture).
- **Domain/institutional knowledge** = context graph (clients, business rules, product decisions, brand voice).
- The agent must never absorb the product's personality. Building a meditation app? The agent codes it -- it does not meditate.

### Three-Layer Architecture

| Layer | Storage | Loaded When | Purpose |
|-------|---------|-------------|---------|
| Always-know | `.claude/context/` files | Every agent session | Lean, technical, universal conventions |
| Often-discover | `context_bundles` (PostgreSQL) | Per-task, scored and attached | Dense topical chapters (like book chapters) |
| On-demand | Context Graph (KG, 8 graphs) | Task start + bundle render | Institutional memory, entity relationships |

Agents do not need the full codebase. They need a high-level map saying "you are here" and the right chapters open to the right pages.

## Diagnose

### Quick Health Check

Run these in sequence to assess context health.

#### 1. Check static context size

```bash
wc -l .claude/context/*.md
```

Flag any file exceeding 200 lines. Static context must be lean -- every line pays rent in every agent session.

#### 2. Audit bundle coverage

```sql
-- Active bundles by domain
SELECT domain, COUNT(*) as bundles, ARRAY_AGG(slug ORDER BY slug) as slugs
FROM context_bundles WHERE is_active = true
GROUP BY domain ORDER BY domain;

-- Tasks with NO bundles attached (context gaps)
SELECT fn.id, fn.title, fn.affinity
FROM field_nodes fn
LEFT JOIN field_node_bundles fnb ON fn.id = fnb.node_id
WHERE fnb.id IS NULL AND fn.status IN ('open', 'claimed')
ORDER BY fn.created_at DESC LIMIT 20;

-- Low-scoring attachments (weak matches, possible noise)
SELECT cb.slug, cb.domain, fnb.match_score, fn.title
FROM field_node_bundles fnb
JOIN context_bundles cb ON cb.id = fnb.bundle_id
JOIN field_nodes fn ON fn.id = fnb.node_id
WHERE fnb.match_score < 4.0
ORDER BY fnb.match_score ASC LIMIT 20;
```

#### 3. Detect context-rot

```bash
# Check if file_refs in bundles point to files that still exist
psql -At -c "SELECT DISTINCT jsonb_array_elements(file_refs)->>'path' FROM context_bundles WHERE is_active = true" | while read path; do
  [ ! -e "$path" ] && echo "ROT: $path"
done
```

Grep static context files for references to deleted paths or renamed modules:

```bash
grep -n 'packages/' .claude/context/*.md | head -20
```

Cross-check against actual filesystem structure.

#### 4. Detect context-overfit

Read `.claude/context/*.md` and flag any content that describes:
- Brand voice, tone, or personality guidelines
- Business strategy or product vision
- Client-specific workflows or preferences
- Marketing language or value propositions

These belong in the context graph (KG), not in static context.

For full diagnostic SQL queries, see [references/diagnosis-queries.md](references/diagnosis-queries.md).

## Static Context

### What Lives Here

`.claude/context/` files are loaded for every agent. Current inventory:

| File | Purpose | Loaded For |
|------|---------|------------|
| `domains.md` | High-level codebase map (apps, packages, domains) | All agents |
| `standards.md` | TypeScript/coding conventions | backend, frontend, fullstack, implementer, reviewer, debugger, architect |
| `hotpaths.md` | Frequently modified areas | frontend, fullstack, implementer, debugger |
| `web-frontend.md` | Next.js App Router, i18n patterns | frontend |
| `database.md` | PostgreSQL conventions, schema patterns | (manual reference) |
| `domain-manifest.json` | JSON schema for DOMAIN.yaml files | (reference only) |

### Context Routes

The `CONTEXT_ROUTES` map in `shared/trinity-swarm-sdk/src/context-loader.ts` determines which files load per affinity:

```
backend      -> standards.md
frontend     -> standards.md, hotpaths.md, web-frontend.md
devops/infra -> infra.md
fullstack    -> standards.md, hotpaths.md
database     -> infra.md, standards.md
implementer  -> standards.md, hotpaths.md
architect    -> standards.md, infra.md
reviewer     -> standards.md
debugger     -> standards.md, hotpaths.md
```

Default fallback (no affinity match): `standards.md`.

### Rules for Static Context

1. Keep each file under 200 lines. If it exceeds, split or compress.
2. Include only codebase-universal information -- patterns every agent needs regardless of task.
3. No domain knowledge, no client details, no business logic.
4. Reference file paths must be validated regularly (prevent context-rot).
5. Write in imperative/infinitive form. Dense. No filler.
6. When bundles provide domain coverage, domain manifests are suppressed (bundles supersede).

### Modifying Static Context

To add a new context file:
1. Create the `.md` file in `.claude/context/`.
2. Add it to `CONTEXT_ROUTES` in `shared/trinity-swarm-sdk/src/context-loader.ts`.
3. Map it to the appropriate affinities.
4. Verify total static context stays under 1000 lines across all files.

## Context Bundles

Bundles are dense topical chapters. Each covers one domain or concern at maximum signal density. A task gets up to 4 bundles attached via scoring.

### Schema

```typescript
interface ContextBundle {
  slug: string;           // e.g., 'auth-jwt'
  domain: string;         // e.g., 'auth'
  title: string;          // e.g., 'Authentication & JWT'
  description: string;    // What this bundle covers
  affinities: string[];   // Matching tags: ['backend', 'fullstack', 'auth']
  keywords: string[];     // Text matching: ['jwt', 'token', 'login', 'session']
  file_refs: FileRef[];   // [{path, purpose, annotation}]
  modification_targets: ModificationTarget[];  // [{path, description}]
  kg_queries: KgQueryPrompt[];  // [{query, project, limit}] -- executed at render time
  conventions: string;    // Compressed markdown conventions
  priority: number;       // 0-100, tie-breaker
  is_active: boolean;
  version: number;
}
```

`file_refs` purpose values: `read` (agent reads), `modify` (agent changes), `create` (agent creates), `reference` (agent consults).

### Scoring Algorithm

```
score = (domain_match * 3.0) + (min(keyword_hits, 3) * 2.0) + (min(affinity_overlap, 2) * 1.5)
```

- **Domain match** (0 or 3.0): Bundle domain appears in domains detected from task text.
- **Keyword hits** (0-6.0): Count of bundle keywords found in task text, capped at 3 hits.
- **Affinity overlap** (0-3.0): Intersection of bundle affinities and task affinities, capped at 2.

Maximum score: 12.0. Threshold: 3.0. Maximum bundles per task: 4. Ties broken by `priority` (higher wins).

Domain detection uses `DOMAIN_KEYWORDS` map in `context-loader.ts` (10 domains: auth, crm, documents, knowledge, swarm, blog, legal, frontend, projects, billing).

### Lifecycle

1. **Deposit**: Task enters the field via `trinity add` or eventbus.
2. **Match**: `matchBundlesToNode()` scores all active bundles against task text + affinities.
3. **Attach**: `attachBundlesToNode()` writes top matches to `field_node_bundles` junction table.
4. **Refresh**: At claim time, `refreshBundlesForNode()` re-scores lazily so new bundles are always picked up.
5. **Render**: `renderBundles()` produces compact markdown, executes KG queries from bundles in parallel.

### Creating a Bundle

Insert directly via SQL. Use the existing seed bundles in `_ops/docker/postgres/init/52_context_bundles.sql` as templates.

```sql
INSERT INTO context_bundles (
  slug, domain, title, description,
  affinities, keywords,
  file_refs, modification_targets, kg_queries,
  conventions, priority
) VALUES (
  'my-bundle',
  'my-domain',
  'My Bundle Title',
  'One-line description of coverage.',
  ARRAY['backend', 'implementer'],
  ARRAY['keyword1', 'keyword2', 'keyword3'],
  '[
    {"path": "path/to/file.ts", "purpose": "reference", "annotation": "What this file is"}
  ]'::jsonb,
  '[]'::jsonb,
  '[{"query": "search term", "project": "codebase", "limit": 3}]'::jsonb,
  E'## Patterns\n- Pattern 1\n- Pattern 2\n## Gotchas\n- Gotcha 1',
  70
);
```

**Bundle quality checklist:**
- `keywords` list has 6-12 terms covering common phrasings
- `affinities` list covers all agent types that would work on this domain
- `file_refs` point to real, existing files with accurate annotations
- `conventions` is compressed markdown, under 500 characters
- `kg_queries` target the correct project graph with reasonable limits
- `priority` reflects relative importance (80+ for core, 50-79 for standard, <50 for supplementary)

For the full bundle creation guide with examples, see [references/bundle-schema.md](references/bundle-schema.md).

### Auditing Bundles

```sql
-- All bundles with basic stats
SELECT slug, domain, title, priority, is_active,
       array_length(keywords, 1) as kw_count,
       array_length(affinities, 1) as aff_count,
       jsonb_array_length(file_refs) as ref_count
FROM context_bundles ORDER BY domain, priority DESC;

-- Top bundle matches across recent tasks
SELECT cb.slug, cb.domain, AVG(fnb.match_score) as avg_score,
       COUNT(*) as attach_count
FROM field_node_bundles fnb
JOIN context_bundles cb ON cb.id = fnb.bundle_id
GROUP BY cb.slug, cb.domain
ORDER BY attach_count DESC;

-- Bundles never attached (potentially dead)
SELECT cb.slug, cb.domain, cb.title
FROM context_bundles cb
LEFT JOIN field_node_bundles fnb ON cb.id = fnb.bundle_id
WHERE fnb.id IS NULL AND cb.is_active = true;
```

### Updating Bundles

```sql
-- Bump version and update conventions
UPDATE context_bundles
SET conventions = E'## Updated Patterns\n- New pattern here',
    version = version + 1,
    updated_at = now()
WHERE slug = 'my-bundle';

-- Deactivate a stale bundle
UPDATE context_bundles SET is_active = false, updated_at = now()
WHERE slug = 'deprecated-bundle';
```

## Context Graph

### Overview

8 domain-specific graphs for institutional memory. Agents search at task start and bundle KG queries execute at render time.

| Graph | Slug | Primary Types |
|-------|------|---------------|
| Agency | `agency` | Client, Person, Project, Contract |
| Knowledge | `knowledge` | Concept, Document, Chunk |
| Codebase | `codebase` | Module, File, Function, API |
| Content | `content` | Article, Feature, Document |
| Templates | `templates` | Template, Skill, Workflow |
| Design | `design-system` | Component, DesignToken |
| Execution | `execution` | Agent, Task, Workflow |
| Meta | `meta` | Schema, Document |

### Setup

If no context graph is available, initialize it:

```bash
npx @trinity369/use context-graph
```

This seeds the KG with fundamental knowledge entities and relationships.

### When to Push Knowledge Here

Push to the context graph when:
- Information is domain-specific (not codebase-universal)
- Knowledge is institutional (client preferences, business rules, product decisions)
- Entities have relationships worth traversing (A depends on B, X implements Y)
- Information changes frequently (entity updates are cheaper than file edits)
- Knowledge should be discoverable by cross-graph search

Do NOT push to the context graph when:
- Information is a coding convention (goes in `.claude/context/`)
- Information is a dense topical reference (create a context bundle instead)
- The same fact would be duplicated across many entities (compress into a bundle convention)

### CLI Operations

```bash
# Cross-graph search (searches all 8 graphs)
trinity kg search "authentication middleware"

# Scoped search
trinity kg search "client onboarding" --project=agency

# Add entity
trinity kg add "Lazy Init Pattern" --type=Concept --project=knowledge \
  --description="Defer expensive init to first call, not module load"

# Connect entities
trinity kg connect <from-id> <to-id> --type=IMPLEMENTS --project=codebase

# Graph stats
trinity kg stats --project=codebase
```

### KG Queries in Bundles

Bundle `kg_queries` execute at render time (not at match time). They pull fresh entity context into the assembled prompt:

```json
[
  {"query": "auth middleware session", "project": "codebase", "limit": 3},
  {"query": "JWT token rotation", "project": "knowledge", "limit": 2}
]
```

Results are deduplicated and appended as a `### KG Context` section. Queries have a 3-second timeout with graceful degradation (empty results on failure).

## The "You Are Here" Map

Agent orientation works through layered composition:

1. **`domains.md`** (always loaded) -- High-level map: apps, packages, admin domains. The agent knows the full topology.
2. **Context bundles** (scored per-task) -- 2-4 dense chapters teleport the agent to the exact context-point. File refs, conventions, modification targets.
3. **KG queries** (executed at render) -- Fresh entity context from the graph. Relationships, prior work, related patterns.
4. **Context routes** (affinity-based) -- `standards.md`, `hotpaths.md`, etc. loaded based on agent role.

The result: an agent that spawns into the codebase knowing where it is, what matters, and what patterns to follow -- without reading the entire codebase.

### Assembly Order (from `assembleContext()`)

1. Spec context from execution graph (highest priority)
2. Task title and content
3. Context bundles (PRIMARY -- when present, domain manifests are suppressed)
4. Domain manifests (fallback when no bundles match)
5. Relevant file paths
6. Package manifests
7. KG context
8. Codebase conventions (lowest priority, truncated first)
9. Acceptance criteria

Total budget: 16,000 characters. Truncation starts from the bottom.

## Key Source Files

| File | Purpose |
|------|---------|
| `shared/trinity-swarm-sdk/src/context-bundles.ts` | Bundle types, scoring, matching, loading, rendering |
| `shared/trinity-swarm-sdk/src/context-loader.ts` | Context assembly, routes, domain detection, KG queries |
| `_ops/docker/postgres/init/52_context_bundles.sql` | Schema + seed bundles |
| `.claude/context/` | Static context files |

---

Custom bash env for agents (shell profile, env vars, PATH) planned for a future version of this skill.
