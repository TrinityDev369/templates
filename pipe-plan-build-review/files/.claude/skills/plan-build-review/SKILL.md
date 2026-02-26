---
name: plan-build-review
description: Full agentic pipeline -- plan the implementation, build it, review the changes, and fix issues. Runs via bash orchestrator with phase configs.
---

# Plan-Build-Review Pipeline

Orchestrate a complete feature lifecycle through four focused phases. Each phase runs as a separate Claude agent with restricted tool access and file visibility.

## Invocation

```
/plan-build-review <feature description>
```

`$ARGS` is the feature description. If empty, ask: "What feature should I plan, build, and review?"

## Execution

Run the pipeline orchestrator:

```bash
./scripts/pbr "$ARGS"
```

This will:
1. Create a git worktree for isolated work
2. Run Plan phase (writes spec to `specs/`)
3. Run Build phase (implements spec, commits changes)
4. Run Review phase (analyzes diff, writes review report)
5. Run Fix phase if review finds Critical/Major issues (max 2 rounds)
6. Merge branch back to main and clean up worktree

## Options

Pass flags after the description:

```bash
./scripts/pbr "$ARGS" --model opus          # Use opus for all phases
./scripts/pbr "$ARGS" --no-review           # Skip review and fix
./scripts/pbr "$ARGS" --dry-run             # Preview prompts only
```

## Starting from a specific phase

If you already have a spec:
```bash
./scripts/pbr --from build --spec specs/existing-spec.md "$ARGS"
```

If you just want to review recent changes:
```bash
./scripts/pbr --from review "$ARGS"
```

## Customization

- **Phase configs**: `pipeline/phases/*.json` -- model, tools, file visibility per phase
- **Prompt templates**: `pipeline/prompts/*.md` -- what each agent is told to do
- **Quality gates**: `pipeline/lib/gates.sh` -- validation between phases
- **Context files**: `.claude/context/*.md` -- project conventions loaded per phase
