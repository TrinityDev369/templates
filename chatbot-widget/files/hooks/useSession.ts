/**
 * Session persistence hook.
 *
 * Stores and retrieves a chat session from localStorage, keyed by a hash
 * of the API URL so that different chatbot instances maintain separate sessions.
 */

import { useCallback, useRef } from 'react';
import type { Session } from '../lib/types';

/** Simple djb2 hash for creating localStorage keys from API URLs. */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

/** UUID v4 with crypto.randomUUID fallback for older browsers. */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface UseSessionReturn {
  /** Returns the existing session or creates a new one. */
  getOrCreateSession: () => Session;

  /** Updates the conversation ID on the current session. */
  updateConversationId: (conversationId: string) => void;
}

export function useSession(apiUrl: string): UseSessionReturn {
  const storageKey = `chatbot_session_${hashString(apiUrl)}`;
  const sessionRef = useRef<Session | null>(null);

  const readFromStorage = useCallback((): Session | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Session;
      if (
        typeof parsed.sessionId === 'string' &&
        typeof parsed.createdAt === 'number'
      ) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const writeToStorage = useCallback(
    (session: Session): void => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(session));
      } catch {
        // Storage unavailable or quota exceeded — session lives only in memory.
      }
    },
    [storageKey],
  );

  const getOrCreateSession = useCallback((): Session => {
    // Return in-memory session if available.
    if (sessionRef.current) return sessionRef.current;

    // Try to restore from localStorage.
    const stored = readFromStorage();
    if (stored) {
      sessionRef.current = stored;
      return stored;
    }

    // Create a brand-new session.
    const session: Session = {
      sessionId: generateId(),
      conversationId: null,
      createdAt: Date.now(),
    };

    sessionRef.current = session;
    writeToStorage(session);
    return session;
  }, [readFromStorage, writeToStorage]);

  const updateConversationId = useCallback(
    (conversationId: string): void => {
      const session = getOrCreateSession();
      session.conversationId = conversationId;
      sessionRef.current = session;
      writeToStorage(session);
    },
    [getOrCreateSession, writeToStorage],
  );

  return { getOrCreateSession, updateConversationId };
}
