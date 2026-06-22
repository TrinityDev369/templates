// ─── Trinity Mail — Tresor schema fragment ───────────────────────────────────
// A mergeable fragment for the project's `tresor/tresor.config.ts`. It declares
// every env key the Trinity Mail tenant family reads (mail-client, mail-webhook),
// with its risk level, rotation policy, a validation regex, and whether the value
// is a secret (must never be committed / printed).
//
// Self-contained: NO `@trinity/*` imports. Spread `mailSecrets` into your project
// schema's `keys` (or equivalent) — see README.md.
//
// NOTE: This fragment governs only the SMTP / app env keys. The per-project
// wrap-key custody (Clausura) belongs to the future Tresor-vault on dedicated
// hardware (Phase C, plan D-3) — it is intentionally NOT modelled here.

/** Blast-radius taxonomy (matches tresor-env-governance.md §"Risk taxonomy"). */
export type TresorRisk = 'critical' | 'high' | 'medium' | 'low';

/** How often a key must be rotated; `never` for non-secret config. */
export type TresorRotation = '30d' | '90d' | '180d' | '365d' | 'never';

/** One key's governance metadata. */
export interface TresorKeySpec {
  /** Blast radius if this value leaks. */
  risk: TresorRisk;
  /** Rotation cadence Tresor tracks + warns against. */
  rotation: TresorRotation;
  /**
   * Regex a value must satisfy (validated by `tresor doctor`).
   * `null` when no meaningful shape can be asserted (free-form / human text).
   */
  pattern: RegExp | null;
  /** Human-readable purpose of the key. */
  description: string;
  /** True if the value is a secret — never committed, never logged. */
  secret: boolean;
}

/** A mergeable map of mail env keys → governance metadata. */
export type TresorKeyMap = Record<string, TresorKeySpec>;

/**
 * The Trinity Mail env contract, governed.
 *
 * Spread into your `tresor.config.ts`:
 *   import { mailSecrets } from './mail.tresor';
 *   export const config = { keys: { ...mailSecrets, ...otherProjectKeys } };
 */
export const mailSecrets = {
  // ── Driver + tenant identity ───────────────────────────────────────────────
  MAIL_DRIVER: {
    risk: 'low',
    rotation: 'never',
    pattern: /^(relay|console|sink)$/,
    description:
      "Transport driver. 'console'/'sink' for safe local dev (no network); 'relay' only with real credentials.",
    secret: false,
  },
  MAIL_PROJECT: {
    risk: 'low',
    rotation: 'never',
    pattern: /^[a-z0-9][a-z0-9-]*$/,
    description: 'Tenant identity at the relay — the X-Trinity-Project tag (lowercase slug).',
    secret: false,
  },

  // ── Sender identity ────────────────────────────────────────────────────────
  MAIL_FROM: {
    risk: 'low',
    rotation: 'never',
    pattern: /.+@.+\..+/,
    description: 'Default sender. "Name <email>" or bare "email".',
    secret: false,
  },
  MAIL_FROM_NAME: {
    risk: 'low',
    rotation: 'never',
    pattern: null, // free-form display name
    description: 'Default sender display name.',
    secret: false,
  },
  MAIL_REPLY_TO: {
    risk: 'low',
    rotation: 'never',
    pattern: /.+@.+\..+/,
    description: 'Default Reply-To address.',
    secret: false,
  },
  MAIL_BOUNCE_DOMAIN: {
    risk: 'low',
    rotation: 'never',
    pattern: /^[a-z0-9.-]+\.[a-z]{2,}$/,
    description: 'Bounce / Return-Path subdomain — DSNs route here for central processing.',
    secret: false,
  },

  // ── Relay SMTP (only used when MAIL_DRIVER=relay) ───────────────────────────
  RELAY_SMTP_HOST: {
    risk: 'low',
    rotation: 'never',
    pattern: /^[a-z0-9.-]+\.[a-z]{2,}$/,
    description: 'SMTP submission host of the shared Trinity Mail relay.',
    secret: false,
  },
  RELAY_SMTP_PORT: {
    risk: 'low',
    rotation: 'never',
    pattern: /^\d{1,5}$/,
    description: 'SMTP submission port — 587 (STARTTLS) or 465 (implicit TLS).',
    secret: false,
  },
  RELAY_SMTP_USER: {
    risk: 'medium',
    rotation: '90d',
    pattern: /^.+$/,
    description: 'Per-project SMTP submission username, issued by `trinity-mail init`.',
    secret: true,
  },
  RELAY_SMTP_PASS: {
    risk: 'high',
    rotation: '90d',
    pattern: /^.+$/,
    description: 'Per-project SMTP submission password — sends mail on the shared reputation.',
    secret: true,
  },
  RELAY_SMTP_SECURE: {
    risk: 'low',
    rotation: 'never',
    pattern: /^(true|false)$/,
    description: 'Implicit TLS toggle — true for port 465, false for 587 STARTTLS.',
    secret: false,
  },

  // ── Outbox + guardrails ────────────────────────────────────────────────────
  MAIL_OUTBOX_MAX_ATTEMPTS: {
    risk: 'low',
    rotation: 'never',
    pattern: /^\d+$/,
    description: 'Max delivery attempts before a message is dead-lettered.',
    secret: false,
  },
  MAIL_OUTBOX_BACKOFF_MS: {
    risk: 'low',
    rotation: 'never',
    pattern: /^\d+$/,
    description: 'Base backoff in ms (exponential with jitter, capped at 1h).',
    secret: false,
  },
  MAIL_RATE_MAX: {
    risk: 'low',
    rotation: 'never',
    pattern: /^\d+$/,
    description: 'Max sends per window, per project+stream.',
    secret: false,
  },
  MAIL_RATE_WINDOW_MS: {
    risk: 'low',
    rotation: 'never',
    pattern: /^\d+$/,
    description: 'Rate-limit window length in ms.',
    secret: false,
  },

  // ── Datastores + shared secrets ─────────────────────────────────────────────
  DATABASE_URL: {
    risk: 'critical',
    rotation: '90d',
    pattern: /^postgres(ql)?:\/\/.+/,
    description: 'Postgres connection string for the durable outbox + email_events store.',
    secret: true,
  },
  RELAY_WEBHOOK_SECRET: {
    risk: 'high',
    rotation: '90d',
    pattern: /^.{16,}$/,
    description:
      'HMAC secret shared with mail-webhook to verify inbound relay delivery/bounce events. Issued by `trinity-mail init`.',
    secret: true,
  },
  MAIL_BODY_KEY: {
    risk: 'critical',
    rotation: '90d',
    pattern: /^[A-Za-z0-9+/=_-]{32,}$/,
    description:
      'Symmetric key used by mail-webhook to encrypt retained message bodies as crypto-shreddable ciphertext ("view in browser"). DSGVO erasure = destroy the key.',
    secret: true,
  },
} satisfies TresorKeyMap;

/** The exact set of keys this fragment governs (handy for audits / tests). */
export const mailSecretKeys = Object.keys(mailSecrets) as Array<keyof typeof mailSecrets>;

export default mailSecrets;
