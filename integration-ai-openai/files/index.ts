/**
 * OpenAI Integration
 *
 * Chat completions, streaming, embeddings, and structured output
 * powered by the official OpenAI SDK.
 *
 * @example
 * ```ts
 * import {
 *   createClient,
 *   chat,
 *   chatStream,
 *   embed,
 *   structuredOutput,
 * } from '@/integrations/openai';
 *
 * // 1. Create a client
 * const client = createClient({
 *   apiKey: process.env.OPENAI_API_KEY!,
 * });
 *
 * // 2. Chat completion
 * const response = await chat(client, [
 *   { role: 'user', content: 'Hello!' },
 * ]);
 *
 * // 3. Stream tokens
 * await chatStream(client, messages, {
 *   onToken: (token) => process.stdout.write(token),
 * });
 *
 * // 4. Generate embeddings
 * const vectors = await embed(client, ['search query']);
 * ```
 */

// Client functions
export {
  createClient,
  chat,
  chatStream,
  embed,
  structuredOutput,
} from "./client";

// Type definitions
export type {
  OpenAIConfig,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  EmbeddingResult,
  StreamCallbacks,
} from "./types";
