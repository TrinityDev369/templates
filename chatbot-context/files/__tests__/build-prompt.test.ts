/**
 * Tests for the system prompt builder.
 *
 * Validates identity block generation, module inclusion/exclusion,
 * budget-aware prioritization, and conversation summary handling.
 */

import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../build-prompt';
import type { ContextModule, IdentityConfig } from '../types';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const TEST_IDENTITY: IdentityConfig = {
  name: 'Luna',
  personality: 'A friendly and knowledgeable assistant for a SaaS platform.',
  tone: 'warm, approachable, and concise',
  antiIntents: [
    'never give medical advice',
    'never discuss competitor pricing',
  ],
  disclaimer: 'This bot provides general information only, not professional advice.',
};

const MINIMAL_IDENTITY: IdentityConfig = {
  name: 'MinBot',
  personality: 'Minimal test bot.',
  tone: 'neutral',
  antiIntents: [],
};

// ---------------------------------------------------------------------------
// Helper: create mock ContextModule
// ---------------------------------------------------------------------------

function mockModule(
  name: string,
  tokens: number,
  content: string,
): ContextModule {
  return {
    name,
    description: `Module: ${name}`,
    estimateTokens: () => tokens,
    build: async (_userMessage?: string) => content,
  };
}

function mockModuleWithRelevance(
  name: string,
  tokens: number,
  contentFn: (userMessage?: string) => string,
): ContextModule {
  return {
    name,
    description: `Module: ${name}`,
    estimateTokens: () => tokens,
    build: async (userMessage?: string) => contentFn(userMessage),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildSystemPrompt', () => {
  it('includes identity block with name, personality, tone', async () => {
    const result = await buildSystemPrompt(TEST_IDENTITY, [], {
      totalBudget: 4000,
    });

    expect(result.systemPrompt).toContain('You are Luna.');
    expect(result.systemPrompt).toContain('## Personality');
    expect(result.systemPrompt).toContain('friendly and knowledgeable');
    expect(result.systemPrompt).toContain('## Tone');
    expect(result.systemPrompt).toContain('warm, approachable, and concise');
  });

  it('includes anti-intents in boundaries section', async () => {
    const result = await buildSystemPrompt(TEST_IDENTITY, [], {
      totalBudget: 4000,
    });

    expect(result.systemPrompt).toContain('## Boundaries');
    expect(result.systemPrompt).toContain('NEVER');
    expect(result.systemPrompt).toContain('never give medical advice');
    expect(result.systemPrompt).toContain('never discuss competitor pricing');
  });

  it('includes disclaimer when provided', async () => {
    const result = await buildSystemPrompt(TEST_IDENTITY, [], {
      totalBudget: 4000,
    });

    expect(result.systemPrompt).toContain('## Disclaimer');
    expect(result.systemPrompt).toContain('general information only');
  });

  it('includes context modules in order', async () => {
    const modules = [
      mockModule('faq', 100, '## FAQ\nQ: What is this?\nA: A test.'),
      mockModule('catalog', 100, '## Catalog\nProduct A, Product B'),
    ];

    const result = await buildSystemPrompt(MINIMAL_IDENTITY, modules, {
      totalBudget: 4000,
    });

    expect(result.systemPrompt).toContain('# Context');
    expect(result.systemPrompt).toContain('## FAQ');
    expect(result.systemPrompt).toContain('## Catalog');

    // FAQ appears before Catalog (order preserved)
    const faqIndex = result.systemPrompt.indexOf('## FAQ');
    const catalogIndex = result.systemPrompt.indexOf('## Catalog');
    expect(faqIndex).toBeLessThan(catalogIndex);
  });

  it('excludes modules that exceed budget', async () => {
    // Use a small budget so there is limited room for modules
    const modules = [
      mockModule('small', 50, '## Small Module\nFits in budget.'),
      mockModule('huge', 50000, '## Huge Module\nDoes not fit.'),
    ];

    const result = await buildSystemPrompt(MINIMAL_IDENTITY, modules, {
      totalBudget: 500, // After identity, module budget is small
    });

    expect(result.modulesIncluded).toContain('small');
    expect(result.modulesExcluded).toContain('huge');
    expect(result.systemPrompt).toContain('Small Module');
    expect(result.systemPrompt).not.toContain('Huge Module');
  });

  it('reports included/excluded modules in result', async () => {
    const modules = [
      mockModule('a', 10, 'Module A content'),
      mockModule('b', 10, 'Module B content'),
      mockModule('c', 99999, 'Module C content'),
    ];

    const result = await buildSystemPrompt(MINIMAL_IDENTITY, modules, {
      totalBudget: 500,
    });

    expect(result.modulesIncluded).toContain('a');
    expect(result.modulesIncluded).toContain('b');
    expect(result.modulesExcluded).toContain('c');
  });

  it('includes conversation summary when provided', async () => {
    const result = await buildSystemPrompt(MINIMAL_IDENTITY, [], {
      totalBudget: 4000,
      conversationSummary: 'User asked about pricing. Bot provided tier details.',
    });

    expect(result.systemPrompt).toContain('# Conversation History');
    expect(result.systemPrompt).toContain('Summary of the conversation so far');
    expect(result.systemPrompt).toContain('User asked about pricing');
  });

  it('handles empty modules array', async () => {
    const result = await buildSystemPrompt(TEST_IDENTITY, [], {
      totalBudget: 4000,
    });

    // Should still have identity, but no context section
    expect(result.systemPrompt).toContain('You are Luna.');
    expect(result.systemPrompt).not.toContain('# Context');
    expect(result.modulesIncluded).toEqual([]);
    expect(result.modulesExcluded).toEqual([]);
  });

  it('handles modules that return empty strings (skipped in output)', async () => {
    const modules = [
      mockModule('empty', 10, ''),
      mockModule('non-empty', 10, '## Active Module\nHas content.'),
      mockModule('whitespace-only', 10, '   '),
    ];

    const result = await buildSystemPrompt(MINIMAL_IDENTITY, modules, {
      totalBudget: 4000,
    });

    // All 3 are "included" from budget perspective
    expect(result.modulesIncluded).toContain('empty');
    expect(result.modulesIncluded).toContain('non-empty');
    expect(result.modulesIncluded).toContain('whitespace-only');

    // But only the non-empty one contributes content
    expect(result.systemPrompt).toContain('Active Module');

    // Context section still appears because non-empty module has content
    expect(result.systemPrompt).toContain('# Context');
  });

  it('returns token estimate and budget in result', async () => {
    const result = await buildSystemPrompt(TEST_IDENTITY, [], {
      totalBudget: 4000,
    });

    expect(typeof result.tokenEstimate).toBe('number');
    expect(result.tokenEstimate).toBeGreaterThan(0);
    expect(result.budget).toBeDefined();
    expect(result.budget.total).toBe(4000);
  });

  it('uses default budget of 4000 when not specified', async () => {
    const result = await buildSystemPrompt(MINIMAL_IDENTITY, []);

    expect(result.budget.total).toBe(4000);
  });
});
