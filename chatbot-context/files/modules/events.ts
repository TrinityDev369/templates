/**
 * @trinity369/use chatbot-context — Events module
 *
 * Context module that injects upcoming events/schedules into the system
 * prompt. Automatically filters out past events so the chatbot only
 * references future or current-day events.
 *
 * Usage:
 * ```ts
 * import { createEventsModule } from './modules/events';
 *
 * const eventsModule = createEventsModule(async () => {
 *   const events = await db.event.findMany({ where: { published: true } });
 *   return events.map(e => ({
 *     title: e.title,
 *     date: e.startDate.toISOString(),
 *     description: e.summary,
 *   }));
 * });
 * ```
 */

import type { ContextModule } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EventItem {
  /** Event title */
  title: string;
  /**
   * Event date as an ISO 8601 string or any format parseable by `new Date()`.
   * Used for filtering (only future events) and display.
   */
  date: string;
  /** Optional short description of the event */
  description?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Estimated tokens per event entry (title + date + description).
 * Roughly 30 tokens per event is a safe upper-bound.
 */
const TOKENS_PER_EVENT_ESTIMATE = 30;

/** Default estimated event count used before the first build. */
const DEFAULT_EVENT_COUNT_ESTIMATE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get the start of today (midnight) in the local timezone.
 * Events on today's date are considered "future" and included.
 */
function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Parse a date string safely. Returns null if the date is invalid.
 */
function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Format a date for display in the context prompt.
 * Uses a concise, human-readable format: "Mon, Jan 15, 2026"
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Create an events context module.
 *
 * @param fetchEvents - Async function that returns events (past and future).
 *   The module will filter to only include future events.
 * @returns A ContextModule that formats upcoming events for prompt injection.
 */
export function createEventsModule(
  fetchEvents: () => Promise<EventItem[]>,
): ContextModule {
  let lastEventCount = DEFAULT_EVENT_COUNT_ESTIMATE;

  return {
    name: 'events',
    description: 'Upcoming events and schedules',

    estimateTokens(): number {
      return lastEventCount * TOKENS_PER_EVENT_ESTIMATE;
    },

    async build(_userMessage?: string): Promise<string> {
      const events = await fetchEvents();
      const startOfToday = getStartOfToday();

      // Filter to future events only and sort by date ascending
      const futureEvents = events
        .map((event) => ({ ...event, _parsed: parseDate(event.date) }))
        .filter(
          (event): event is typeof event & { _parsed: Date } =>
            event._parsed !== null && event._parsed >= startOfToday,
        )
        .sort((a, b) => a._parsed.getTime() - b._parsed.getTime());

      // Update estimate for future budget calculations
      lastEventCount = futureEvents.length || DEFAULT_EVENT_COUNT_ESTIMATE;

      if (futureEvents.length === 0) {
        return '';
      }

      const lines: string[] = ['## Upcoming Events'];
      lines.push('');

      for (const event of futureEvents) {
        const dateStr = formatDate(event._parsed);
        const desc = event.description ? ` — ${event.description}` : '';
        lines.push(`- **${event.title}** (${dateStr})${desc}`);
      }

      return lines.join('\n');
    },
  };
}
