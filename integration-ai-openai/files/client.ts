/**
 * OpenAI Client
 *
 * Provides typed functions for common OpenAI API operations: chat
 * completions, streaming chat, embeddings, and structured (JSON) output.
 * Uses the official `openai` Node.js SDK.
 *
 * @example
 * ```ts
 * import { createClient, chat, chatStream, embed } from '@/integrations/openai';
 *
 * const client = createClient({
 *   apiKey: process.env.OPENAI_API_KEY!,
 * });
 *
 * const response = await chat(client, [
 *   { role: 'system', content: 'You are a helpful assistant.' },
 *   { role: 'user', content: 'Hello!' },
 * ]);
 * console.log(response.content);
 * ```
 */

import OpenAI from "openai";
import type {
  OpenAIConfig,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  EmbeddingResult,
  StreamCallbacks,
} from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default model used when none is specified in config or per-request options */
const DEFAULT_MODEL = "gpt-4o";

/** Default embedding model */
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

// ---------------------------------------------------------------------------
// Client Initialization
// ---------------------------------------------------------------------------

/**
 * Create and return an authenticated OpenAI client instance.
 *
 * The returned client is a thin wrapper around `new OpenAI(...)`.
 * Store the client instance and reuse it across requests -- do NOT create
 * a new client per API call.
 *
 * @param config  OpenAI API credentials and optional defaults
 * @returns       Authenticated OpenAI client instance
 * @throws        If apiKey is missing or empty
 *
 * @example
 * ```ts
 * const client = createClient({
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   defaultModel: 'gpt-4o',
 * });
 * ```
 */
export function createClient(config: OpenAIConfig): OpenAI {
  if (!config.apiKey) {
    throw new Error(
      "[OpenAI] API key is required. " +
        "Get your key from https://platform.openai.com/api-keys"
    );
  }

  return new OpenAI({
    apiKey: config.apiKey,
    organization: config.organization,
    baseURL: config.baseUrl,
    defaultHeaders: {
      "X-Default-Model": config.defaultModel ?? DEFAULT_MODEL,
    },
  });
}

// ---------------------------------------------------------------------------
// Chat Completion (non-streaming)
// ---------------------------------------------------------------------------

/**
 * Send a chat completion request and return the full response.
 *
 * @param client    OpenAI client instance from `createClient`
 * @param messages  Array of conversation messages
 * @param options   Optional model, temperature, and token limit overrides
 * @returns         Parsed chat response with content, usage, and metadata
 * @throws          If the API request fails or returns no choices
 *
 * @example
 * ```ts
 * const response = await chat(client, [
 *   { role: 'system', content: 'You are a helpful assistant.' },
 *   { role: 'user', content: 'Explain quantum computing in one sentence.' },
 * ], { temperature: 0.3 });
 *
 * console.log(response.content);
 * console.log(`Tokens used: ${response.usage.totalTokens}`);
 * ```
 */
export async function chat(
  client: OpenAI,
  messages: ChatMessage[],
  options?: ChatOptions,
): Promise<ChatResponse> {
  if (!messages || messages.length === 0) {
    throw new Error("[OpenAI] At least one message is required.");
  }

  try {
    const model = resolveModel(client, options?.model);

    const completion = await client.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: false,
    });

    const choice = completion.choices[0];

    if (!choice) {
      throw new Error("[OpenAI] API returned no choices.");
    }

    return {
      id: completion.id,
      content: choice.message?.content ?? "",
      model: completion.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens ?? 0,
        completionTokens: completion.usage?.completion_tokens ?? 0,
        totalTokens: completion.usage?.total_tokens ?? 0,
      },
      finishReason: choice.finish_reason ?? "unknown",
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[OpenAI]")) {
      throw error;
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`[OpenAI] Chat completion failed: ${errMsg}`);
  }
}

// ---------------------------------------------------------------------------
// Chat Completion (streaming)
// ---------------------------------------------------------------------------

/**
 * Send a streaming chat completion request with token-by-token callbacks.
 *
 * Tokens are delivered via `callbacks.onToken` as they arrive. When the
 * stream finishes, the full assembled response is passed to
 * `callbacks.onComplete`. Errors are forwarded to `callbacks.onError`.
 *
 * @param client     OpenAI client instance from `createClient`
 * @param messages   Array of conversation messages
 * @param callbacks  Token, completion, and error callbacks
 * @param options    Optional model, temperature, and token limit overrides
 * @throws           If the API request fails (also calls callbacks.onError)
 *
 * @example
 * ```ts
 * await chatStream(
 *   client,
 *   [{ role: 'user', content: 'Write a haiku about TypeScript.' }],
 *   {
 *     onToken: (token) => process.stdout.write(token),
 *     onComplete: (response) => {
 *       console.log('\n---');
 *       console.log('Tokens:', response.usage.totalTokens);
 *     },
 *     onError: (error) => console.error('Error:', error.message),
 *   },
 * );
 * ```
 */
export async function chatStream(
  client: OpenAI,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  options?: ChatOptions,
): Promise<void> {
  if (!messages || messages.length === 0) {
    const err = new Error("[OpenAI] At least one message is required.");
    callbacks.onError?.(err);
    throw err;
  }

  try {
    const model = resolveModel(client, options?.model);

    const stream = await client.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: true,
      stream_options: { include_usage: true },
    });

    let content = "";
    let completionId = "";
    let completionModel = model;
    let finishReason = "unknown";
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;

    for await (const chunk of stream) {
      // Capture metadata from the first chunk
      if (chunk.id) {
        completionId = chunk.id;
      }
      if (chunk.model) {
        completionModel = chunk.model;
      }

      // Extract token delta
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        content += delta;
        callbacks.onToken?.(delta);
      }

      // Capture finish reason
      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason;
      }

      // Capture usage from the final chunk (when stream_options.include_usage is true)
      if (chunk.usage) {
        promptTokens = chunk.usage.prompt_tokens ?? 0;
        completionTokens = chunk.usage.completion_tokens ?? 0;
        totalTokens = chunk.usage.total_tokens ?? 0;
      }
    }

    callbacks.onComplete?.({
      id: completionId,
      content,
      model: completionModel,
      usage: { promptTokens, completionTokens, totalTokens },
      finishReason,
    });
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(`[OpenAI] Stream failed: ${String(error)}`);
    callbacks.onError?.(err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

/**
 * Generate embeddings for an array of text strings.
 *
 * Uses OpenAI's embeddings API to convert text into dense vector
 * representations suitable for similarity search, clustering, or
 * classification tasks.
 *
 * @param client  OpenAI client instance from `createClient`
 * @param texts   Array of text strings to embed (max ~8191 tokens each)
 * @param model   Embedding model to use (default: "text-embedding-3-small")
 * @returns       Array of embedding results with vectors and indices
 * @throws        If the API request fails or texts array is empty
 *
 * @example
 * ```ts
 * const results = await embed(client, [
 *   'The quick brown fox',
 *   'jumps over the lazy dog',
 * ]);
 *
 * console.log(`Dimension: ${results[0].embedding.length}`);
 * console.log(`Vectors: ${results.length}`);
 * ```
 */
export async function embed(
  client: OpenAI,
  texts: string[],
  model?: string,
): Promise<EmbeddingResult[]> {
  if (!texts || texts.length === 0) {
    throw new Error("[OpenAI] At least one text string is required for embedding.");
  }

  try {
    const response = await client.embeddings.create({
      model: model ?? DEFAULT_EMBEDDING_MODEL,
      input: texts,
    });

    return response.data.map((item) => ({
      embedding: item.embedding,
      index: item.index,
    }));
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`[OpenAI] Embedding request failed: ${errMsg}`);
  }
}

// ---------------------------------------------------------------------------
// Structured Output (JSON Mode)
// ---------------------------------------------------------------------------

/**
 * Send a chat completion with JSON mode enabled for structured output.
 *
 * Instructs the model to respond with valid JSON matching the provided
 * schema description. The schema is injected into the system prompt to
 * guide the model's output format.
 *
 * **Important**: The caller is responsible for validating the returned
 * object matches the expected shape. Consider using Zod or similar
 * for runtime validation.
 *
 * @param client    OpenAI client instance from `createClient`
 * @param messages  Array of conversation messages
 * @param schema    JSON schema object describing the expected output structure
 * @param options   Optional model, temperature, and token limit overrides
 * @returns         Parsed JSON response typed as T
 * @throws          If the API request fails or response is not valid JSON
 *
 * @example
 * ```ts
 * interface Analysis {
 *   sentiment: 'positive' | 'negative' | 'neutral';
 *   confidence: number;
 *   summary: string;
 * }
 *
 * const result = await structuredOutput<Analysis>(
 *   client,
 *   [{ role: 'user', content: 'Analyze: "This product is amazing!"' }],
 *   {
 *     type: 'object',
 *     properties: {
 *       sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
 *       confidence: { type: 'number', minimum: 0, maximum: 1 },
 *       summary: { type: 'string' },
 *     },
 *     required: ['sentiment', 'confidence', 'summary'],
 *   },
 * );
 *
 * console.log(result.sentiment);   // 'positive'
 * console.log(result.confidence);  // 0.95
 * ```
 */
export async function structuredOutput<T>(
  client: OpenAI,
  messages: ChatMessage[],
  schema: Record<string, unknown>,
  options?: ChatOptions,
): Promise<T> {
  if (!messages || messages.length === 0) {
    throw new Error("[OpenAI] At least one message is required.");
  }

  try {
    const model = resolveModel(client, options?.model);

    // Prepend a system message with the JSON schema instruction
    const schemaInstruction: ChatMessage = {
      role: "system",
      content:
        "You must respond with valid JSON that conforms to the following schema:\n" +
        JSON.stringify(schema, null, 2),
    };

    // Place schema instruction first, then user-provided messages
    const allMessages = [schemaInstruction, ...messages];

    const completion = await client.chat.completions.create({
      model,
      messages: allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      response_format: { type: "json_object" },
    });

    const choice = completion.choices[0];

    if (!choice?.message?.content) {
      throw new Error("[OpenAI] API returned no content for structured output.");
    }

    try {
      return JSON.parse(choice.message.content) as T;
    } catch {
      throw new Error(
        "[OpenAI] Failed to parse structured output as JSON. " +
          `Raw response: ${choice.message.content.slice(0, 200)}`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[OpenAI]")) {
      throw error;
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`[OpenAI] Structured output request failed: ${errMsg}`);
  }
}

// ---------------------------------------------------------------------------
// Internal Utilities
// ---------------------------------------------------------------------------

/**
 * Resolve the model to use, checking per-request option, then client
 * default header, then falling back to DEFAULT_MODEL.
 */
function resolveModel(client: OpenAI, requestModel?: string): string {
  if (requestModel) return requestModel;

  // Check if a default model was set via the X-Default-Model header
  const defaultHeader = (
    client as unknown as { _options?: { defaultHeaders?: Record<string, string> } }
  )._options?.defaultHeaders?.["X-Default-Model"];

  return defaultHeader ?? DEFAULT_MODEL;
}
