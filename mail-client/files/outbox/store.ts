/**
 * Trinity Mail — outbox stores.
 *
 *  - `createPostgresStore(sql)` — durable, concurrency-safe (FOR UPDATE SKIP LOCKED),
 *    using a postgres.js client. The production default.
 *  - `createMemoryStore()` — in-process, for tests and the console driver.
 *
 * postgres.js gotcha (honored below): pass jsonb via `sql.json(value)`, never
 * `JSON.stringify(value)` with a `::jsonb` cast — the latter double-encodes.
 */
import { randomUUID } from 'node:crypto';
import type { EnqueueResult, MailStore, NewOutboxRecord, OutboxRecord } from '../lib/types';

// Minimal structural type for a postgres.js client — avoids a hard type dependency
// so the memory store works in repos that don't install `postgres`.
export interface PostgresClient {
  <T = Record<string, unknown>>(strings: TemplateStringsArray, ...args: unknown[]): Promise<T[]>;
  json(value: unknown): unknown;
}

function mapRow(r: Record<string, any>): OutboxRecord {
  return {
    id: r.id,
    idempotencyKey: r.idempotency_key,
    status: r.status,
    attempts: r.attempts,
    nextAttemptAt: Number(r.next_attempt_at),
    message: r.message,
    providerMessageId: r.provider_message_id ?? undefined,
    lastError: r.last_error ?? undefined,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : 0,
    updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : 0,
  };
}

export function createPostgresStore(sql: PostgresClient): MailStore {
  return {
    async enqueue(rec: NewOutboxRecord): Promise<EnqueueResult> {
      const id = randomUUID();
      const inserted = await sql<Record<string, any>>`
        INSERT INTO mail_outbox (id, idempotency_key, status, attempts, next_attempt_at, message)
        VALUES (${id}, ${rec.idempotencyKey}, 'queued', 0, ${rec.nextAttemptAt}, ${sql.json(rec.message)})
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *`;
      if (inserted.length) return { record: mapRow(inserted[0]), created: true };
      const existing = await sql<Record<string, any>>`
        SELECT * FROM mail_outbox WHERE idempotency_key = ${rec.idempotencyKey}`;
      return { record: mapRow(existing[0]), created: false };
    },

    async claimDue(limit: number, now: number): Promise<OutboxRecord[]> {
      const rows = await sql<Record<string, any>>`
        UPDATE mail_outbox SET status = 'sending', updated_at = now()
        WHERE id IN (
          SELECT id FROM mail_outbox
          WHERE status = 'queued' AND next_attempt_at <= ${now}
          ORDER BY next_attempt_at
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *`;
      return rows.map(mapRow);
    },

    async markSent(id: string, providerMessageId?: string): Promise<void> {
      await sql`
        UPDATE mail_outbox
        SET status = 'sent', provider_message_id = ${providerMessageId ?? null},
            message = NULL, updated_at = now()
        WHERE id = ${id}`;
    },

    async reschedule(id: string, error: string, nextAttemptAt: number | null): Promise<void> {
      if (nextAttemptAt === null) {
        await sql`
          UPDATE mail_outbox
          SET status = 'dead', last_error = ${error}, attempts = attempts + 1, updated_at = now()
          WHERE id = ${id}`;
      } else {
        await sql`
          UPDATE mail_outbox
          SET status = 'queued', next_attempt_at = ${nextAttemptAt}, last_error = ${error},
              attempts = attempts + 1, updated_at = now()
          WHERE id = ${id}`;
      }
    },
  };
}

export function createMemoryStore(): MailStore {
  const byId = new Map<string, OutboxRecord>();
  const byKey = new Map<string, string>();

  return {
    async enqueue(rec: NewOutboxRecord): Promise<EnqueueResult> {
      const existingId = byKey.get(rec.idempotencyKey);
      if (existingId) return { record: { ...byId.get(existingId)! }, created: false };
      const now = Date.now();
      const record: OutboxRecord = {
        id: randomUUID(),
        idempotencyKey: rec.idempotencyKey,
        status: 'queued',
        attempts: 0,
        nextAttemptAt: rec.nextAttemptAt,
        message: rec.message,
        createdAt: now,
        updatedAt: now,
      };
      byId.set(record.id, record);
      byKey.set(record.idempotencyKey, record.id);
      return { record: { ...record }, created: true };
    },

    async claimDue(limit: number, now: number): Promise<OutboxRecord[]> {
      const due = [...byId.values()]
        .filter((r) => r.status === 'queued' && r.nextAttemptAt <= now)
        .sort((a, b) => a.nextAttemptAt - b.nextAttemptAt)
        .slice(0, limit);
      for (const r of due) {
        r.status = 'sending';
        r.updatedAt = now;
      }
      return due.map((r) => ({ ...r }));
    },

    async markSent(id: string, providerMessageId?: string): Promise<void> {
      const r = byId.get(id);
      if (!r) return;
      r.status = 'sent';
      r.providerMessageId = providerMessageId;
      r.message = undefined as never; // cleared — not an archive
      r.updatedAt = Date.now();
    },

    async reschedule(id: string, error: string, nextAttemptAt: number | null): Promise<void> {
      const r = byId.get(id);
      if (!r) return;
      r.attempts += 1;
      r.lastError = error;
      r.updatedAt = Date.now();
      if (nextAttemptAt === null) r.status = 'dead';
      else {
        r.status = 'queued';
        r.nextAttemptAt = nextAttemptAt;
      }
    },
  };
}
