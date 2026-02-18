---
name: swarm
description: Sense the thermodynamic field, spawn context-bundle agents, or create new tasks via intake. Use when orchestrating parallel work, spawning workers, checking field status, or when the user wants to add new work to the system.
---

# Swarm Orchestration

Sense the field, spawn workers, or populate new work.

## Quick Reference

```bash
# Sense field state
python3 scripts/lib/field-query.py --json

# Spawn agent (auto-selects highest-potential task)
bash scripts/spawn.sh

# Spawn for specific task
bash scripts/spawn.sh --task <uuid>

# Spawn with a spec file (no field query)
bash scripts/spawn.sh --spec specs/my-task.md

# Spawn with model override
bash scripts/spawn.sh --model opus

# Preview context bundle without spawning
bash scripts/spawn.sh --dry-run

# Run in background
bash scripts/spawn.sh --background
```

## Workflow

### Step 1: Sense the Field

```bash
python3 scripts/lib/field-query.py --json --limit 10
```

**Decision tree:**
- **Tasks exist (potential > 0.5)** → Go to Step 2 (Spawn)
- **No tasks or all low potential** → Go to Step 3 (Intake)
- **All tasks claimed** → Report status, wait or spawn more

### Step 2: Spawn Workers

The spawn script:
1. Queries field for highest-potential open task (or uses `--task`/`--spec`)
2. Builds context bundle with `build-context-bundle.py`
3. Creates git worktree for isolation
4. Claims task and registers in `agent_presence`
5. Runs `claude` CLI with assembled prompt
6. On completion: merges branch back, cleans up

```bash
# Auto-select from field
bash scripts/spawn.sh

# Multiple workers in parallel
bash scripts/spawn.sh --background
bash scripts/spawn.sh --background
bash scripts/spawn.sh --background
```

### Step 3: Intake (No Tasks Available)

Interview the user:
1. "What problem are you trying to solve?"
2. "What would success look like?"

Transform problems into tasks and insert via SQL:

```sql
INSERT INTO field_nodes (node_type, title, affinity, potential, content)
VALUES ('task', 'Task title', ARRAY['implementer','backend'], 0.8,
        '{"description": "What needs to happen"}'::jsonb);
```

**Affinity reference:**

| Work Type | Affinities |
|-----------|------------|
| Code implementation | `implementer`, `backend`, `frontend` |
| Testing | `tester`, `qa` |
| Code review | `reviewer`, `audit` |
| System design | `architect`, `design` |
| Bug fixes | `debugger`, `bugfix` |
| Documentation | `documenter`, `docs` |
| Infrastructure | `devops`, `infra` |

### Step 4: Monitor

```bash
# Active agents
psql -c "SELECT agent_id, lifecycle_state, current_activity, now() - last_heartbeat as age FROM agent_presence WHERE last_heartbeat > now() - interval '30 minutes';"
```

## Spawn Options

| Option | Description |
|--------|-------------|
| `--spec <path>` | Use spec file (no field query) |
| `--task <uuid>` | Spawn for specific task ID |
| `--model <m>` | Model: opus, sonnet, haiku |
| `--dry-run` | Preview without spawning |
| `--background` | Run in background |
| `--resume <id>` | Resume previous session |

## Context-Bundle Architecture

Agents get identity from **context bundles** — curated knowledge matched to tasks by scoring:

```
Score = (domain_match x 3) + (keyword_hits x 2) + (affinity_overlap x 1.5)
Threshold: 1.0 | Max 4 bundles per task
```

Bundles contain: file refs, conventions, modification targets. When bundles are present, domain manifests are suppressed (bundles supersede).
