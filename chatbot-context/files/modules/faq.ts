/**
 * @trinity369/use chatbot-context — FAQ module
 *
 * Context module that injects curated FAQ/knowledge base entries into the
 * system prompt. Supports optional relevance filtering when the user's
 * message is provided — only FAQ entries with keyword overlap are included.
 *
 * Usage:
 * ```ts
 * import { createFAQModule } from './modules/faq';
 *
 * const faqModule = createFAQModule(async () => {
 *   const entries = await db.faq.findMany({ where: { published: true } });
 *   return entries.map(e => ({ question: e.question, answer: e.answer }));
 * });
 * ```
 */

import type { ContextModule } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FAQEntry {
  /** The question */
  question: string;
  /** The answer */
  answer: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Estimated tokens per FAQ entry (question + answer).
 * Roughly 50 tokens per Q&A pair is a safe upper-bound.
 */
const TOKENS_PER_ENTRY_ESTIMATE = 50;

/** Default estimated entry count used before the first build. */
const DEFAULT_ENTRY_COUNT_ESTIMATE = 15;

/** Minimum keyword length to consider for relevance matching */
const MIN_KEYWORD_LENGTH = 3;

/**
 * Common stop words excluded from keyword matching.
 * Keeps relevance filtering focused on meaningful terms.
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
  'through', 'after', 'before', 'above', 'below', 'and', 'but', 'or',
  'not', 'no', 'nor', 'so', 'yet', 'both', 'each', 'all', 'any', 'few',
  'more', 'most', 'some', 'such', 'than', 'too', 'very', 'just', 'also',
  'how', 'what', 'when', 'where', 'who', 'which', 'why', 'this', 'that',
  'these', 'those', 'it', 'its', 'my', 'your', 'his', 'her', 'our',
  'their', 'i', 'me', 'you', 'he', 'she', 'we', 'they', 'them',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract meaningful keywords from a text string.
 * Lowercases, splits on non-alphanumeric characters, removes stop words
 * and short words.
 */
function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= MIN_KEYWORD_LENGTH && !STOP_WORDS.has(w));

  return new Set(words);
}

/**
 * Check if a FAQ entry has keyword overlap with the user's message.
 * Returns true if at least one meaningful keyword matches.
 */
function hasKeywordOverlap(
  entry: FAQEntry,
  userKeywords: Set<string>,
): boolean {
  const entryText = `${entry.question} ${entry.answer}`;
  const entryKeywords = extractKeywords(entryText);

  for (const keyword of userKeywords) {
    if (entryKeywords.has(keyword)) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Create a FAQ context module.
 *
 * @param fetchFAQ - Async function that returns the FAQ entries.
 *   Called every time the module is built (at request time).
 * @returns A ContextModule that formats FAQ entries for prompt injection.
 */
export function createFAQModule(
  fetchFAQ: () => Promise<FAQEntry[]>,
): ContextModule {
  let lastEntryCount = DEFAULT_ENTRY_COUNT_ESTIMATE;

  return {
    name: 'faq',
    description: 'Curated frequently asked questions and knowledge base',

    estimateTokens(): number {
      return lastEntryCount * TOKENS_PER_ENTRY_ESTIMATE;
    },

    async build(userMessage?: string): Promise<string> {
      const entries = await fetchFAQ();

      // Update estimate for future budget calculations
      lastEntryCount = entries.length || DEFAULT_ENTRY_COUNT_ESTIMATE;

      if (entries.length === 0) {
        return '';
      }

      // Apply relevance filtering when a user message with meaningful keywords is provided.
      // Falls back to all entries if no keywords match (better to have context than none).
      let filtered = entries;

      if (userMessage?.trim()) {
        const userKeywords = extractKeywords(userMessage);
        if (userKeywords.size > 0) {
          const matched = entries.filter((entry) =>
            hasKeywordOverlap(entry, userKeywords),
          );
          if (matched.length > 0) {
            filtered = matched;
          }
        }
      }

      const lines: string[] = ['## Frequently Asked Questions'];
      lines.push('');

      for (const entry of filtered) {
        lines.push(`**Q: ${entry.question}**`);
        lines.push(`A: ${entry.answer}`);
        lines.push('');
      }

      return lines.join('\n').trimEnd();
    },
  };
}
