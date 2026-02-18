# Prime

Load project context. With argument: search knowledge graph for that topic. Without: high-level codebase overview.

## Usage
`/prime` — full codebase overview
`/prime <topic>` — search KG for topic

## Workflow

### With argument (e.g., `/prime authentication`)
1. `mcp__knowledge__kg_search` query `$ARGUMENT` (omit project to search ALL graphs)
2. Summarize findings: entities, relationships, relevant files/components
3. If no results, fall back to `Grep` for keyword search in codebase

### Without argument (default overview)
1. Try `./scripts/swarm sense --json` (silent fail if offline)
2. Search KG in parallel across key domains:
   - `mcp__knowledge__kg_search` query `"architecture patterns"` project `codebase`
   - `mcp__knowledge__kg_search` query `"core services"` project `codebase`
3. Summarize architecture in information-dense format:
   - **Apps**: list discovered apps/packages
   - **Shared**: list shared packages
   - **Field**: open/claimed/resolved task counts (if online)

## Report Format
```
## Prime: {topic or "Overview"}
{2-3 dense paragraphs: what exists, how it connects, where to look next}

Ready.
```

## Rules
- KG search first, filesystem fallback only if KG unavailable
- Information-dense: names, paths, relationships — not explanations
- Silent fail on network errors
