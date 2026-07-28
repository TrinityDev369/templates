/**
 * @trinity369/use chatbot-api — Express server
 *
 * Minimal Express server that mounts the chat route, rate limiter,
 * origin guard (replaces cors package), API key auth, and health check.
 * Run with: npx tsx server.ts
 */

import express from 'express';
import { originGuard } from './middleware/cors-origin';
import { apiKeyAuth } from './middleware/api-key';
import { rateLimit } from './middleware/rate-limit';
import { createChatHandler } from './chat';
import { createHistoryHandler } from './history';
import { stopCleanup } from './lib/session';
import config from './chatbot.config';

// ---------------------------------------------------------------------------
// Configuration from environment
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '20', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS ?? '60000',
  10,
);

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();

// Origin validation (replaces the cors package — handles CORS headers + preflight)
// Must run before body parser so OPTIONS preflights are handled early.
app.use(originGuard());

// Body parser
app.use(express.json({ limit: '100kb' }));

// API key authentication (health check excluded so monitoring probes work)
app.use(apiKeyAuth({ exclude: ['/api/chat/health'] }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/api/chat/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: config.name,
    model: config.model ?? 'claude-sonnet-4-6',
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint with rate limiting
app.post(
  '/api/chat',
  rateLimit({ maxRequests: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS }),
  createChatHandler(config),
);

// History endpoint — retrieve conversation messages for a session
app.get(
  '/api/chat/history',
  rateLimit({ maxRequests: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS }),
  createHistoryHandler(),
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const server = app.listen(PORT, () => {
  console.log(
    `[chatbot-api] ${config.name} listening on :${PORT} | ` +
    `Rate limit: ${RATE_LIMIT_MAX}/${RATE_LIMIT_WINDOW_MS}ms`,
  );
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

function shutdown(signal: string): void {
  console.log(`\n[chatbot-api] Received ${signal}. Shutting down gracefully...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('[chatbot-api] HTTP server closed.');

    // Clean up session store interval
    stopCleanup();

    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('[chatbot-api] Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
