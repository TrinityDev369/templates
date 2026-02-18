/**
 * CRM AI Assistant — API Route Handler (Server-Side)
 *
 * Creates a Next.js App Router POST handler that proxies messages to
 * an OpenAI-compatible API, injecting CRM context into the system prompt.
 *
 * Supports streaming responses via ReadableStream and includes a simple
 * in-memory token-bucket rate limiter.
 *
 * Environment variables:
 * - ASSISTANT_API_KEY  — Bearer token for the upstream AI API
 * - ASSISTANT_API_URL  — Base URL of the AI API (e.g. https://api.openai.com)
 */

import type { AssistantConfig, CRMContext, ChatMessage } from './types';
import { DEFAULT_ASSISTANT_CONFIG } from './types';

// ---------------------------------------------------------------------------
// Rate Limiter (in-memory token bucket)
// ---------------------------------------------------------------------------

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

/** Maximum tokens (requests) per bucket. */
const MAX_TOKENS = 20;
/** Token refill interval in milliseconds (1 minute). */
const REFILL_INTERVAL_MS = 60_000;
/** Tokens added per refill interval. */
const REFILL_AMOUNT = 10;

/**
 * Check (and consume) a rate-limit token for the given key.
 * Returns `true` if the request is allowed, `false` if rate-limited.
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    const intervals = Math.floor(elapsed / REFILL_INTERVAL_MS);
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + intervals * REFILL_AMOUNT);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    return false;
  }

  bucket.tokens -= 1;
  return true;
}

// ---------------------------------------------------------------------------
// System Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Build the full system prompt by combining the configured prompt
 * with serialized CRM context so the AI has deal awareness.
 */
function buildSystemPrompt(config: AssistantConfig, context?: CRMContext): string {
  let prompt = config.systemPrompt;

  if (context) {
    const contextBlock = [
      '\n\n--- CRM CONTEXT ---',
      `Total pipeline value: $${context.totalPipeline.toLocaleString()}`,
      `Average deal size: $${context.avgDealSize.toLocaleString()}`,
      `Win rate: ${context.winRate}%`,
      `Open deals: ${context.deals.filter((d) => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length}`,
      '',
      'Deals summary:',
      ...context.deals.map(
        (d) =>
          `- ${d.name} | ${d.company} | $${d.value.toLocaleString()} | Stage: ${d.stage} | Prob: ${d.probability}% | Close: ${d.expectedClose}`,
      ),
      '--- END CRM CONTEXT ---',
    ].join('\n');

    prompt += contextBlock;
  }

  return prompt;
}

// ---------------------------------------------------------------------------
// Request / Response Types
// ---------------------------------------------------------------------------

interface AssistantRequestBody {
  messages: ChatMessage[];
  context?: CRMContext;
}

// ---------------------------------------------------------------------------
// Handler Factory
// ---------------------------------------------------------------------------

/**
 * Create a Next.js App Router POST handler for the CRM AI assistant.
 *
 * Usage in `app/api/assistant/route.ts`:
 * ```ts
 * import { createAssistantHandler } from '@/modules/crm-ai-assistant';
 * export const POST = createAssistantHandler({ ... });
 * ```
 */
export function createAssistantHandler(
  configOverrides: Partial<AssistantConfig> = {},
): (request: Request) => Promise<Response> {
  const config: AssistantConfig = {
    ...DEFAULT_ASSISTANT_CONFIG,
    ...configOverrides,
  };

  return async function handlePost(request: Request): Promise<Response> {
    // ----- Rate limiting (keyed by IP or fallback) -----
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'anonymous';

    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // ----- Parse request body -----
    let body: AssistantRequestBody;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required and must not be empty.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // ----- Build messages payload for upstream API -----
    const systemPrompt = buildSystemPrompt(config, body.context);

    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...body.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // ----- Resolve API credentials from env -----
    const apiKey = process.env.ASSISTANT_API_KEY;
    const apiBaseUrl = process.env.ASSISTANT_API_URL ?? 'https://api.openai.com';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: ASSISTANT_API_KEY is not set.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // ----- Forward to upstream AI API (streaming) -----
    const upstreamUrl = `${apiBaseUrl.replace(/\/+$/, '')}/v1/chat/completions`;

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(upstreamUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: apiMessages,
          max_tokens: config.maxTokens,
          stream: true,
        }),
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: 'Failed to connect to AI service.',
          detail: err instanceof Error ? err.message : String(err),
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text().catch(() => 'Unknown error');
      return new Response(
        JSON.stringify({
          error: 'AI service returned an error.',
          status: upstreamResponse.status,
          detail: errorText,
        }),
        {
          status: upstreamResponse.status >= 500 ? 502 : upstreamResponse.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // ----- Stream the response back to the client -----
    const upstreamBody = upstreamResponse.body;
    if (!upstreamBody) {
      return new Response(
        JSON.stringify({ error: 'Empty response from AI service.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Pipe the SSE stream directly to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamBody.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  };
}
