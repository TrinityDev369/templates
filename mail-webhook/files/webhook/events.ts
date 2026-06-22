/**
 * Trinity Mail — delivery-event webhook handler (framework-agnostic core).
 *
 *   handleEventWebhook(rawBody, sigHeader, deps)
 *     → verify HMAC signature (timing-safe)
 *     → parse + validate the JSON payload
 *     → append to email_events (append-only; redelivery is a no-op via UNIQUE key)
 *     → advance email_logs.status by lifecycle ORDER (never regress)
 *     → on hard bounce / complaint, mirror the recipient into mail_suppression
 *
 * Status lifecycle (the high-water mark — status only ever moves forward):
 *   queued(0) < sent(1) < delivered(2)        — the linear path
 *   deferred                                   — transient; recorded but does not
 *                                                advance past sent (a retry is pending)
 *   bounced / complained                       — terminal; always win
 *   opened / clicked                           — ENGAGEMENT; recorded as events but
 *                                                MUST NOT touch status (doctrine: tracking
 *                                                off by default; never regress a status)
 *
 * This is a pure function over (rawBody, signature, deps) — no Next.js, no global
 * state. The route adapters (adapters/next-events-route.ts) are thin wrappers.
 */
import { verifyRelaySignature } from './signature';
import { addSuppression, normalizeRecipient } from './suppression';
import type { WebhookDeps } from './store';
import type { MailEventPayload, MailEventType, MailLogStatus, WebhookResult } from './types';

/** Linear lifecycle ranks. Higher wins; equal/lower never overwrites. */
const RANK: Record<MailLogStatus, number> = {
  queued: 0,
  sent: 1,
  delivered: 2,
  // Off the linear axis — handled specially below, but ranked so comparisons are total.
  deferred: 1,
  bounced: 3,
  complained: 3,
};

/** Terminal failure states — they always win, regardless of current rank. */
const TERMINAL = new Set<MailLogStatus>(['bounced', 'complained']);

/** Engagement events: recorded, but they never touch email_logs.status. */
const ENGAGEMENT = new Set<MailEventType>(['opened', 'clicked']);

const KNOWN_TYPES = new Set<MailEventType>([
  'queued',
  'sent',
  'delivered',
  'deferred',
  'bounced',
  'complained',
  'opened',
  'clicked',
]);

function badPayload(): WebhookResult {
  return { ok: false, error: 'bad_payload' };
}

function parsePayload(rawBody: string): MailEventPayload | null {
  let obj: unknown;
  try {
    obj = JSON.parse(rawBody);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;
  const p = obj as Record<string, unknown>;
  if (
    typeof p.type !== 'string' ||
    !KNOWN_TYPES.has(p.type as MailEventType) ||
    typeof p.idempotencyKey !== 'string' ||
    !p.idempotencyKey ||
    typeof p.project !== 'string' ||
    !p.project ||
    typeof p.recipient !== 'string' ||
    !p.recipient ||
    (typeof p.timestamp !== 'string' && typeof p.timestamp !== 'number')
  ) {
    return null;
  }
  return obj as MailEventPayload;
}

function toEpochMs(ts: string | number): number {
  if (typeof ts === 'number') return ts;
  const n = Date.parse(ts);
  return Number.isNaN(n) ? Date.now() : n;
}

/**
 * Resolve the new email_logs status given the current one and the incoming event.
 * Returns null when the event must NOT change status (engagement, or a non-advancing
 * event). `deferred` is recorded as a status only while still pre-delivery.
 */
export function nextStatus(
  current: MailLogStatus | null,
  type: MailEventType,
): MailLogStatus | null {
  if (ENGAGEMENT.has(type)) return null; // opened/clicked never move status
  const incoming = type as MailLogStatus; // remaining types map 1:1 onto MailLogStatus

  if (current === null) return incoming; // first event seeds the row

  // A terminal state, once set, is sticky — nothing reopens it.
  if (TERMINAL.has(current)) return null;

  // Terminal incoming always wins.
  if (TERMINAL.has(incoming)) return incoming;

  // `deferred` is transient: only record it if we haven't progressed past 'sent'.
  // (A delivered message that later defers is nonsense; ignore it.)
  if (incoming === 'deferred') {
    return RANK[current] <= RANK.sent ? 'deferred' : null;
  }

  // A prior 'deferred' should yield to forward linear progress (sent/delivered).
  if (current === 'deferred') {
    return RANK[incoming] >= RANK.sent ? incoming : null;
  }

  // Linear monotonic advance — never regress.
  return RANK[incoming] > RANK[current] ? incoming : null;
}

export async function handleEventWebhook(
  rawBody: string | Buffer,
  sigHeader: string | null | undefined,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

  if (!verifyRelaySignature(rawBody, sigHeader, deps.secret)) {
    return { ok: false, error: 'bad_signature' };
  }

  const payload = parsePayload(bodyStr);
  if (!payload) return badPayload();

  const recipient = normalizeRecipient(payload.recipient);
  const occurredAt = toEpochMs(payload.timestamp);
  const { store } = deps;

  // 1) Append the fact (idempotent — redelivery is a no-op).
  const { created } = await store.appendEvent({
    idempotencyKey: payload.idempotencyKey,
    type: payload.type,
    recipient,
    reason: payload.reason,
    occurredAt,
    raw: payload,
  });

  // 2) Ensure the message log row exists, keyed on the message's idempotency key —
  //    the same key mail-client wrote to its outbox, so the tenant can correlate a
  //    delivery back to the message it sent. providerMessageId is just a stored fact.
  const logKey = payload.idempotencyKey;
  await store.ensureLog({
    idempotencyKey: logKey,
    project: payload.project,
    category: payload.category,
    recipient,
    providerMessageId: payload.providerMessageId,
  });

  // If we've already processed this exact event, don't re-advance/re-suppress.
  if (!created) {
    const existing = await store.getLog(logKey);
    return { ok: true, deduped: true, status: existing?.status };
  }

  // 3) Advance status by lifecycle order (engagement events return null → no change).
  const current = (await store.getLog(logKey))?.status ?? null;
  const advanced = nextStatus(current, payload.type);
  if (advanced && advanced !== current) {
    await store.setLogStatus(logKey, advanced, payload.providerMessageId);
  }

  // 4) Suppress on a hard bounce or a complaint.
  let suppressed = false;
  if (payload.type === 'bounced' && isHardBounce(payload.reason)) {
    await addSuppression(store, recipient, 'hard_bounce', 'events_webhook');
    suppressed = true;
  } else if (payload.type === 'complained') {
    await addSuppression(store, recipient, 'complaint', 'events_webhook');
    suppressed = true;
  }

  const finalStatus = (await store.getLog(logKey))?.status;
  return { ok: true, deduped: false, status: finalStatus, suppressed };
}

/**
 * A `bounced` event is suppression-worthy only when it's a HARD bounce. The relay
 * tags soft/transient bounces too; those should NOT suppress (they retry). We treat
 * an explicit soft/transient/deferred reason as a soft bounce and EVERYTHING ELSE
 * (including an absent reason) as hard — fail closed so a mystery bounce suppresses.
 */
export function isHardBounce(reason?: string): boolean {
  if (!reason) return true;
  return !/\b(soft|transient|temporary|deferred|greylist|throttl|rate)/i.test(reason);
}
