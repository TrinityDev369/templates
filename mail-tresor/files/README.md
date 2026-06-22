# Trinity Mail — `mail-tresor`

The **env contract** for the Trinity Mail tenant family, expressed as a
[Tresor](https://) schema fragment. It declares every mail-related env key your
project reads — with its **risk**, **rotation policy**, a **validation regex**, and
whether it's a **secret** — so the keys are tracked, validated, and rotated instead
of copy-pasted and forgotten.

This template installs to `./tresor/`. It is the env counterpart to `mail-client`
(transport) and `mail-webhook` (events + ciphertext bodies).

## What's in here

| File | Purpose |
| --- | --- |
| `mail.tresor.ts` | `mailSecrets` — a schema **fragment** you merge into `tresor.config.ts`. Covers every mail env key. |
| `mail.env.example` | The mail env block, ready to seed `tresor/vault.env`. (Named `.env`-free on purpose; rename/copy as needed.) |
| `__tests__/keys.test.ts` | Asserts the fragment covers **exactly** the documented key set, and stays in parity with the example. |

## Merging into `tresor.config.ts`

`mailSecrets` is a plain object keyed by env name, so you spread it into your
project's key map. It carries **no secret values** — only governance metadata —
so it's safe to commit.

```ts
// tresor/tresor.config.ts
import { mailSecrets } from './mail.tresor';

export const config = {
  keys: {
    ...mailSecrets,
    // ...your project's other keys (STRIPE_SECRET_KEY, JWT_SECRET, …)
  },
};
```

Then the normal Tresor flow applies:

```bash
# put real values in tresor/vault.env (never committed), seeded from mail.env.example
tresor sync     # parse vault.env → update lock → generate runtime .env
tresor doctor   # validate every value against its pattern; catch drift/missing
tresor audit    # rotation status; surfaces stale critical/high keys first
```

## The keys

| Key | Risk | Rotation | Secret | What it is |
| --- | --- | --- | --- | --- |
| `MAIL_DRIVER` | low | never | no | `relay` \| `console` \| `sink`. Keep `console` until you have relay creds. |
| `MAIL_PROJECT` | low | never | no | Tenant identity at the relay (the `X-Trinity-Project` tag). |
| `MAIL_FROM` | low | never | no | Default sender — `"Name <email>"` or bare email. |
| `MAIL_FROM_NAME` | low | never | no | Default sender display name. |
| `MAIL_REPLY_TO` | low | never | no | Default Reply-To address. |
| `MAIL_BOUNCE_DOMAIN` | low | never | no | Return-Path subdomain DSNs route to. |
| `RELAY_SMTP_HOST` | low | never | no | SMTP submission host of the shared relay. |
| `RELAY_SMTP_PORT` | low | never | no | `587` (STARTTLS) or `465` (implicit TLS). |
| `RELAY_SMTP_USER` | medium | 90d | yes | Per-project SMTP username (from `trinity-mail init`). |
| `RELAY_SMTP_PASS` | **high** | 90d | yes | Per-project SMTP password — sends on the shared reputation. |
| `RELAY_SMTP_SECURE` | low | never | no | `true` for 465, `false` for 587. |
| `MAIL_OUTBOX_MAX_ATTEMPTS` | low | never | no | Attempts before dead-lettering. |
| `MAIL_OUTBOX_BACKOFF_MS` | low | never | no | Base backoff (exponential + jitter, capped 1h). |
| `MAIL_RATE_MAX` | low | never | no | Max sends per window, per project+stream. |
| `MAIL_RATE_WINDOW_MS` | low | never | no | Rate-limit window length (ms). |
| `DATABASE_URL` | **critical** | 90d | yes | Postgres for the durable outbox + `email_events`. |
| `RELAY_WEBHOOK_SECRET` | **high** | 90d | yes | HMAC secret `mail-webhook` uses to verify relay events. |
| `MAIL_BODY_KEY` | **critical** | 90d | yes | Symmetric key for ciphertext "view in browser" bodies. DSGVO erasure = destroy the key. |

## Scope: this governs the SMTP/app env keys only

`mail-tresor` is the env-governance fragment described in `tresor-env-governance.md`:
schema + `vault.env` + lock + audit, for the mail env block.

The **wrap-key custody for client data — Clausura** — is a *different, future* thing.
Per the tenant-template plan (decision **D-3**), Tresor is being promoted into a
**vault / key-service running on dedicated, network-segmented hardware** that holds
the per-project wrap keys the swarm has no route to. That is **Phase C** and is **not**
built here. This template never touches a wrap key; `MAIL_BODY_KEY` above is the
per-project mail-body cipher key for `mail-webhook`, not the Clausura wrap key.

## Pairs with

`mail-client` (transport) · `mail-templates` (rendering) · `mail-webhook` (events,
bounces, ciphertext bodies) · `mail-dns` (DNS manifest + verify).
