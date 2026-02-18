/**
 * Twilio SMS Webhook Handler
 *
 * Handles incoming SMS messages and delivery status callbacks from Twilio.
 * Includes request signature validation to verify that webhook requests
 * genuinely originate from Twilio.
 *
 * @example
 * ```ts
 * import {
 *   validateTwilioSignature,
 *   parseIncomingSms,
 *   createTwimlResponse,
 * } from '@/integrations/sms-twilio';
 *
 * // In your webhook handler:
 * const isValid = validateTwilioSignature(url, params, signature, authToken);
 * if (!isValid) return new Response('Forbidden', { status: 403 });
 *
 * const sms = parseIncomingSms(params);
 * console.log(`From: ${sms.from}, Body: ${sms.body}`);
 *
 * const twiml = createTwimlResponse('Thanks for your message!');
 * return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
 * ```
 */

import { createHmac } from 'crypto';
import type { WebhookPayload, SmsMessage, MessageStatus } from './types';

// ---------------------------------------------------------------------------
// Signature Validation
// ---------------------------------------------------------------------------

/**
 * Validate that a webhook request was genuinely sent by Twilio.
 *
 * Twilio signs every webhook request with an HMAC-SHA1 signature using your
 * Auth Token. This function recomputes the signature and compares it to the
 * `X-Twilio-Signature` header value.
 *
 * Algorithm (per Twilio docs):
 *   1. Start with the full webhook URL (including https://)
 *   2. Sort POST parameters alphabetically by key
 *   3. Append each key-value pair to the URL string
 *   4. HMAC-SHA1 the resulting string with your Auth Token
 *   5. Base64-encode the HMAC digest
 *
 * @param url        The full URL of your webhook endpoint (must match exactly)
 * @param params     The parsed POST body parameters (key-value pairs)
 * @param signature  Value of the X-Twilio-Signature header
 * @param authToken  Your Twilio Auth Token (used as the HMAC key)
 * @returns          true if the signature is valid, false otherwise
 *
 * @see https://www.twilio.com/docs/usage/security#validating-requests
 *
 * @example
 * ```ts
 * const isValid = validateTwilioSignature(
 *   'https://example.com/api/sms/incoming',
 *   req.body,
 *   req.headers['x-twilio-signature'],
 *   process.env.TWILIO_AUTH_TOKEN!,
 * );
 * ```
 */
export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string,
): boolean {
  if (!url || !signature || !authToken) {
    return false;
  }

  // Build the data string: URL + sorted params concatenated as key=value pairs
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + (params[key] ?? '');
  }

  // Compute HMAC-SHA1 and Base64-encode
  const computed = createHmac('sha1', authToken)
    .update(data, 'utf-8')
    .digest('base64');

  // Constant-time comparison to prevent timing attacks
  if (computed.length !== signature.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }

  return mismatch === 0;
}

// ---------------------------------------------------------------------------
// Parse Incoming SMS
// ---------------------------------------------------------------------------

/**
 * Parse an incoming SMS webhook payload into a structured message object.
 *
 * Extracts the core message fields and normalizes them into an `SmsMessage`
 * for easy consumption by your application logic.
 *
 * @param body  Parsed webhook POST body (form-encoded parameters from Twilio)
 * @returns     Structured SMS message with sender, recipient, body, and metadata
 * @throws      If the payload is missing required fields (MessageSid, From, To)
 *
 * @example
 * ```ts
 * const sms = parseIncomingSms(req.body);
 * console.log(`New SMS from ${sms.from}: ${sms.body}`);
 * ```
 */
export function parseIncomingSms(body: WebhookPayload): SmsMessage {
  if (!body.MessageSid) {
    throw new Error('[Twilio Webhook] Missing required field: MessageSid');
  }

  if (!body.From) {
    throw new Error('[Twilio Webhook] Missing required field: From');
  }

  if (!body.To) {
    throw new Error('[Twilio Webhook] Missing required field: To');
  }

  return {
    sid: body.MessageSid,
    to: body.To,
    from: body.From,
    body: body.Body ?? '',
    status: (body.SmsStatus as MessageStatus) ?? 'received',
    dateSent: new Date().toISOString(),
    price: null,
    direction: 'inbound',
  };
}

// ---------------------------------------------------------------------------
// Parse Media Attachments
// ---------------------------------------------------------------------------

/**
 * Extract media attachment URLs from an incoming MMS webhook payload.
 *
 * Twilio sends media URLs as `MediaUrl0`, `MediaUrl1`, etc., with the count
 * in `NumMedia`.
 *
 * @param body  Parsed webhook POST body
 * @returns     Array of media URLs (empty if no media attached)
 *
 * @example
 * ```ts
 * const media = parseMediaAttachments(req.body);
 * for (const url of media) {
 *   console.log('Received media:', url);
 * }
 * ```
 */
export function parseMediaAttachments(body: WebhookPayload): string[] {
  const numMedia = parseInt(body.NumMedia ?? '0', 10);

  if (numMedia <= 0) {
    return [];
  }

  const urls: string[] = [];
  for (let i = 0; i < numMedia; i++) {
    const url = body[`MediaUrl${i}`];
    if (url) {
      urls.push(url);
    }
  }

  return urls;
}

// ---------------------------------------------------------------------------
// TwiML Response
// ---------------------------------------------------------------------------

/**
 * Generate a TwiML XML response for replying to an incoming SMS.
 *
 * TwiML (Twilio Markup Language) is how you instruct Twilio to respond to
 * incoming messages. Your webhook endpoint must return valid TwiML XML with
 * a `Content-Type: text/xml` header.
 *
 * @param message  Optional reply message text. If omitted, returns an empty
 *                 TwiML response (acknowledges receipt without replying).
 * @returns        Valid TwiML XML string
 *
 * @example
 * ```ts
 * // Auto-reply with a message
 * const xml = createTwimlResponse('Thanks! We received your message.');
 *
 * // Acknowledge without replying
 * const emptyXml = createTwimlResponse();
 *
 * return new Response(xml, {
 *   headers: { 'Content-Type': 'text/xml' },
 * });
 * ```
 */
export function createTwimlResponse(message?: string): string {
  if (message) {
    // Escape XML special characters in the message body
    const escaped = escapeXml(message);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>${escaped}</Message>\n</Response>`;
  }

  // Empty response — acknowledge the webhook without sending a reply
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response></Response>`;
}

// ---------------------------------------------------------------------------
// Internal Utilities
// ---------------------------------------------------------------------------

/**
 * Escape XML special characters to prevent injection in TwiML responses.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ---------------------------------------------------------------------------
// Example: Next.js API Route (App Router)
// ---------------------------------------------------------------------------

/*
 * Copy this example to your Next.js app at:
 *   app/api/sms/incoming/route.ts
 *
 * Then configure this URL as your Twilio webhook:
 *   https://your-domain.com/api/sms/incoming
 *
 * ---
 *
 * import { NextRequest, NextResponse } from 'next/server';
 * import {
 *   validateTwilioSignature,
 *   parseIncomingSms,
 *   parseMediaAttachments,
 *   createTwimlResponse,
 * } from '@/integrations/sms-twilio';
 * import type { WebhookPayload } from '@/integrations/sms-twilio';
 *
 * export async function POST(req: NextRequest) {
 *   const authToken = process.env.TWILIO_AUTH_TOKEN!;
 *
 *   // 1. Parse the form-encoded body
 *   const formData = await req.formData();
 *   const params: Record<string, string> = {};
 *   formData.forEach((value, key) => {
 *     params[key] = String(value);
 *   });
 *
 *   // 2. Validate the Twilio signature
 *   const signature = req.headers.get('x-twilio-signature') ?? '';
 *   const url = req.url; // Must match the URL configured in Twilio
 *
 *   if (!validateTwilioSignature(url, params, signature, authToken)) {
 *     return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
 *   }
 *
 *   // 3. Parse the incoming message
 *   const sms = parseIncomingSms(params as unknown as WebhookPayload);
 *   const media = parseMediaAttachments(params as unknown as WebhookPayload);
 *
 *   console.log(`SMS from ${sms.from}: ${sms.body}`);
 *   if (media.length > 0) {
 *     console.log(`  Media: ${media.join(', ')}`);
 *   }
 *
 *   // 4. Process the message (add your business logic here)
 *   // await handleIncomingSms(sms, media);
 *
 *   // 5. Respond with TwiML
 *   const twiml = createTwimlResponse('Thanks for your message!');
 *   return new NextResponse(twiml, {
 *     headers: { 'Content-Type': 'text/xml' },
 *   });
 * }
 */
