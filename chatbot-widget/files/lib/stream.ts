/**
 * SSE streaming client for the chatbot API.
 *
 * Uses fetch + ReadableStream (not EventSource) because we need POST
 * requests with a JSON body. EventSource only supports GET.
 *
 * Includes automatic retry for transient failures:
 * - Network errors (TypeError from fetch): retry after 1s
 * - HTTP 429 (rate limited): retry after Retry-After header (max 10s)
 * - HTTP 5xx (server errors): retry after 2s
 * - HTTP 4xx (except 429): fail immediately (client error)
 */

import type { ChatMessage, SSEEvent } from './types';

export type SSEEventHandler = (event: SSEEvent) => void;

/** Default maximum number of automatic retries on transient failures. */
const DEFAULT_MAX_RETRIES = 1;

/** Maximum wait time for a Retry-After header (in milliseconds). */
const MAX_RETRY_AFTER_MS = 10_000;

/**
 * Send a message to the chat API and stream the response via SSE.
 * Returns a cancel function that aborts the in-flight request.
 *
 * @param maxRetries Number of automatic retries on transient failures (default: 1).
 */
export function sendMessage(
  apiUrl: string,
  messages: ChatMessage[],
  sessionId: string,
  onEvent: SSEEventHandler,
  maxRetries: number = DEFAULT_MAX_RETRIES,
): () => void {
  const controller = new AbortController();

  processStreamWithRetry(apiUrl, messages, sessionId, controller.signal, onEvent, maxRetries).catch(
    (err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Intentional cancellation — not an error.
        return;
      }
      onEvent({
        type: 'error',
        error: err instanceof Error ? err.message : 'Unknown streaming error',
      });
    },
  );

  return () => controller.abort();
}

/** Wait for the given number of milliseconds, aborting early if the signal fires. */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }

    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Attempt to process the stream, retrying on transient failures.
 *
 * Retryable conditions:
 * - Network errors (TypeError thrown by fetch — offline, DNS, etc.)
 * - HTTP 429 with optional Retry-After header
 * - HTTP 5xx server errors
 *
 * Non-retryable conditions:
 * - HTTP 4xx (except 429) — client errors that won't resolve on retry
 * - Abort signal triggered — user cancelled
 */
async function processStreamWithRetry(
  apiUrl: string,
  messages: ChatMessage[],
  sessionId: string,
  signal: AbortSignal,
  onEvent: SSEEventHandler,
  maxRetries: number,
): Promise<void> {
  let attempt = 0;

  while (true) {
    try {
      await processStream(apiUrl, messages, sessionId, signal, onEvent);
      return; // Success — exit the retry loop.
    } catch (err: unknown) {
      // Never retry after an intentional abort.
      if (signal.aborted) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') throw err;

      // Network errors (TypeError) are retryable.
      if (err instanceof TypeError && attempt < maxRetries) {
        attempt++;
        await delay(1_000, signal);
        continue;
      }

      // All other errors propagate immediately.
      throw err;
    }
  }
}

/**
 * Perform the fetch, handle HTTP-level retries for 429/5xx, read the
 * SSE stream, and dispatch events.
 */
async function processStream(
  apiUrl: string,
  messages: ChatMessage[],
  sessionId: string,
  signal: AbortSignal,
  onEvent: SSEEventHandler,
  _retryAttempt: number = 0,
  _maxRetries: number = DEFAULT_MAX_RETRIES,
): Promise<void> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      sessionId,
    }),
    signal,
  });

  if (!response.ok) {
    const status = response.status;

    // HTTP 429 — rate limited. Retry once after Retry-After (max 10s).
    if (status === 429 && _retryAttempt < _maxRetries) {
      const retryAfterHeader = response.headers.get('Retry-After');
      let waitMs = 2_000; // Default wait if no header present.

      if (retryAfterHeader) {
        const seconds = Number(retryAfterHeader);
        if (!Number.isNaN(seconds) && seconds > 0) {
          waitMs = Math.min(seconds * 1_000, MAX_RETRY_AFTER_MS);
        }
      }

      await delay(waitMs, signal);
      return processStream(apiUrl, messages, sessionId, signal, onEvent, _retryAttempt + 1, _maxRetries);
    }

    // HTTP 5xx — server error. Retry once after 2s.
    if (status >= 500 && _retryAttempt < _maxRetries) {
      await delay(2_000, signal);
      return processStream(apiUrl, messages, sessionId, signal, onEvent, _retryAttempt + 1, _maxRetries);
    }

    // Non-retryable HTTP error (4xx except 429, or exhausted retries).
    const text = await response.text().catch(() => 'Unknown error');
    onEvent({ type: 'error', error: `HTTP ${status}: ${text}` });
    return;
  }

  const body = response.body;
  if (!body) {
    onEvent({ type: 'error', error: 'Response body is empty' });
    return;
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE lines are separated by newlines. Process complete lines.
      const lines = buffer.split('\n');

      // Keep the last (potentially incomplete) line in the buffer.
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and SSE comments.
        if (trimmed === '' || trimmed.startsWith(':')) continue;

        // Parse "data: {...}" lines.
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim();

          // "data: [DONE]" is a common stream termination signal.
          if (jsonStr === '[DONE]') {
            onEvent({ type: 'done' });
            continue;
          }

          try {
            const event = JSON.parse(jsonStr) as SSEEvent;
            onEvent(event);
          } catch {
            // Non-JSON data line — skip silently.
          }
        }
      }
    }

    // Process any remaining data in the buffer after the stream ends.
    if (buffer.trim().startsWith('data:')) {
      const jsonStr = buffer.trim().slice(5).trim();
      if (jsonStr && jsonStr !== '[DONE]') {
        try {
          const event = JSON.parse(jsonStr) as SSEEvent;
          onEvent(event);
        } catch {
          // Ignore malformed trailing data.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
