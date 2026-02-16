---
description: Creates an implementation plan from requirements and saves to specs/
argument-hint: <requirement>
---

# Quick Plan

Create a detailed implementation plan based on the user's requirements provided through the `USER_PROMPT` variable. Analyze the request, explore the codebase, and save a comprehensive specification to `PLAN_OUTPUT_DIRECTORY/<name>.md`.

## Variables

USER_PROMPT: $1
PLAN_OUTPUT_DIRECTORY: `specs/`

## Instructions

- IMPORTANT: If no `USER_PROMPT` is provided, stop and ask the user to provide it.
- Analyze the requirements and determine task type (feature/fix/refactor/chore) and complexity
- Explore the codebase to understand existing patterns and architecture
- Generate a descriptive kebab-case filename
- Save the plan to `PLAN_OUTPUT_DIRECTORY/<descriptive-name>.md`
- Ensure the plan is detailed enough for another developer to implement

## Workflow

1. Analyze Requirements — Parse the USER_PROMPT to understand the core problem
2. Explore Codebase — Understand existing patterns, architecture, and relevant files
3. Design Solution — Develop technical approach with architecture decisions
4. Document Plan — Structure a comprehensive markdown document
5. Save & Report — Write to `PLAN_OUTPUT_DIRECTORY/<filename>.md` and summarize

## Plan Format

```md
# Plan: <task name>

## Task Description
<describe the task>

## Objective
<what will be accomplished>

## Relevant Files
<list files with explanations>

## Step by Step Tasks

### 1. <Task Name>
- <specific action>

## Acceptance Criteria
<measurable criteria>

## Validation Commands
<commands to verify>
```

## Report

After saving, provide:

```
Plan Created

File: PLAN_OUTPUT_DIRECTORY/<filename>.md
Topic: <brief description>
Key Components:
- <component 1>
- <component 2>
```
