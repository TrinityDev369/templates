/**
 * @trinity369/use chatbot-api — In-memory session store
 *
 * Keeps conversation history per sessionId with automatic TTL expiry.
 * This is a development / lightweight-production store. For durable
 * persistence, install the chatbot-db template:
 *
 *   npx @trinity369/use chatbot-db
 *
 * TODO: Replace this in-memory store with chatbot-db for PostgreSQL persistence
 */

import type { ChatMessage } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Session {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActivityAt: number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/** Session TTL in milliseconds (30 minutes of inactivity) */
const SESSION_TTL_MS = 30 * 60 * 1000;

/** How often to sweep expired sessions (every 5 minutes) */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const sessions = new Map<string, Session>();

// ---------------------------------------------------------------------------
// Cleanup interval
// ---------------------------------------------------------------------------

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    let expired = 0;

    for (const [id, session] of sessions) {
      if (now - session.lastActivityAt > SESSION_TTL_MS) {
        sessions.delete(id);
        expired++;
      }
    }

    if (expired > 0) {
      console.log(
        `[chatbot-api] Session cleanup: removed ${expired} expired session(s), ${sessions.size} active`,
      );
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the process to exit even if the timer is still running
  cleanupTimer.unref();
}

// Start the cleanup loop immediately on import
startCleanup();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve an existing session or create a new one.
 */
export function getOrCreateSession(sessionId: string): Session {
  const existing = sessions.get(sessionId);

  if (existing) {
    existing.lastActivityAt = Date.now();
    return existing;
  }

  const session: Session = {
    id: sessionId,
    messages: [],
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  };

  sessions.set(sessionId, session);
  return session;
}

/**
 * Append a message to a session's conversation history.
 */
export function addMessage(
  sessionId: string,
  role: ChatMessage['role'],
  content: string,
): void {
  const session = getOrCreateSession(sessionId);
  session.messages.push({ role, content });
  session.lastActivityAt = Date.now();
}

/**
 * Return the full conversation history for a session.
 */
export function getHistory(sessionId: string): ChatMessage[] {
  const session = sessions.get(sessionId);
  return session ? [...session.messages] : [];
}

/**
 * Stop the cleanup interval (useful for graceful shutdown / tests).
 */
export function stopCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

/**
 * Clear all sessions (useful for tests).
 */
export function clearAll(): void {
  sessions.clear();
}
