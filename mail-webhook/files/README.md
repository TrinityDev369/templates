# Trinity Mail — `mail-webhook`

Signature-verified receivers for the Trinity Mail relay's delivery-lifecycle webhooks.
Advances a local `email_logs` / `email_events` view, mirrors hard bounces + complaints
into a check-before-send suppression list, and (optionally) retains rendered bodies as
crypto-shreddable ciphertext. Framework-agnostic core + thin Next.js route adapters.
Pairs with `mail-client`.

```ts
import postgres from 'postgres';
import {
  handleEventWebhook,
  handleBounceWebhook,
  createPostgresStore,
  isSuppressed,
} from './mail/webhook';

const sql = postgres(process.env.DATABASE_URL!);
const deps = {
  store: createPostgresStore(sql as any),
  secret: process.env.RELAY_WEBHOOK_SECRET!,
};

// In your route handler — pass the RAW body + the X-Trinity-Signature header:
const result = await handleEventWebhook(rawBody, req.headers.get('x-trinity-signature'), deps);

// Before every mail-client send():
if (await isSuppressed(deps.store, recipient)) return; // skip — known-bad / complained
```

## The relay → tenant contract

Every relay POST carries `X-Trinity-Signature: sha256=<hex>` — the lowercase-hex
HMAC-SHA256 of the **raw** request body, keyed by `RELAY_WEBHOOK_SECRET`. Verification is
timing-safe (`crypto.timingSafeEqual`). Always feed the handlers the raw bytes — never a
re-serialized object, which would break the HMAC.

| Endpoint | Body | Effect |
| --- | --- | --- |
| `POST /api/mail/events` | `{ type, idempotencyKey, providerMessageId, project, category?, recipient, timestamp, reason? }` | append `email_events`, advance `email_logs.status`, suppress on hard bounce / complaint |
| `POST /api/mail/bounce` | `{ type: 'bounce'\|'complaint', recipient, bounceType: 'hard'\|'soft'\|'complaint', idempotencyKey?, project, timestamp, diagnostic? }` | suppress the recipient (soft bounces are NOT suppressed) |

`type` ∈ `queued | sent | delivered | deferred | bounced | complained | opened | clicked`.

## Status lifecycle (the high-water mark)

`email_logs.status` only ever moves **forward** — a late or out-of-order event can never
regress it:

```
queued ─▶ sent ─▶ delivered          (the linear happy path)
   deferred                          (transient; recorded, yields to forward progress)
   bounced / complained              (terminal; sticky — nothing reopens it)
   opened / clicked                  (ENGAGEMENT; recorded as events, NEVER touch status)
```

**Tracking is OFF by default** (doctrine). `opened`/`clicked` are *recorded* if the relay
sends them, but this template never generates pixels or click-redirects.

## Suppression (check-before-send)

The relay holds the authoritative **global** suppression list. This is the tenant-local
mirror, populated from hard bounces + complaints. Gate every send on
`isSuppressed(store, recipient)` — sending to a known-bad address burns the **shared**
relay reputation for every tenant. Recipients are normalized (trim + lowercase) so a
casing/whitespace variant can't slip through.

## Confidentiality — retained bodies are crypto-shreddable (doctrine)

Subjects and bodies are **content**. They never reach the relay's central log, and this
template never writes them as plaintext. If you retain a rendered body (e.g. a
"view in browser" surface), store it **only** as AES-256-GCM ciphertext via
`encryptBody()` into the `email_logs.body_ciphertext/body_iv/body_tag` columns.

DSGVO erasure = **crypto-shred**: destroy the key (and/or the row). Once the key is gone
the ciphertext is mathematically undecryptable — no `DELETE`-and-hope. The crypto tests
exercise exactly this ("a lost key makes the body undecryptable").

## Environment

Add these to your tenant env (delivered/governed via `npx @trinity369/use mail-tresor`;
never commit real values):

```sh
# Shared with mail-client. Verifies inbound relay events. Issued by `trinity-mail init`.
RELAY_WEBHOOK_SECRET=

# 32-byte AES-256 key for crypto-shreddable retained bodies, base64-encoded.
# Generate:  openssl rand -base64 32
# Phase C: this key graduates to the Tresor vault (D-3) on its dedicated server; the
# per-message-key wrap is a drop-in once the vault exists.
MAIL_BODY_KEY=
```

`DATABASE_URL` (postgres.js) is the same one `mail-client` uses.

## Install

1. Apply `webhook/schema.sql` to your database (creates `email_logs`, `email_events`,
   `mail_suppression`). Self-contained — no Trinity DB functions/triggers; `updated_at`
   is set in code.
2. Set `RELAY_WEBHOOK_SECRET` and `MAIL_BODY_KEY`.
3. Wire the adapters: `adapters/next-events-route.ts` → `app/api/mail/events/route.ts`,
   `adapters/next-bounce-route.ts` → `app/api/mail/bounce/route.ts`.
4. Call `isSuppressed(...)` before every `mail.send(...)`.

Tests: `npx vitest run src/mail`.

## Pairs with

`mail-client` (transport + outbox) · `mail-templates` (React Email rendering) ·
`mail-dns` (DNS manifest + verify) · `mail-tresor` (env contract).
