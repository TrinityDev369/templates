/**
 * Trinity Mail — relay webhook signature verification.
 *
 * Every relay POST carries `X-Trinity-Signature: sha256=<hex>` — the lowercase-hex
 * HMAC-SHA256 of the RAW request body, keyed by RELAY_WEBHOOK_SECRET (issued per
 * project by `trinity-mail init`, shared with mail-client's env contract).
 *
 * Verify against the *raw* bytes the relay signed — never a re-serialized object
 * (key order / whitespace would diverge). The comparison is timing-safe.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

const PREFIX = 'sha256=';

/**
 * Compute the canonical `sha256=<hex>` signature for a raw body. Exposed so the
 * relay-side emitter and tests can produce a matching header.
 */
export function signRelayBody(rawBody: string | Buffer, secret: string): string {
  const body = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
  const hex = createHmac('sha256', secret).update(body).digest('hex');
  return `${PREFIX}${hex}`;
}

/**
 * Timing-safe verification of `X-Trinity-Signature` against the raw body.
 * Returns false (never throws) on any malformed input — a missing/garbage header,
 * an empty secret, or a length mismatch.
 */
export function verifyRelaySignature(
  rawBody: string | Buffer,
  header: string | null | undefined,
  secret: string,
): boolean {
  if (!header || !secret) return false;
  if (!header.startsWith(PREFIX)) return false;

  const provided = header.slice(PREFIX.length).trim().toLowerCase();
  // A hex SHA-256 digest is always 64 chars; reject anything else before hashing.
  if (!/^[0-9a-f]{64}$/.test(provided)) return false;

  const expected = signRelayBody(rawBody, secret).slice(PREFIX.length);

  const a = Buffer.from(provided, 'hex');
  const b = Buffer.from(expected, 'hex');
  // Equal length by construction (both 32-byte digests), but guard anyway —
  // timingSafeEqual throws on a length mismatch.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
