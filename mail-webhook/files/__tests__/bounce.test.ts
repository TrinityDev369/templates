import { describe, expect, it } from 'vitest';
import { handleBounceWebhook } from '../webhook/bounce';
import { signRelayBody } from '../webhook/signature';
import { isSuppressed } from '../webhook/suppression';
import { createMemoryStore } from '../webhook/store';
import type { WebhookDeps } from '../webhook/store';
import type { MailBouncePayload } from '../webhook/types';

const SECRET = 'bounce-secret';

function setup(): WebhookDeps {
  return { store: createMemoryStore(), secret: SECRET };
}

function bounce(over: Partial<MailBouncePayload> = {}): MailBouncePayload {
  return {
    type: 'bounce',
    recipient: 'Dead@Example.com',
    bounceType: 'hard',
    project: 'test',
    timestamp: Date.now(),
    ...over,
  };
}

async function post(deps: WebhookDeps, payload: MailBouncePayload) {
  const raw = JSON.stringify(payload);
  return handleBounceWebhook(raw, signRelayBody(raw, SECRET), deps);
}

describe('handleBounceWebhook', () => {
  it('rejects a bad signature', async () => {
    const deps = setup();
    const raw = JSON.stringify(bounce());
    expect((await handleBounceWebhook(raw, 'sha256=bad', deps)).error).toBe('bad_signature');
  });

  it('rejects a malformed payload', async () => {
    const deps = setup();
    const raw = JSON.stringify({ type: 'bounce', recipient: '' });
    const res = await handleBounceWebhook(raw, signRelayBody(raw, SECRET), deps);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('bad_payload');
  });

  it('hard bounce → suppressed (normalized)', async () => {
    const deps = setup();
    const res = await post(deps, bounce({ bounceType: 'hard' }));
    expect(res.suppressed).toBe(true);
    expect(await isSuppressed(deps.store, 'dead@example.com')).toBe(true);
    const s = await deps.store.getSuppression('dead@example.com');
    expect(s?.reason).toBe('hard_bounce');
    expect(s?.source).toBe('bounce_webhook');
  });

  it('soft bounce → NOT suppressed', async () => {
    const deps = setup();
    const res = await post(deps, bounce({ bounceType: 'soft' }));
    expect(res.suppressed).toBe(false);
    expect(await isSuppressed(deps.store, 'dead@example.com')).toBe(false);
  });

  it('complaint → suppressed with reason=complaint', async () => {
    const deps = setup();
    const res = await post(deps, bounce({ type: 'complaint', bounceType: 'complaint' }));
    expect(res.suppressed).toBe(true);
    const s = await deps.store.getSuppression('dead@example.com');
    expect(s?.reason).toBe('complaint');
  });

  it('is idempotent across re-POSTs', async () => {
    const deps = setup();
    const first = await post(deps, bounce());
    const second = await post(deps, bounce());
    expect(first.deduped).toBe(false);
    expect(second.deduped).toBe(true);
    expect(await isSuppressed(deps.store, 'dead@example.com')).toBe(true);
  });
});
