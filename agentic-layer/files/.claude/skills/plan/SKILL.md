---
name: plan
description: Create an implementation plan from requirements and save to specs/. Use when starting a new feature, fix, or refactor that needs upfront design.
---

# Planning Skill

Create structured implementation plans from requirements.

## Workflow

1. **Analyze** — Parse the requirement, determine task type (feature/fix/refactor/chore) and complexity (simple/medium/complex)
2. **Explore** — Search the codebase for existing patterns, relevant files, and architecture
3. **Design** — Develop technical approach with architecture decisions and implementation strategy
4. **Document** — Write a comprehensive spec to `specs/<descriptive-name>.md`
5. **Report** — Summarize key components and file location

## Plan Format

```markdown
# Plan: <task name>

## Task Description
<describe the task based on the requirement>

## Objective
<what will be accomplished when complete>

## Problem Statement
<the specific problem or opportunity this addresses>

## Solution Approach
<proposed solution and how it addresses the objective>

## Relevant Files
<list files with bullet points explaining relevance>

## Step by Step Tasks

### 1. <First Task>
- <specific action>

### 2. <Second Task>
- <specific action>

## Acceptance Criteria
<measurable criteria for completion>

## Validation Commands
<commands to verify the work>
```

## Guidelines

- Include enough detail for another developer to implement the solution
- Add code examples or pseudo-code for complex logic
- Consider edge cases, error handling, and performance
- Reference existing patterns found in the codebase
- Keep plans actionable — every section should guide implementation
