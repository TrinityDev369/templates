/**
 * Tests for the token budget calculator.
 *
 * Validates token estimation, budget allocation, fit checking,
 * and greedy module prioritization.
 */

import { describe, it, expect } from 'vitest';
import {
  estimateTokens,
  createBudget,
  fitsInBudget,
  prioritizeModules,
} from '../budget';
import type { ContextModule } from '../types';

// ---------------------------------------------------------------------------
// Helper: Create a mock ContextModule with a fixed token estimate
// ---------------------------------------------------------------------------

function mockModule(name: string, tokens: number): ContextModule {
  return {
    name,
    description: `Mock module: ${name}`,
    estimateTokens: () => tokens,
    build: async () => `Content of ${name}`,
  };
}

// ---------------------------------------------------------------------------
// Tests: estimateTokens
// ---------------------------------------------------------------------------

describe('estimateTokens', () => {
  it('empty string returns 0', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('standard text returns approximately chars / 4', () => {
    const text = 'Hello, world! This is a test string.';
    const estimate = estimateTokens(text);

    // chars / 4, rounded up
    const expected = Math.ceil(text.length / 4);
    expect(estimate).toBe(expected);
  });

  it('returns 0 for null/undefined input (falsy)', () => {
    expect(estimateTokens(null as unknown as string)).toBe(0);
    expect(estimateTokens(undefined as unknown as string)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: createBudget
// ---------------------------------------------------------------------------

describe('createBudget', () => {
  it('correct allocation (identity, 25% history, 75% modules)', () => {
    const budget = createBudget(4000, 1000);

    expect(budget.total).toBe(4000);
    expect(budget.identity).toBe(1000);
    // Remaining: 3000. History = floor(3000 * 0.25) = 750. Modules = 3000 - 750 = 2250.
    expect(budget.history).toBe(750);
    expect(budget.modules).toBe(2250);
    // Verify they add up
    expect(budget.identity + budget.history + budget.modules).toBe(4000);
  });

  it('identity overflow yields 0 for history and modules', () => {
    const budget = createBudget(1000, 1500);

    expect(budget.total).toBe(1000);
    expect(budget.identity).toBe(1500);
    expect(budget.history).toBe(0);
    expect(budget.modules).toBe(0);
  });

  it('exact budget (identity equals total) yields 0 for history and modules', () => {
    const budget = createBudget(500, 500);

    expect(budget.history).toBe(0);
    expect(budget.modules).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: fitsInBudget
// ---------------------------------------------------------------------------

describe('fitsInBudget', () => {
  it('true when modules fit', () => {
    const budget = createBudget(4000, 1000); // modules = 2250
    const modules = [mockModule('a', 1000), mockModule('b', 1000)];

    expect(fitsInBudget(modules, budget)).toBe(true);
  });

  it('false when modules do not fit', () => {
    const budget = createBudget(4000, 1000); // modules = 2250
    const modules = [mockModule('a', 1500), mockModule('b', 1500)];

    expect(fitsInBudget(modules, budget)).toBe(false);
  });

  it('true when modules exactly match budget', () => {
    const budget = createBudget(4000, 1000); // modules = 2250
    const modules = [mockModule('a', 2250)];

    expect(fitsInBudget(modules, budget)).toBe(true);
  });

  it('true for empty modules array', () => {
    const budget = createBudget(4000, 1000);
    expect(fitsInBudget([], budget)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: prioritizeModules
// ---------------------------------------------------------------------------

describe('prioritizeModules', () => {
  it('includes modules in order until budget exhausted', () => {
    const budget = createBudget(4000, 1000); // modules = 2250
    const modules = [
      mockModule('a', 1000),
      mockModule('b', 1000),
      mockModule('c', 500),
    ];

    const result = prioritizeModules(modules, budget);

    expect(result.included.map((m) => m.name)).toEqual(['a', 'b']);
    expect(result.excluded.map((m) => m.name)).toEqual(['c']);
  });

  it('skips large module but includes smaller one after it', () => {
    const budget = createBudget(4000, 1000); // modules = 2250
    const modules = [
      mockModule('small-1', 500),
      mockModule('too-big', 3000), // Doesn't fit
      mockModule('small-2', 500),
    ];

    const result = prioritizeModules(modules, budget);

    expect(result.included.map((m) => m.name)).toEqual(['small-1', 'small-2']);
    expect(result.excluded.map((m) => m.name)).toEqual(['too-big']);
  });

  it('empty modules array returns empty included', () => {
    const budget = createBudget(4000, 1000);
    const result = prioritizeModules([], budget);

    expect(result.included).toEqual([]);
    expect(result.excluded).toEqual([]);
  });

  it('all modules fit when budget is large enough', () => {
    const budget = createBudget(10000, 100); // modules = huge
    const modules = [
      mockModule('a', 100),
      mockModule('b', 200),
      mockModule('c', 300),
    ];

    const result = prioritizeModules(modules, budget);

    expect(result.included).toHaveLength(3);
    expect(result.excluded).toHaveLength(0);
  });

  it('no modules fit when budget is zero', () => {
    const budget = createBudget(500, 500); // modules = 0
    const modules = [mockModule('a', 1)];

    const result = prioritizeModules(modules, budget);

    expect(result.included).toHaveLength(0);
    expect(result.excluded).toHaveLength(1);
  });
});
