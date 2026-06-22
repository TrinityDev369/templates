/**
 * Trinity Mail — Next.js route adapter for delivery events (example).
 *
 * Thin wrapper over the framework-agnostic `handleEventWebhook` core. Its ONLY jobs:
 *   1) read the RAW request body (the exact bytes the relay signed — never
 *      `req.json()`, which re-serializes and breaks the HMAC),
 *   2) pull the `X-Trinity-Signature` header,
 *   3) call the core and translate its result into an HTTP response.
 *
 * Copy/adapt to `app/api/mail/events/route.ts`. This file is illustrative; it is not
 * wired into any route by default.
 */
import postgres from 'postgres';
import { handleEventWebhook } from '../webhook/events';
import { createPostgresStore, type PostgresClient, type WebhookDeps } from '../webhook/store';

// Reuse one pool across warm invocations.
const sql = postgres(process.env.DATABASE_URL!);
const deps: WebhookDeps = {
  store: createPostgresStore(sql as unknown as PostgresClient),
  secret: process.env.RELAY_WEBHOOK_SECRET!,
};

// app/api/mail/events/route.ts
export async function POST(req: Request): Promise<Response> {
  // RAW body — sign-over-bytes integrity depends on not touching it.
  const rawBody = await req.text();
  const sig = req.headers.get('x-trinity-signature');

  const result = await handleEventWebhook(rawBody, sig, deps);

  if (!result.ok) {
    // 401 for a bad signature, 400 for a malformed payload. Never 5xx on these —
    // the relay would pointlessly retry a permanently-bad request.
    const code = result.error === 'bad_signature' ? 401 : 400;
    return Response.json({ ok: false, error: result.error }, { status: code });
  }

  return Response.json(result, { status: 200 });
}
