/**
 * Lemon Squeezy Webhook Handler
 *
 * Verification and parsing utilities for Lemon Squeezy webhook events.
 * Includes HMAC-SHA256 signature validation using Node.js built-in `crypto`
 * and a full request handler suitable for Next.js API routes.
 *
 * @example
 * ```ts
 * // Next.js App Router: app/api/webhooks/lemon-squeezy/route.ts
 * import { handleWebhook } from '@/integrations/lemon-squeezy';
 *
 * export async function POST(request: Request) {
 *   try {
 *     const event = await handleWebhook(request, {
 *       webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!,
 *     });
 *
 *     switch (event.event) {
 *       case 'subscription_created':
 *         // Handle new subscription
 *         break;
 *       case 'order_created':
 *         // Handle new order
 *         break;
 *     }
 *
 *     return new Response('OK', { status: 200 });
 *   } catch (error) {
 *     return new Response('Invalid signature', { status: 401 });
 *   }
 * }
 * ```
 */

import { createHmac, timingSafeEqual } from 'crypto';
import type { LemonSqueezyConfig, WebhookEvent } from './types';

// ---------------------------------------------------------------------------
// Signature Verification
// ---------------------------------------------------------------------------

/**
 * Verify that a webhook payload was genuinely sent by Lemon Squeezy.
 *
 * Lemon Squeezy signs every webhook request with an HMAC-SHA256 digest
 * of the raw request body, using your webhook secret as the key. The
 * signature is sent in the `X-Signature` header as a hex string.
 *
 * Uses `crypto.timingSafeEqual` for constant-time comparison to prevent
 * timing attacks.
 *
 * @param payload    Raw request body as a string (must not be parsed/modified)
 * @param signature  Value of the `X-Signature` header from the incoming request
 * @param secret     Your Lemon Squeezy webhook secret
 * @returns          `true` if the signature is valid, `false` otherwise
 *
 * @example
 * ```ts
 * const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
 * if (!isValid) {
 *   return new Response('Forbidden', { status: 403 });
 * }
 * ```
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    const computed = createHmac('sha256', secret)
      .update(payload, 'utf-8')
      .digest('hex');

    const computedBuffer = Buffer.from(computed, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');

    if (computedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(computedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Event Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a raw webhook body into a typed `WebhookEvent`.
 *
 * Lemon Squeezy sends webhook payloads as JSON with this structure:
 * ```json
 * {
 *   "meta": { "event_name": "subscription_created", ... },
 *   "data": { "id": "...", "type": "...", "attributes": { ... } }
 * }
 * ```
 *
 * This function extracts the event name and flattens the data payload
 * for easier consumption.
 *
 * @param body  Raw JSON string of the webhook request body
 * @returns     Parsed webhook event with event name and data
 * @throws      If the body is not valid JSON or is missing required fields
 *
 * @example
 * ```ts
 * const event = parseWebhookEvent(rawBody);
 * console.log(`Event: ${event.event}`);
 * console.log(`Data:`, event.data);
 * ```
 */
export function parseWebhookEvent(body: string): WebhookEvent {
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error('[LemonSqueezy] Webhook body is not valid JSON.');
  }

  const meta = parsed.meta as Record<string, unknown> | undefined;
  if (!meta || typeof meta.event_name !== 'string') {
    throw new Error(
      '[LemonSqueezy] Webhook payload is missing meta.event_name.',
    );
  }

  const data = parsed.data as Record<string, unknown> | undefined;
  if (!data) {
    throw new Error('[LemonSqueezy] Webhook payload is missing data.');
  }

  return {
    event: meta.event_name,
    data,
  };
}

// ---------------------------------------------------------------------------
// Full Request Handler
// ---------------------------------------------------------------------------

/**
 * Complete webhook handler: reads the request body, verifies the
 * HMAC-SHA256 signature, and parses the event payload.
 *
 * Designed for use in Next.js App Router API routes, Hono handlers,
 * or any framework that provides a standard `Request` object.
 *
 * @param request  Incoming HTTP request (must have an unread body)
 * @param config   Configuration object containing the webhook secret
 * @returns        Parsed and verified webhook event
 * @throws         If the signature is invalid or the payload cannot be parsed
 *
 * @example
 * ```ts
 * // Next.js App Router
 * export async function POST(request: Request) {
 *   try {
 *     const event = await handleWebhook(request, {
 *       webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!,
 *     });
 *
 *     // event is verified and safe to process
 *     console.log(`Received: ${event.event}`);
 *     return new Response('OK', { status: 200 });
 *   } catch (error) {
 *     console.error('Webhook error:', error);
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 * }
 * ```
 */
export async function handleWebhook(
  request: Request,
  config: Pick<LemonSqueezyConfig, 'webhookSecret'>,
): Promise<WebhookEvent> {
  if (!config.webhookSecret) {
    throw new Error('[LemonSqueezy] Webhook secret is required.');
  }

  // Read the raw body
  const body = await request.text();

  if (!body) {
    throw new Error('[LemonSqueezy] Webhook request body is empty.');
  }

  // Extract the signature header
  const signature = request.headers.get('x-signature') ?? '';

  if (!signature) {
    throw new Error(
      '[LemonSqueezy] Missing X-Signature header. Ensure the request is from Lemon Squeezy.',
    );
  }

  // Verify the signature
  const isValid = verifyWebhookSignature(body, signature, config.webhookSecret);

  if (!isValid) {
    throw new Error(
      '[LemonSqueezy] Invalid webhook signature. The request may have been tampered with.',
    );
  }

  // Parse and return the event
  return parseWebhookEvent(body);
}
