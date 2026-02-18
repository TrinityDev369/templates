# CLAUDE.md — Project Instructions

## Identity

<!-- Replace with your project description -->
This project uses Claude Code with an agentic layer: commands, skills, agents, and hooks that extend Claude's capabilities for this codebase.

## Rules

1. **Search before asking** — Explore the codebase before asking user questions
2. **Specs before code** — Write to `specs/` during planning, implement after approval
3. **Resolve with artifacts** — Always document what changed (files, commits, learnings)

## Quick Reference

- **Commands**: `.claude/commands/` — plan, build, review, fix, question, scrape-docs, load-skill
- **Skills**: `.claude/skills/` (hot, always loaded) + `shared/skills/` (cold, on demand)
- **Agents**: `.claude/agents/` — builder, reviewer, scout, meta-agent, docs-scraper, browser, general
- **Hooks**: `.claude/hooks/` — safety guardrails, auto-typecheck, session context

## Skills (Dual System)

- **Hot skills** (`.claude/skills/`): Always available in interactive sessions
- **Cold skills** (`shared/skills/`): Loaded on demand via `/load-skill <name>` or affinity routing

## Database Access

<!-- Configure for your project -->
<!-- Example: psql, prisma, drizzle, etc. -->

## When Stuck

1. Check `.claude/skills/` for relevant skill
2. Use `/question` to explore the codebase read-only
3. Ask user with specific options (not open-ended)
