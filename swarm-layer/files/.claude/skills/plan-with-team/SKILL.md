---
name: plan-with-team
description: |
  Full planning workflow: gather requirements, generate spec, discuss for approval,
  decompose into tasks with correct agent affinities, deposit to swarm field, and
  spawn workers. Use when starting a new feature, project, or complex fix that
  requires multiple agents working in parallel.
---

# Plan with Team

End-to-end planning workflow that creates a spec, decomposes it into tasks, and assembles a team.

## Workflow

### Step 1: Requirements Gathering

**If `$ARGS` provided:** Use the argument as requirements.
**If no args:** Ask "What problem are you trying to solve?" + "What would success look like?"

**Complexity levels:**
- **simple**: Single concern, 1-2 files
- **medium**: Multiple files, some design decisions
- **complex**: Cross-cutting, architectural decisions

### Step 2: Context Assembly

Run in parallel:
1. Search knowledge graph: `mcp__knowledge__kg_search(query: "<terms>", project: "codebase")`
2. Check for related prior specs: `Glob specs/*.md`
3. Explore codebase structure

### Step 3: Spec Generation

Save to `specs/<kebab-case-name>.md` following the `/plan` format.

### Step 4: Interactive Approval

```
## Spec Summary

**Title:** <name>
**Complexity:** <simple|medium|complex>
**File:** specs/<name>.md

### Proposed Tasks
1. <task-1> → <affinity>
2. <task-2> → <affinity>

### Team Composition
- <agent-type>: <N> tasks

**Proceed?** (yes / no / modify)
```

### Step 5: Task Decomposition & Field Deposit

**A. Parse tasks from spec's step-by-step section**

**B. Map affinities:**

| Keywords | Affinity |
|----------|----------|
| implement, create, build, write code | `implementer` |
| test, verify, e2e, unit test | `tester` |
| review, audit, check quality | `reviewer` |
| design, architect, plan | `architect` |
| fix, debug, investigate | `debugger` |
| document, readme, docs | `documenter` |
| deploy, infra, CI/CD, docker | `devops` |

**C. Deposit each task:**
```sql
INSERT INTO field_nodes (node_type, title, affinity, potential, content)
VALUES ('task', '<title>', ARRAY['<aff1>','<aff2>'], 0.8,
        '{"description": "<description>"}'::jsonb);
```

### Step 6: Report

```
## Plan Complete

**Spec:** <title>
**File:** specs/<name>.md
**Tasks:** <N> deposited to field

**Team:**
- implementer: <N> tasks
- tester: <N> tasks

**Next:** Run `/swarm` to spawn workers
```

## Agent Types Reference

| Agent | Affinities | Use For |
|-------|------------|---------|
| implementer | implementer, backend, frontend | Building code |
| tester | tester, qa, testing | Writing/running tests |
| reviewer | reviewer, review, audit | Code review |
| architect | architect, design, planning | System design |
| debugger | debugger, bugfix, hotfix | Bug investigation |
| documenter | documenter, docs | Writing docs |
| devops | devops, infra, deploy | Infrastructure |
