---
name: work
description: Sense the field, claim the highest-potential task, and execute it directly in this session. Use when the user wants to immediately start working on a field task without spawning separate workers.
---

# Work — Direct Task Execution

Sense the field, claim a task, load context dynamically, and execute it in the current agent session.

## Workflow

### Step 1: Sense the Field

```bash
python3 scripts/lib/field-query.py --json --limit 5
```

Look for unclaimed nodes with the highest effective potential.

**If no tasks available:** Tell user the field is empty. Suggest `/swarm` to create tasks.

### Step 2: Pick and Claim

Select the highest-potential unclaimed task.

```bash
python3 scripts/lib/claim-task.py <node-id> <session-id>
```

Show the user what was claimed:
```
## Claimed Task
**Title:** <title>
**ID:** <id>
**Potential:** <potential>
**Content:** <summary>
```

### Step 3: Assemble Context

**Before writing any code**, assemble context from local files:

1. **Parse the task** — extract package/module names from title/content
2. **Read package manifests** — look for `PACKAGE.md` or `README.md` in relevant dirs
3. **Read context files** based on task domain:
   - Backend tasks → project standards + architecture docs
   - Frontend tasks → component patterns + design docs
   - DevOps tasks → infrastructure docs
4. **Read CLAUDE.md** at project root for global instructions

Display: `CONTEXT: Loaded <N> manifests, <N> context files`

### Step 4: Execute

Read the task content carefully. Execute using all available tools:
- Apply context loaded in Step 3
- Write/edit code as needed
- Run tests if applicable
- Follow project standards from CLAUDE.md

### Step 5: Knowledge Capture (optional)

After completing work, record learnings if your project uses a knowledge graph:

```
mcp__knowledge__kg_ingest_document(
  filename: "work-session-<task-slug>.md",
  content: "<structured summary>",
  content_type: "note"
)
```

### Step 6: Resolve

```bash
python3 scripts/lib/resolve-task.py <task-id>
```

Report:
```
## Task Complete
**Title:** <title>
**Summary:** <what was done>
**Files:** <list of modified files>
```

## Error Handling

- **Task blocked** → Skip, pick next available
- **Task ambiguous** → Ask user for clarification
- **Implementation fails** → Document what failed and why
