/**
 * @trinity369/use chatbot-context — Token budget calculator
 *
 * Rough token budgeting (chars / 4) for context assembly. Good enough
 * to prevent overflow without a tokenizer dependency.
 *
 * Strategy: identity reserved first, remaining split 25% history / 75% modules.
 * Modules included greedily in priority order.
 */

import type { ContextBudget, ContextModule } from './types';

/** Rough token estimate (~4 chars per token). Sufficient for budgeting. */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Create a token budget. After reserving identity tokens, the remainder
 * is split 25% history / 75% modules. Identity overflow yields 0 for both.
 */
export function createBudget(
  totalTokens: number,
  identityTokens: number,
): ContextBudget {
  const remaining = Math.max(0, totalTokens - identityTokens);
  const history = Math.floor(remaining * 0.25);
  const modules = remaining - history;

  return {
    total: totalTokens,
    identity: identityTokens,
    history,
    modules,
  };
}

/** Check whether the combined token estimates of all modules fit in the budget. */
export function fitsInBudget(
  modules: ContextModule[],
  budget: ContextBudget,
): boolean {
  const totalEstimate = modules.reduce(
    (sum, mod) => sum + mod.estimateTokens(),
    0,
  );
  return totalEstimate <= budget.modules;
}

export interface PrioritizationResult {
  included: ContextModule[];
  excluded: ContextModule[];
}

/**
 * Greedy prioritization: include modules in array order until budget is exhausted.
 * Smaller modules after a too-large one may still be included if they fit.
 */
export function prioritizeModules(
  modules: ContextModule[],
  budget: ContextBudget,
): PrioritizationResult {
  const included: ContextModule[] = [];
  const excluded: ContextModule[] = [];
  let remaining = budget.modules;

  for (const mod of modules) {
    const estimate = mod.estimateTokens();
    if (estimate <= remaining) {
      included.push(mod);
      remaining -= estimate;
    } else {
      excluded.push(mod);
    }
  }

  return { included, excluded };
}
