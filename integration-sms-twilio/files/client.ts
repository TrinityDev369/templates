/**
 * Twilio SMS Client
 *
 * Provides a typed wrapper around the Twilio Node.js SDK for common SMS
 * operations: sending, bulk sending with rate limiting, delivery tracking,
 * message listing, and phone number lookup/formatting.
 *
 * @example
 * ```ts
 * import { createSmsClient, sendSms, formatPhoneNumber } from '@/integrations/sms-twilio';
 *
 * const client = createSmsClient({
 *   accountSid: process.env.TWILIO_ACCOUNT_SID!,
 *   authToken: process.env.TWILIO_AUTH_TOKEN!,
 *   defaultFrom: process.env.TWILIO_PHONE_NUMBER!,
 * });
 *
 * const result = await sendSms(client, '+14155551234', 'Hello from Twilio!');
 * console.log('Message SID:', result);
 * ```
 */

import twilio from 'twilio';
import type { Twilio } from 'twilio';
import type {
  TwilioConfig,
  SmsMessage,
  SendSmsOptions,
  BulkSmsResult,
  BulkSmsRecipientResult,
  MessageStatus,
  PhoneLookupResult,
  ListMessagesOptions,
} from './types';

// ---------------------------------------------------------------------------
// Client Initialization
// ---------------------------------------------------------------------------

/**
 * Create and return an authenticated Twilio REST client.
 *
 * The returned client is a thin wrapper around `twilio(accountSid, authToken)`.
 * Store the client instance and reuse it across requests — do NOT create a new
 * client per API call.
 *
 * @param config  Twilio account credentials and optional default sender number
 * @returns       Authenticated Twilio client instance
 * @throws        If accountSid or authToken are missing or malformed
 *
 * @example
 * ```ts
 * const client = createSmsClient({
 *   accountSid: process.env.TWILIO_ACCOUNT_SID!,
 *   authToken: process.env.TWILIO_AUTH_TOKEN!,
 *   defaultFrom: '+14155551234',
 * });
 * ```
 */
export function createSmsClient(config: TwilioConfig): { client: Twilio; config: TwilioConfig } {
  if (!config.accountSid || !config.accountSid.startsWith('AC')) {
    throw new Error(
      '[Twilio] Invalid accountSid — must start with "AC". ' +
      'Get your Account SID from https://console.twilio.com'
    );
  }

  if (!config.authToken || config.authToken.length < 10) {
    throw new Error(
      '[Twilio] Invalid authToken — must be a non-empty string. ' +
      'Get your Auth Token from https://console.twilio.com'
    );
  }

  const client = twilio(config.accountSid, config.authToken);

  return { client, config };
}

// ---------------------------------------------------------------------------
// Send Single SMS
// ---------------------------------------------------------------------------

/**
 * Send a single SMS message.
 *
 * @param smsClient  Client wrapper returned by `createSmsClient`
 * @param to         Recipient phone number (E.164 format recommended)
 * @param body       Message text (max 1600 chars; Twilio splits longer messages automatically)
 * @param from       Sender phone number — overrides config.defaultFrom
 * @returns          Twilio message SID (starts with "SM")
 * @throws           If no "from" number is available or the API call fails
 *
 * @example
 * ```ts
 * const sid = await sendSms(client, '+14155551234', 'Your code is 123456');
 * ```
 */
export async function sendSms(
  smsClient: { client: Twilio; config: TwilioConfig },
  to: string,
  body: string,
  from?: string,
): Promise<string> {
  const senderNumber = from ?? smsClient.config.defaultFrom;

  if (!senderNumber) {
    throw new Error(
      '[Twilio] No "from" phone number provided and no defaultFrom configured. ' +
      'Pass a "from" parameter or set defaultFrom in your TwilioConfig.'
    );
  }

  if (!to) {
    throw new Error('[Twilio] Recipient "to" phone number is required.');
  }

  if (!body) {
    throw new Error('[Twilio] Message "body" cannot be empty.');
  }

  try {
    const message = await smsClient.client.messages.create({
      to,
      from: senderNumber,
      body,
    });

    return message.sid;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`[Twilio] Failed to send SMS to ${to}: ${errMsg}`);
  }
}

// ---------------------------------------------------------------------------
// Send with Full Options
// ---------------------------------------------------------------------------

/**
 * Send an SMS with full options including status callback and media.
 *
 * @param smsClient  Client wrapper returned by `createSmsClient`
 * @param options    Full send options (to, body, from, statusCallback, mediaUrl)
 * @returns          Twilio message SID
 * @throws           If required fields are missing or the API call fails
 *
 * @example
 * ```ts
 * const sid = await sendSmsWithOptions(client, {
 *   to: '+14155551234',
 *   body: 'Check out this image!',
 *   statusCallback: 'https://example.com/webhook/status',
 *   mediaUrl: ['https://example.com/image.jpg'],
 * });
 * ```
 */
export async function sendSmsWithOptions(
  smsClient: { client: Twilio; config: TwilioConfig },
  options: SendSmsOptions,
): Promise<string> {
  const senderNumber = options.from ?? smsClient.config.defaultFrom;

  if (!senderNumber) {
    throw new Error(
      '[Twilio] No "from" phone number provided and no defaultFrom configured.'
    );
  }

  if (!options.to) {
    throw new Error('[Twilio] Recipient "to" phone number is required.');
  }

  if (!options.body) {
    throw new Error('[Twilio] Message "body" cannot be empty.');
  }

  try {
    const createParams: Record<string, unknown> = {
      to: options.to,
      from: senderNumber,
      body: options.body,
    };

    if (options.statusCallback) {
      createParams.statusCallback = options.statusCallback;
    }

    if (options.mediaUrl && options.mediaUrl.length > 0) {
      createParams.mediaUrl = options.mediaUrl;
    }

    const message = await smsClient.client.messages.create(createParams as Parameters<typeof smsClient.client.messages.create>[0]);

    return message.sid;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`[Twilio] Failed to send SMS to ${options.to}: ${errMsg}`);
  }
}

// ---------------------------------------------------------------------------
// Bulk SMS
// ---------------------------------------------------------------------------

/** Default delay between messages in a bulk send (milliseconds) */
const BULK_SMS_RATE_LIMIT_MS = 100;

/**
 * Send an SMS to multiple recipients with rate limiting.
 *
 * Messages are sent sequentially with a configurable delay between each to
 * respect Twilio's rate limits (default: 1 message per second for trial
 * accounts, higher for paid accounts).
 *
 * Failures for individual recipients do NOT abort the entire batch — each
 * recipient's result is tracked independently.
 *
 * @param smsClient   Client wrapper returned by `createSmsClient`
 * @param recipients  Array of phone numbers in E.164 format
 * @param body        Message text to send to all recipients
 * @param from        Sender phone number — overrides config.defaultFrom
 * @param delayMs     Milliseconds to wait between sends (default: 100ms)
 * @returns           Summary of sent/failed counts and per-recipient results
 *
 * @example
 * ```ts
 * const result = await sendBulkSms(
 *   client,
 *   ['+14155551234', '+14155555678', '+14155559012'],
 *   'Flash sale! 20% off everything today.',
 * );
 * console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
 * ```
 */
export async function sendBulkSms(
  smsClient: { client: Twilio; config: TwilioConfig },
  recipients: string[],
  body: string,
  from?: string,
  delayMs: number = BULK_SMS_RATE_LIMIT_MS,
): Promise<BulkSmsResult> {
  if (!recipients || recipients.length === 0) {
    return { sent: 0, failed: 0, results: [] };
  }

  if (!body) {
    throw new Error('[Twilio] Message "body" cannot be empty for bulk send.');
  }

  const senderNumber = from ?? smsClient.config.defaultFrom;
  if (!senderNumber) {
    throw new Error(
      '[Twilio] No "from" phone number provided and no defaultFrom configured.'
    );
  }

  // Deduplicate recipients
  const uniqueRecipients = [...new Set(recipients)];

  const results: BulkSmsRecipientResult[] = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < uniqueRecipients.length; i++) {
    const to = uniqueRecipients[i];

    try {
      const message = await smsClient.client.messages.create({
        to,
        from: senderNumber,
        body,
      });

      results.push({ to, sid: message.sid, error: null });
      sent++;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      results.push({ to, sid: null, error: errMsg });
      failed++;
    }

    // Rate limit: wait between messages (skip delay after the last one)
    if (i < uniqueRecipients.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return { sent, failed, results };
}

// ---------------------------------------------------------------------------
// Message Status
// ---------------------------------------------------------------------------

/**
 * Check the delivery status of a previously sent message.
 *
 * @param smsClient   Client wrapper returned by `createSmsClient`
 * @param messageSid  Twilio message SID (starts with "SM")
 * @returns           Current message status
 * @throws            If the message SID is invalid or the API call fails
 *
 * @example
 * ```ts
 * const status = await getMessageStatus(client, 'SM1234567890abcdef');
 * if (status === 'delivered') {
 *   console.log('Message was delivered successfully');
 * }
 * ```
 */
export async function getMessageStatus(
  smsClient: { client: Twilio; config: TwilioConfig },
  messageSid: string,
): Promise<MessageStatus> {
  if (!messageSid || !messageSid.startsWith('SM')) {
    throw new Error(
      '[Twilio] Invalid messageSid — must start with "SM". ' +
      `Received: "${messageSid}"`
    );
  }

  try {
    const message = await smsClient.client.messages(messageSid).fetch();
    return message.status as MessageStatus;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`[Twilio] Failed to fetch status for message ${messageSid}: ${errMsg}`);
  }
}

// ---------------------------------------------------------------------------
// List Messages
// ---------------------------------------------------------------------------

/**
 * List sent and received messages with optional filters.
 *
 * @param smsClient  Client wrapper returned by `createSmsClient`
 * @param options    Filters for to, from, date range, and result limit
 * @returns          Array of SMS message records
 *
 * @example
 * ```ts
 * // List last 10 messages sent to a specific number
 * const messages = await listMessages(client, {
 *   to: '+14155551234',
 *   limit: 10,
 * });
 *
 * // List messages sent today
 * const today = new Date();
 * today.setHours(0, 0, 0, 0);
 * const todayMessages = await listMessages(client, {
 *   dateSentAfter: today,
 *   limit: 50,
 * });
 * ```
 */
export async function listMessages(
  smsClient: { client: Twilio; config: TwilioConfig },
  options?: ListMessagesOptions,
): Promise<SmsMessage[]> {
  try {
    const filters: Record<string, unknown> = {};

    if (options?.to) {
      filters.to = options.to;
    }

    if (options?.from) {
      filters.from = options.from;
    }

    if (options?.dateSentAfter) {
      filters.dateSentAfter = options.dateSentAfter instanceof Date
        ? options.dateSentAfter
        : new Date(options.dateSentAfter);
    }

    if (options?.dateSentBefore) {
      filters.dateSentBefore = options.dateSentBefore instanceof Date
        ? options.dateSentBefore
        : new Date(options.dateSentBefore);
    }

    const limit = options?.limit ?? 20;

    const messages = await smsClient.client.messages.list({
      ...filters,
      limit,
    });

    return messages.map(mapTwilioMessage);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`[Twilio] Failed to list messages: ${errMsg}`);
  }
}

// ---------------------------------------------------------------------------
// Phone Number Lookup
// ---------------------------------------------------------------------------

/**
 * Validate a phone number and retrieve carrier information using the
 * Twilio Lookup API.
 *
 * Requires the Lookup API to be enabled on your Twilio account.
 * Carrier lookups incur additional per-lookup charges.
 *
 * @param smsClient    Client wrapper returned by `createSmsClient`
 * @param phoneNumber  Phone number to look up (any format; Twilio normalizes it)
 * @returns            Phone number details including carrier and line type
 * @throws             If the phone number is invalid or the API call fails
 *
 * @example
 * ```ts
 * const info = await lookupPhoneNumber(client, '+14155551234');
 * console.log(info.type);       // 'mobile'
 * console.log(info.carrier);    // 'T-Mobile'
 * console.log(info.countryCode); // 'US'
 * ```
 */
export async function lookupPhoneNumber(
  smsClient: { client: Twilio; config: TwilioConfig },
  phoneNumber: string,
): Promise<PhoneLookupResult> {
  if (!phoneNumber) {
    throw new Error('[Twilio] Phone number is required for lookup.');
  }

  try {
    const lookup = await smsClient.client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ fields: 'line_type_intelligence' });

    const lineType = lookup.lineTypeIntelligence as Record<string, string> | null;

    return {
      phoneNumber: lookup.phoneNumber ?? phoneNumber,
      countryCode: lookup.countryCode ?? 'unknown',
      carrier: lineType?.carrier_name ?? null,
      type: mapLineType(lineType?.type),
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`[Twilio] Failed to look up phone number "${phoneNumber}": ${errMsg}`);
  }
}

// ---------------------------------------------------------------------------
// Phone Number Formatting
// ---------------------------------------------------------------------------

/**
 * Format a phone number to E.164 international format.
 *
 * This is a local formatting utility that does NOT call the Twilio API.
 * For authoritative validation, use `lookupPhoneNumber` instead.
 *
 * Rules applied:
 *   - Strips all non-digit characters (except leading "+")
 *   - If no country code prefix and `countryCode` is "US" or "1", prepends "+1"
 *   - If already has "+", returns as-is after stripping non-digits
 *   - Defaults to US (+1) if no country code specified
 *
 * @param phone        Phone number in any format
 * @param countryCode  ISO country code or calling code (default: "US")
 * @returns            Phone number in E.164 format (e.g. "+14155551234")
 *
 * @example
 * ```ts
 * formatPhoneNumber('(415) 555-1234');        // '+14155551234'
 * formatPhoneNumber('0151 12345678', 'DE');   // '+4915112345678'
 * formatPhoneNumber('+44 20 7946 0958');      // '+442079460958'
 * ```
 */
export function formatPhoneNumber(phone: string, countryCode: string = 'US'): string {
  if (!phone) {
    throw new Error('[Twilio] Phone number is required for formatting.');
  }

  // If already starts with "+", strip non-digits (preserve the "+")
  if (phone.startsWith('+')) {
    return '+' + phone.slice(1).replace(/\D/g, '');
  }

  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    throw new Error(`[Twilio] Phone number "${phone}" contains no digits.`);
  }

  // Map of common country codes to calling codes
  const callingCodes: Record<string, string> = {
    US: '1',
    CA: '1',
    GB: '44',
    UK: '44',
    DE: '49',
    FR: '33',
    ES: '34',
    IT: '39',
    AU: '61',
    JP: '81',
    CN: '86',
    IN: '91',
    BR: '55',
    MX: '52',
    NL: '31',
    BE: '32',
    AT: '43',
    CH: '41',
    SE: '46',
    NO: '47',
    DK: '45',
    FI: '358',
    PL: '48',
    CZ: '420',
    PT: '351',
    IE: '353',
    NZ: '64',
    SG: '65',
    KR: '82',
    ZA: '27',
    AE: '971',
    IL: '972',
  };

  const upper = countryCode.toUpperCase();
  const callingCode = callingCodes[upper] ?? upper;

  // If the number already starts with the calling code, just prepend "+"
  if (digits.startsWith(callingCode)) {
    return `+${digits}`;
  }

  // Strip leading zero (common in many countries for local numbers)
  const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits;

  return `+${callingCode}${withoutLeadingZero}`;
}

// ---------------------------------------------------------------------------
// Internal Utilities
// ---------------------------------------------------------------------------

/**
 * Map a Twilio message resource to our typed SmsMessage.
 */
function mapTwilioMessage(msg: Record<string, unknown>): SmsMessage {
  return {
    sid: String(msg.sid ?? ''),
    to: String(msg.to ?? ''),
    from: String(msg.from ?? ''),
    body: String(msg.body ?? ''),
    status: String(msg.status ?? 'queued') as MessageStatus,
    dateSent: msg.dateSent
      ? (msg.dateSent instanceof Date ? msg.dateSent.toISOString() : String(msg.dateSent))
      : null,
    price: msg.price ? String(msg.price) : null,
    direction: String(msg.direction ?? 'outbound-api') as SmsMessage['direction'],
  };
}

/**
 * Map Twilio line type string to our union type.
 */
function mapLineType(type?: string): PhoneLookupResult['type'] {
  if (!type) return 'unknown';
  const lower = type.toLowerCase();
  if (lower === 'mobile' || lower === 'cellular') return 'mobile';
  if (lower === 'landline' || lower === 'fixedline' || lower === 'fixed_line') return 'landline';
  if (lower === 'voip' || lower === 'non_fixed_voip' || lower === 'nonFixedVoip') return 'voip';
  return 'unknown';
}

/**
 * Simple sleep utility for rate limiting.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
