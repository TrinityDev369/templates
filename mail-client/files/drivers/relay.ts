/**
 * Trinity Mail — relay SMTP driver (the real send path).
 *
 * Pooled submission to the Trinity Mail relay over 587 (STARTTLS) or 465 (implicit
 * TLS), authenticated with per-app credentials issued by `trinity-mail init`. The
 * relay does DKIM signing, egress, and the central fact-log; this driver just hands
 * it an authenticated, well-formed message.
 */
import nodemailer, { type Transporter } from 'nodemailer';
import type { RelayConfig, MailConfig } from '../config';
import type { DeliveryResult, MailDriver, NormalizedMessage } from '../lib/types';

function formatAddress(a: { email: string; name?: string }): string {
  return a.name ? `${a.name} <${a.email}>` : a.email;
}

/** 4xx SMTP and connection-level faults are transient; 5xx is permanent. */
function isRetriable(err: unknown): boolean {
  const e = err as { responseCode?: number; code?: string };
  if (typeof e?.responseCode === 'number') return e.responseCode >= 400 && e.responseCode < 500;
  const transientCodes = new Set(['ETIMEDOUT', 'ECONNECTION', 'ECONNRESET', 'ESOCKET', 'EDNS', 'EAI_AGAIN']);
  return e?.code ? transientCodes.has(e.code) : true; // unknown → retry (at-least-once)
}

export function createRelayDriver(relay: RelayConfig, config: MailConfig): MailDriver {
  const transporter: Transporter = nodemailer.createTransport({
    host: relay.host,
    port: relay.port,
    secure: relay.secure,
    auth: { user: relay.user, pass: relay.pass },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
    requireTLS: !relay.secure, // force STARTTLS on 587 — never plaintext SMTP
  });

  return {
    name: 'relay',
    async deliver(message: NormalizedMessage): Promise<DeliveryResult> {
      try {
        const info = await transporter.sendMail({
          from: formatAddress(message.from),
          to: message.to.map(formatAddress),
          replyTo: message.replyTo ? formatAddress(message.replyTo) : undefined,
          subject: message.subject,
          html: message.html,
          text: message.text,
          // Headers (X-Trinity-* + List-Unsubscribe) are built during normalization.
          headers: message.headers,
          // Route bounces to the relay's Return-Path so DSNs are processed centrally.
          envelope: config.bounceDomain
            ? { from: `bounces@${config.bounceDomain}`, to: message.to.map((a) => a.email) }
            : undefined,
        });
        return { ok: true, providerMessageId: info.messageId };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
          retriable: isRetriable(err),
        };
      }
    },
    async close() {
      transporter.close();
    },
  };
}
