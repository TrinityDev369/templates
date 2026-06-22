/**
 * Trinity Mail — shared transport contract.
 *
 * Self-contained: no monorepo package imports. Copied into the tenant repo by
 * `npx @trinity369/use mail-client`. This file is the contract the sibling
 * mail-* templates (mail-webhook, mail-dns, mail-tresor) key off — the header
 * names, categories, and streams below must stay identical across them.
 *
 * Doctrine notes (trinity-mail-relay-architecture):
 *  - Subjects and bodies are CONTENT. The relay's central log only ever sees the
 *    *facts* below (project, category, entity ref, timing) — never subject/body.
 *  - The outbox is operational, not an archive: rows are deleted on success and
 *    moved to dead-letter on exhaustion. It is not a retention store.
 */

/** Reputation stream. Transactional and marketing NEVER share an IP/pool (doctrine L-8). */
export type MailStream = 'transactional' | 'marketing';

/** Per-message classification, surfaced to the relay as `X-Trinity-Category` (a fact, not content). */
export type MailCategory =
  | 'auth' // verification codes, password reset, magic links
  | 'receipt' // invoices, payment receipts
  | 'reminder' // scheduled reminders
  | 'digest' // periodic digests
  | 'notification' // generic system notifications
  | 'marketing'; // newsletters / bulk — requires consent + List-Unsubscribe (RFC 8058)

/** Categories that ride the marketing reputation stream and require consent + unsubscribe. */
export const MARKETING_CATEGORIES: ReadonlySet<MailCategory> = new Set<MailCategory>(['marketing']);

export function streamForCategory(category: MailCategory): MailStream {
  return MARKETING_CATEGORIES.has(category) ? 'marketing' : 'transactional';
}

export interface Address {
  email: string;
  name?: string;
}

export interface MailMessage {
  to: string | Address | Array<string | Address>;
  subject: string;
  html: string;
  /** Plain-text alternative. Auto-generated from `html` when omitted (deliverability + a11y). */
  text?: string;
  from?: string | Address; // defaults to config.from
  replyTo?: string | Address; // defaults to config.replyTo
  category: MailCategory;
  /** Opaque reference to the originating entity (member id, order id, …). A fact, not content. */
  entityRef?: string;
  /** One-click unsubscribe URL — REQUIRED for category 'marketing' (RFC 8058). */
  unsubscribeUrl?: string;
  /** Extra headers (rare). */
  headers?: Record<string, string>;
  /**
   * Idempotency key. Derived from (project, category, entityRef, recipients, subject)
   * when omitted, so a retry never double-sends.
   */
  idempotencyKey?: string;
}

/** A message normalized for transport — from/replyTo/text/stream/headers resolved. */
export interface NormalizedMessage {
  to: Address[];
  from: Address;
  replyTo?: Address;
  subject: string;
  html: string;
  text: string;
  category: MailCategory;
  stream: MailStream;
  entityRef?: string;
  idempotencyKey: string;
  headers: Record<string, string>;
}

export type OutboxStatus = 'queued' | 'sending' | 'sent' | 'dead';

export interface OutboxRecord {
  id: string;
  idempotencyKey: string;
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: number; // epoch ms
  message: NormalizedMessage;
  providerMessageId?: string;
  lastError?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NewOutboxRecord {
  idempotencyKey: string;
  message: NormalizedMessage;
  nextAttemptAt: number;
}

/** Result of a transport delivery attempt. */
export interface DeliveryResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  /** True when the error is transient and the message should be retried. */
  retriable?: boolean;
}

/** A transport driver: relay (real SMTP) or console/sink (dev). */
export interface MailDriver {
  readonly name: string;
  deliver(message: NormalizedMessage): Promise<DeliveryResult>;
  /** Release pooled resources (connections). Safe to call repeatedly. */
  close?(): Promise<void>;
}

export interface EnqueueResult {
  record: OutboxRecord;
  /** False when an existing record was returned (idempotency_key already seen). */
  created: boolean;
}

/** Pluggable durable outbox store. Ships with a postgres.js impl and an in-memory impl. */
export interface MailStore {
  /** Insert, or return the existing record when `idempotencyKey` was already seen. */
  enqueue(rec: NewOutboxRecord): Promise<EnqueueResult>;
  /** Atomically claim up to `limit` due records (status→sending). */
  claimDue(limit: number, now: number): Promise<OutboxRecord[]>;
  markSent(id: string, providerMessageId?: string): Promise<void>;
  /** `nextAttemptAt = null` dead-letters the record (attempts exhausted). */
  reschedule(id: string, error: string, nextAttemptAt: number | null): Promise<void>;
}

export interface SendResult {
  id: string;
  idempotencyKey: string;
  status: OutboxStatus;
  /** True when an existing record was returned instead of enqueuing a duplicate. */
  deduped: boolean;
}
