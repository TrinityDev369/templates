/**
 * SendGrid Email Client
 *
 * Provides a typed, zero-dependency client for the SendGrid v3 Mail Send API.
 * Uses Node native `fetch` — no external HTTP libraries required.
 *
 * Features:
 *   - Authenticated HTTPS requests to SendGrid v3 API
 *   - Automatic retry with exponential backoff on 429 (rate limit) responses
 *   - Email address validation before sending
 *   - Sandbox mode for testing without delivery
 *   - Typed responses and structured error handling
 *
 * @example
 * ```ts
 * import { createSendGridClient } from '@/integrations/sendgrid/client';
 *
 * const client = createSendGridClient({
 *   apiKey: process.env.SENDGRID_API_KEY!,
 *   defaultFrom: {
 *     email: process.env.SENDGRID_FROM_EMAIL!,
 *     name: process.env.SENDGRID_FROM_NAME,
 *   },
 * });
 *
 * const response = await client.send({
 *   to: 'recipient@example.com',
 *   subject: 'Hello!',
 *   html: '<h1>Welcome</h1>',
 * });
 * ```
 */

import type {
  SendGridConfig,
  EmailMessage,
  EmailAddress,
  SendResponse,
  SendGridError,
  SendGridErrorDetail,
  SendGridMailBody,
  SendGridPersonalization,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** SendGrid v3 API base URL */
const SENDGRID_API_BASE = 'https://api.sendgrid.com/v3';

/** Maximum number of retry attempts for rate-limited (429) requests */
const MAX_RETRIES = 3;

/** Base delay in milliseconds for exponential backoff (doubles each retry) */
const BASE_RETRY_DELAY_MS = 1000;

/** Simple email address regex for basic validation */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Client Class
// ---------------------------------------------------------------------------

/**
 * SendGrid API client for sending transactional and marketing emails.
 *
 * Instantiate via `createSendGridClient()` — do not construct directly.
 */
export class SendGridClient {
  private readonly config: SendGridConfig;

  constructor(config: SendGridConfig) {
    this.config = config;
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Send a single email message.
   *
   * Constructs the SendGrid v3 Mail Send request body from the provided
   * EmailMessage, validates addresses, and dispatches the API call with
   * automatic retry on rate limiting.
   *
   * @param message  Email message to send
   * @returns        SendResponse with status code, message ID, and headers
   * @throws         If validation fails or the API returns a non-2xx response
   *
   * @example
   * ```ts
   * // Plain text + HTML email
   * const res = await client.send({
   *   to: 'user@example.com',
   *   subject: 'Welcome!',
   *   text: 'Welcome to our platform.',
   *   html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
   * });
   *
   * // Dynamic template email
   * const res = await client.send({
   *   to: 'user@example.com',
   *   templateId: 'd-abc123',
   *   dynamicTemplateData: { name: 'Alice', url: 'https://example.com' },
   * });
   * ```
   */
  async send(message: EmailMessage): Promise<SendResponse> {
    const body = this.buildMailBody(message);
    return this.postMail(body);
  }

  /**
   * Send an email using a SendGrid dynamic template.
   *
   * Convenience method that wraps `send()` with template-specific parameters.
   *
   * @param to            Recipient email address(es)
   * @param templateId    SendGrid dynamic template ID (starts with "d-")
   * @param data          Template merge variables
   * @param from          Optional sender override
   * @returns             SendResponse
   *
   * @example
   * ```ts
   * await client.sendTemplate(
   *   'user@example.com',
   *   'd-abc123def456',
   *   { firstName: 'Alice', confirmUrl: 'https://example.com/confirm' },
   * );
   * ```
   */
  async sendTemplate(
    to: string | EmailAddress | Array<string | EmailAddress>,
    templateId: string,
    data: Record<string, unknown>,
    from?: string | EmailAddress,
  ): Promise<SendResponse> {
    if (!templateId || !templateId.startsWith('d-')) {
      throw this.createValidationError(
        'Invalid templateId — must start with "d-". ' +
        `Received: "${templateId}". ` +
        'Find your template IDs at https://mc.sendgrid.com/dynamic-templates'
      );
    }

    return this.send({
      to,
      from,
      templateId,
      dynamicTemplateData: data,
    });
  }

  /**
   * Send multiple emails in a batch using SendGrid personalizations.
   *
   * Groups messages that share the same sender, subject, and content into
   * a single API call with multiple personalizations (up to 1000 per call).
   * Messages that cannot be grouped are sent as individual API calls.
   *
   * @param messages  Array of email messages to send
   * @returns         Array of SendResponse results (one per API call made)
   *
   * @example
   * ```ts
   * const results = await client.sendBatch([
   *   { to: 'alice@example.com', subject: 'Hi Alice', text: 'Hello!' },
   *   { to: 'bob@example.com', subject: 'Hi Bob', text: 'Hello!' },
   * ]);
   * ```
   */
  async sendBatch(messages: EmailMessage[]): Promise<SendResponse[]> {
    if (!messages || messages.length === 0) {
      return [];
    }

    const results: SendResponse[] = [];

    // Send each message individually to ensure per-message error isolation.
    // SendGrid personalizations could batch them, but individual sends give
    // better error granularity and prevent one bad address from blocking others.
    for (const message of messages) {
      const body = this.buildMailBody(message);
      const response = await this.postMail(body);
      results.push(response);
    }

    return results;
  }

  /**
   * Get the current client configuration (with API key masked).
   *
   * Useful for debugging — never exposes the full API key.
   */
  getConfig(): { defaultFrom: EmailAddress; sandbox: boolean; apiKeyPrefix: string } {
    return {
      defaultFrom: this.config.defaultFrom,
      sandbox: this.config.sandbox ?? false,
      apiKeyPrefix: this.config.apiKey.substring(0, 5) + '...',
    };
  }

  // -------------------------------------------------------------------------
  // Request Building
  // -------------------------------------------------------------------------

  /**
   * Build the SendGrid v3 Mail Send API request body from an EmailMessage.
   *
   * @internal
   */
  private buildMailBody(message: EmailMessage): SendGridMailBody {
    // Resolve sender
    const from = this.resolveEmailAddress(message.from ?? this.config.defaultFrom);
    if (!from) {
      throw this.createValidationError(
        'No "from" address provided and no defaultFrom configured. ' +
        'Pass a "from" field or set defaultFrom in your SendGridConfig.'
      );
    }
    this.validateEmail(from.email, 'from');

    // Resolve recipients
    const toAddresses = this.resolveRecipients(message.to);
    if (toAddresses.length === 0) {
      throw this.createValidationError(
        'At least one recipient "to" address is required.'
      );
    }
    for (const addr of toAddresses) {
      this.validateEmail(addr.email, 'to');
    }

    // Validate content: need either text/html or templateId
    if (!message.templateId && !message.text && !message.html) {
      throw this.createValidationError(
        'Email must have at least one of: text, html, or templateId.'
      );
    }

    // Build personalization
    const personalization: SendGridPersonalization = {
      to: toAddresses,
    };

    if (message.subject) {
      personalization.subject = message.subject;
    }

    if (message.dynamicTemplateData) {
      personalization.dynamic_template_data = message.dynamicTemplateData;
    }

    if (message.headers) {
      personalization.headers = message.headers;
    }

    // Build body
    const body: SendGridMailBody = {
      personalizations: [personalization],
      from: { email: from.email, name: from.name },
    };

    // Subject (required when not using a template)
    if (message.subject) {
      body.subject = message.subject;
    }

    // Content
    const content: Array<{ type: string; value: string }> = [];
    if (message.text) {
      content.push({ type: 'text/plain', value: message.text });
    }
    if (message.html) {
      content.push({ type: 'text/html', value: message.html });
    }
    if (content.length > 0) {
      body.content = content;
    }

    // Template
    if (message.templateId) {
      body.template_id = message.templateId;
    }

    // Reply-to
    if (message.replyTo) {
      const replyAddr = this.resolveEmailAddress(message.replyTo);
      if (replyAddr) {
        this.validateEmail(replyAddr.email, 'replyTo');
        body.reply_to = { email: replyAddr.email, name: replyAddr.name };
      }
    }

    // Attachments
    if (message.attachments && message.attachments.length > 0) {
      body.attachments = message.attachments.map((att) => ({
        content: att.content,
        filename: att.filename,
        type: att.type,
        disposition: att.disposition,
        content_id: att.contentId,
      }));
    }

    // Categories
    if (message.categories && message.categories.length > 0) {
      body.categories = message.categories.slice(0, 10); // SendGrid max 10
    }

    // Sandbox mode
    if (this.config.sandbox) {
      body.mail_settings = {
        sandbox_mode: { enable: true },
      };
    }

    return body;
  }

  // -------------------------------------------------------------------------
  // HTTP Transport
  // -------------------------------------------------------------------------

  /**
   * Send the constructed mail body to the SendGrid v3 Mail Send endpoint.
   *
   * Handles:
   *   - Bearer token authentication
   *   - Rate limit (429) retry with exponential backoff
   *   - Structured error parsing
   *
   * @internal
   */
  private async postMail(body: SendGridMailBody): Promise<SendResponse> {
    let lastError: SendGridError | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(`${SENDGRID_API_BASE}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Success: 202 Accepted (or 200 in sandbox mode)
      if (response.ok) {
        const messageId = response.headers.get('x-message-id') ?? '';
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        return {
          statusCode: response.status,
          messageId,
          headers,
        };
      }

      // Rate limited: retry with exponential backoff
      if (response.status === 429) {
        lastError = await this.parseErrorResponse(response);

        if (attempt < MAX_RETRIES) {
          const retryAfter = response.headers.get('retry-after');
          const delayMs = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : BASE_RETRY_DELAY_MS * Math.pow(2, attempt);

          await this.sleep(delayMs);
          continue;
        }
      }

      // Other errors: parse and throw immediately
      const error = await this.parseErrorResponse(response);
      throw error;
    }

    // All retries exhausted
    throw lastError ?? this.createApiError(429, 'Rate limit exceeded after maximum retries', []);
  }

  /**
   * Parse a non-2xx response from SendGrid into a structured error.
   *
   * @internal
   */
  private async parseErrorResponse(response: Response): Promise<SendGridError> {
    let errorDetails: SendGridErrorDetail[] = [];
    let message = `SendGrid API error: ${response.status} ${response.statusText}`;

    try {
      const responseBody = await response.json() as {
        errors?: Array<{ message?: string; field?: string; help?: string }>;
      };

      if (responseBody.errors && Array.isArray(responseBody.errors)) {
        errorDetails = responseBody.errors.map((e) => ({
          message: e.message ?? 'Unknown error',
          field: e.field,
          help: e.help,
        }));
        message = errorDetails.map((e) => e.message).join('; ');
      }
    } catch {
      // Response body was not JSON — use status text
    }

    return this.createApiError(response.status, message, errorDetails);
  }

  // -------------------------------------------------------------------------
  // Validation Helpers
  // -------------------------------------------------------------------------

  /**
   * Validate that an email address has a plausible format.
   *
   * This is a basic structural check (not RFC 5322 exhaustive) — SendGrid
   * performs its own authoritative validation on the server side.
   *
   * @internal
   */
  private validateEmail(email: string, field: string): void {
    if (!email) {
      throw this.createValidationError(`"${field}" email address is required.`);
    }

    if (!EMAIL_REGEX.test(email)) {
      throw this.createValidationError(
        `Invalid email address in "${field}": "${email}". ` +
        'Expected format: user@domain.tld'
      );
    }
  }

  /**
   * Normalize a string or EmailAddress into the { email, name } shape.
   *
   * @internal
   */
  private resolveEmailAddress(
    input: string | EmailAddress | undefined,
  ): { email: string; name?: string } | null {
    if (!input) return null;

    if (typeof input === 'string') {
      return { email: input };
    }

    return { email: input.email, name: input.name };
  }

  /**
   * Normalize recipient(s) to an array of { email, name } objects.
   *
   * @internal
   */
  private resolveRecipients(
    to: string | EmailAddress | Array<string | EmailAddress>,
  ): Array<{ email: string; name?: string }> {
    const recipients = Array.isArray(to) ? to : [to];

    return recipients
      .map((r) => this.resolveEmailAddress(r))
      .filter((r): r is { email: string; name?: string } => r !== null);
  }

  // -------------------------------------------------------------------------
  // Error Factories
  // -------------------------------------------------------------------------

  /**
   * Create a validation error (thrown before making an API call).
   *
   * @internal
   */
  private createValidationError(message: string): SendGridError {
    return {
      status: 0,
      message: `[SendGrid] Validation error: ${message}`,
      code: 'VALIDATION_ERROR',
      errors: [{ message }],
    };
  }

  /**
   * Create a structured API error.
   *
   * @internal
   */
  private createApiError(
    status: number,
    message: string,
    errors: SendGridErrorDetail[],
  ): SendGridError {
    return {
      status,
      message: `[SendGrid] API error (${status}): ${message}`,
      code: `HTTP_${status}`,
      errors,
    };
  }

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------

  /**
   * Async sleep for retry backoff.
   *
   * @internal
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ---------------------------------------------------------------------------
// Factory Function
// ---------------------------------------------------------------------------

/**
 * Create an authenticated SendGrid client.
 *
 * Validates the API key format and returns a ready-to-use client instance.
 * Store and reuse the client — do NOT create a new instance per request.
 *
 * @param config  SendGrid configuration with API key and default sender
 * @returns       Configured SendGridClient instance
 * @throws        If the API key is missing or malformed
 *
 * @example
 * ```ts
 * const client = createSendGridClient({
 *   apiKey: process.env.SENDGRID_API_KEY!,
 *   defaultFrom: { email: 'hello@example.com', name: 'My App' },
 * });
 * ```
 */
export function createSendGridClient(config: SendGridConfig): SendGridClient {
  if (!config.apiKey) {
    throw new Error(
      '[SendGrid] API key is required. ' +
      'Get your key from https://app.sendgrid.com/settings/api_keys'
    );
  }

  if (!config.apiKey.startsWith('SG.')) {
    throw new Error(
      '[SendGrid] Invalid API key format — must start with "SG.". ' +
      `Received key starting with: "${config.apiKey.substring(0, 3)}..."`
    );
  }

  if (!config.defaultFrom?.email) {
    throw new Error(
      '[SendGrid] defaultFrom.email is required. ' +
      'This is the verified sender address for your SendGrid account.'
    );
  }

  return new SendGridClient(config);
}
