/**
 * Trinity Mail — the client you import.
 *
 *   const mail = createMailClient({ store, config });
 *   await mail.send({ to, subject, html, category: 'auth' });
 *
 * `send()` is provider-agnostic, durable (writes to the outbox first), and idempotent.
 * Delivery happens via the worker (standalone process) or an inline `drain()` after
 * enqueue in serverless runtimes. Framework-agnostic: no Next.js internals here.
 */
import { createHash } from 'node:crypto';
import { loadMailConfig, type MailConfig } from './config';
import { buildHeaders } from './lib/headers';
import { htmlToText } from './lib/plaintext';
import {
  type Address,
  type MailDriver,
  type MailMessage,
  type MailStore,
  type NormalizedMessage,
  type SendResult,
  streamForCategory,
} from './lib/types';
import { selectDriver } from './drivers';
import { drainOnce, startWorker, type DrainResult, type LoopHandle } from './outbox/worker';
import {
  allowAllConsent,
  ConsentRequiredError,
  createMemoryRateLimiter,
  MailRateLimitError,
  type ConsentChecker,
  type RateLimiter,
} from './guards';

function resolveAddress(value: string | Address | undefined, fallback?: Address): Address {
  if (!value) {
    if (!fallback) throw new Error('Missing required address (no value and no fallback).');
    return fallback;
  }
  return typeof value === 'string' ? { email: value } : value;
}

function toRecipients(to: MailMessage['to']): Address[] {
  const list = Array.isArray(to) ? to : [to];
  return list.map((v) => (typeof v === 'string' ? { email: v } : v));
}

/** Stable idempotency key over local facts (subject stays local — it is content). */
function deriveIdempotencyKey(project: string, msg: MailMessage, recipients: Address[]): string {
  const basis = [
    project,
    msg.category,
    msg.entityRef ?? '',
    recipients.map((r) => r.email.toLowerCase()).sort().join(','),
    msg.subject,
  ].join('|');
  return createHash('sha256').update(basis).digest('hex').slice(0, 32);
}

export interface MailClientOptions {
  store: MailStore;
  config?: MailConfig;
  driver?: MailDriver;
  consent?: ConsentChecker;
  rateLimiter?: RateLimiter;
}

export interface MailClient {
  /** Validate, guard, render text, and durably enqueue. Idempotent on retry. */
  send(message: MailMessage): Promise<SendResult>;
  /** Process due outbox records now (call after send in serverless runtimes). */
  drain(batchSize?: number): Promise<DrainResult>;
  /** Start a continuous background drain (long-running worker process). */
  startWorker(intervalMs?: number, batchSize?: number): LoopHandle;
  close(): Promise<void>;
}

export function createMailClient(opts: MailClientOptions): MailClient {
  const config = opts.config ?? loadMailConfig();
  const driver = opts.driver ?? selectDriver(config);
  const consent = opts.consent ?? allowAllConsent;
  const rateLimiter = opts.rateLimiter ?? createMemoryRateLimiter(config.rate.max, config.rate.windowMs);
  const deps = { store: opts.store, driver, config };

  async function normalize(msg: MailMessage): Promise<NormalizedMessage> {
    const recipients = toRecipients(msg.to);
    if (recipients.length === 0) throw new Error('send(): at least one recipient is required.');

    const stream = streamForCategory(msg.category);
    const idempotencyKey = msg.idempotencyKey ?? deriveIdempotencyKey(config.project, msg, recipients);

    const partial: NormalizedMessage = {
      to: recipients,
      from: resolveAddress(msg.from, config.from),
      replyTo: msg.replyTo ? resolveAddress(msg.replyTo) : config.replyTo,
      subject: msg.subject,
      html: msg.html,
      text: msg.text ?? htmlToText(msg.html),
      category: msg.category,
      stream,
      entityRef: msg.entityRef,
      idempotencyKey,
      headers: { ...msg.headers },
    };
    // Headers are built once here (X-Trinity-* + RFC 8058 for marketing).
    partial.headers = buildHeaders(partial, config, msg.unsubscribeUrl);
    return partial;
  }

  return {
    async send(message: MailMessage): Promise<SendResult> {
      const normalized = await normalize(message);

      // Consent gate — marketing stream only.
      if (normalized.stream === 'marketing') {
        for (const r of normalized.to) {
          if (!(await consent.isAllowed(r.email))) throw new ConsentRequiredError(r.email);
        }
      }

      // Rate guard — keyed per project+stream so transactional isn't starved by bulk.
      const key = `${config.project}:${normalized.stream}`;
      if (!rateLimiter.check(key)) throw new MailRateLimitError(key);

      const { record, created } = await opts.store.enqueue({
        idempotencyKey: normalized.idempotencyKey,
        message: normalized,
        nextAttemptAt: Date.now(),
      });

      return {
        id: record.id,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        deduped: !created,
      };
    },

    drain(batchSize?: number) {
      return drainOnce(deps, batchSize);
    },

    startWorker(intervalMs?: number, batchSize?: number) {
      return startWorker(deps, intervalMs, batchSize);
    },

    async close() {
      await driver.close?.();
    },
  };
}
