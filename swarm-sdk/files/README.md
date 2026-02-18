# Swarm SDK

TypeScript Agent SDK worker for thermodynamic field coordination. Built on the [Claude Agent SDK](https://docs.anthropic.com/en/docs/claude-code/agent-sdk).

## Prerequisites

- [swarm-layer](../swarm-layer/) template installed (provides schema + CLI tools)
- Node.js 20+ or Bun
- PostgreSQL with field system schema applied
- Claude Code authenticated (for subscription billing)

## Setup

1. `npm install`
2. Set environment variables in `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
   SWARM_BILLING=subscription  # or "api" with ANTHROPIC_API_KEY
   ```
3. Apply schema: `psql $DATABASE_URL -f schema/field-system.sql`
4. Start a worker: `npx tsx src/worker.ts`

## Billing Switch

| Mode | Cost | Env |
|------|------|-----|
| `subscription` (default) | $0 marginal | Uses Claude Code OAuth |
| `api` | Pay-per-token | Requires `ANTHROPIC_API_KEY` |

## Architecture

```
SwarmWorker
  ├── Field Tools (MCP)     -- sense, claim, resolve, release, boost, deposit
  ├── PRD Intake Tools (MCP) -- deposit_tree, suggest_affinities, check_duplicates
  ├── EventBus               -- typed events, fire-and-forget subscribers
  └── Config                 -- billing, models, agent society
```

## Agent Types

| Type | Affinities | Model |
|------|-----------|-------|
| Implementer | backend, frontend, fullstack | haiku |
| Architect | design, planning, spec | opus |
| Task Writer | planner, breakdown | haiku |
| Reviewer | review, audit | haiku |
| Debugger | bugfix, hotfix | haiku |
| Tester | qa, testing, e2e | haiku |

## PRD Intake

Decompose a PRD into field nodes:

```typescript
import { SwarmWorker } from './index.js';

const worker = new SwarmWorker({
  affinities: ['architect', 'planner'],
  model: 'opus',
});
await worker.run(); // Agent will use prd_deposit_tree tool
```

Or call the tool directly via MCP:
```
prd_deposit_tree({
  goal: { title: "My Project", description: "...", affinities: ["architect"] },
  specs: [{ title: "Phase 1", description: "...", tasks: [...] }]
})
```

## Environment Variables

| Var | Default | Description |
|-----|---------|-------------|
| `DATABASE_URL` | (required) | PostgreSQL connection string |
| `SWARM_BILLING` | `subscription` | Billing mode |
| `ANTHROPIC_API_KEY` | -- | Required if `SWARM_BILLING=api` |
| `CLAUDE_MODEL` | `haiku` | Default model (opus/sonnet/haiku) |
| `AGENT_ID` | auto | Agent identifier |
| `AGENT_AFFINITIES` | -- | Comma-separated affinities |
| `AGENT_MAX_TURNS` | `50` | Max conversation turns |
