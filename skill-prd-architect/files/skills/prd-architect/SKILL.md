---
name: prd-architect
description: >
  Write and iterate on Product Requirements Documents optimized for AI agent execution.
  Produces structured PRDs that swarm agents can directly decompose and implement.
  Supports full PRD lifecycle: create v1, iterate to v2+, and capture implementation learnings.
  Use when: (1) Starting a new client project — "write a PRD", "draft requirements",
  (2) Converting discovery notes into formal requirements, (3) Structuring a project
  scope for AI-driven development, (4) Creating specs from a website scrape or intake call,
  (5) Iterating on an existing PRD — "update PRD", "PRD v2", "revise requirements",
  (6) Post-implementation reflection — "PRD retrospective", "capture learnings".
  Complements prd-intake (which decomposes PRDs into tasks) — this skill WRITES the PRD.
  Triggers on: "write PRD", "draft PRD", "create PRD", "requirements document",
  "scope project", "architect PRD", "PRD for <client>", "update PRD", "PRD v2",
  "revise PRD", "PRD retrospective".
---

# PRD Architect

Write structured, AI-optimized Product Requirements Documents for Trinity Agency projects.

**This skill writes PRDs. Use `prd-intake` to decompose them into swarm tasks.**

## Modes

This skill operates in three modes. Detect the mode from user intent:

| Mode | Trigger | Output |
|------|---------|--------|
| **Create** | "write PRD", "new PRD", "draft requirements" | New PRD at v1.0 |
| **Iterate** | "update PRD", "v2", "revise", existing PRD path provided | Version bump with change log |
| **Reflect** | "retrospective", "capture learnings", post-implementation | Reflection log appended to PRD |

## Input Sources

Accept ONE or more of:
- **Discovery call notes** or client intake questionnaire (from `/intake`)
- **Client website URL** — scrape via firecrawl for current-state audit
- **Inline description** — user describes the project verbally
- **Existing spec or brief** — file path to prior work
- **Existing PRD** (iterate mode) — path to a PRD that needs a version bump
- **Implementation results** (reflect mode) — git diff, agent session logs, or verbal summary of what happened

If insufficient context, ask:
> What's the project? Provide a client name, website URL, or paste your notes.
> To iterate on an existing PRD, provide the file path.

## Workflow

### 1. Gather Context

Before writing, collect:

| Source | Method |
|--------|--------|
| Client website | Scrape with firecrawl — extract: services, pricing, tech stack, content types, friction points |
| Discovery notes | Read file or inline paste |
| Existing systems | Audit current infrastructure — list what exists, what's broken, what's manual |
| KG prior art | `kg_search` for the client or similar past projects |

Spend 2-5 minutes gathering before writing. A well-researched PRD prevents 10x rework downstream.

### 2. Write the PRD

Follow the template structure in [references/prd-template.md](references/prd-template.md).

**Core rules:**
- **Tables over prose** for structured data (features, systems, metrics)
- **Before/After examples** for every automation or workflow improvement
- **P0/P1/P2 priority** on every feature group (P0 = prototype, P1 = v1, P2 = v2+)
- **Explicit out-of-scope** — prevent agent scope creep
- **Measurable success criteria** — no vague "improved UX"
- **Open questions numbered** — unresolved items are first-class, not footnotes
- **Phase boundaries** with concrete checklists (not vague milestones)

**AI-optimization principles:**
- Each feature describes: **what triggers it → what happens → what the user sees**
- Data models use tree notation showing relationships (not ER diagrams)
- Technical architecture uses ASCII diagrams, not image references
- Acceptance criteria are testable by an automated agent
- Phase dependencies are explicit — Phase 2 items never leak into Phase 1
- **Rejected Alternatives** (Section 5.5) — document what was NOT chosen and why, preventing agents from re-proposing dead ends
- **Agent Boundaries** (Section 11) with concrete ALWAYS / ASK FIRST / NEVER rules (from GitHub Spec Kit research — standard across 2,500+ agent configs)
- **Protected Interfaces** (Section 11.2) listing specific files/schemas/APIs with paths and reasons — agents must stop and surface blockers, not silently modify

### 3. Save and Present

Save the PRD to:
```
specs/intake/<project-slug>-prd.md
```

Present a summary to the user:
```
## PRD Complete: <Project Title> (v1.0)

Sections: 13 | Features: N (P0: X, P1: Y, P2: Z)
Phases: M | Open Questions: Q
Saved to: specs/intake/<slug>-prd.md

Next steps:
- Review and approve the PRD
- Run /prd-intake to decompose into swarm tasks
- Generate PDF: use the design-system PRD template
```

## Iterate Workflow (v1 → v2+)

When updating an existing PRD, follow this protocol:

### 1. Read Current Version

Read the existing PRD. Note the current version from frontmatter (`Status: ... vN`).

### 2. Determine Change Scope

| Change Type | Version Bump | Downstream Impact |
|-------------|-------------|-------------------|
| Typo, clarification, wording | v1.0 → v1.1 (patch) | None — no task regeneration |
| New feature added, priority change, phase reorder | v1.x → v1.(x+1) (minor) | Flag affected tasks as stale |
| Architectural change, scope pivot, major cut/add | vN.x → v(N+1).0 (major) | Full task regeneration via prd-intake |

### 3. Apply Changes

- Update the frontmatter version and status
- **Add a Change Log entry** at the top (see template Section 0)
- Make the substantive changes in the body
- If a feature or approach was **removed or replaced**, move it to **Rejected Alternatives** (Section 5.5) with the rationale — never silently delete
- Update Open Questions: resolve any that are now answered, add new ones

### 4. Cascading Regeneration Check

After saving the updated PRD, assess downstream impact:

```
## PRD Updated: <Project Title> (v1.0 → v1.2)

Changes: 3 sections modified
Change log entry added: "Added webhook retry logic to P0, moved SMS to P2"

Downstream impact:
- 2 existing tasks affected (need re-scope or replacement)
- 1 new task needed (webhook retry implementation)

Recommendation: Run /prd-intake with --diff to regenerate affected tasks only
```

If version bump is **major** (vN → v(N+1).0):
> This is a major revision. Recommend running `/prd-intake` to fully regenerate the task tree. Existing in-progress tasks should be reviewed before replacement.

## Reflect Workflow (Post-Implementation)

After a phase or project completes, capture what was learned. This closes the feedback loop from implementation back into the PRD.

### 1. Gather Implementation Evidence

| Source | What to Extract |
|--------|----------------|
| Git log | What was actually built vs. what was specified |
| Agent session logs | Where agents got stuck, asked for help, or deviated |
| Test results | What passed, what failed, what was missing from spec |
| User/client feedback | Post-launch reactions, unexpected use patterns |

### 2. Write the Reflection Log

Append **Section 12: Reflection Log** to the PRD (see template). Each entry captures:

- **What worked** — spec was clear, agents executed without confusion
- **What drifted** — implementation deviated from spec (and why)
- **What was missing** — requirements that should have been in the PRD but weren't
- **Surprises** — things no one anticipated
- **Recommendations** — concrete changes for the next version or future PRDs

### 3. Propagate Learnings

After writing the reflection:

1. **KG ingest** — feed the reflection into the knowledge graph:
   ```
   trinity kg ingest specs/intake/<slug>-prd.md --project=knowledge
   trinity learn "<key insight>" --type=discovery --tags=prd,<project>
   ```
2. **Update patterns** — if a reflection reveals a recurring pattern (e.g., "agents always struggle with auth flows when the PRD doesn't specify token refresh"), add it to the KG as a reusable insight
3. **Feed next version** — if the project continues, the reflection directly informs the v(N+1).0 PRD

## Writing Style

| Do | Don't |
|----|-------|
| "System auto-approves refunds within 14-day EU withdrawal window" | "The refund process should be user-friendly" |
| "Stripe webhook fires `payment_intent.payment_failed` → retry chain triggers" | "Handle failed payments gracefully" |
| "Mobile Lighthouse score >= 90" | "Good mobile performance" |
| "Customer clicks 'Request Refund' → system checks rules → auto-approve or queue for review" | "Implement refund functionality" |
| P0/P1/P2 labels on every section | Unlabeled feature lists |
| Numbered open questions with impact notes | "TBD" scattered throughout |

## Section Reference

The full template with all sections is in [references/prd-template.md](references/prd-template.md). Key sections:

0. **Change Log** — version history with date, author, scope, and downstream impact
1. **Executive Summary** — one-paragraph thesis: problem + solution + outcome
2. **Current State Audit** — systems inventory, observed friction, brand/content, legal
3. **Business Model** — revenue streams, user types, monetization mechanics
4. **Core Concept** — the architectural thesis (what makes this system intelligent)
5. **Feature Requirements** — P0/P1/P2 grouped, each with trigger→action→result
   - 5.5 **Rejected Alternatives** — approaches considered and why they were not chosen
6. **Technical Architecture** — stack table, service diagram, data model tree
7. **Migration Considerations** — data to move, integrations, systems to retire, DNS
8. **Project Phases** — phased delivery with checkbox items per phase
9. **Success Criteria** — measurable targets table
10. **Open Questions** — numbered, with impact classification
11. **Agent Boundaries & Protected Interfaces** — ALWAYS/ASK/NEVER tiers + frozen files
12. **Reflection Log** — post-implementation learnings (added after each phase ships)

## Adapting to Project Type

| Project Type | Emphasis | Skip/Minimize |
|-------------|----------|---------------|
| **Client webapp rebuild** | Current State Audit, Migration, Business Model | — |
| **Internal tool** | Core Concept, Technical Architecture | Business Model, Migration |
| **New SaaS product** | Business Model, Feature Requirements | Current State Audit |
| **Security audit** | Current State Audit, Success Criteria | Business Model |
| **Design system** | Feature Requirements, Technical Architecture | Migration, Business Model |

## Integration Points

- **PDF export**: `shared/design-system/src/pdf/templates/prd.tsx` — PrdDocument component
- **Task decomposition**: `/prd-intake` reads the PRD and creates field_nodes
- **Admin dashboard**: `apps/admin/src/app/[locale]/dashboard/prds/` — PRD management UI
- **Database**: `_ops/docker/postgres/init/34_prd_management.sql` — PRD storage schema
