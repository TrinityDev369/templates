/**
 * @trinity369/use chatbot-api — Anthropic SDK wrapper
 *
 * Thin wrapper around the official @anthropic-ai/sdk that yields
 * SSEEvent objects suitable for streaming to the client.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage, ChatbotConfig, SSEEvent } from './types';

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to your .env file.',
    );
  }

  _client = new Anthropic({ apiKey });
  return _client;
}

// ---------------------------------------------------------------------------
// Streaming chat
// ---------------------------------------------------------------------------

/**
 * Stream a chat completion from Anthropic, yielding SSEEvent objects.
 *
 * @param systemPrompt  - Fully assembled system prompt (identity + context + constraints)
 * @param messages       - Conversation history in Anthropic message format
 * @param config         - Chatbot configuration for model/token settings
 */
export async function* streamChat(
  systemPrompt: string,
  messages: ChatMessage[],
  config: ChatbotConfig,
): AsyncGenerator<SSEEvent> {
  const client = getClient();
  const model = config.model ?? 'claude-sonnet-4-6';
  const maxTokens = config.maxTokens ?? 2048;

  // Signal the start of streaming
  yield { type: 'start' };

  try {
    const messageStream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of messageStream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { type: 'delta', content: event.delta.text };
      }
    }

    yield { type: 'done' };
  } catch (err: unknown) {
    // Surface a safe error message — never leak stack traces or API keys
    const message =
      err instanceof Anthropic.APIError
        ? `Anthropic API error (${err.status}): ${err.message}`
        : 'An unexpected error occurred while generating a response.';

    console.error('[chatbot-api] streamChat error:', err);
    yield { type: 'error', error: message };
  }
}
