---
name: plan-build-review
description: Full agentic pipeline — plan the implementation, build it, review the changes, and fix issues. Chains four phases automatically.
---

# Plan-Build-Review Pipeline

Orchestrate a complete feature lifecycle: plan, build, review, fix. Each phase produces artifacts that feed the next.

## Invocation

```
/plan-build-review <feature description>
```

`$ARGS` is the feature description. If empty, ask: "What feature should I plan, build, and review?"

---

## Phase 1: Plan

**Goal:** Produce a clear, actionable spec before writing any code.

1. **Parse requirements** from `$ARGS` -- what to build, implied constraints, target codebase area.

2. **Explore the codebase:**
   - Glob/Grep for files related to the feature
   - Read key files for existing patterns, types, conventions
   - Check `specs/` for related prior specs

3. **Write the spec** to `specs/<feature-slug>.md`:

   ```markdown
   # Plan: <Feature Name>

   ## Task Description
   <What needs to be built and why>

   ## Objective
   <Clear statement of the end goal>

   ## Relevant Files
   - <path> -- <why it matters>

   ### New Files
   - <path> -- <purpose>

   ## Step-by-Step Implementation Tasks
   ### 1. <Task>
   - <Specific action>
   - <Expected outcome>

   ## Testing Strategy
   - <How to verify correctness>

   ## Acceptance Criteria
   - [ ] <Measurable criterion>
   ```

4. **Report:**
   ```
   PHASE 1 COMPLETE: Plan
   Spec: specs/<slug>.md | Steps: <N> tasks
   ```

**Errors:** If `$ARGS` is too vague, ask the user for clarification. If no relevant files found, proceed greenfield.

---

## Phase 2: Build

**Goal:** Execute every step from the spec, producing working code with commits.

1. **Load the spec.** Parse the `## Step-by-Step Implementation Tasks` section.

2. **For each step** in order:
   - **Read** relevant files from the spec and any discovered during work
   - **Implement** changes following existing code style, with error handling and type annotations
   - **Verify** -- run type-check (`npx tsc --noEmit`), tests, or linter as available
   - **Commit** after each logical unit:
     ```
     git add <specific files>
     git commit -m "<descriptive message>"
     ```

3. **Track progress:**
   ```
   BUILD [1/N]: <description> ... done
   BUILD [2/N]: <description> ... done
   ```

4. **Report:**
   ```
   PHASE 2 COMPLETE: Build
   Commits: <N> | Files changed: <list>
   ```

**Errors:**
- Type-check fails: fix before continuing (skip if pre-existing)
- Test fails: investigate and fix (note if pre-existing)
- Build blocked: stop, report status, ask user for guidance

---

## Phase 3: Review

**Goal:** Analyze all changes for quality, security, and correctness.

1. **Gather the diff:**
   ```bash
   # Auto-detect base branch (works with main, master, develop, trunk)
   BASE=$(git remote show origin 2>/dev/null | awk '/HEAD branch/ {print $NF}' || echo "main")
   git diff "${BASE}...HEAD"
   ```
   On the base branch directly, use `git diff HEAD~<N>` where N = commits from Phase 2.

2. **Analyze changes** across five dimensions:

   - **Security** -- hardcoded secrets, SQL injection, XSS, missing auth checks, sensitive data in logs
   - **Logic** -- off-by-one errors, null access without guards, race conditions, unreachable code
   - **Error Handling** -- uncaught exceptions, missing try/catch on I/O, swallowed errors, missing input validation
   - **Test Coverage** -- new code without tests, untested edge cases, missing negative tests
   - **Code Quality** -- dead code, duplication, overly complex functions, inconsistent naming/style

3. **Classify findings by risk:**

   | Risk | Criteria | Action |
   |------|----------|--------|
   | **Critical** | Security vulnerability, data loss risk | Must fix |
   | **High** | Logic error, broken functionality | Must fix |
   | **Medium** | Quality issue, missing tests | Fix if quick |
   | **Low** | Style nit, docs gap | Note only |

4. **Produce the review report:**
   ```
   REVIEW REPORT
   =============
   Analyzed: <N> files, +<N> -<N>

   CRITICAL (<N>)
   - [C1] <file:line> -- <description>

   HIGH (<N>)
   - [H1] <file:line> -- <description>

   MEDIUM (<N>)
   - [M1] <file:line> -- <description>

   LOW (<N>)
   - [L1] <file:line> -- <description>

   VERDICT: <PASS | PASS WITH NOTES | NEEDS FIXES>
   ```

5. **Verdict rules:**
   - **PASS** -- zero Critical/High
   - **PASS WITH NOTES** -- zero Critical/High, some Medium/Low
   - **NEEDS FIXES** -- any Critical or High present

   If PASS or PASS WITH NOTES, skip Phase 4 and go to Final Summary.

---

## Phase 4: Fix

**Goal:** Address Critical and High findings. Re-review after fixes. Max 2 rounds.

1. **Fix in priority order:** Critical first, then High, then quick-win Medium. Skip Low.

2. **For each fix:**
   - Read the file at the finding location
   - Implement and verify the fix
   - Commit: `git commit -m "fix: <ID> -- <description>"`

3. **Re-review** the fix commits -- check they resolve findings without introducing new issues.

4. **Iterate** if re-review finds new Critical/High issues (max 2 rounds total).

5. **Report:**
   ```
   PHASE 4 COMPLETE: Fix
   Round 1: Fixed <N> (<IDs>)
   Round 2: Fixed <N> (<IDs>) [if applicable]
   Remaining: <N> deferred (<IDs>) [if any]
   ```

**Errors:**
- Fix introduces regression: revert, try alternative, or defer with explanation.
- Max rounds reached: report remaining findings for user to address.

---

## Final Summary

```
PIPELINE COMPLETE: Plan-Build-Review
=====================================

Feature: <description>
Spec: specs/<slug>.md

Build:    <N> commits, <N> files changed
Review:   <verdict> -- <N> critical, <N> high, <N> medium, <N> low
Fixes:    <N> applied, <N> deferred

Acceptance Criteria:
  [x] <criterion>
  [ ] <not met -- explain>
```

---

## Configuration

**Skipping phases:**
- "I have a spec at specs/foo.md" -- start at Phase 2
- "Already built, just review" -- start at Phase 3

**Review focus:**
- "Focus on security" -- prioritize security, reduce code quality emphasis
- "Quick review" -- Critical/High patterns only

**Branch strategy:**
```bash
./scripts/pbr.sh <feature-name>   # creates feat/<feature-name>
/plan-build-review <description>   # runs pipeline on that branch
```
