/**
 * Swarm SDK Configuration
 *
 * Agent configuration and environment setup
 */

import type { AgentConfig, AgentModel, AgentType, BillingMode } from './types.js';

// =============================================================================
// Model ID Mapping
// =============================================================================

export const MODEL_ID_MAP: Record<AgentModel, string> = {
  opus: 'claude-opus-4-6',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5-20251001',
};

/**
 * Convert shorthand model name to full model ID
 */
export function getFullModelId(shortName: AgentModel): string {
  return MODEL_ID_MAP[shortName];
}

// =============================================================================
// Billing
// =============================================================================

/**
 * Build a sanitized env for the SDK subprocess based on billing mode.
 *
 * - subscription: strips ANTHROPIC_API_KEY so the subprocess falls through
 *   to Claude Code OAuth (flat-rate, $0 marginal cost).
 * - api: requires ANTHROPIC_API_KEY in the environment.
 */
export function getWorkerEnv(mode: BillingMode): Record<string, string | undefined> {
  const env = { ...process.env };

  if (mode === 'subscription') {
    delete env.ANTHROPIC_API_KEY;
  } else {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error(
        'SWARM_BILLING=api requires ANTHROPIC_API_KEY to be set. ' +
        'Set it in .env or switch to SWARM_BILLING=subscription.',
      );
    }
  }

  return env;
}

// =============================================================================
// Environment Configuration
// =============================================================================

export function getEnvConfig(): AgentConfig {
  const billingMode = (process.env.SWARM_BILLING as BillingMode) || 'subscription';
  if (billingMode !== 'subscription' && billingMode !== 'api') {
    throw new Error(`Invalid SWARM_BILLING="${billingMode}". Must be "subscription" or "api".`);
  }

  return {
    id: process.env.AGENT_ID || `worker-${Date.now()}`,
    affinities: (process.env.AGENT_AFFINITIES || '').split(',').filter(Boolean),
    threshold: parseFloat(process.env.AGENT_THRESHOLD || '0.5'),
    model: (process.env.CLAUDE_MODEL as AgentModel) || 'haiku',
    billingMode,
    workspace: process.env.WORKSPACE_PATH || process.cwd(),
    systemPrompt: process.env.AGENT_SYSTEM_PROMPT || '',
    timeout: parseInt(process.env.AGENT_TIMEOUT || '300000', 10),
    maxTurns: parseInt(process.env.AGENT_MAX_TURNS || '50', 10),
    checkpointAt: parseInt(process.env.AGENT_CHECKPOINT_AT || '40', 10),
    tokensPerTurn: parseInt(process.env.AGENT_TOKENS_PER_TURN || '3000', 10),
  };
}

export const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// =============================================================================
// Agent Society Registry
// =============================================================================

export const AGENT_SOCIETY: AgentType[] = [
  {
    id: 'implementer',
    name: 'Implementer',
    description: 'Writes production code. Builds features, components, and modules.',
    affinities: ['implementer', 'backend', 'frontend', 'fullstack'],
    model: 'haiku',
    color: '#3b82f6',
    systemPrompt: `You are an Implementer agent in the swarm.

Your job is to write production-quality code for assigned tasks.

## Workflow
1. Use field_sense to find tasks matching your affinities
2. Use field_claim to claim a task
3. Read the task content for context and requirements
4. Implement the solution following project patterns
5. Verify your code compiles/runs
6. Use field_resolve with artifact listing files modified

Follow existing codebase conventions and patterns.`,
  },
  {
    id: 'architect',
    name: 'Architect',
    description: 'Designs systems and creates technical specifications.',
    affinities: ['architect', 'design', 'planning', 'spec', 'goal'],
    model: 'opus',
    color: '#f59e0b',
    systemPrompt: `You are an Architect agent in the swarm.

Your job is to design systems and write specifications.

## Workflow
1. Use field_sense to find GOAL nodes
2. Use field_claim to claim a goal
3. Analyze the problem deeply, research the codebase
4. Design a comprehensive solution approach
5. Use field_deposit to create a SPEC node with your design
6. Use field_resolve to mark the goal complete

Think holistically. Consider maintainability, scalability, and developer experience.`,
  },
  {
    id: 'task-writer',
    name: 'Task Writer',
    description: 'Atomizes specs into ordered, actionable tasks.',
    affinities: ['task-writer', 'planner', 'spec', 'breakdown'],
    model: 'haiku',
    color: '#14b8a6',
    systemPrompt: `You are a Task Writer agent in the swarm.

Your job is to transform specs into atomic tasks.

## Workflow
1. Use field_sense to find SPEC nodes
2. Use field_claim to claim a spec
3. Decompose the spec into smallest workable units
4. For each task, use field_deposit to create a TASK node
5. Use field_resolve to mark the spec complete

Each task should be completable in a single work session. Be specific about acceptance criteria.`,
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Reviews code for quality, security, and best practices.',
    affinities: ['reviewer', 'review', 'audit'],
    model: 'haiku',
    color: '#a855f7',
    systemPrompt: `You are a Reviewer agent in the swarm.

Your job is to ensure code quality and catch issues.

## Workflow
1. Read the code thoroughly
2. Check for bugs, security issues, performance problems
3. Verify best practices are followed
4. Provide actionable feedback
5. Use field_resolve with a review report as artifact

Be constructive but thorough. Catch what others miss.`,
  },
  {
    id: 'debugger',
    name: 'Debugger',
    description: 'Investigates and fixes bugs. Root cause analysis specialist.',
    affinities: ['debugger', 'bugfix', 'hotfix', 'issue'],
    model: 'haiku',
    color: '#ef4444',
    systemPrompt: `You are a Debugger agent in the swarm.

Your job is to find and fix bugs.

## Workflow
1. Reproduce the issue
2. Investigate root cause using logs, traces, and code analysis
3. Identify the minimal fix
4. Implement the fix
5. Verify the bug is resolved
6. Use field_resolve with details of the fix

Be methodical. Understand WHY before fixing WHAT.`,
  },
  {
    id: 'tester',
    name: 'Tester',
    description: 'Validates implementations work correctly via functional checks.',
    affinities: ['tester', 'qa', 'testing', 'validation', 'e2e'],
    model: 'haiku',
    color: '#10b981',
    systemPrompt: `You are a Tester agent in the swarm.

Your job is to verify that implementations actually work -- not review code quality, but functional validation.

## Workflow
1. Use field_sense to find test/validation tasks
2. Use field_claim to claim a task
3. Read the task content for what to validate
4. Run functional checks (build, test suites, manual verification)
5. Use field_resolve with artifact containing:
   - validation.allPassed (bool)
   - findings[] (success/warning/error)
   - summary of what was tested

Report PASS/FAIL honestly. If it doesn't work, say so.`,
  },
];

/**
 * Find the best agent type for a set of affinities
 */
export function matchAgentType(affinities: string[]): AgentType | null {
  let bestMatch: AgentType | null = null;
  let bestScore = 0;

  for (const agent of AGENT_SOCIETY) {
    const overlap = agent.affinities.filter((a) => affinities.includes(a));
    if (overlap.length > bestScore) {
      bestScore = overlap.length;
      bestMatch = agent;
    }
  }

  return bestMatch;
}

/**
 * Get agent type by ID
 */
export function getAgentType(id: string): AgentType | undefined {
  return AGENT_SOCIETY.find((a) => a.id === id);
}
