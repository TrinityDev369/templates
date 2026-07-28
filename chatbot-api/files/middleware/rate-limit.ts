/**
 * @trinity369/use chatbot-api — In-memory rate limiter middleware
 *
 * Sliding-window rate limiter keyed by client IP address.
 * Returns 429 Too Many Requests with a Retry-After header when exceeded.
 */

import type { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RateLimitOptions {
  /** Maximum requests allowed within the window (default 20) */
  maxRequests?: number;
  /** Window duration in milliseconds (default 60_000 = 1 minute) */
  windowMs?: number;
}

interface ClientRecord {
  timestamps: number[];
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create an Express rate-limiting middleware.
 *
 * @example
 *   import { rateLimit } from './middleware/rate-limit';
 *   app.use('/api/chat', rateLimit({ maxRequests: 20, windowMs: 60_000 }));
 */
export function rateLimit(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  const maxRequests = options.maxRequests ?? 20;
  const windowMs = options.windowMs ?? 60_000;

  const clients = new Map<string, ClientRecord>();

  // Periodic cleanup to prevent memory leak from stale IP entries
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients) {
      // Remove timestamps outside the window
      record.timestamps = record.timestamps.filter(
        (ts) => now - ts < windowMs,
      );
      // Remove the entry entirely if no timestamps remain
      if (record.timestamps.length === 0) {
        clients.delete(ip);
      }
    }
  }, windowMs);

  // Allow the process to exit even if the timer is running
  cleanupInterval.unref();

  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const ip = getClientIp(req);
    const now = Date.now();

    // Get or create the record for this IP
    let record = clients.get(ip);
    if (!record) {
      record = { timestamps: [] };
      clients.set(ip, record);
    }

    // Slide the window: discard timestamps older than windowMs
    record.timestamps = record.timestamps.filter(
      (ts) => now - ts < windowMs,
    );

    if (record.timestamps.length >= maxRequests) {
      // Calculate when the oldest request in the window will expire
      const oldestInWindow = record.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    // Record this request
    record.timestamps.push(now);
    next();
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract client IP from x-forwarded-for header (first entry) or req.ip.
 * Falls back to 'unknown' if neither is available.
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    // x-forwarded-for can be a comma-separated list; take the first (original client)
    return forwarded.split(',')[0].trim();
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(',')[0].trim();
  }

  return req.ip ?? 'unknown';
}
