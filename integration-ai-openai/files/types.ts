/**
 * OpenAI Integration -- Type Definitions
 *
 * Core interfaces for OpenAI API chat completions, streaming,
 * embeddings, and structured output.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * OpenAI client configuration.
 *
 * Obtain an API key from https://platform.openai.com/api-keys
 *
 * @example
 * ```ts
 * const config: OpenAIConfig = {
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   organization: process.env.OPENAI_ORG_ID,
 *   defaultModel: 'gpt-4o',
 * };
 * ```
 */
export interface OpenAIConfig {
  /** OpenAI API key (starts with "sk-") */
  apiKey: string;
  /** Optional organization ID for multi-org accounts */
  organization?: string;
  /** Custom base URL for API-compatible proxies or Azure OpenAI */
  baseUrl?: string;
  /** Default model to use when not specified per-request (default: "gpt-4o") */
  defaultModel?: string;
}

// ---------------------------------------------------------------------------
// Chat Messages
// ---------------------------------------------------------------------------

/**
 * A single message in a chat conversation.
 */
export interface ChatMessage {
  /** The role of the message author */
  role: "system" | "user" | "assistant";
  /** The message content */
  content: string;
}

// ---------------------------------------------------------------------------
// Chat Options
// ---------------------------------------------------------------------------

/**
 * Options for chat completion requests.
 */
export interface ChatOptions {
  /** Model to use (overrides config.defaultModel) */
  model?: string;
  /** Sampling temperature between 0 and 2. Higher values increase randomness. */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Whether to stream the response token-by-token */
  stream?: boolean;
}

// ---------------------------------------------------------------------------
// Chat Response
// ---------------------------------------------------------------------------

/**
 * Parsed response from a chat completion request.
 */
export interface ChatResponse {
  /** Unique identifier for the completion */
  id: string;
  /** The generated text content */
  content: string;
  /** Model that produced the completion */
  model: string;
  /** Token usage breakdown */
  usage: {
    /** Tokens consumed by the input messages */
    promptTokens: number;
    /** Tokens generated in the response */
    completionTokens: number;
    /** Sum of prompt and completion tokens */
    totalTokens: number;
  };
  /** Reason the model stopped generating (e.g. "stop", "length") */
  finishReason: string;
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

/**
 * A single embedding result from the embeddings API.
 */
export interface EmbeddingResult {
  /** The embedding vector (array of floats) */
  embedding: number[];
  /** Index of the input text this embedding corresponds to */
  index: number;
}

// ---------------------------------------------------------------------------
// Streaming
// ---------------------------------------------------------------------------

/**
 * Callbacks for streaming chat completions.
 *
 * @example
 * ```ts
 * await chatStream(client, messages, {
 *   onToken: (token) => process.stdout.write(token),
 *   onComplete: (response) => console.log('\nDone:', response.id),
 *   onError: (error) => console.error('Stream error:', error),
 * });
 * ```
 */
export interface StreamCallbacks {
  /** Called for each token as it arrives */
  onToken?: (token: string) => void;
  /** Called when the stream completes with the full response */
  onComplete?: (response: ChatResponse) => void;
  /** Called if an error occurs during streaming */
  onError?: (error: Error) => void;
}
