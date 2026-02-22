# Context Bundle Schema Reference

Complete specification for creating, scoring, and managing context bundles in the Trinity swarm system.

Source of truth: `shared/trinity-swarm-sdk/src/context-bundles.ts`
SQL schema: `_ops/docker/postgres/init/52_context_bundles.sql`

---

## 1. Bundle Schema

```typescript
interface ContextBundle {
  slug: string;           // Unique identifier, kebab-case (e.g., 'auth-jwt')
  domain: string;         // Primary domain (auth, swarm, frontend, devops, crm, legal, content, knowledge)
  title: string;          // Human-readable title
  description: string;    // What this bundle covers
  affinities: string[];   // Tags for matching: ['backend', 'fullstack', 'auth']
  keywords: string[];     // Text-matching triggers: ['jwt', 'token', 'login']
  file_refs: FileRef[];   // Key files with purpose annotations
  modification_targets: ModificationTarget[];  // Files likely to be modified
  kg_queries: KgQueryPrompt[];  // KG queries executed at render time
  conventions: string;    // Compressed markdown — the "dense page"
  priority: number;       // 0-100, tie-breaker for equal scores
  is_active: boolean;     // Toggle without deleting
  version: number;        // Increment on updates
}

interface FileRef {
  path: string;
  purpose: 'read' | 'modify' | 'create' | 'reference';
  annotation?: string;    // One-line explanation of why this file matters
}

interface ModificationTarget {
  path: string;
  description: string;    // What changes are expected here
}

interface KgQueryPrompt {
  query: string;          // Search term sent to KG API
  project?: string;       // KG graph: codebase, knowledge, agency, design-system, content, templates, execution, meta
  limit?: number;         // Max results, default 3
}
```

### SQL Column Types

| Column               | SQL Type           | Default               | Constraint                    |
|----------------------|--------------------|-----------------------|-------------------------------|
| `id`                 | `UUID`             | `gen_random_uuid()`   | PRIMARY KEY                   |
| `slug`               | `VARCHAR(100)`     | —                     | UNIQUE NOT NULL               |
| `domain`             | `VARCHAR(50)`      | —                     | NOT NULL                      |
| `title`              | `VARCHAR(255)`     | —                     | NOT NULL                      |
| `description`        | `TEXT`             | —                     | —                             |
| `affinities`         | `TEXT[]`           | `'{}'`                | GIN indexed                   |
| `keywords`           | `TEXT[]`           | `'{}'`                | GIN indexed                   |
| `file_refs`          | `JSONB`            | `'[]'::jsonb`         | —                             |
| `modification_targets` | `JSONB`          | `'[]'::jsonb`         | —                             |
| `kg_queries`         | `JSONB`            | `'[]'::jsonb`         | —                             |
| `conventions`        | `TEXT`             | `''`                  | —                             |
| `priority`           | `INT`              | `50`                  | CHECK (0-100)                 |
| `is_active`          | `BOOLEAN`          | `true`                | Partial index on `true`       |
| `version`            | `INT`              | `1`                   | —                             |
| `created_at`         | `TIMESTAMPTZ`      | `now()`               | —                             |
| `updated_at`         | `TIMESTAMPTZ`      | `now()`               | —                             |

---

## 2. Scoring Algorithm

```
score = (domain_match * 3.0) + (min(keyword_hits, 3) * 2.0) + (min(affinity_overlap, 2) * 1.5)
```

| Component          | Points Each | Cap | Max Contribution |
|--------------------|-------------|-----|------------------|
| `domain_match`     | 3.0         | 1   | 3.0              |
| `keyword_hits`     | 2.0         | 3   | 6.0              |
| `affinity_overlap` | 1.5         | 2   | 3.0              |
| **Total**          |             |     | **12.0**         |

**Threshold**: 3.0 (below = not attached)
**Max bundles per task**: 4

### How Each Component Scores

- **domain_match**: Bundle `domain` field appears in the task's detected domains (via `detectDomainsFromText()`). Binary: 3.0 or 0.
- **keyword_hits**: Bundle `keywords[]` entries found as case-insensitive substrings in the combined task text (`title + JSON.stringify(content)`). Each hit = 2.0 points, capped at 3 hits.
- **affinity_overlap**: Intersection of bundle `affinities[]` and task `affinity[]`. Each overlap = 1.5 points, capped at 2 overlaps.

### Tie-Breaking

When two bundles have the same `match_score`, `priority` (descending) breaks the tie. Higher priority wins.

---

## 3. SQL Insert Template

```sql
INSERT INTO context_bundles (
  id, slug, domain, title, description,
  affinities, keywords,
  file_refs, modification_targets, kg_queries,
  conventions, priority, is_active, version
) VALUES (
  gen_random_uuid(),
  'my-bundle-slug',
  'domain-name',
  'Bundle Title',
  'One-line description of what this covers',
  ARRAY['affinity1', 'affinity2'],
  ARRAY['keyword1', 'keyword2', 'keyword3', 'keyword4'],
  '[
    {"path": "path/to/file.ts", "purpose": "reference", "annotation": "Main entry point"},
    {"path": "path/to/other.ts", "purpose": "modify", "annotation": "Where changes go"}
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {"query": "search term", "project": "codebase", "limit": 3}
  ]'::jsonb,
  '## Conventions
- Pattern 1: description
- Pattern 2: description
- Gotcha: thing to watch out for',
  50,
  true,
  1
);
```

Use `ON CONFLICT (slug) DO NOTHING` when seeding to make inserts idempotent.

For conventions with newlines in SQL, use `E'...\n...'` escape syntax or dollar-quoting `$$...$$`.

---

## 4. Bundle Design Principles

### One topic, maximum density
A bundle is a chapter, not a book. Cover one cohesive domain. If you need to split, create two bundles with distinct slugs.

### Keywords for recall
Think: "What words would appear in a task title or description that needs this context?" Include 6-12 keywords. Use lowercase. Keywords match as case-insensitive substrings in task text.

### Affinities for routing
Use the standard affinity vocabulary:

`backend` | `frontend` | `fullstack` | `devops` | `auth` | `database` | `testing` | `swarm` | `content` | `legal` | `design` | `implementer` | `reviewer` | `architect` | `qa` | `tester` | `designer` | `cli` | `planning`

### File refs as navigation
Do not list every file. List the 3-5 files an agent MUST know about. Use purpose annotations to signal intent:

| Purpose     | Icon  | Meaning                              |
|-------------|-------|--------------------------------------|
| `read`      | `[R]` | Understand this file before working  |
| `modify`    | `[M]` | Changes go here                      |
| `create`    | `[+]` | New file needed                      |
| `reference` | `[.]` | Lookup/docs, read on demand          |

### Conventions as compressed knowledge
Write like you are briefing a senior dev in 30 seconds. Use markdown bullets. No preamble, no introductions. Start with `## Section Header` and list patterns, then gotchas.

### KG queries for freshness
Add 1-2 queries that pull live context from the knowledge graph at render time. This keeps bundles fresh without manual updates. Queries execute with a 3-second timeout and degrade gracefully on failure.

### Priority as confidence

| Range | Meaning                                        |
|-------|------------------------------------------------|
| 80-100| Core system bundle (auth, review, lifecycle)   |
| 50-79 | Feature bundle (CRM, CLI, thumbnail)           |
| 30-49 | Supporting bundle (docs, templates)            |
| 0-29  | Experimental or low-confidence                 |

---

## 5. Complete Example: auth-jwt

```sql
INSERT INTO context_bundles (
  slug, domain, title, description,
  affinities, keywords,
  file_refs, modification_targets, kg_queries,
  conventions, priority
) VALUES (
  'auth-jwt',
  'auth',
  'Authentication & JWT',
  'JWT token pair generation, session management, auth middleware patterns.',
  ARRAY['backend', 'fullstack', 'auth'],
  ARRAY['jwt', 'token', 'auth', 'login', 'session', 'refresh', 'password', 'mfa', 'oauth'],
  '[
    {"path": "packages/auth/src/lib/jwt.ts", "purpose": "reference", "annotation": "JWT sign/verify, token pair generation"},
    {"path": "packages/auth/src/lib/password.ts", "purpose": "reference", "annotation": "Password hashing with bcrypt"},
    {"path": "packages/auth/src/server.ts", "purpose": "reference", "annotation": "getServerSession for RSC"},
    {"path": "apps/admin/src/domains/auth/", "purpose": "reference", "annotation": "Auth domain components and hooks"}
  ]'::jsonb,
  '[]'::jsonb,
  '[{"query": "JwtService token", "project": "codebase", "limit": 3}]'::jsonb,
  E'## Auth Patterns\n- JWT: 30min access + 7d refresh in httpOnly cookies\n- Import types from `@trinity/auth` (canonical source)\n- Use `getServerSession()` in Server Components, `useSession()` client-side\n- Password: bcrypt with 12 rounds\n## Gotchas\n- Never use auth hooks in Server Components\n- Always validate refresh tokens server-side before issuing new pair\n- OAuth accounts link via `oauth_accounts` table, not `users` directly',
  80
);
```

**Why this bundle works:**
- 9 keywords cover all auth-related task vocabulary
- 3 affinities match backend, fullstack, and auth agent types
- 4 file refs point to the exact files an agent needs (no noise)
- Conventions fit on one screen with zero fluff
- Priority 80 = core system bundle, will win ties against feature bundles

---

## 6. Bundle Lifecycle

```
CREATE ──> MATCH ──> ATTACH ──> RENDER ──> REFRESH
  │          │         │          │           │
  │          │         │          │           └─ refreshBundlesForNode(sql, nodeId, task)
  │          │         │          │              Re-scores at claim time. Picks up new bundles.
  │          │         │          │
  │          │         │          └─ renderBundles(bundles)
  │          │         │             Generates markdown. Executes KG queries. Returns string.
  │          │         │
  │          │         └─ attachBundlesToNode(sql, nodeId, matches)
  │          │            INSERT INTO field_node_bundles. ON CONFLICT DO NOTHING.
  │          │
  │          └─ matchBundlesToNode(sql, task)
  │             Loads all active bundles. Scores each. Returns top 4 above threshold.
  │
  └─ INSERT INTO context_bundles (...)
     Seed via SQL init scripts or runtime insertion.
```

### Lifecycle Operations

| Operation    | Function                       | When                                |
|--------------|--------------------------------|-------------------------------------|
| Create       | SQL INSERT                     | Init scripts or admin action        |
| Match        | `matchBundlesToNode(sql, task)`| On DEPOSITED event (subscriber)     |
| Attach       | `attachBundlesToNode(sql, nodeId, matches)` | Immediately after match  |
| Render       | `renderBundles(bundles)`       | At context assembly time            |
| Refresh      | `refreshBundlesForNode(sql, nodeId, task)` | At claim time (lazy)     |
| Deactivate   | `UPDATE ... SET is_active = false` | When bundle is obsolete         |
| Version      | `UPDATE ... SET version = version + 1` | On any content update       |

### Deactivation

```sql
UPDATE context_bundles SET is_active = false WHERE slug = 'my-bundle-slug';
```

Do not DELETE bundles. Deactivate them. The `field_node_bundles` junction table has `ON DELETE CASCADE`, but historical context is valuable.

### Versioning

Increment `version` on every update. Old attachments auto-refresh at claim time via `refreshBundlesForNode()`, so stale versions are replaced with fresh scores.

```sql
UPDATE context_bundles
SET conventions = '## Updated Conventions\n- New pattern here',
    version = version + 1,
    updated_at = now()
WHERE slug = 'my-bundle-slug';
```

---

## 7. Rendered Output Format

When bundles are rendered into agent context, the output looks like:

```markdown
## Context Bundles (2 attached)

### Authentication & JWT [auth] (score: 9.0)
**Files:**
- [.] `packages/auth/src/lib/jwt.ts` — JWT sign/verify, token pair generation
- [.] `packages/auth/src/lib/password.ts` — Password hashing with bcrypt
- [.] `packages/auth/src/server.ts` — getServerSession for RSC
- [.] `apps/admin/src/domains/auth/` — Auth domain components and hooks

## Auth Patterns
- JWT: 30min access + 7d refresh in httpOnly cookies
- Import types from `@trinity/auth` (canonical source)
...

### Swarm EventBus & Subscribers [swarm] (score: 7.0)
**Files:**
- [.] `shared/trinity-swarm-sdk/src/eventbus.ts` — TaskEventBus singleton
...

### KG Context (from bundle queries)
- **JwtService** (Module): JWT token pair generation and verification
- **TaskEventBus** (Class): Fire-and-forget event dispatcher
```

### File Purpose Icons

```
[R] — read (understand this file before working)
[M] — modify (changes go here)
[+] — create (new file needed)
[.] — reference (lookup/docs, read on demand)
```

---

## 8. Junction Table: field_node_bundles

```sql
CREATE TABLE field_node_bundles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id     UUID NOT NULL REFERENCES field_nodes(id) ON DELETE CASCADE,
    bundle_id   UUID NOT NULL REFERENCES context_bundles(id) ON DELETE CASCADE,
    match_score FLOAT NOT NULL DEFAULT 0,
    attached_at TIMESTAMPTZ DEFAULT now(),
    attached_by VARCHAR(100) DEFAULT 'system:context-bundle',
    UNIQUE(node_id, bundle_id)
);
```

`attached_by` values:
- `system:context-bundle` — attached by DEPOSITED subscriber
- `system:lazy-rematch` — attached by lazy refresh at claim time

---

## 9. Querying Existing Bundles

### List all active bundles
```sql
SELECT slug, domain, title, priority, version, array_length(keywords, 1) as kw_count
FROM context_bundles
WHERE is_active = true
ORDER BY domain, priority DESC;
```

### Check bundle attachments for a task
```sql
SELECT cb.slug, cb.title, fnb.match_score
FROM field_node_bundles fnb
JOIN context_bundles cb ON cb.id = fnb.bundle_id
WHERE fnb.node_id = '<node-uuid>'::uuid
ORDER BY fnb.match_score DESC;
```

### Find bundles matching a keyword
```sql
SELECT slug, title, keywords
FROM context_bundles
WHERE is_active = true
AND 'jwt' = ANY(keywords);
```

### Domain coverage report
```sql
SELECT domain, count(*) as bundle_count, avg(priority)::int as avg_priority
FROM context_bundles
WHERE is_active = true
GROUP BY domain
ORDER BY bundle_count DESC;
```

---

## 10. When Bundles Are Present

When a task has attached bundles, domain manifests (DOMAIN.yaml files from `apps/admin/src/domains/`) are suppressed. Bundles supersede domain manifests because they are more targeted and include KG freshness.

The check happens in `assembleContext()`: if `loadBundlesForNode()` returns non-empty, skip domain manifest injection.
