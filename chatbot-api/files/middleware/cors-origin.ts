/**
 * @trinity369/use chatbot-api — Origin validation middleware
 *
 * More granular CORS replacement that validates the Origin header against
 * an allow-list. Handles preflight (OPTIONS) requests, sets the correct
 * Access-Control-Allow-Origin header per matched origin, and rejects
 * disallowed browser origins with 403.
 *
 * Non-browser requests (no Origin header) are allowed through — they
 * represent server-to-server or CLI callers.
 */

import type { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OriginOptions {
  /** Allowed origins. '*' allows all. Default: reads CORS_ORIGINS env var (comma-separated) or '*' */
  origins?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the allowed origins from options or the CORS_ORIGINS env var.
 * Returns `null` to indicate "allow all" (wildcard mode).
 */
function resolveOrigins(options?: OriginOptions): string[] | null {
  // Explicit options take precedence
  if (options?.origins && options.origins.length > 0) {
    if (options.origins.includes('*')) return null;
    return options.origins.map((o) => o.trim().replace(/\/+$/, ''));
  }

  // Fall back to env var
  const envValue = process.env.CORS_ORIGINS?.trim() ?? '';

  if (!envValue || envValue === '*') return null;

  return envValue
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/**
 * Write standard CORS headers for a given allowed origin.
 */
function writeCorsHeaders(res: Response, origin: string | '*'): void {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-api-key',
  );
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('Vary', 'Origin');
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create an Express middleware that validates the request Origin header.
 *
 * @example
 *   import { originGuard } from './middleware/cors-origin';
 *   app.use(originGuard()); // reads CORS_ORIGINS from env
 *   app.use(originGuard({ origins: ['https://example.com'] }));
 */
export function originGuard(
  options?: OriginOptions,
): (req: Request, res: Response, next: NextFunction) => void {
  const allowedOrigins = resolveOrigins(options);

  if (!allowedOrigins) {
    console.log('[chatbot-api] CORS origin guard: allowing all origins (wildcard)');
  } else {
    console.log(
      `[chatbot-api] CORS origin guard: allowed origins — ${allowedOrigins.join(', ')}`,
    );
  }

  return function originGuardMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const requestOrigin = req.headers.origin;

    // -----------------------------------------------------------------------
    // Wildcard mode — allow everything
    // -----------------------------------------------------------------------
    if (!allowedOrigins) {
      writeCorsHeaders(res, requestOrigin ?? '*');

      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }

      next();
      return;
    }

    // -----------------------------------------------------------------------
    // No Origin header — non-browser client (curl, server-to-server, etc.)
    // Allow these through without CORS headers.
    // -----------------------------------------------------------------------
    if (!requestOrigin) {
      if (req.method === 'OPTIONS') {
        // Preflight without Origin is unusual; respond minimally
        res.status(204).end();
        return;
      }

      next();
      return;
    }

    // -----------------------------------------------------------------------
    // Check the Origin against the allow-list
    // -----------------------------------------------------------------------
    const normalizedOrigin = requestOrigin.replace(/\/+$/, '');

    if (!allowedOrigins.includes(normalizedOrigin)) {
      res.status(403).json({ error: 'Origin not allowed' });
      return;
    }

    // Origin is allowed — set CORS headers with the specific matched origin
    writeCorsHeaders(res, normalizedOrigin);

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}
