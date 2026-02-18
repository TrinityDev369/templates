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

## Architecture

```
Field Nodes (PostgreSQL)          Context Bundles
  goal → spec → task              matched by affinity scoring
       ↓                              ↓
  Agent Presence                  Assembled Prompt
  (heartbeats, lifecycle)         (task + bundles + skill)
       ↓                              ↓
  spawn.sh → claude CLI           → git worktree → merge back
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
| `plan-with-team` | Spec → tasks → field deposit → spawn |

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | For field mode | PostgreSQL connection |
| `SWARM_AGENT` | Auto-set | `true` when running as swarm agent |
| `SWARM_AGENT_ID` | Auto-set | Worker identifier |
| `SWARM_TASK_ID` | Auto-set | Claimed task UUID |
