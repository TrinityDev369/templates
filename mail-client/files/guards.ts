/**
 * Trinity Mail — policy guardrails.
 *
 * Because the relay IP is shared, these are preconditions, not features (doctrine §7):
 *  - a per-process rate limiter caps spikes (e.g. OL's unthrottled reminder blast that
 *    would otherwise get the shared IP throttled by Gmail);
 *  - a consent gate blocks any marketing-stream send to a recipient who hasn't opted in.
 *
 * The relay enforces global limits too; this is the near-side guard.
 */

export interface RateLimiter {
  /** Returns false when the window quota for `key` is exhausted. */
  check(key: string): boolean;
}

/** Fixed-window, in-process limiter. For cross-process limits, back it with Redis/DB. */
export function createMemoryRateLimiter(max: number, windowMs: number): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();
  return {
    check(key: string): boolean {
      const now = Date.now();
      const w = windows.get(key);
      if (!w || now >= w.resetAt) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (w.count >= max) return false;
      w.count += 1;
      return true;
    },
  };
}

export interface ConsentChecker {
  /** Resolve whether `recipient` has consented to marketing-stream mail. */
  isAllowed(recipient: string): boolean | Promise<boolean>;
}

/** Transactional-only projects can use this; marketing projects must supply a real checker. */
export const allowAllConsent: ConsentChecker = { isAllowed: () => true };

export class MailRateLimitError extends Error {
  constructor(key: string) {
    super(`Rate limit exceeded for "${key}"`);
    this.name = 'MailRateLimitError';
  }
}

export class ConsentRequiredError extends Error {
  constructor(recipient: string) {
    super(`No marketing consent on record for ${recipient}`);
    this.name = 'ConsentRequiredError';
  }
}
