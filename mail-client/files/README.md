# Trinity Mail — `mail-client`

Provider-agnostic transport over the shared Trinity Mail relay. You import `sendMail`;
the package handles durability, idempotency, the message contract, and shared-IP
guardrails. Framework-agnostic — works in Next.js route handlers/RSC and a plain Node
worker.

```ts
import { createMailClient, createPostgresStore } from './mail';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);
const mail = createMailClient({ store: createPostgresStore(sql as any) });

await mail.send({
  to: 'member@example.com',
  subject: 'Dein Bestätigungscode',
  html: '<p>Code: <b>123456</b></p>',
  category: 'auth',          // auth | receipt | reminder | digest | notification | marketing
  entityRef: 'verify:member-42',
});
```

## What you get

| Concern | How |
| --- | --- |
| **Durable, at-least-once** | every send is persisted to `mail_outbox` before delivery; retried with exponential backoff + jitter; dead-lettered on exhaustion |
| **Idempotent** | a derived key (or your own `idempotencyKey`) means a retry never double-sends |
| **Message contract** | `X-Trinity-Project / -Category / -Stream / -Entity` headers (facts, never content) |
| **Deliverability** | auto plaintext alternative; STARTTLS/implicit-TLS; bounces routed to your Return-Path |
| **Shared-IP citizen** | per-project+stream rate limit; consent gate + RFC 8058 one-click for marketing |
| **Safe local dev** | `MAIL_DRIVER=console` logs instead of sending — never burns shared reputation |

## Delivery models

- **Long-running / worker:** `npx tsx src/mail/adapters/standalone-worker.ts` drains continuously.
- **Serverless:** call `await mail.drain()` right after `send()` (see `adapters/next-route.ts`).

## Confidentiality (doctrine)

Subjects and bodies are **content** — they never reach the relay's central log, only the
header *facts* do. The outbox is operational, not an archive: message content is cleared the
moment a send succeeds. Retention of rendered bodies (e.g. "view in browser") belongs to
`mail-webhook`, where they are stored as crypto-shreddable ciphertext.

## Pairs with

`mail-templates` (React Email rendering) · `mail-webhook` (delivery events, bounces,
suppression) · `mail-dns` (DNS manifest + verify) · `mail-tresor` (env contract).
