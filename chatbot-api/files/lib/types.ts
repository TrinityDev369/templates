/**
 * @trinity369/use chatbot-api — Type definitions
 *
 * Shared types for the chat API: request/response shapes,
 * SSE event protocol, and chatbot configuration.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  sessionId: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
}

export interface SSEEvent {
  type: 'start' | 'delta' | 'done' | 'error' | 'escalation';
  content?: string;
  error?: string;
  escalation?: { agentName?: string; reason?: string };
}

export interface ChatbotConfig {
  /** Display name of the chatbot */
  name: string;

  /** Personality description injected into the system prompt */
  personality: string;

  /** Tone of voice guidance */
  tone: string;

  /** Things the bot must NOT do — injected as explicit constraints */
  antiIntents: string[];

  /** Optional disclaimer appended to every response context */
  disclaimer?: string;

  /** Max output tokens per response (default 2048) */
  maxTokens?: number;

  /** Anthropic model identifier (default claude-sonnet-4-6) */
  model?: string;

  /** Which context modules to load (reserved for chatbot-context template) */
  contextModules?: string[];

  /** URL to POST escalation events to (conversation transcript + metadata) */
  escalationWebhook?: string;

  /** API key for authenticating widget requests. Read from CHATBOT_API_KEY env var. */
  apiKey?: string;
}
