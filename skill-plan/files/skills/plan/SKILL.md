---
name: plan
description: Creates a concise engineering implementation plan based on user requirements and saves it to the specs directory. Use when scoping work, planning features, or preparing implementation before writing code. Triggers on "plan", "scope", "design approach", "implementation plan".
argument-hint: "[feature description]"
---

# Plan — Implementation Planning

Analyze a feature request, explore the codebase for context, and produce a structured implementation plan saved to `specs/`. Plans are reviewed before any code is written.

## Workflow

### Step 1: Gather Requirements

**If `$ARGUMENTS` provided:**
- Use the argument as the feature description
- Extract key nouns (components, services, pages) and verbs (create, migrate, refactor)

**If no arguments:**
- Ask the user: "What do you want to build or change?"
- Follow up if needed: "What would success look like?"

Determine the scope:
- **small**: Single file or function change, clear solution path
- **medium**: Multiple files, some design decisions needed
- **large**: Cross-cutting concern, architectural decisions, many files or services

Scope indicators:
- Single function or component mentioned -> small
- Multiple packages or directories mentioned -> medium
- Words like "system", "architecture", "migration", "integration" -> large
- Database changes combined with UI changes -> large

### Step 2: Explore the Codebase

Gather context to inform the plan. Run these in parallel where possible:

1. **Search for related files:**
   ```
   Glob for files matching feature keywords
   Grep for function/component names related to the feature
   ```

2. **Read existing patterns:**
   - Check `specs/` for prior plans on related features
   - Read any existing files that will be modified
   - Look at neighboring files for conventions (imports, exports, naming)

3. **Identify the dependency chain:**
   - What existing modules does this feature depend on?
   - What existing code depends on files that will change?
   - Are there shared types, utilities, or configs involved?

**Output a brief context summary (do not show to user yet):**
```
CONTEXT: Found N related files, M prior specs
PATTERNS: <key conventions observed>
DEPENDENCIES: <modules involved>
```

### Step 3: Identify Affected Files

Based on exploration, build a complete list of files:

- **Files to modify** — existing files that need changes, with a one-line summary of each change
- **Files to create** — new files required, with their purpose
- **Files to read** (reference only) — files the implementer should study but not change

For each file, note:
- The package or directory it lives in
- Whether it has tests that will need updating
- Any shared types or interfaces it exports

### Step 4: Design the Approach

Choose a strategy based on scope:

**Small scope:**
- Single step, direct implementation
- No phases needed

**Medium scope:**
- 2-3 sequential steps
- Each step should be independently testable

**Large scope:**
- Multiple phases with clear boundaries
- Each phase delivers a working (if incomplete) system
- Later phases build on earlier ones without breaking them

Design principles:
- Prefer incremental changes over big rewrites
- Keep each step small enough to review in one pass
- Put risky or uncertain work early so it fails fast
- Database or schema changes always come before code that uses them
- Tests can be written alongside implementation or as a final step

### Step 5: Write the Plan

Create the plan file at `specs/<feature-slug>.md` using this format:

```markdown
# <Feature Name>

## Context
<What exists today and why this change is needed. Reference specific files
or modules discovered during exploration. Keep to 2-4 sentences.>

## Approach
<High-level strategy in 1-2 sentences. State the key design decision
and why it was chosen over alternatives.>

## Steps

### 1. <Step Title>
<What to do, referencing specific file paths. Each step should be
concrete enough that an engineer can start immediately.>

### 2. <Step Title>
<Next step. Include code patterns or signatures if they clarify intent,
but keep them brief.>

### 3. <Step Title>
<Continue as needed. Most plans have 3-7 steps.>

## Files Affected
- `path/to/existing-file.ts` — <what changes and why>
- `path/to/new-file.ts` — <new: purpose of this file>

## Testing
<How to verify the implementation works. Include specific commands
if known, or describe manual verification steps.>

## Risks / Open Questions
- <Potential issues, unknowns, or decisions that need user input>
- <Things that might break or need special attention>
```

**File naming rules:**
- Use kebab-case: `specs/user-auth-flow.md`, `specs/api-rate-limiting.md`
- Keep names short but descriptive (2-4 words)
- Do not include dates or version numbers in the filename

Save the file using the Write tool.

### Step 6: Present for Approval

Show the user a summary of the plan:

```
## Plan: <Feature Name>

**Scope:** <small | medium | large>
**File:** specs/<feature-slug>.md
**Steps:** <N>
**Files affected:** <N existing> modified, <N new> created

### Steps
1. <step title> — <one-line summary>
2. <step title> — <one-line summary>
...

### Key Decisions
- <most important design choice and reasoning>

### Risks
- <top risk or open question>

**Proceed with implementation?** (yes / no / modify)
```

**If "modify":**
- Ask what to change
- Update the spec file
- Re-display the summary

**If "no":**
- Ask for new direction
- Return to Step 1 with updated requirements

**If "yes":**
- Confirm the plan is ready
- Suggest next action: implement directly, spawn agents, or hand off

## Guidelines

**Do:**
- Be specific about file paths — plans with vague references are useless
- Include the "why" alongside the "what" — especially for non-obvious decisions
- Flag risks early — better to surface unknowns before implementation starts
- Keep plans concise — a good plan fits on one screen, not ten
- Reference existing patterns — if the codebase already solves a similar problem, point to it

**Do not:**
- Write implementation code in the plan — save that for the implementation step
- Make assumptions about missing context — ask the user or flag it as an open question
- Over-plan small changes — a 2-line bug fix does not need a 5-phase plan
- Include project-specific credentials, URLs, or secrets in the plan

## Error Handling

- **Feature is too vague:** Ask clarifying questions before proceeding past Step 1
- **No related files found:** Note that this appears to be greenfield work and skip to Step 4
- **Conflicting patterns in codebase:** Flag both approaches in Risks and ask user which to follow
- **User wants to skip planning:** Respect it — suggest writing a minimal 3-line plan at minimum

## Output Format

Keep status updates brief:

```
ANALYZING: <feature description>
EXPLORING: Found <N> related files in <packages>
PLANNING: <scope> scope, <N> steps
SAVED: specs/<feature-slug>.md
AWAITING: User approval
```
