# agentic-layer

Production-ready Claude Code configuration with skills, agents, hooks, and commands. Drop into any project for an instant agentic workflow.

## Installation

```bash
npx @trinity369/use agentic-layer
```

To preserve an existing `CLAUDE.md`:

```bash
npx @trinity369/use agentic-layer --no-overwrite
```

## What's Included

```
CLAUDE.md                          # Project instructions template
.claude/
  settings.json                    # Hook configuration
  hooks/
    hooks.py                       # Hook router
    interactive.py                 # Safety guards, auto-approve reads, git context
  skills/
    plan/SKILL.md                  # Implementation planning workflow
    review/SKILL.md                # Code review with risk tiers
    testing/SKILL.md               # Test running + writing (Vitest/Jest/Playwright)
  agents/
    builder.md                     # Single-file implementation specialist
    reviewer.md                    # Read-only code analysis + structured reports
    researcher.md                  # Codebase exploration + research
  commands/
    plan.md                        # /plan <requirement>
    review.md                      # /review <scope>
    fix.md                         # /fix <issue>
```

## Customization

1. **CLAUDE.md** — Fill in your project description, tech stack, and coding standards
2. **settings.json** — Adjust hook timeouts or add new matchers
3. **Skills** — Modify test commands in `testing/SKILL.md` to match your stack
4. **Agents** — Tune agent prompts for your codebase conventions

## Adding More Skills

Install individual skills on top:

```bash
npx @trinity369/use skill-security --dir .claude
npx @trinity369/use skill-copywriter --dir .claude
```

## How It Works

- **Hooks** run automatically on session start (git context), before tool use (safety), and after edits
- **Skills** are loaded via `/skill-name` commands or referenced by agents
- **Agents** are subagent definitions used by the Task tool for parallel work
- **Commands** are slash commands (`/plan`, `/review`, `/fix`) for common workflows
