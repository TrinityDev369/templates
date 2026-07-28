/**
 * Core type definitions for the chatbot widget.
 * Single source of truth for all components, hooks, and the streaming client.
 */

/** Configuration passed to the root <ChatWidget> component. */
export interface ChatConfig {
  /** Bot display name shown in the chat header. */
  name: string;

  /** Chat API endpoint URL. POST requests are sent here with SSE streaming. */
  apiUrl: string;

  /** Hex accent color used for buttons, user bubbles, and highlights. Defaults to #2563eb. */
  accentColor?: string;

  /** URL for the bot's avatar image displayed in the chat header. */
  avatarUrl?: string;

  /** First message shown when the chat window is opened for the first time. */
  welcomeMessage?: string;

  /** Placeholder text shown in the message input field. */
  placeholder?: string;

  /** Screen corner where the chat bubble and window appear. Defaults to 'bottom-right'. */
  position?: 'bottom-right' | 'bottom-left';

  /** Legal disclaimer text displayed above the input area. */
  disclaimer?: string;

  /** Webhook URL called when human handoff / escalation is triggered. */
  escalationUrl?: string;
}

/** A single chat message in the conversation. */
export interface ChatMessage {
  /** Unique message identifier. Auto-generated if not provided. */
  id?: string;

  /** Who sent the message. */
  role: 'user' | 'assistant';

  /** Message text content. */
  content: string;

  /** Unix timestamp in milliseconds when the message was created. */
  timestamp?: number;
}

/** A single event received from the SSE stream. */
export interface SSEEvent {
  /** Event type discriminator. */
  type: 'start' | 'delta' | 'done' | 'error' | 'escalation';

  /** Content payload — used by 'delta' (text chunk) and 'start' events. */
  content?: string;

  /** Error message — used by 'error' events. */
  error?: string;

  /** Escalation metadata — used by 'escalation' events. */
  escalation?: {
    agentName?: string;
    reason?: string;
  };
}

/** Client-side session object persisted in localStorage. */
export interface Session {
  /** Unique session identifier (UUID v4). */
  sessionId: string;

  /** Server-assigned conversation ID, bound after the first exchange. */
  conversationId: string | null;

  /** Unix timestamp in milliseconds when the session was created. */
  createdAt: number;
}
