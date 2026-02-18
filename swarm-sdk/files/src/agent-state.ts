/**
 * Agent State - Shared Mutable State
 *
 * Shared mutable state for the current agent session.
 * Both field.ts and lifecycle.ts import from here to enforce
 * the single-goal discipline: 1 Agent = 1 Problem = 1 Goal.
 */

// The node ID this agent has claimed (null = no claim yet)
export let claimedNodeId: string | null = null;

// Whether this agent has resolved its goal
export let hasResolved = false;

export function setClaimedNodeId(id: string | null): void {
  claimedNodeId = id;
}

export function setHasResolved(v: boolean): void {
  hasResolved = v;
}
