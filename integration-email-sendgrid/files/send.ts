/**
 * SendGrid Email — High-Level Send Functions
 *
 * Convenience functions for common email operations. Reads configuration
 * from environment variables — no manual config passing required.
 *
 * Environment variables:
 *   - SENDGRID_API_KEY      — SendGrid API key (starts with "SG.")
 *   - SENDGRID_FROM_EMAIL   — Default sender email address
 *   - SENDGRID_FROM_NAME    — Default sender display name (optional)
 *
 * Server-side only — uses `process.env` for configuration.
 *
 * @example
 * ```ts
 * import { sendEmail, sendTemplateEmail, sendBulkEmails } from '@/integrations/sendgrid/send';
 *
 * // Simple email
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<h1>Welcome aboard</h1>',
 * });
 *
 * // Dynamic template
 * await sendTemplateEmail('user@example.com', 'd-abc123', {
 *   firstName: 'Alice',
 *   confirmUrl: 'https://example.com/confirm',
 * });
 *
 * // Bulk send
 * await sendBulkEmails([
 *   { to: 'alice@example.com', subject: 'Hi Alice', text: 'Hello!' },
 *   { to: 'bob@example.com', subject: 'Hi Bob', text: 'Hello!' },
 * ]);
 * ```
 */

import type {
  EmailMessage,
  EmailAddress,
  SendResponse,
  SendGridConfig,
  BulkEmailResult,
} from './types';
import { createSendGridClient, SendGridClient } from './client';

// ---------------------------------------------------------------------------
// Singleton Client
// ---------------------------------------------------------------------------

/**
 * Lazily-initialized singleton client.
 *
 * Created on first use from environment variables. Reused across all
 * subsequent calls to avoid repeated initialization overhead.
 */
let _client: SendGridClient | null = null;

/**
 * Get or create the singleton SendGrid client from environment variables.
 *
 * @returns  Configured SendGridClient instance
 * @throws   If required environment variables are missing
 *
 * @example
 * ```ts
 * const client = getClient();
 * await client.send({ to: 'user@example.com', subject: 'Hi', text: 'Hello' });
 * ```
 */
function getClient(): SendGridClient {
  if (_client) return _client;

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error(
      '[SendGrid] Missing SENDGRID_API_KEY environment variable. ' +
      'Get your key from https://app.sendgrid.com/settings/api_keys'
    );
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error(
      '[SendGrid] Missing SENDGRID_FROM_EMAIL environment variable. ' +
      'Set this to your verified sender address.'
    );
  }

  const fromName = process.env.SENDGRID_FROM_NAME;

  const config: SendGridConfig = {
    apiKey,
    defaultFrom: {
      email: fromEmail,
      name: fromName,
    },
  };

  _client = createSendGridClient(config);
  return _client;
}

/**
 * Reset the singleton client.
 *
 * Useful for testing or when environment variables change at runtime.
 * The next call to any send function will re-create the client from
 * the current environment.
 */
export function resetClient(): void {
  _client = null;
}

// ---------------------------------------------------------------------------
// sendEmail
// ---------------------------------------------------------------------------

/**
 * Send a single email message.
 *
 * Reads configuration from environment variables (SENDGRID_API_KEY,
 * SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME).
 *
 * @param message  Email message — must include `to` and at least one of
 *                 `text`, `html`, or `templateId`
 * @returns        SendResponse with statusCode, messageId, and headers
 * @throws         On validation failure or API error
 *
 * @example
 * ```ts
 * // Plain text email
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Order Confirmation',
 *   text: 'Your order #1234 has been confirmed.',
 * });
 *
 * // HTML email with attachment
 * await sendEmail({
 *   to: [{ email: 'user@example.com', name: 'Alice' }],
 *   subject: 'Your Invoice',
 *   html: '<h1>Invoice #5678</h1><p>Please find your invoice attached.</p>',
 *   attachments: [{
 *     content: base64EncodedPdf,
 *     filename: 'invoice-5678.pdf',
 *     type: 'application/pdf',
 *     disposition: 'attachment',
 *   }],
 * });
 * ```
 */
export async function sendEmail(message: EmailMessage): Promise<SendResponse> {
  const client = getClient();
  return client.send(message);
}

// ---------------------------------------------------------------------------
// sendTemplateEmail
// ---------------------------------------------------------------------------

/**
 * Send an email using a SendGrid dynamic template.
 *
 * The subject line and body content are defined within the template itself.
 * Only the recipient and merge data need to be provided.
 *
 * @param to          Recipient email address(es) — string, EmailAddress, or array
 * @param templateId  SendGrid dynamic template ID (starts with "d-")
 * @param data        Key-value merge variables for the template
 * @param from        Optional sender override (defaults to SENDGRID_FROM_EMAIL)
 * @returns           SendResponse
 * @throws            On validation failure or API error
 *
 * @example
 * ```ts
 * // Welcome email
 * await sendTemplateEmail(
 *   'newuser@example.com',
 *   'd-abc123def456',
 *   { firstName: 'Alice', loginUrl: 'https://app.example.com/login' },
 * );
 *
 * // Password reset to multiple addresses
 * await sendTemplateEmail(
 *   ['user@example.com', 'user@backup.com'],
 *   'd-reset789',
 *   { resetUrl: 'https://app.example.com/reset?token=xyz', expiresIn: '1 hour' },
 * );
 * ```
 */
export async function sendTemplateEmail(
  to: string | EmailAddress | Array<string | EmailAddress>,
  templateId: string,
  data: Record<string, unknown>,
  from?: string | EmailAddress,
): Promise<SendResponse> {
  const client = getClient();
  return client.sendTemplate(to, templateId, data, from);
}

// ---------------------------------------------------------------------------
// sendBulkEmails
// ---------------------------------------------------------------------------

/**
 * Send multiple emails in a batch.
 *
 * Each message is sent as an individual API call to ensure per-message
 * error isolation. A failure for one recipient does not block others.
 *
 * For very high volumes (10,000+ messages), consider using SendGrid's
 * Marketing Campaigns API or contact lists instead.
 *
 * @param messages  Array of email messages to send
 * @returns         BulkEmailResult with sent/failed counts and per-message details
 *
 * @example
 * ```ts
 * const result = await sendBulkEmails([
 *   {
 *     to: 'alice@example.com',
 *     subject: 'Your weekly digest',
 *     html: '<h1>This week...</h1>',
 *   },
 *   {
 *     to: 'bob@example.com',
 *     templateId: 'd-digest123',
 *     dynamicTemplateData: { articles: [...] },
 *   },
 * ]);
 *
 * console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
 * for (const r of result.results) {
 *   if (r.error) console.error(`Failed for ${r.to}: ${r.error}`);
 * }
 * ```
 */
export async function sendBulkEmails(
  messages: EmailMessage[],
): Promise<BulkEmailResult> {
  if (!messages || messages.length === 0) {
    return { sent: 0, failed: 0, results: [] };
  }

  const client = getClient();
  const results: BulkEmailResult = {
    sent: 0,
    failed: 0,
    results: [],
  };

  for (const message of messages) {
    // Extract primary recipient for result tracking
    const primaryTo = extractPrimaryRecipient(message.to);

    try {
      const response = await client.send(message);
      results.sent++;
      results.results.push({
        to: primaryTo,
        messageId: response.messageId,
        error: null,
      });
    } catch (error) {
      results.failed++;
      const errMsg = error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : String(error);
      results.results.push({
        to: primaryTo,
        messageId: null,
        error: errMsg,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Internal Utilities
// ---------------------------------------------------------------------------

/**
 * Extract the primary recipient email address from a to field.
 *
 * Used for result tracking in bulk operations.
 *
 * @internal
 */
function extractPrimaryRecipient(
  to: string | EmailAddress | Array<string | EmailAddress>,
): string {
  if (typeof to === 'string') return to;
  if (Array.isArray(to)) {
    const first = to[0];
    if (!first) return 'unknown';
    return typeof first === 'string' ? first : first.email;
  }
  return to.email;
}
