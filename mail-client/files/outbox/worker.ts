/**
 * Trinity Mail — outbox worker.
 *
 * Drains due records through the driver with exponential backoff + jitter, and
 * dead-letters once attempts are exhausted (or on a permanent, non-retriable error).
 * Runnable as a standalone process (see adapters/standalone-worker.ts) or invoked
 * inline from a serverless function after enqueue.
 */
import type { MailConfig } from '../config';
import type { MailDriver, MailStore, OutboxRecord } from '../lib/types';

export interface WorkerDeps {
  store: MailStore;
  driver: MailDriver;
  config: MailConfig;
}

export interface DrainResult {
  claimed: number;
  sent: number;
  rescheduled: number;
  deadLettered: number;
}

/** Exponential backoff with ±20% jitter, capped at 1h. */
function backoffMs(attempt: number, base: number): number {
  const raw = Math.min(base * 2 ** attempt, 3_600_000);
  const jitter = raw * 0.2 * (Math.random() * 2 - 1);
  return Math.round(raw + jitter);
}

export async function drainOnce(
  { store, driver, config }: WorkerDeps,
  batchSize = 20,
): Promise<DrainResult> {
  const now = Date.now();
  const due = await store.claimDue(batchSize, now);
  const result: DrainResult = { claimed: due.length, sent: 0, rescheduled: 0, deadLettered: 0 };

  await Promise.all(
    due.map(async (rec: OutboxRecord) => {
      const res = await driver.deliver(rec.message);
      if (res.ok) {
        await store.markSent(rec.id, res.providerMessageId);
        result.sent += 1;
        return;
      }
      const attempts = rec.attempts + 1;
      const exhausted = attempts >= config.outbox.maxAttempts;
      const permanent = res.retriable === false;
      if (exhausted || permanent) {
        await store.reschedule(rec.id, res.error ?? 'delivery failed', null);
        result.deadLettered += 1;
      } else {
        await store.reschedule(rec.id, res.error ?? 'delivery failed', now + backoffMs(attempts, config.outbox.baseBackoffMs));
        result.rescheduled += 1;
      }
    }),
  );

  return result;
}

export interface LoopHandle {
  stop(): void;
}

/** Continuous drain loop. Returns a handle to stop it (e.g. on SIGTERM). */
export function startWorker(deps: WorkerDeps, intervalMs = 5_000, batchSize = 20): LoopHandle {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout>;

  const tick = async () => {
    if (stopped) return;
    try {
      await drainOnce(deps, batchSize);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[trinity-mail worker] drain error:', err instanceof Error ? err.message : err);
    }
    if (!stopped) timer = setTimeout(tick, intervalMs);
  };

  void tick();
  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
    },
  };
}
