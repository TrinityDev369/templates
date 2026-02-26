# Project Instructions

## Identity

<!-- Customize this section for your project -->
**[Your Project Name]** -- brief description of what this project does and who it serves.

## Pipeline: Plan-Build-Review

This project uses an agentic pipeline that chains four phases to ship features safely:

```
Plan --> Build --> Review --> Fix
```

1. **Plan** -- Gather requirements, explore the codebase, produce a spec in `specs/`
2. **Build** -- Execute the spec step by step, committing after each logical unit
3. **Review** -- Analyze all changes via `git diff`, check for security issues, logic errors, missing error handling, and test coverage gaps
4. **Fix** -- Address Critical and High findings from review, re-review, iterate (max 2 rounds)

## Usage

### Full pipeline (recommended)

```
/plan-build-review <feature description>
```

This runs all four phases automatically. The skill will pause if the review phase finds critical issues and attempt to fix them before finishing.

### Optional: create a feature branch first

```bash
./scripts/pbr.sh <feature-name>
```

This creates a `feat/<feature-name>` branch so the pipeline works on an isolated branch that can be merged via PR later.

## Artifacts

| Artifact | Location | Phase |
|----------|----------|-------|
| Spec | `specs/<feature-name>.md` | Plan |
| Commits | Feature branch | Build |
| Review report | Printed to console | Review |
| Fix commits | Feature branch | Fix |

## Rules

1. **Specs before code** -- The Plan phase always writes a spec before any implementation begins
2. **Commit after each unit** -- The Build phase commits after each logical step, not in one big batch
3. **No silent failures** -- If the Build phase hits an error, it stops and reports rather than continuing
4. **Critical/High must be fixed** -- The Fix phase addresses all Critical and High review findings before the pipeline completes
5. **Max 2 fix rounds** -- To prevent infinite loops, the Fix phase iterates at most twice

## Customization

- Edit the skill at `.claude/skills/plan-build-review/SKILL.md` to adjust phase behavior
- Modify `scripts/pbr.sh` to change branch naming conventions
- Add project-specific review criteria by extending Phase 3 in the skill
