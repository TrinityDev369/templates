/**
 * @trinity369/use chatbot-api — History route handler
 *
 * GET /api/chat/history?sessionId=xxx
 *
 * Returns the conversation history for a given session. If the session
 * does not exist (e.g., new user, expired session), returns an empty
 * messages array — this is a valid state, not an error.
 */

import type { Request, Response } from 'express';
import { getHistory } from './lib/session';

// ---------------------------------------------------------------------------
// Response shape
// ---------------------------------------------------------------------------

interface HistoryResponse {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId: string;
  conversationId?: string;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * Create the GET /api/chat/history route handler.
 *
 * @example
 *   import { createHistoryHandler } from './history';
 *   app.get('/api/chat/history', createHistoryHandler());
 */
export function createHistoryHandler(): (req: Request, res: Response) => void {
  return function historyHandler(req: Request, res: Response): void {
    const sessionId = req.query.sessionId;

    // --- Validate sessionId ---
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({
        error: 'sessionId query parameter is required and must be a string.',
      });
      return;
    }

    if (sessionId.length > 128) {
      res.status(400).json({
        error: 'sessionId must not exceed 128 characters.',
      });
      return;
    }

    // --- Retrieve history ---
    const messages = getHistory(sessionId);

    const response: HistoryResponse = {
      messages,
      sessionId,
    };

    res.json(response);
  };
}
