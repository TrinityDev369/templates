/**
 * Trinity Mail — Next.js usage (example).
 *
 * The client has zero Next.js coupling, so it drops straight into a route handler or
 * a server action. In serverless runtimes there is no long-running worker, so call
 * `drain()` right after `send()` to flush the just-enqueued message. A separate
 * durable worker (adapters/standalone-worker.ts) is still recommended for retries of
 * anything that didn't go out on the first attempt.
 *
 * Copy/adapt — this file is illustrative, not wired into any route by default.
 */
import postgres from 'postgres';
import { createMailClient } from '../sendMail';
import { createPostgresStore, type PostgresClient } from '../outbox/store';

// Reuse a single pool across warm invocations.
const sql = postgres(process.env.DATABASE_URL!);
const mail = createMailClient({ store: createPostgresStore(sql as unknown as PostgresClient) });

// app/api/auth/send-code/route.ts
export async function POST(req: Request) {
  const { email, code } = (await req.json()) as { email: string; code: string };

  const result = await mail.send({
    to: email,
    subject: 'Dein Bestätigungscode',
    html: `<p>Dein Code lautet <strong>${code}</strong>.</p>`,
    category: 'auth',
    entityRef: `verify:${email}`,
  });

  // Flush now (no background worker in serverless). Safe to await; retries persist.
  await mail.drain();

  return Response.json({ ok: true, id: result.id, deduped: result.deduped });
}
