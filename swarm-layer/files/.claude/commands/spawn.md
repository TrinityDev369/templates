---
description: Launch N parallel agents for a task
argument-hint: [agent-type] [count] [task description]
---

# Spawn

Launch one or more parallel agents to work on tasks.

## Variables

AGENT_TYPE: $1
COUNT: $2
TASK_DESCRIPTION: $3

## Instructions

- If no `AGENT_TYPE` provided, show available agent types and ask.
- Default COUNT to 1 if not specified.
- Use the Task tool with `subagent_type` matching the requested agent.
- Launch agents in parallel when count > 1 (multiple Task tool calls in one message).
- Each agent gets the TASK_DESCRIPTION as its prompt.

## Available Agent Types

| Type | Use Case |
|------|----------|
| `builder` | Implement code from specs/plans |
| `scout-report-suggest` | Investigate codebase, report findings |
| `reviewer-agent` | Review code for patterns/security |
| `docs-scraper` | Fetch and save documentation |
| `general-agent` | Flexible multi-purpose tasks |
| `meta-agent` | Create new agent configurations |

## Workflow

1. Parse AGENT_TYPE, COUNT, and TASK_DESCRIPTION
2. Validate agent type exists
3. Launch COUNT agents in parallel via Task tool
4. Report spawn status

## Report

```
Spawned [COUNT] x [AGENT_TYPE] agent(s)
Task: [TASK_DESCRIPTION]
Status: [launched/failed]
```
