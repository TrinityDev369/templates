# Project Instructions

## Identity

<!-- Customize: replace with your project name and description -->
**[Your Project Name]** -- brief description of what this project does.

## Pipeline: Plan-Build-Review

This project uses an automated pipeline that chains four phases to ship features safely:

```
Plan --> Build --> Review --> Fix (if needed)
```

### Phases

1. **Plan** -- Explore the codebase, produce a spec in `specs/<feature>.md`
2. **Build** -- Execute the spec step by step, commit after each logical unit
3. **Review** -- Analyze changes via `git diff`, check for security, logic, and quality issues
4. **Fix** -- Address Critical and Major findings, re-review (max 2 rounds)

### Usage

```bash
# Full pipeline
./scripts/pbr "Add user authentication"

# Start from a specific phase
./scripts/pbr --from build --spec specs/auth.md

# Skip review
./scripts/pbr "Quick feature" --no-review

# Dry run (inspect prompts without execution)
./scripts/pbr --dry-run "Test feature"

# Override model for all phases
./scripts/pbr "Complex feature" --model opus
```

### Focus Sharpening

Each phase gets a tailored `.claudeignore` that restricts which files the agent can see. This keeps agents focused on relevant code. Configure visibility per phase in `pipeline/phases/*.json`.

### Phase Configs

Edit `pipeline/phases/<phase>.json` to customize:
- **model** -- which Claude model to use
- **tools** -- which Claude Code tools to allow (e.g., plan phase has no Edit)
- **focus.include** -- directories the agent CAN see
- **focus.exclude** -- directories always hidden
- **focus.contextFiles** -- which `.claude/context/*.md` files to load

### Artifacts

| Artifact | Location | Phase |
|----------|----------|-------|
| Spec | `specs/<slug>.md` | Plan |
| Commits | `pbr/<slug>` branch | Build |
| Review report | `docs/reviews/review_<date>_<slug>.md` | Review |
| Fix commits | Same branch | Fix |

## Customization

- **Phase prompts**: Edit `pipeline/prompts/*.md` to adjust agent instructions
- **Phase configs**: Edit `pipeline/phases/*.json` to change model, tools, or focus
- **Context files**: Add `.claude/context/*.md` files for project conventions
- **Quality gates**: Edit `pipeline/lib/gates.sh` to add custom validation
