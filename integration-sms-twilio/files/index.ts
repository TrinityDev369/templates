/**
 * Twilio SMS Integration
 *
 * Send and receive SMS messages via Twilio with full TypeScript support.
 *
 * @example
 * ```ts
 * import {
 *   createSmsClient,
 *   sendSms,
 *   sendBulkSms,
 *   getMessageStatus,
 *   formatPhoneNumber,
 *   validateTwilioSignature,
 *   parseIncomingSms,
 *   createTwimlResponse,
 * } from '@/integrations/sms-twilio';
 *
 * // 1. Create a client
 * const client = createSmsClient({
 *   accountSid: process.env.TWILIO_ACCOUNT_SID!,
 *   authToken: process.env.TWILIO_AUTH_TOKEN!,
 *   defaultFrom: process.env.TWILIO_PHONE_NUMBER!,
 * });
 *
 * // 2. Send an SMS
 * const sid = await sendSms(client, '+14155551234', 'Hello from Twilio!');
 *
 * // 3. Check delivery status
 * const status = await getMessageStatus(client, sid);
 * ```
 */

// Types
export type {
  TwilioConfig,
  SmsMessage,
  SendSmsOptions,
  BulkSmsResult,
  BulkSmsRecipientResult,
  MessageStatus,
  PhoneLookupResult,
  WebhookPayload,
  ListMessagesOptions,
} from './types';

// Client
export {
  createSmsClient,
  sendSms,
  sendSmsWithOptions,
  sendBulkSms,
  getMessageStatus,
  listMessages,
  lookupPhoneNumber,
  formatPhoneNumber,
} from './client';

// Webhook
export {
  validateTwilioSignature,
  parseIncomingSms,
  parseMediaAttachments,
  createTwimlResponse,
} from './webhook-handler';
