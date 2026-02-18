# Swarm Layer

Thermodynamic field coordination for Claude Code. Adds autonomous agent spawning, task fields, and context-bundle assembly on top of the [agentic-layer](../agentic-layer/) template.

## Prerequisites

- **agentic-layer** template installed (provides base hooks, commands, agents)
- **PostgreSQL** database (for field_nodes, agent_presence tables)
- **psycopg2** Python package (`pip install psycopg2-binary`)
- **claude** CLI installed and authenticated
- **DATABASE_URL** environment variable set

## Setup

1. Install the agentic-layer template first
2. Copy swarm-layer files into your project
3. Run the schema: `psql $DATABASE_URL -f schema/field-system.sql`
4. Set `DATABASE_URL` in your `.env`

## Billing

Swarm agents can run on either billing mode:

| Mode | Env var | Cost | How |
|------|---------|------|-----|
| **Subscription** (default) | `SWARM_BILLING=subscription` | $0 marginal | Uses Claude Code OAuth login |
| **API** | `SWARM_BILLING=api` | Pay-per-token | Requires `ANTHROPIC_API_KEY` |

The subscription mode strips `ANTHROPIC_API_KEY` from agent subprocess environments, ensuring OAuth is used. Set `SWARM_BILLING=api` only when you need API-specific features or are running outside an authenticated Claude Code session.

### How it works

When `SWARM_BILLING=subscription` (or unset), the spawn script:
1. Removes `ANTHROPIC_API_KEY` from the environment before launching `claude`
2. Claude CLI falls back to its OAuth session (your logged-in subscription)
3. Agent compute is covered by your Claude subscription at no additional cost

When `SWARM_BILLING=api`:
1. `ANTHROPIC_API_KEY` is passed through to child processes
2. Each agent session bills per-token against your API account
3. Use this for CI/CD pipelines or headless environments without OAuth

## Architecture

```
Field Nodes (PostgreSQL)          Context Bundles
  goal -> spec -> task              matched by affinity scoring
       |                              |
  Agent Presence                  Assembled Prompt
  (heartbeats, lifecycle)         (task + bundles + skill)
       |                              |
  spawn.sh -> claude CLI           -> git worktree -> merge back
```

### Thermodynamic Model

- **Potential** (0.0-1.0): How much a task "wants" to be worked on
- **Temperature**: Rises on failures, boosting priority (self-healing)
- **Affinity**: Tags matching tasks to agent specializations
- **Entropy**: Overall field health metric

## Commands

| Command | Purpose |
|---------|---------|
| `/prime [topic]` | Load project context from knowledge graph |
| `/swarm` | Sense field, recommend actions, spawn agents |
| `/spawn [type] [count] [task]` | Launch parallel agents |

## Skills

| Skill | Purpose |
|-------|---------|
| `work` | Claim and execute a task in current session |
| `swarm` | Full CLI reference for field operations |
| `monitor` | Health check: context efficiency, blockers |
| `plan-with-team` | Spec -> tasks -> field deposit -> spawn |
| `prd-intake` | Read a PRD -> decompose into goal/spec/task nodes |

## PRD Intake

The `prd-intake` skill reads a Product Requirements Document and decomposes it into field nodes:

```
PRD -> Goal node (project)
        +-- Spec node (Phase 1)
        |     +-- Task node (implement auth)
        |     +-- Task node (build API)
        |     +-- Task node (create schema)
        +-- Spec node (Phase 2)
              +-- Task node (deploy staging)
```

Usage: `/prd-intake` then provide a file path or paste PRD content.

The skill walks through a structured pipeline:
1. **Parse** the PRD into sections (overview, phases, features, architecture)
2. **Decompose** into a 3-level node tree (goal -> specs -> tasks)
3. **Assign affinities** to each task (backend, frontend, database, auth, devops, etc.)
4. **Present** the full plan for approval before any database writes
5. **Deposit** all nodes atomically into the field
6. **Report** the results with next steps

Each task is made atomic (1-4 hours of agent work), specific, testable, and independent. The skill splits aggressively -- more small tasks is better than fewer large ones.

## Spawning Agents

```bash
# Auto-select highest priority task
bash scripts/spawn.sh

# Specific task
bash scripts/spawn.sh --task <uuid>

# From spec file (no DB needed)
bash scripts/spawn.sh --spec specs/my-feature.md

# Preview without spawning
bash scripts/spawn.sh --dry-run

# Multiple parallel workers
bash scripts/spawn.sh --background
bash scripts/spawn.sh --background
```

## Monitoring

Use the `monitor` skill or query the field directly:

```bash
# Field overview
psql $DATABASE_URL -c "
  SELECT state, count(*) FROM field_nodes
  WHERE node_type = 'task' GROUP BY state;
"

# Active agents
psql $DATABASE_URL -c "
  SELECT agent_id, task_id, last_heartbeat FROM agent_presence
  WHERE last_heartbeat > NOW() - INTERVAL '5 minutes';
"

# High-temperature tasks (failing, need attention)
psql $DATABASE_URL -c "
  SELECT id, title, temperature FROM field_nodes
  WHERE temperature > 0.5 ORDER BY temperature DESC;
"
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | For field mode | PostgreSQL connection |
| `SWARM_BILLING` | No (default: subscription) | `subscription` or `api` |
| `ANTHROPIC_API_KEY` | Only if `SWARM_BILLING=api` | API key for pay-per-token |
| `SWARM_AGENT` | Auto-set | `true` when running as swarm agent |
| `SWARM_AGENT_ID` | Auto-set | Worker identifier |
| `SWARM_TASK_ID` | Auto-set | Claimed task UUID |
