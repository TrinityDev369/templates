/**
 * Trinity Mail — environment contract.
 *
 * Every value here is delivered via Tresor (`npx @trinity369/use mail-tresor`)
 * and documented in `.env.example`. Nothing is hardcoded; nothing carries a secret
 * default. The relay credentials are issued per-app by `trinity-mail init <project>`.
 */
import type { Address } from './lib/types';

export interface RelayConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  /** true → implicit TLS (465); false → STARTTLS (587). */
  secure: boolean;
}

export interface MailConfig {
  /** 'relay' (real send) | 'console' (log only) | 'sink' (drop silently). Default 'console' in dev. */
  driver: 'relay' | 'console' | 'sink';
  /** X-Trinity-Project tag, e.g. 'ozean-licht'. Identifies the tenant at the relay. */
  project: string;
  from: Address;
  replyTo?: Address;
  relay: RelayConfig | null;
  /** Bounce / Return-Path subdomain, e.g. 'bounce.ozean-licht.com'. */
  bounceDomain?: string;
  rate: { max: number; windowMs: number };
  outbox: { maxAttempts: number; baseBackoffMs: number };
}

function addr(value: string | undefined, fallbackName?: string): Address | undefined {
  if (!value) return undefined;
  // "Name <email>" or "email"
  const m = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1] || fallbackName, email: m[2] };
  return { email: value.trim(), name: fallbackName };
}

function int(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Build config from `process.env`. Throws only for the relay driver with missing
 * credentials — console/sink need nothing, so local dev never burns shared reputation.
 */
export function loadMailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig {
  const driver = (env.MAIL_DRIVER as MailConfig['driver']) || 'console';

  const from = addr(env.MAIL_FROM, env.MAIL_FROM_NAME) ?? { email: 'noreply@example.com' };
  if (env.MAIL_FROM_NAME && !from.name) from.name = env.MAIL_FROM_NAME;

  let relay: RelayConfig | null = null;
  if (driver === 'relay') {
    const host = env.RELAY_SMTP_HOST;
    const user = env.RELAY_SMTP_USER;
    const pass = env.RELAY_SMTP_PASS;
    if (!host || !user || !pass) {
      throw new Error(
        'MAIL_DRIVER=relay requires RELAY_SMTP_HOST, RELAY_SMTP_USER, RELAY_SMTP_PASS ' +
          '(issued by `trinity-mail init <project>`). Use MAIL_DRIVER=console for local dev.',
      );
    }
    // Default 465 (implicit TLS, RFC 8314): the Trinity Mail relay serves 465, not 587.
    const port = int(env.RELAY_SMTP_PORT, 465);
    // Honor an explicit RELAY_SMTP_SECURE; otherwise default by port (implicit TLS unless 587).
    const secure =
      env.RELAY_SMTP_SECURE === 'true'
        ? true
        : env.RELAY_SMTP_SECURE === 'false'
          ? false
          : port !== 587;
    relay = { host, port, user, pass, secure };
  }

  return {
    driver,
    project: env.MAIL_PROJECT || 'unknown-project',
    from,
    replyTo: addr(env.MAIL_REPLY_TO),
    relay,
    bounceDomain: env.MAIL_BOUNCE_DOMAIN,
    rate: { max: int(env.MAIL_RATE_MAX, 60), windowMs: int(env.MAIL_RATE_WINDOW_MS, 60_000) },
    outbox: {
      maxAttempts: int(env.MAIL_OUTBOX_MAX_ATTEMPTS, 6),
      baseBackoffMs: int(env.MAIL_OUTBOX_BACKOFF_MS, 30_000),
    },
  };
}
