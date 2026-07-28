/**
 * @trinity369/use chatbot-api — API key authentication middleware
 *
 * Validates requests against a pre-shared API key sent in a custom header.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * If no API key is configured (env var empty/unset), auth is disabled
 * entirely — convenient for local development.
 */

import { timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiKeyOptions {
  /** Environment variable name containing the API key. Default: 'CHATBOT_API_KEY' */
  envVar?: string;
  /** Header name to check. Default: 'x-api-key' */
  headerName?: string;
  /** Routes to exclude from auth (e.g., ['/api/chat/health']). Default: [] */
  exclude?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Constant-time string comparison using Node's `timingSafeEqual`.
 * Returns `false` for mismatched lengths without leaking *which* byte differs,
 * though the length difference itself is observable.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still perform a comparison to keep timing somewhat constant,
    // but the result is always false for different lengths.
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(a); // compare against self to burn time
    timingSafeEqual(bufA, bufB);
    return false;
  }

  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create an Express middleware that validates an API key header.
 *
 * @example
 *   import { apiKeyAuth } from './middleware/api-key';
 *   app.use(apiKeyAuth({ exclude: ['/api/chat/health'] }));
 */
export function apiKeyAuth(
  options?: ApiKeyOptions,
): (req: Request, res: Response, next: NextFunction) => void {
  const envVar = options?.envVar ?? 'CHATBOT_API_KEY';
  const headerName = options?.headerName ?? 'x-api-key';
  const exclude = options?.exclude ?? [];

  // Read the API key once at middleware creation time (not per-request)
  const apiKey = process.env[envVar]?.trim() ?? '';

  if (!apiKey) {
    console.warn(
      `[chatbot-api] WARNING: No API key configured (${envVar} is empty). Auth is disabled.`,
    );

    // No-op middleware — allow all requests through
    return function noopAuth(
      _req: Request,
      _res: Response,
      next: NextFunction,
    ): void {
      next();
    };
  }

  console.log(
    `[chatbot-api] API key auth enabled via ${envVar} (header: ${headerName})`,
  );

  return function apiKeyMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    // Skip excluded routes
    if (exclude.includes(req.path)) {
      next();
      return;
    }

    const provided = req.headers[headerName];

    // Header absent
    if (!provided || typeof provided !== 'string') {
      res.status(401).json({ error: 'Missing API key' });
      return;
    }

    // Header present but invalid
    if (!safeCompare(provided, apiKey)) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }

    next();
  };
}
