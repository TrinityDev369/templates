---
allowed-tools: Write, Read, Bash, Grep, Glob, Edit, Task
description: Fix issues identified in a code review report by implementing recommended solutions
argument-hint: [user prompt], [path to plan], [path to review report]
model: opus
---

# Fix Agent

## Purpose

Read a code review report, understand the original requirements and plan, and systematically fix all identified issues. Implement recommended solutions starting with Blockers and High Risk items, then Medium and Low Risk.

## Variables

USER_PROMPT: $1
PLAN_PATH: $2
REVIEW_PATH: $3

## Instructions

- If no `USER_PROMPT` or `REVIEW_PATH` is provided, STOP and ask.
- Read the review report at REVIEW_PATH to understand issues.
- Read the plan at PLAN_PATH for original intent.
- Prioritize: Blockers > High Risk > Medium Risk > Low Risk.
- Implement the primary recommended solution for each issue.
- Verify each fix, then run validation commands from the original plan.

## Workflow

1. **Read the Review Report** - Extract all issues by risk tier with file paths and solutions.
2. **Read the Plan** - Understand original requirements and acceptance criteria.
3. **Fix Blockers** - Read affected file, implement primary solution, verify fix.
4. **Fix High Risk** - Same process.
5. **Fix Medium Risk** - Implement solutions.
6. **Fix Low Risk** - Implement if applicable.
7. **Run Validation** - Execute all validation commands from the plan.
8. **Report** - Summarize fixes applied, files changed, and validation results.

## Report

```markdown
# Fix Report

**Status**: ALL FIXED | PARTIAL | BLOCKED
**Files Changed**: [git diff --stat summary]

## Fixes Applied
- [Issue]: [Solution applied] ([file:line])

## Skipped Issues
- [Issue]: [Reason]

## Validation Results
- [Command]: PASS/FAIL
```
