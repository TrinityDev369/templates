/**
 * Trinity Mail — bounce/complaint webhook handler (framework-agnostic core).
 *
 *   handleBounceWebhook(rawBody, sigHeader, deps)
 *     → verify HMAC signature (timing-safe)
 *     → parse + validate the JSON payload
 *     → mirror the recipient into mail_suppression
 *
 * This is the dedicated suppression endpoint (`POST /api/mail/bounce`) the relay POSTs
 * to from its bounce + FBL/ARF complaint ingestion. A `hard` bounce or a `complaint`
 * suppresses; a `soft` bounce is transient (a retry is in flight) and is NOT
 * suppressed — suppressing on soft bounces would needlessly burn deliverable contacts.
 *
 * Pure function over (rawBody, signature, deps) — the route adapter is a thin wrapper.
 */
import { verifyRelaySignature } from './signature';
import { addSuppression, normalizeRecipient } from './suppression';
import type { WebhookDeps } from './store';
import type { MailBouncePayload, SuppressionReason, WebhookResult } from './types';

function parsePayload(rawBody: string): MailBouncePayload | null {
  let obj: unknown;
  try {
    obj = JSON.parse(rawBody);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;
  const p = obj as Record<string, unknown>;
  if (
    (p.type !== 'bounce' && p.type !== 'complaint') ||
    typeof p.recipient !== 'string' ||
    !p.recipient ||
    (p.bounceType !== 'hard' && p.bounceType !== 'soft' && p.bounceType !== 'complaint') ||
    typeof p.project !== 'string' ||
    !p.project ||
    (typeof p.timestamp !== 'string' && typeof p.timestamp !== 'number')
  ) {
    return null;
  }
  return obj as MailBouncePayload;
}

export async function handleBounceWebhook(
  rawBody: string | Buffer,
  sigHeader: string | null | undefined,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

  if (!verifyRelaySignature(rawBody, sigHeader, deps.secret)) {
    return { ok: false, error: 'bad_signature' };
  }

  const payload = parsePayload(bodyStr);
  if (!payload) return { ok: false, error: 'bad_payload' };

  const recipient = normalizeRecipient(payload.recipient);

  // Soft bounces are transient — record nothing in suppression; the message retries.
  if (payload.bounceType === 'soft') {
    return { ok: true, suppressed: false };
  }

  const reason: SuppressionReason =
    payload.bounceType === 'complaint' || payload.type === 'complaint'
      ? 'complaint'
      : 'hard_bounce';

  // Idempotent — re-POSTing the same bounce keeps the existing entry.
  const already = await deps.store.isSuppressed(recipient);
  await addSuppression(deps.store, recipient, reason, 'bounce_webhook');

  return { ok: true, suppressed: true, deduped: already };
}
