---
name: prd-intake
description: Read a PRD (Product Requirements Document) and decompose it into field_nodes — goal, specs, and atomic tasks with affinities. Use when ingesting a new project, scoping work from a PRD, or converting requirements into swarm-ready tasks. Triggers on "scope PRD", "ingest PRD", "decompose PRD", "prd to tasks".
---

# PRD Intake — Requirements to Field Nodes

Read a PRD file, decompose it into a hierarchical field node tree (goal -> specs -> tasks), and deposit everything into the thermodynamic field so swarm agents can claim and execute.

## SDK Tools (if using swarm-sdk MCP server)

If your project exposes an MCP server with PRD tools, use these directly:

| Tool | Purpose |
|------|---------|
| `prd_deposit_tree` | Atomic deposit of goal -> specs -> tasks in one transaction |
| `prd_suggest_affinities` | Keyword-based affinity suggestion for a task |
| `prd_check_duplicates` | Search existing nodes to prevent duplicate deposits |

In **MCP agent mode**, call these tools with the appropriate prefix (e.g., `mcp__swarm-prd__prd_deposit_tree`).
In **interactive mode**, use the CLI/SQL commands shown below as fallback.

## Input

The user provides ONE of:
- A **file path** to a PRD (`.md` or `.pdf`)
- A **PRD pasted inline** in the conversation
- A **URL** to a PRD document

If no PRD is provided, ask:
> Which PRD should I scope? Provide a file path, URL, or paste the content.

## Pipeline

### Step 1: Read & Parse the PRD

Read the full PRD content. Extract these sections (adapt to the actual headings found):

| Section | Maps to |
|---------|---------|
| Executive Summary / Overview | Goal node title + description |
| Business Model / Requirements | Spec content |
| Feature Requirements / User Stories | Task source material |
| Technical Architecture | Affinity hints (backend, frontend, database, etc.) |
| Project Phases | Spec boundaries + sequence ordering |
| Success Criteria | Acceptance criteria for tasks |
| Data Model / Schema | Database-affinity tasks |
| Migration / Integration | DevOps-affinity tasks |
| Open Questions | Blocker nodes or notes in task content |

If the PRD has explicit phases (e.g., "Phase 1: Core", "Phase 2: Features"), use each phase as a **spec node** under the goal.

If the PRD has no phases, group tasks by domain (auth, payments, frontend, API, data, etc.).

### Step 2: Build the Node Tree

Structure the decomposition as a 3-level tree:

```
GOAL: "<Project Name> — <One-line summary>"
  |
  +-- SPEC: "Phase 1: <Phase Name>"
  |     +-- TASK: "Implement user registration + login"
  |     +-- TASK: "Set up PostgreSQL schema for users table"
  |     +-- TASK: "Build product catalog API endpoints"
  |     +-- TASK: "Create responsive homepage with branding"
  |
  +-- SPEC: "Phase 2: <Phase Name>"
  |     +-- TASK: "Build subscription management system"
  |     +-- TASK: "Implement admin dashboard"
  |
  +-- SPEC: "Phase 3: Launch"
        +-- TASK: "Data migration from legacy system"
        +-- TASK: "DNS cutover + monitoring setup"
```

### Step 3: Assign Affinities

Map each task to affinities using these rules:

| Keywords in task | Affinities |
|-----------------|------------|
| API, endpoint, backend, server, tRPC | `implementer,backend` |
| component, page, UI, responsive, CSS, layout | `implementer,frontend` |
| schema, migration, table, PostgreSQL, query | `implementer,database` |
| auth, login, JWT, session, password | `implementer,auth` |
| Stripe, payment, billing, subscription | `implementer,backend,payments` |
| deploy, Docker, CI/CD, DNS, monitoring | `devops` |
| migrate, import, export, legacy | `implementer,devops` |
| test, E2E, validation, QA | `tester` |
| review, audit, security | `reviewer` |
| design, branding, logo, typography | `implementer,frontend,design` |
| SEO, analytics, tracking | `implementer,frontend` |
| email, notification, webhook | `implementer,backend` |
| legal, GDPR, privacy, terms | `implementer,legal` |
| documentation, README, spec | `documenter` |

Tasks can have **multiple affinities** (comma-separated). Default to `implementer` if no clear match.

### Step 4: Write Atomic Tasks

Each task MUST be:
- **Atomic**: Completable in a single agent session (1-4 hours of work)
- **Specific**: Clear what files/APIs/components to create or modify
- **Testable**: Has implicit or explicit acceptance criteria
- **Independent**: Can be worked on without blocking other tasks (where possible)

**Task content structure**:

```
<2-3 sentence description of what to build>

Acceptance criteria:
- [ ] <concrete, verifiable criterion>
- [ ] <concrete, verifiable criterion>

References: <relevant PRD section or prior art>
```

**Splitting rules:**
- If a PRD line item requires both frontend AND backend work -> split into 2 tasks
- If a feature has > 3 acceptance criteria -> consider splitting
- Database schema changes are always a separate task from the code that uses them
- Authentication/authorization is always a separate task
- Migrations are always separate from new feature code

### Step 5: Present Plan for Approval

Before depositing anything, show the user a summary table:

```
## PRD Scope: <Project Name>

### Goal: <goal title>

### Phase 1: <name> (N tasks)
| # | Task | Affinities | Seq |
|---|------|-----------|-----|
| 1 | Implement user registration + login | implementer,auth | 1 |
| 2 | Set up PostgreSQL schema | implementer,database | 2 |
...

### Phase 2: <name> (N tasks)
| # | Task | Affinities | Seq |
...

### Team Composition
| Role | Count |
|------|-------|
| implementer | 8 |
| tester | 2 |
| devops | 1 |
| reviewer | 1 |

Total: N tasks across M specs
```

Ask:
> Ready to deposit N tasks into the field? (yes / modify / cancel)

If "modify" -- ask what to change and regenerate the affected section.

### Step 6: Deposit into Field

After approval, deposit the entire tree atomically.

**Preferred: MCP tool (atomic transaction)**

Call `prd_deposit_tree` with the full structure:

```json
{
  "goal": {
    "title": "<Project Name> — <summary>",
    "description": "<executive summary from PRD>",
    "affinities": ["architect", "planner"]
  },
  "specs": [
    {
      "title": "Phase 1: <Phase Name>",
      "description": "<phase scope summary>",
      "affinities": ["architect", "planner"],
      "tasks": [
        {
          "title": "<Task Title>",
          "description": "<description>\n\nAcceptance criteria:\n- [ ] ...",
          "affinities": ["implementer", "backend"],
          "potential": 0.8,
          "sequence_order": 1
        }
      ]
    }
  ],
  "source_prd": "specs/<project>-prd.md"
}
```

This creates all nodes in one database transaction with parent-child links and emits DEPOSITED events for each node.

**Potential values:**
- `0.9` for critical-path tasks (auth, schema, core API)
- `0.8` for standard feature tasks (default)
- `0.7` for nice-to-have or polish tasks
- `0.6` for documentation-only tasks

**Fallback: Direct SQL deposit (one node at a time)**

If no MCP tools are available, deposit directly via SQL:

```bash
# Goal
psql $DATABASE_URL -c "
  INSERT INTO field_nodes (title, node_type, state, potential, affinities, content)
  VALUES ('<Project Name>', 'goal', 'open', 0.9, '{architect,planner}', '<description>')
  RETURNING id;
"

# Spec (use goal_id from above)
psql $DATABASE_URL -c "
  INSERT INTO field_nodes (title, node_type, state, potential, affinities, content, parent_id)
  VALUES ('Phase 1: ...', 'spec', 'open', 0.8, '{architect,planner}', '<description>', '<goal_id>')
  RETURNING id;
"

# Task (use spec_id from above)
psql $DATABASE_URL -c "
  INSERT INTO field_nodes (title, node_type, state, potential, affinities, content, parent_id, sequence_order)
  VALUES ('<Task Title>', 'task', 'open', 0.8, '{implementer,backend}', '<description>', '<spec_id>', 1)
  RETURNING id;
"
```

### Step 7: Report

After all deposits, show the final report:

```
## Deposit Complete

Goal: <id> — <title>

Specs deposited: M
Tasks deposited: N

Breakdown:
  Phase 1: K tasks (IDs: <first>...<last>)
  Phase 2: K tasks (IDs: <first>...<last>)
  ...

Next steps:
  - Run field query to verify tasks are visible:
    psql $DATABASE_URL -c "SELECT id, title, state FROM field_nodes WHERE parent_id = '<spec_id>';"
  - Use /spawn to launch agents against the new tasks
  - Or use /swarm to orchestrate the full swarm
```

## Rules

1. **Never skip approval** — Always show the plan and wait for user confirmation before depositing
2. **Never deposit duplicate tasks** — If re-running on the same PRD, check for existing nodes with similar titles first:
   ```bash
   psql $DATABASE_URL -c "SELECT id, title FROM field_nodes WHERE title ILIKE '%<keyword>%' AND state = 'open';"
   ```
3. **Preserve PRD context** — Include PRD section references in task descriptions so agents have traceability
4. **Flag open questions** — If the PRD has unresolved questions, create them as `error` nodes with affinity `architect` so they get triaged
5. **Respect phase boundaries** — Don't mix Phase 2 tasks into Phase 1 specs
6. **Be generous with splitting** — More small tasks > fewer large tasks. Agents work best on focused, atomic problems
7. **Save the spec** — If the PRD isn't already in `specs/`, copy or summarize it there:
   ```
   specs/<project-slug>-prd.md
   ```

## Examples

### Simple PRD (5-10 tasks)
A landing page with contact form:
- Goal: "Acme Landing Page"
- Spec: "MVP Launch"
- Tasks: homepage layout, contact form, form API endpoint, thank-you page, deploy

### Complex PRD (30-50 tasks)
A SaaS platform rebuild:
- Goal: "Platform Rebuild — Intelligent Backend & Unification"
- Spec 1: "Intelligent Core" (15 tasks)
- Spec 2: "Feature Completion" (12 tasks)
- Spec 3: "Production Launch" (8 tasks)

### PRD with no phases
Group by domain:
- Spec: "Authentication & Users"
- Spec: "Product Catalog & Cart"
- Spec: "Payment & Billing"
- Spec: "Admin & Monitoring"
