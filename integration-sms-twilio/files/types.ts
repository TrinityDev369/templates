/**
 * Twilio SMS Integration — Type Definitions
 *
 * Core interfaces for Twilio SMS sending, receiving, delivery tracking,
 * phone number validation, and webhook handling.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Twilio account configuration.
 *
 * Obtain credentials from https://console.twilio.com
 *
 * @example
 * ```ts
 * const config: TwilioConfig = {
 *   accountSid: process.env.TWILIO_ACCOUNT_SID!,
 *   authToken: process.env.TWILIO_AUTH_TOKEN!,
 *   defaultFrom: process.env.TWILIO_PHONE_NUMBER!,
 * };
 * ```
 */
export interface TwilioConfig {
  /** Twilio Account SID (starts with "AC") */
  accountSid: string;
  /** Twilio Auth Token for API authentication */
  authToken: string;
  /** Default "From" phone number in E.164 format (e.g. "+14155551234") */
  defaultFrom?: string;
}

// ---------------------------------------------------------------------------
// SMS Message
// ---------------------------------------------------------------------------

/**
 * Represents a single SMS message as returned by the Twilio API.
 */
export interface SmsMessage {
  /** Unique Twilio message identifier (starts with "SM") */
  sid: string;
  /** Recipient phone number in E.164 format */
  to: string;
  /** Sender phone number in E.164 format */
  from: string;
  /** Message body text */
  body: string;
  /** Current delivery status */
  status: MessageStatus;
  /** ISO-8601 timestamp when the message was sent */
  dateSent: string | null;
  /** Cost of the message in USD (null if not yet billed) */
  price: string | null;
  /** Message direction */
  direction: 'inbound' | 'outbound-api' | 'outbound-call' | 'outbound-reply';
}

// ---------------------------------------------------------------------------
// Send Options
// ---------------------------------------------------------------------------

/**
 * Options for sending a single SMS message.
 */
export interface SendSmsOptions {
  /** Recipient phone number (E.164 format recommended) */
  to: string;
  /** Message body (max 1600 characters; longer messages are split by Twilio) */
  body: string;
  /** Sender phone number — overrides TwilioConfig.defaultFrom if provided */
  from?: string;
  /** Webhook URL for delivery status callbacks */
  statusCallback?: string;
  /** URL of media to include (MMS). Only supported on MMS-enabled numbers. */
  mediaUrl?: string[];
}

// ---------------------------------------------------------------------------
// Bulk SMS
// ---------------------------------------------------------------------------

/**
 * Result of a bulk SMS send operation.
 */
export interface BulkSmsResult {
  /** Number of messages successfully queued */
  sent: number;
  /** Number of messages that failed to send */
  failed: number;
  /** Per-recipient results */
  results: BulkSmsRecipientResult[];
}

/**
 * Individual recipient result within a bulk SMS operation.
 */
export interface BulkSmsRecipientResult {
  /** Recipient phone number */
  to: string;
  /** Message SID if sent successfully, null if failed */
  sid: string | null;
  /** Error message if the send failed, null on success */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Message Status
// ---------------------------------------------------------------------------

/**
 * Twilio message delivery status values.
 *
 * Lifecycle: queued -> sending -> sent -> delivered
 * Error states: undelivered, failed
 */
export type MessageStatus =
  | 'accepted'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'undelivered'
  | 'failed'
  | 'receiving'
  | 'received'
  | 'read';

// ---------------------------------------------------------------------------
// Phone Lookup
// ---------------------------------------------------------------------------

/**
 * Result of a phone number lookup via Twilio Lookup API.
 */
export interface PhoneLookupResult {
  /** Phone number in E.164 format */
  phoneNumber: string;
  /** ISO 3166-1 alpha-2 country code (e.g. "US", "DE") */
  countryCode: string;
  /** Carrier name (null if lookup not available or not requested) */
  carrier: string | null;
  /** Phone number type */
  type: 'mobile' | 'landline' | 'voip' | 'unknown';
}

// ---------------------------------------------------------------------------
// Webhook Payload
// ---------------------------------------------------------------------------

/**
 * Incoming SMS webhook payload sent by Twilio to your status/reply webhook.
 *
 * Twilio sends these fields as form-encoded POST parameters.
 * See: https://www.twilio.com/docs/messaging/guides/webhook-request
 */
export interface WebhookPayload {
  /** Unique identifier of the message */
  MessageSid: string;
  /** Twilio Account SID */
  AccountSid: string;
  /** The Messaging Service SID (if using a Messaging Service) */
  MessagingServiceSid?: string;
  /** Sender phone number */
  From: string;
  /** Recipient phone number (your Twilio number) */
  To: string;
  /** Message body text */
  Body: string;
  /** Number of media attachments */
  NumMedia: string;
  /** Number of message segments */
  NumSegments: string;
  /** Message status */
  SmsStatus: string;
  /** API version */
  ApiVersion: string;
  /** City of the sender (if available) */
  FromCity?: string;
  /** State of the sender (if available) */
  FromState?: string;
  /** Country of the sender (if available) */
  FromCountry?: string;
  /** Zip code of the sender (if available) */
  FromZip?: string;
  /** City of the recipient (if available) */
  ToCity?: string;
  /** State of the recipient (if available) */
  ToState?: string;
  /** Country of the recipient (if available) */
  ToCountry?: string;
  /** Zip code of the recipient (if available) */
  ToZip?: string;
  /** Additional properties for media URLs (MediaUrl0, MediaUrl1, etc.) */
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Message List Filters
// ---------------------------------------------------------------------------

/**
 * Filters for listing messages from the Twilio API.
 */
export interface ListMessagesOptions {
  /** Filter by recipient phone number */
  to?: string;
  /** Filter by sender phone number */
  from?: string;
  /** Filter by date sent (messages sent on or after this date, ISO-8601 or Date) */
  dateSentAfter?: Date | string;
  /** Filter by date sent (messages sent on or before this date, ISO-8601 or Date) */
  dateSentBefore?: Date | string;
  /** Maximum number of messages to return (default 20, max 1000) */
  limit?: number;
}
