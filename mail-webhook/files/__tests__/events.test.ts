import { describe, expect, it } from 'vitest';
import { handleEventWebhook, nextStatus } from '../webhook/events';
import { signRelayBody } from '../webhook/signature';
import { createMemoryStore } from '../webhook/store';
import type { WebhookDeps } from '../webhook/store';
import type { MailEventPayload, MailEventType } from '../webhook/types';

const SECRET = 'evt-secret';
const MSG_KEY = 'msg-key-1'; // the message's idempotency key (shared across its events)
const MSG_ID = 'relay-msg-1'; // the relay/MTA Message-ID (a stored fact, not the key)

function setup(): WebhookDeps {
  return { store: createMemoryStore(), secret: SECRET };
}

// One message: its lifecycle events SHARE one idempotencyKey and differ by type.
function event(type: MailEventType, over: Partial<MailEventPayload> = {}): MailEventPayload {
  return {
    type,
    idempotencyKey: over.idempotencyKey ?? MSG_KEY,
    providerMessageId: MSG_ID,
    project: 'test',
    category: 'auth',
    recipient: 'Member@Example.com',
    timestamp: new Date().toISOString(),
    ...over,
  };
}

async function post(deps: WebhookDeps, payload: MailEventPayload) {
  const raw = JSON.stringify(payload);
  return handleEventWebhook(raw, signRelayBody(raw, SECRET), deps);
}

describe('handleEventWebhook — signature', () => {
  it('rejects an unsigned / wrongly-signed event', async () => {
    const deps = setup();
    const raw = JSON.stringify(event('delivered'));
    expect((await handleEventWebhook(raw, 'sha256=bad', deps)).error).toBe('bad_signature');
    expect((await handleEventWebhook(raw, null, deps)).error).toBe('bad_signature');
  });

  it('rejects a malformed payload (valid signature, bad body)', async () => {
    const deps = setup();
    const raw = JSON.stringify({ type: 'not-a-type', recipient: 'x' });
    const res = await handleEventWebhook(raw, signRelayBody(raw, SECRET), deps);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('bad_payload');
  });
});

describe('handleEventWebhook — status lifecycle', () => {
  it('advances queued → sent → delivered monotonically', async () => {
    const deps = setup();
    expect((await post(deps, event('queued'))).status).toBe('queued');
    expect((await post(deps, event('sent'))).status).toBe('sent');
    expect((await post(deps, event('delivered'))).status).toBe('delivered');
  });

  it('never regresses: a late "sent" after "delivered" leaves delivered', async () => {
    const deps = setup();
    await post(deps, event('delivered'));
    const res = await post(deps, event('sent'));
    expect(res.status).toBe('delivered');
  });

  it('records opened/clicked as events but never moves status', async () => {
    const deps = setup();
    await post(deps, event('delivered'));
    const opened = await post(deps, event('opened'));
    const clicked = await post(deps, event('clicked'));
    expect(opened.status).toBe('delivered');
    expect(clicked.status).toBe('delivered');
  });

  it('opened/clicked before any delivery status seeds the row but does not set an engagement status', async () => {
    const deps = setup();
    // First event for the message is an open — log row is created, status stays queued default.
    const res = await post(deps, event('opened'));
    expect(res.ok).toBe(true);
    const log = await deps.store.getLog(MSG_KEY);
    expect(log?.status).toBe('queued');
  });

  it('deferred is recorded pre-delivery, then yields to forward progress', async () => {
    const deps = setup();
    await post(deps, event('sent'));
    expect((await post(deps, event('deferred'))).status).toBe('deferred');
    // A subsequent delivered overtakes the transient defer.
    expect((await post(deps, event('delivered'))).status).toBe('delivered');
  });

  it('deferred after delivered is ignored (no regression)', async () => {
    const deps = setup();
    await post(deps, event('delivered'));
    expect((await post(deps, event('deferred'))).status).toBe('delivered');
  });

  it('bounced is terminal and sticky', async () => {
    const deps = setup();
    await post(deps, event('sent'));
    expect((await post(deps, event('bounced', { reason: 'mailbox does not exist' }))).status).toBe(
      'bounced',
    );
    // Nothing reopens a terminal state.
    expect((await post(deps, event('delivered'))).status).toBe('bounced');
  });

  it('is idempotent: a redelivered event with the same key is a no-op', async () => {
    const deps = setup();
    const e = event('delivered');
    const first = await post(deps, e);
    const second = await post(deps, e);
    expect(first.deduped).toBe(false);
    expect(second.deduped).toBe(true);
    expect(second.status).toBe('delivered');
  });
});

describe('handleEventWebhook — suppression', () => {
  it('hard bounce → recipient suppressed (normalized lowercase)', async () => {
    const deps = setup();
    const res = await post(deps, event('bounced', { reason: '550 user unknown' }));
    expect(res.suppressed).toBe(true);
    expect(await deps.store.isSuppressed('member@example.com')).toBe(true);
  });

  it('a soft/transient bounce does NOT suppress', async () => {
    const deps = setup();
    const res = await post(deps, event('bounced', { reason: 'temporary deferral, greylisted' }));
    expect(res.suppressed).toBeFalsy();
    expect(await deps.store.isSuppressed('member@example.com')).toBe(false);
  });

  it('complained → recipient suppressed', async () => {
    const deps = setup();
    const res = await post(deps, event('complained'));
    expect(res.suppressed).toBe(true);
    const s = await deps.store.getSuppression('member@example.com');
    expect(s?.reason).toBe('complaint');
    expect(s?.source).toBe('events_webhook');
  });
});

describe('nextStatus (unit)', () => {
  it('engagement events always return null', () => {
    expect(nextStatus('delivered', 'opened')).toBeNull();
    expect(nextStatus('queued', 'clicked')).toBeNull();
  });

  it('terminal states are sticky', () => {
    expect(nextStatus('bounced', 'delivered')).toBeNull();
    expect(nextStatus('complained', 'sent')).toBeNull();
  });

  it('first event seeds the status', () => {
    expect(nextStatus(null, 'sent')).toBe('sent');
  });
});
