---
description: Load a specific skill into the current session
argument-hint: [skill-name]
---

# Load Skill

Load a specific skill's knowledge into the current session context.

## Variables

SKILL_NAME: $ARGUMENTS

## Instructions

- If no `SKILL_NAME` provided, list available skills from both tiers and ask which to load.
- **Tier 1 (hot):** Check `.claude/skills/<SKILL_NAME>/SKILL.md` first
- **Tier 2 (cold):** Read `shared/skills/registry.json`, find the skill path, load `<path>/SKILL.md`
- Present the skill content as active context for the session.

## Hot Skills (`.claude/skills/`)

Skills in `.claude/skills/` are always available. List them dynamically by scanning the directory.

## Cold Skills (`shared/skills/`)

Cold skills are registered in `shared/skills/registry.json` and loaded on demand. They keep context lean by only loading when explicitly requested.

## Workflow

1. Parse SKILL_NAME from arguments
2. If SKILL_NAME exists in `.claude/skills/<SKILL_NAME>/SKILL.md`, load it (hot skill)
3. Otherwise, read `shared/skills/registry.json` and find the matching skill entry
4. Load `<registry_path>/SKILL.md` from the matched entry
5. Present skill content as session context
6. Confirm skill loaded
