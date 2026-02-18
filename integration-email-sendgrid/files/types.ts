/**
 * SendGrid Email Integration — Type Definitions
 *
 * Core interfaces for SendGrid v3 API email sending, dynamic templates,
 * batch operations, and error handling.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * SendGrid client configuration.
 *
 * Obtain your API key from https://app.sendgrid.com/settings/api_keys
 *
 * @example
 * ```ts
 * const config: SendGridConfig = {
 *   apiKey: process.env.SENDGRID_API_KEY!,
 *   defaultFrom: {
 *     email: process.env.SENDGRID_FROM_EMAIL!,
 *     name: process.env.SENDGRID_FROM_NAME,
 *   },
 *   sandbox: false,
 * };
 * ```
 */
export interface SendGridConfig {
  /** SendGrid API key (starts with "SG.") */
  apiKey: string;
  /** Default sender address used when no "from" is specified per-message */
  defaultFrom: EmailAddress;
  /** Enable sandbox mode — emails are validated but not delivered (default: false) */
  sandbox?: boolean;
}

// ---------------------------------------------------------------------------
// Email Address
// ---------------------------------------------------------------------------

/**
 * An email address with an optional display name.
 *
 * @example
 * ```ts
 * const from: EmailAddress = { email: 'hello@example.com', name: 'My App' };
 * ```
 */
export interface EmailAddress {
  /** Email address (RFC 5322 compliant) */
  email: string;
  /** Optional display name shown in the recipient's email client */
  name?: string;
}

// ---------------------------------------------------------------------------
// Email Message
// ---------------------------------------------------------------------------

/**
 * Represents a single email message to be sent via SendGrid.
 *
 * At minimum, provide either `text` or `html` content (or both).
 * For dynamic templates, use `templateId` and `dynamicTemplateData` instead.
 */
export interface EmailMessage {
  /** Recipient email address(es) — string or EmailAddress for single, array for multiple */
  to: string | EmailAddress | Array<string | EmailAddress>;
  /** Sender address — overrides SendGridConfig.defaultFrom if provided */
  from?: string | EmailAddress;
  /** Email subject line (ignored when using a dynamic template with its own subject) */
  subject?: string;
  /** Plain-text body content */
  text?: string;
  /** HTML body content */
  html?: string;
  /** SendGrid dynamic template ID (starts with "d-") */
  templateId?: string;
  /** Key-value data merged into the dynamic template */
  dynamicTemplateData?: Record<string, unknown>;
  /** Optional reply-to address */
  replyTo?: string | EmailAddress;
  /** File attachments */
  attachments?: EmailAttachment[];
  /** Custom email headers */
  headers?: Record<string, string>;
  /** Categories for SendGrid analytics (max 10) */
  categories?: string[];
}

// ---------------------------------------------------------------------------
// Template Message
// ---------------------------------------------------------------------------

/**
 * An email that uses a SendGrid dynamic template.
 *
 * Extends EmailMessage with required templateId and dynamicTemplateData.
 * Subject and body content come from the template itself.
 */
export interface TemplateMessage extends EmailMessage {
  /** SendGrid dynamic template ID (required, starts with "d-") */
  templateId: string;
  /** Key-value data merged into the dynamic template (required) */
  dynamicTemplateData: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Attachment
// ---------------------------------------------------------------------------

/**
 * A file attachment for an email message.
 *
 * The content must be base64-encoded.
 */
export interface EmailAttachment {
  /** Base64-encoded file content */
  content: string;
  /** Filename shown to the recipient (e.g. "invoice.pdf") */
  filename: string;
  /** MIME type (e.g. "application/pdf", "image/png") */
  type?: string;
  /** Content disposition: "attachment" (default) or "inline" */
  disposition?: 'attachment' | 'inline';
  /** Content ID for inline attachments (used in HTML via cid:) */
  contentId?: string;
}

// ---------------------------------------------------------------------------
// Send Response
// ---------------------------------------------------------------------------

/**
 * Response from a successful SendGrid send operation.
 */
export interface SendResponse {
  /** HTTP status code from the SendGrid API (202 = accepted) */
  statusCode: number;
  /** Message ID assigned by SendGrid (from x-message-id header) */
  messageId: string;
  /** Raw response headers from SendGrid */
  headers: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Bulk Email
// ---------------------------------------------------------------------------

/**
 * Request for sending emails to multiple recipients in a single API call.
 *
 * Uses SendGrid personalizations to send individualized emails efficiently.
 * All messages share the same sender, subject template, and content —
 * but each personalization can override subject and include unique template data.
 */
export interface BulkEmailRequest {
  /** Array of individual email messages to send */
  messages: EmailMessage[];
}

/**
 * Result of a bulk email operation.
 */
export interface BulkEmailResult {
  /** Number of messages successfully accepted by SendGrid */
  sent: number;
  /** Number of messages that failed to send */
  failed: number;
  /** Per-message results */
  results: BulkEmailRecipientResult[];
}

/**
 * Individual result within a bulk email operation.
 */
export interface BulkEmailRecipientResult {
  /** Recipient email address */
  to: string;
  /** Message ID if accepted, null if failed */
  messageId: string | null;
  /** Error message if the send failed, null on success */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

/**
 * Structured error from the SendGrid API.
 *
 * SendGrid returns errors as an array of `{ message, field, help }` objects.
 */
export interface SendGridError {
  /** HTTP status code */
  status: number;
  /** Human-readable error message */
  message: string;
  /** Error code identifier */
  code: string;
  /** Individual error details from the SendGrid response body */
  errors: SendGridErrorDetail[];
}

/**
 * A single error detail from the SendGrid API response.
 */
export interface SendGridErrorDetail {
  /** Error description */
  message: string;
  /** The request field that caused the error (if applicable) */
  field?: string;
  /** Link to relevant SendGrid documentation */
  help?: string;
}

// ---------------------------------------------------------------------------
// Internal API Types
// ---------------------------------------------------------------------------

/**
 * SendGrid v3 Mail Send API request body shape.
 *
 * @internal Used by the client to construct API requests.
 * @see https://docs.sendgrid.com/api-reference/mail-send/mail-send
 */
export interface SendGridMailBody {
  personalizations: SendGridPersonalization[];
  from: { email: string; name?: string };
  reply_to?: { email: string; name?: string };
  subject?: string;
  content?: Array<{ type: string; value: string }>;
  template_id?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
    content_id?: string;
  }>;
  headers?: Record<string, string>;
  categories?: string[];
  mail_settings?: {
    sandbox_mode?: { enable: boolean };
  };
}

/**
 * A personalization block within the SendGrid Mail Send request.
 *
 * @internal
 */
export interface SendGridPersonalization {
  to: Array<{ email: string; name?: string }>;
  subject?: string;
  dynamic_template_data?: Record<string, unknown>;
  headers?: Record<string, string>;
}
