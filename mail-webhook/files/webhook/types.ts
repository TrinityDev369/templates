/**
 * Trinity Mail — webhook receiver contract.
 *
 * Self-contained: no monorepo package imports. Copied into the tenant repo by
 * `npx @trinity369/use mail-webhook`. Pairs with mail-client — the project,
 * category, and recipient facts below must stay identical across the family.
 *
 * Doctrine notes (trinity-mail-relay-architecture §3):
 *  - Subjects and bodies are CONTENT. This layer records delivery *facts*
 *    (type, recipient, timing, reason) — never plaintext bodies/subjects.
 *  - A retained rendered body (e.g. "view in browser") is stored only as
 *    crypto-shreddable AES-256-GCM ciphertext (per-message key). DSGVO erasure
 *    = destroy the key, not a DELETE.
 *  - Tracking (opened/clicked) is OFF by default — we record those events if the
 *    relay sends them, but never generate pixels/redirects here.
 */

/**
 * The delivery-lifecycle event type, as emitted by the relay.
 *
 *   queued → sent → delivered        (the happy linear path)
 *   deferred                          (transient — a retry is in flight)
 *   bounced | complained              (terminal failure)
 *   opened | clicked                  (engagement — OFF by default, recorded if sent)
 */
export type MailEventType =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'deferred'
  | 'bounced'
  | 'complained'
  | 'opened'
  | 'clicked';

/** The persisted status of an email_logs row. Mirrors the linear lifecycle plus terminals. */
export type MailLogStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'deferred'
  | 'bounced'
  | 'complained';

/**
 * `POST /api/mail/events` body — the relay's per-message delivery fact.
 * The raw body is HMAC-signed; see signature.ts.
 */
export interface MailEventPayload {
  type: MailEventType;
  /**
   * The message's stable idempotency key — mail-client's X-Trinity-Idempotency-Key,
   * one per message, shared with the outbox and email_logs. Event-level dedup is the
   * composite (idempotencyKey, type), so a redelivered same-type event is a no-op
   * while the many distinct events of one message all persist.
   */
  idempotencyKey: string;
  /**
   * The relay/MTA Message-ID — a per-message FACT stored on email_logs for correlation
   * with relay logs (NOT the log key). Optional: a 'queued' event may predate it.
   */
  providerMessageId?: string;
  /** Tenant identity at the relay (X-Trinity-Project). */
  project: string;
  /** Message classification (X-Trinity-Category) — a fact, not content. */
  category?: string;
  recipient: string;
  /** ISO-8601 or epoch-ms timestamp of when the event occurred at the relay. */
  timestamp: string | number;
  /** Human-readable cause (bounce diagnostic, defer reason). A fact, not content. */
  reason?: string;
}

/** `POST /api/mail/bounce` body — bounce/complaint, the suppression trigger. */
export interface MailBouncePayload {
  type: 'bounce' | 'complaint';
  recipient: string;
  bounceType: 'hard' | 'soft' | 'complaint';
  idempotencyKey?: string;
  project: string;
  timestamp: string | number;
  /** SMTP/DSN diagnostic. A fact, not content. */
  diagnostic?: string;
}

/** Reason a recipient landed on the suppression list. */
export type SuppressionReason = 'hard_bounce' | 'complaint' | 'manual';

/** Where the suppression entry originated. */
export type SuppressionSource = 'events_webhook' | 'bounce_webhook' | 'manual';

/** A row of the local suppression mirror. */
export interface SuppressionEntry {
  recipient: string;
  reason: SuppressionReason;
  source: SuppressionSource;
  createdAt: number; // epoch ms
}

/** An append-only delivery event. */
export interface EmailEvent {
  id: string;
  idempotencyKey: string;
  type: MailEventType;
  recipient: string;
  reason?: string;
  occurredAt: number; // epoch ms
  raw: unknown;
}

/** Encrypted, crypto-shreddable rendered body (per-message AES-256-GCM). */
export interface EncryptedBody {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag: Uint8Array;
}

/** The current view of an email_logs row (status reflects the lifecycle high-water mark). */
export interface EmailLog {
  idempotencyKey: string;
  project: string;
  category?: string;
  recipient: string;
  status: MailLogStatus;
  providerMessageId?: string;
  createdAt: number;
  updatedAt: number;
}

/** Outcome of handling a webhook — a small, JSON-safe ack for the route adapter. */
export interface WebhookResult {
  ok: boolean;
  /** True when the event/bounce was already seen (idempotent no-op). */
  deduped?: boolean;
  /** Set when ok is false: 'bad_signature' | 'bad_payload'. */
  error?: 'bad_signature' | 'bad_payload';
  /** The status email_logs settled on (events only). */
  status?: MailLogStatus;
  /** True when this event/bounce suppressed the recipient. */
  suppressed?: boolean;
}
