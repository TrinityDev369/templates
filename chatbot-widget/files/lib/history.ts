/**
 * Client-side conversation history fetcher.
 *
 * Loads previous messages from the chat API so the widget can restore
 * conversation state across page refreshes.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HistoryResponse {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId: string;
  conversationId?: string;
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

/**
 * Fetch conversation history from the server.
 * Returns null if no history exists (new session) or if the request fails.
 *
 * The history URL is derived from `apiUrl` by appending `/history`.
 * For example, if apiUrl is `https://api.example.com/api/chat`, the
 * history endpoint becomes `https://api.example.com/api/chat/history`.
 *
 * @param apiUrl   - Base chat API URL (e.g., `https://api.example.com/api/chat`)
 * @param sessionId - Session identifier stored in localStorage
 */
export async function fetchHistory(
  apiUrl: string,
  sessionId: string,
): Promise<HistoryResponse | null> {
  try {
    // Strip trailing slash for consistent URL construction
    const base = apiUrl.replace(/\/+$/, '');
    const url = `${base}/history?sessionId=${encodeURIComponent(sessionId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      // 404 or other error — treat as no history available
      return null;
    }

    const data = (await response.json()) as HistoryResponse;

    // Return null if the server returned an empty messages array
    if (!data.messages || data.messages.length === 0) {
      return null;
    }

    return data;
  } catch {
    // Network error, CORS issue, JSON parse failure, etc.
    // Silently return null — the widget will just show the welcome state.
    return null;
  }
}
