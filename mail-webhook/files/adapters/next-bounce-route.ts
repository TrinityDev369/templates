/**
 * Trinity Mail — Next.js route adapter for bounces/complaints (example).
 *
 * Thin wrapper over `handleBounceWebhook`. Same contract as the events adapter: read
 * the RAW body, pull `X-Trinity-Signature`, call the core, translate the result.
 *
 * Copy/adapt to `app/api/mail/bounce/route.ts`. Illustrative; not wired by default.
 */
import postgres from 'postgres';
import { handleBounceWebhook } from '../webhook/bounce';
import { createPostgresStore, type PostgresClient, type WebhookDeps } from '../webhook/store';

const sql = postgres(process.env.DATABASE_URL!);
const deps: WebhookDeps = {
  store: createPostgresStore(sql as unknown as PostgresClient),
  secret: process.env.RELAY_WEBHOOK_SECRET!,
};

// app/api/mail/bounce/route.ts
export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const sig = req.headers.get('x-trinity-signature');

  const result = await handleBounceWebhook(rawBody, sig, deps);

  if (!result.ok) {
    const code = result.error === 'bad_signature' ? 401 : 400;
    return Response.json({ ok: false, error: result.error }, { status: code });
  }

  return Response.json(result, { status: 200 });
}
