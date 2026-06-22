import { describe, expect, it } from 'vitest';
import { loadMailConfig } from '../config';
import { createMailClient } from '../sendMail';
import { createMemoryStore } from '../outbox/store';
import { MailRateLimitError } from '../guards';
import type { MailDriver, NormalizedMessage } from '../lib/types';

function captureDriver(): { driver: MailDriver; sent: NormalizedMessage[] } {
  const sent: NormalizedMessage[] = [];
  return {
    sent,
    driver: {
      name: 'capture',
      async deliver(m) {
        sent.push(m);
        return { ok: true, providerMessageId: `cap-${sent.length}` };
      },
    },
  };
}

const baseEnv = { MAIL_DRIVER: 'sink', MAIL_PROJECT: 'test', MAIL_FROM: 'noreply@test.dev' };

function makeClient(envOverrides: Record<string, string> = {}) {
  const config = loadMailConfig({ ...baseEnv, ...envOverrides } as NodeJS.ProcessEnv);
  const cap = captureDriver();
  const client = createMailClient({ store: createMemoryStore(), driver: cap.driver, config });
  return { client, sent: cap.sent };
}

describe('mail-client', () => {
  it('enqueues then delivers a transactional message', async () => {
    const { client, sent } = makeClient();
    const res = await client.send({ to: 'a@x.dev', subject: 'Hi', html: '<p>Hello</p>', category: 'auth' });
    expect(res.deduped).toBe(false);
    expect(res.status).toBe('queued');

    const drained = await client.drain();
    expect(drained.sent).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0].stream).toBe('transactional');
    expect(sent[0].headers['X-Trinity-Project']).toBe('test');
    expect(sent[0].headers['X-Trinity-Category']).toBe('auth');
  });

  it('auto-generates a plain-text alternative from html', async () => {
    const { client, sent } = makeClient();
    await client.send({ to: 'a@x.dev', subject: 'Hi', html: '<p>Hello <b>world</b></p>', category: 'notification' });
    await client.drain();
    expect(sent[0].text).toBe('Hello world');
  });

  it('is idempotent — a duplicate send dedupes and does not double-deliver', async () => {
    const { client, sent } = makeClient();
    const msg = { to: 'a@x.dev', subject: 'Receipt #9', html: '<p>thanks</p>', category: 'receipt' as const, entityRef: 'order:9' };
    const first = await client.send(msg);
    const second = await client.send(msg);
    expect(first.deduped).toBe(false);
    expect(second.deduped).toBe(true);
    expect(second.idempotencyKey).toBe(first.idempotencyKey);

    await client.drain();
    expect(sent).toHaveLength(1);
  });

  it('requires a one-click unsubscribe URL for marketing', async () => {
    const { client } = makeClient();
    await expect(
      client.send({ to: 'a@x.dev', subject: 'News', html: '<p>news</p>', category: 'marketing' }),
    ).rejects.toThrow(/unsubscribeUrl/);
  });

  it('adds RFC 8058 headers for marketing with consent', async () => {
    const config = loadMailConfig({ ...baseEnv } as NodeJS.ProcessEnv);
    const cap = captureDriver();
    const client = createMailClient({
      store: createMemoryStore(),
      driver: cap.driver,
      config,
      consent: { isAllowed: () => true },
    });
    await client.send({
      to: 'a@x.dev',
      subject: 'News',
      html: '<p>news</p>',
      category: 'marketing',
      unsubscribeUrl: 'https://x.dev/u/abc',
    });
    await client.drain();
    expect(cap.sent[0].stream).toBe('marketing');
    expect(cap.sent[0].headers['List-Unsubscribe']).toBe('<https://x.dev/u/abc>');
    expect(cap.sent[0].headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });

  it('enforces the per-project rate limit', async () => {
    const { client } = makeClient({ MAIL_RATE_MAX: '1', MAIL_RATE_WINDOW_MS: '60000' });
    await client.send({ to: 'a@x.dev', subject: 'one', html: '<p>1</p>', category: 'auth' });
    await expect(
      client.send({ to: 'b@x.dev', subject: 'two', html: '<p>2</p>', category: 'auth' }),
    ).rejects.toBeInstanceOf(MailRateLimitError);
  });
});
