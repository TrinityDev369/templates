/**
 * Trinity Mail — standalone outbox worker.
 *
 * A plain Node process (no framework) that drains the outbox continuously. Use this
 * where sends must be durable across requests — e.g. a separate worker container, or
 * OL's calendar-reminder-worker. Run: `npx tsx src/mail/adapters/standalone-worker.ts`
 *
 * Serverless/edge runtimes instead call `mail.drain()` right after `mail.send()`.
 */
import postgres from 'postgres';
import { createMailClient } from '../sendMail';
import { createPostgresStore, type PostgresClient } from '../outbox/store';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('standalone-worker requires DATABASE_URL (durable outbox).');

  const sql = postgres(url);
  const store = createPostgresStore(sql as unknown as PostgresClient);
  const mail = createMailClient({ store });

  const handle = mail.startWorker(
    Number.parseInt(process.env.MAIL_WORKER_INTERVAL_MS ?? '5000', 10),
  );
  // eslint-disable-next-line no-console
  console.log('[trinity-mail] outbox worker started');

  const shutdown = async () => {
    handle.stop();
    await mail.close();
    await sql.end({ timeout: 5 });
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[trinity-mail] worker failed to start:', err);
  process.exit(1);
});
