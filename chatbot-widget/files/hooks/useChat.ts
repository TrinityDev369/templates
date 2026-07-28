/**
 * Main chat hook — manages messages, streaming state, errors, and session persistence.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHistory } from '../lib/history';
import { sendMessage as streamSendMessage } from '../lib/stream';
import type { ChatConfig, ChatMessage, SSEEvent } from '../lib/types';
import { useSession } from './useSession';

/** Escalation metadata exposed to the UI. */
export interface EscalationInfo {
  agentName?: string;
  reason?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  escalation: EscalationInfo | null;
  sendMessage: (text: string) => void;
  cancel: () => void;
  clearHistory: () => void;
  /** Clear the error and resend the last user message. No-op if no error or no prior user message. */
  retry: () => void;
  /** Remove the last assistant message and resend the user message before it. No-op if streaming or no assistant message to regenerate. */
  regenerate: () => void;
  /** Clear the current error without retrying. */
  dismissError: () => void;
}

/** Generate a short random ID for messages. */
function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useChat(config: ChatConfig): UseChatReturn {
  const { apiUrl, welcomeMessage } = config;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escalation, setEscalation] = useState<EscalationInfo | null>(null);

  const cancelRef = useRef<(() => void) | null>(null);
  const assistantBufferRef = useRef('');
  const assistantIdRef = useRef('');
  const greetingAddedRef = useRef(false);
  const historyLoadedRef = useRef(false);
  const { getOrCreateSession, updateConversationId } = useSession(apiUrl);

  // On mount, attempt to load conversation history from the server.
  // If history exists, it replaces the welcome message. Otherwise,
  // fall back to showing the welcome message (existing behaviour).
  useEffect(() => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    // Try reading an existing session from localStorage without creating one.
    // We only fetch history when there is an existing session (returning user).
    const existingSession = (() => {
      try {
        const key = Object.keys(localStorage).find((k) => k.startsWith('chatbot_session_'));
        if (!key) return null;
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.sessionId === 'string') return parsed as { sessionId: string };
        return null;
      } catch {
        return null;
      }
    })();

    if (!existingSession) {
      // Brand-new user — no session yet. Show welcome message immediately.
      if (welcomeMessage) {
        greetingAddedRef.current = true;
        setMessages([
          {
            id: makeId(),
            role: 'assistant',
            content: welcomeMessage,
            timestamp: Date.now(),
          },
        ]);
      }
      return;
    }

    // Returning user — attempt to load history from server.
    setIsLoading(true);

    fetchHistory(apiUrl, existingSession.sessionId)
      .then((history) => {
        if (history && history.messages.length > 0) {
          // Restore messages from server history.
          greetingAddedRef.current = true;
          setMessages(
            history.messages.map((m) => ({
              id: makeId(),
              role: m.role,
              content: m.content,
              timestamp: Date.now(),
            })),
          );

          if (history.conversationId) {
            updateConversationId(history.conversationId);
          }
        } else {
          // No server history — show welcome message.
          if (welcomeMessage && !greetingAddedRef.current) {
            greetingAddedRef.current = true;
            setMessages([
              {
                id: makeId(),
                role: 'assistant',
                content: welcomeMessage,
                timestamp: Date.now(),
              },
            ]);
          }
        }
      })
      .catch(() => {
        // History fetch failed — fall back to welcome message.
        if (welcomeMessage && !greetingAddedRef.current) {
          greetingAddedRef.current = true;
          setMessages([
            {
              id: makeId(),
              role: 'assistant',
              content: welcomeMessage,
              timestamp: Date.now(),
            },
          ]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [apiUrl, welcomeMessage, updateConversationId]);

  const handleEvent = useCallback(
    (event: SSEEvent) => {
      switch (event.type) {
        case 'start': {
          assistantBufferRef.current = event.content ?? '';
          assistantIdRef.current = makeId();
          setMessages((prev) => [
            ...prev,
            {
              id: assistantIdRef.current,
              role: 'assistant',
              content: assistantBufferRef.current,
              timestamp: Date.now(),
            },
          ]);
          break;
        }

        case 'delta': {
          assistantBufferRef.current += event.content ?? '';
          const updatedContent = assistantBufferRef.current;
          const currentId = assistantIdRef.current;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === currentId ? { ...m, content: updatedContent } : m,
            ),
          );
          break;
        }

        case 'done': {
          setIsStreaming(false);
          cancelRef.current = null;

          if (event.content) {
            updateConversationId(event.content);
          }
          break;
        }

        case 'error': {
          setIsStreaming(false);
          cancelRef.current = null;
          setError(event.error ?? 'An unknown error occurred');
          break;
        }

        case 'escalation': {
          setEscalation(event.escalation ?? { reason: 'Escalation requested' });
          setIsStreaming(false);
          cancelRef.current = null;
          break;
        }
      }
    },
    [updateConversationId],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => {
        const updated = [...prev, userMessage];

        // Start streaming in a microtask so `updated` is committed first.
        queueMicrotask(() => {
          setIsStreaming(true);
          assistantBufferRef.current = '';
          assistantIdRef.current = '';

          const session = getOrCreateSession();
          const cancelFn = streamSendMessage(
            apiUrl,
            updated,
            session.sessionId,
            handleEvent,
          );

          cancelRef.current = cancelFn;
        });

        return updated;
      });
    },
    [apiUrl, isStreaming, getOrCreateSession, handleEvent],
  );

  const cancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearHistory = useCallback(() => {
    cancel();
    setError(null);
    setEscalation(null);

    if (welcomeMessage) {
      setMessages([
        {
          id: makeId(),
          role: 'assistant',
          content: welcomeMessage,
          timestamp: Date.now(),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [cancel, welcomeMessage]);

  /** Clear error and dismiss without retrying. */
  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Retry: clears the error and resends the last user message.
   * No-op if there is no error or no previous user message to retry.
   */
  const retry = useCallback(() => {
    if (!error || isStreaming) return;

    // Find the last user message in the conversation.
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    // Remove any incomplete assistant message that may have been added
    // after the user message (e.g. a partial response before the error).
    setMessages((prev) => {
      const cleaned = prev.slice(0, lastUserIndex + 1);
      return cleaned;
    });

    setError(null);

    // Use a microtask so the state update above is committed first.
    queueMicrotask(() => {
      setIsStreaming(true);
      assistantBufferRef.current = '';
      assistantIdRef.current = '';

      // Build the messages array up to and including the last user message.
      const messagesToSend = messages.slice(0, lastUserIndex + 1);

      const session = getOrCreateSession();
      const cancelFn = streamSendMessage(
        apiUrl,
        messagesToSend,
        session.sessionId,
        handleEvent,
      );

      cancelRef.current = cancelFn;
    });
  }, [error, isStreaming, messages, apiUrl, getOrCreateSession, handleEvent]);

  /**
   * Regenerate: removes the last assistant message and resends the
   * user message that preceded it.
   * No-op if currently streaming or if there is no assistant message to regenerate.
   */
  const regenerate = useCallback(() => {
    if (isStreaming) return;

    // Find the last assistant message.
    let lastAssistantIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        lastAssistantIndex = i;
        break;
      }
    }

    if (lastAssistantIndex === -1) return;

    // Find the user message before it.
    let userBeforeIndex = -1;
    for (let i = lastAssistantIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userBeforeIndex = i;
        break;
      }
    }

    if (userBeforeIndex === -1) return;

    // Remove the last assistant message.
    const withoutLastAssistant = messages.filter((_, i) => i !== lastAssistantIndex);

    setMessages(withoutLastAssistant);
    setError(null);

    // Build the messages to send (everything up to and including the user message).
    const messagesToSend = messages.slice(0, lastAssistantIndex);

    queueMicrotask(() => {
      setIsStreaming(true);
      assistantBufferRef.current = '';
      assistantIdRef.current = '';

      const session = getOrCreateSession();
      const cancelFn = streamSendMessage(
        apiUrl,
        messagesToSend,
        session.sessionId,
        handleEvent,
      );

      cancelRef.current = cancelFn;
    });
  }, [isStreaming, messages, apiUrl, getOrCreateSession, handleEvent]);

  return {
    messages,
    isStreaming,
    isLoading,
    error,
    escalation,
    sendMessage,
    cancel,
    clearHistory,
    retry,
    regenerate,
    dismissError,
  };
}
