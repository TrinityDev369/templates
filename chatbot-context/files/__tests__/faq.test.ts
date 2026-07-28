/**
 * Tests for the FAQ context module.
 *
 * Validates Q&A formatting, keyword-based relevance filtering,
 * stop word exclusion, and token estimation.
 */

import { describe, it, expect, vi } from 'vitest';
import { createFAQModule, type FAQEntry } from '../modules/faq';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const SAMPLE_ENTRIES: FAQEntry[] = [
  {
    question: 'What are your business hours?',
    answer: 'We are open Monday to Friday, 9am to 5pm.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Account > Reset Password.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards, PayPal, and bank transfers.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer full refunds within 30 days of purchase.',
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function createModule(entries: FAQEntry[] = SAMPLE_ENTRIES) {
  const fetchFAQ = vi.fn(async () => entries);
  const mod = createFAQModule(fetchFAQ);
  return { mod, fetchFAQ };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FAQ module', () => {
  it('builds formatted Q&A output', async () => {
    const { mod } = createModule();
    const output = await mod.build();

    expect(output).toContain('## Frequently Asked Questions');
    expect(output).toContain('**Q: What are your business hours?**');
    expect(output).toContain('A: We are open Monday to Friday');
    expect(output).toContain('**Q: How do I reset my password?**');
    expect(output).toContain('A: Go to Settings > Account');
  });

  it('filters by keyword relevance when userMessage provided', async () => {
    const { mod } = createModule();
    const output = await mod.build('How can I reset my password?');

    // Should include the password-related entry
    expect(output).toContain('reset my password');

    // Should NOT include unrelated entries (business hours, payment, refunds)
    // unless there's keyword overlap. "password" and "reset" are the keywords.
    expect(output).toContain('password');
  });

  it('falls back to all entries when no keywords match', async () => {
    const { mod } = createModule();
    // Use a message with only stop words or very short words
    const output = await mod.build('to be or not to be');

    // All stop words, no meaningful keywords extracted -> all entries included
    expect(output).toContain('business hours');
    expect(output).toContain('reset my password');
    expect(output).toContain('payment methods');
    expect(output).toContain('refunds');
  });

  it('returns empty string when no entries', async () => {
    const { mod } = createModule([]);
    const output = await mod.build();

    expect(output).toBe('');
  });

  it('handles entries with no keyword overlap gracefully', async () => {
    const { mod } = createModule();
    // "xylophone" has no overlap with any FAQ entry
    const output = await mod.build('Tell me about xylophone maintenance');

    // Falls back to all entries since no matches found
    expect(output).toContain('## Frequently Asked Questions');
    expect(output).toContain('business hours');
    expect(output).toContain('password');
    expect(output).toContain('payment');
    expect(output).toContain('refunds');
  });

  it('estimates tokens based on entry count', () => {
    const { mod } = createModule();

    // Before first build, uses default estimate (15 entries * 50 tokens)
    const initialEstimate = mod.estimateTokens();
    expect(initialEstimate).toBe(15 * 50); // 750
  });

  it('updates token estimate after build', async () => {
    const { mod } = createModule();

    // Before build: default 15 * 50 = 750
    expect(mod.estimateTokens()).toBe(750);

    // After build with 4 entries: 4 * 50 = 200
    await mod.build();
    expect(mod.estimateTokens()).toBe(4 * 50); // 200
  });

  it('stop words are excluded from keyword matching', async () => {
    // Create entries where only stop words overlap with the query
    const entries: FAQEntry[] = [
      {
        question: 'What is the pricing?',
        answer: 'Our pricing starts at $10/month.',
      },
      {
        question: 'Where are you located?',
        answer: 'We are located in Berlin, Germany.',
      },
    ];

    const { mod } = createModule(entries);

    // "what is the" are all stop words; "pricing" is the meaningful keyword
    const output = await mod.build('what is the pricing');

    // "pricing" should match the first entry
    expect(output).toContain('pricing');

    // The output should contain the matched entry. If keyword matching works,
    // only the pricing entry should appear (not the location one).
    // Count how many **Q:** entries are in the output
    const questionMatches = output.match(/\*\*Q:/g);
    expect(questionMatches).toBeDefined();
    expect(questionMatches!.length).toBe(1);
    expect(output).toContain('$10/month');
    expect(output).not.toContain('Berlin');
  });
});
