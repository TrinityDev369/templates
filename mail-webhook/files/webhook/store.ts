/**
 * Trinity Mail — webhook stores (email_logs / email_events / mail_suppression).
 *
 *  - `createPostgresStore(sql)` — durable, on a postgres.js client. Production default.
 *  - `createMemoryStore()` — in-process, for tests and local dev.
 *
 * postgres.js gotcha (honored below): pass jsonb via `sql.json(value)`, never
 * `JSON.stringify(value)` with a `::jsonb` cast — the latter double-encodes.
 *
 * `updated_at` on email_logs is set in code (see schema.sql) — no DB trigger, so the
 * schema stays portable across tenant databases.
 */
import { randomUUID } from 'node:crypto';
import type {
  EmailLog,
  EmailEvent,
  EncryptedBody,
  MailEventType,
  MailLogStatus,
  SuppressionEntry,
  SuppressionReason,
  SuppressionSource,
} from './types';

// Minimal structural type for a postgres.js client — avoids a hard type dependency
// so the memory store works in repos that don't install `postgres`.
export interface PostgresClient {
  <T = Record<string, unknown>>(strings: TemplateStringsArray, ...args: unknown[]): Promise<T[]>;
  json(value: unknown): unknown;
}

/** Fields the relay sends with a delivery event that seed a fresh email_logs row. */
export interface LogSeed {
  idempotencyKey: string;
  project: string;
  category?: string;
  recipient: string;
  providerMessageId?: string;
}

/** An event to append (the verified payload, normalized). */
export interface EventAppend {
  idempotencyKey: string;
  type: MailEventType;
  recipient: string;
  reason?: string;
  occurredAt: number; // epoch ms
  raw: unknown;
}

/**
 * The persistence surface the core handlers depend on. Both the postgres and memory
 * stores implement it; tests swap in the memory store.
 */
export interface WebhookStore {
  /** Append an event; returns false if its idempotencyKey was already recorded (no-op). */
  appendEvent(ev: EventAppend): Promise<{ created: boolean }>;
  /** Insert the log row if absent (status defaults to 'queued'). Idempotent. */
  ensureLog(seed: LogSeed): Promise<void>;
  /** Read the current log row for a message (by its idempotency key), if any. */
  getLog(idempotencyKey: string): Promise<EmailLog | null>;
  /** Set a log's status (caller has already resolved the monotonic high-water mark). */
  setLogStatus(
    idempotencyKey: string,
    status: MailLogStatus,
    providerMessageId?: string,
  ): Promise<void>;
  /** Store a retained body as crypto-shreddable ciphertext on the message's log row. */
  storeBody(idempotencyKey: string, body: EncryptedBody): Promise<void>;
  /** Read back a retained body's ciphertext, if any. */
  getBody(idempotencyKey: string): Promise<EncryptedBody | null>;
  /** Insert/keep a suppression entry. Idempotent (PK on recipient). */
  suppress(
    recipient: string,
    reason: SuppressionReason,
    source: SuppressionSource,
  ): Promise<void>;
  unsuppress(recipient: string): Promise<void>;
  isSuppressed(recipient: string): Promise<boolean>;
  getSuppression(recipient: string): Promise<SuppressionEntry | null>;
}

/** The shared dependency bundle the core handlers receive. */
export interface WebhookDeps {
  store: WebhookStore;
  secret: string;
}

function bytes(v: unknown): Uint8Array | null {
  if (v == null) return null;
  if (v instanceof Uint8Array) return v;
  if (Buffer.isBuffer(v)) return v;
  return Buffer.from(v as ArrayBuffer);
}

function mapLog(r: Record<string, any>): EmailLog {
  return {
    idempotencyKey: r.idempotency_key,
    project: r.project,
    category: r.category ?? undefined,
    recipient: r.recipient,
    status: r.status as MailLogStatus,
    providerMessageId: r.provider_message_id ?? undefined,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : 0,
    updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : 0,
  };
}

export function createPostgresStore(sql: PostgresClient): WebhookStore {
  return {
    async appendEvent(ev) {
      const inserted = await sql<Record<string, any>>`
        INSERT INTO email_events (id, idempotency_key, type, recipient, reason, occurred_at, raw)
        VALUES (
          ${randomUUID()}, ${ev.idempotencyKey}, ${ev.type}, ${ev.recipient},
          ${ev.reason ?? null}, ${new Date(ev.occurredAt)}, ${sql.json(ev.raw)}
        )
        ON CONFLICT (idempotency_key, type) DO NOTHING
        RETURNING id`;
      return { created: inserted.length > 0 };
    },

    async ensureLog(seed) {
      await sql`
        INSERT INTO email_logs (idempotency_key, project, category, recipient, status, provider_message_id)
        VALUES (
          ${seed.idempotencyKey}, ${seed.project}, ${seed.category ?? null},
          ${seed.recipient}, 'queued', ${seed.providerMessageId ?? null}
        )
        ON CONFLICT (idempotency_key) DO NOTHING`;
    },

    async getLog(idempotencyKey) {
      const rows = await sql<Record<string, any>>`
        SELECT * FROM email_logs WHERE idempotency_key = ${idempotencyKey}`;
      return rows.length ? mapLog(rows[0]) : null;
    },

    async setLogStatus(idempotencyKey, status, providerMessageId) {
      await sql`
        UPDATE email_logs
        SET status = ${status},
            provider_message_id = COALESCE(${providerMessageId ?? null}, provider_message_id),
            updated_at = now()
        WHERE idempotency_key = ${idempotencyKey}`;
    },

    async storeBody(idempotencyKey, body) {
      await sql`
        UPDATE email_logs
        SET body_ciphertext = ${Buffer.from(body.ciphertext)},
            body_iv = ${Buffer.from(body.iv)},
            body_tag = ${Buffer.from(body.tag)},
            updated_at = now()
        WHERE idempotency_key = ${idempotencyKey}`;
    },

    async getBody(idempotencyKey) {
      const rows = await sql<Record<string, any>>`
        SELECT body_ciphertext, body_iv, body_tag
        FROM email_logs WHERE idempotency_key = ${idempotencyKey}`;
      if (!rows.length) return null;
      const ct = bytes(rows[0].body_ciphertext);
      const iv = bytes(rows[0].body_iv);
      const tag = bytes(rows[0].body_tag);
      if (!ct || !iv || !tag) return null;
      return { ciphertext: ct, iv, tag };
    },

    async suppress(recipient, reason, source) {
      await sql`
        INSERT INTO mail_suppression (recipient, reason, source)
        VALUES (${recipient}, ${reason}, ${source})
        ON CONFLICT (recipient) DO NOTHING`;
    },

    async unsuppress(recipient) {
      await sql`DELETE FROM mail_suppression WHERE recipient = ${recipient}`;
    },

    async isSuppressed(recipient) {
      const rows = await sql<Record<string, any>>`
        SELECT 1 FROM mail_suppression WHERE recipient = ${recipient} LIMIT 1`;
      return rows.length > 0;
    },

    async getSuppression(recipient) {
      const rows = await sql<Record<string, any>>`
        SELECT * FROM mail_suppression WHERE recipient = ${recipient}`;
      if (!rows.length) return null;
      const r = rows[0];
      return {
        recipient: r.recipient,
        reason: r.reason as SuppressionReason,
        source: r.source as SuppressionSource,
        createdAt: r.created_at ? new Date(r.created_at).getTime() : 0,
      };
    },
  };
}

interface MemLog extends EmailLog {
  body?: EncryptedBody;
}

export function createMemoryStore(): WebhookStore {
  const events = new Map<string, EmailEvent>(); // by `${idempotencyKey}:${type}`
  const logs = new Map<string, MemLog>(); // by idempotencyKey (the message key)
  const suppression = new Map<string, SuppressionEntry>(); // by recipient

  return {
    async appendEvent(ev) {
      const eventKey = `${ev.idempotencyKey}:${ev.type}`;
      if (events.has(eventKey)) return { created: false };
      events.set(eventKey, {
        id: randomUUID(),
        idempotencyKey: ev.idempotencyKey,
        type: ev.type,
        recipient: ev.recipient,
        reason: ev.reason,
        occurredAt: ev.occurredAt,
        raw: ev.raw,
      });
      return { created: true };
    },

    async ensureLog(seed) {
      if (logs.has(seed.idempotencyKey)) return;
      const now = Date.now();
      logs.set(seed.idempotencyKey, {
        idempotencyKey: seed.idempotencyKey,
        project: seed.project,
        category: seed.category,
        recipient: seed.recipient,
        status: 'queued',
        providerMessageId: seed.providerMessageId,
        createdAt: now,
        updatedAt: now,
      });
    },

    async getLog(idempotencyKey) {
      const l = logs.get(idempotencyKey);
      return l ? { ...l } : null;
    },

    async setLogStatus(idempotencyKey, status, providerMessageId) {
      const l = logs.get(idempotencyKey);
      if (!l) return;
      l.status = status;
      if (providerMessageId) l.providerMessageId = providerMessageId;
      l.updatedAt = Date.now();
    },

    async storeBody(idempotencyKey, body) {
      const l = logs.get(idempotencyKey);
      if (!l) return;
      l.body = {
        ciphertext: Uint8Array.from(body.ciphertext),
        iv: Uint8Array.from(body.iv),
        tag: Uint8Array.from(body.tag),
      };
      l.updatedAt = Date.now();
    },

    async getBody(idempotencyKey) {
      const l = logs.get(idempotencyKey);
      return l?.body ? { ...l.body } : null;
    },

    async suppress(recipient, reason, source) {
      if (suppression.has(recipient)) return;
      suppression.set(recipient, { recipient, reason, source, createdAt: Date.now() });
    },

    async unsuppress(recipient) {
      suppression.delete(recipient);
    },

    async isSuppressed(recipient) {
      return suppression.has(recipient);
    },

    async getSuppression(recipient) {
      const s = suppression.get(recipient);
      return s ? { ...s } : null;
    },
  };
}
