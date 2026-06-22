import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import { signRelayBody, verifyRelaySignature } from '../webhook/signature';

const SECRET = 'test-relay-secret';
const BODY = JSON.stringify({ type: 'delivered', recipient: 'a@x.dev' });

describe('signature', () => {
  it('verifies a correctly signed body', () => {
    const header = signRelayBody(BODY, SECRET);
    expect(header.startsWith('sha256=')).toBe(true);
    expect(verifyRelaySignature(BODY, header, SECRET)).toBe(true);
  });

  it('verifies the raw Buffer form identically to the string form', () => {
    const header = signRelayBody(BODY, SECRET);
    expect(verifyRelaySignature(Buffer.from(BODY, 'utf8'), header, SECRET)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const header = signRelayBody(BODY, SECRET);
    expect(verifyRelaySignature(BODY + ' ', header, SECRET)).toBe(false);
  });

  it('rejects a wrong secret', () => {
    const header = signRelayBody(BODY, SECRET);
    expect(verifyRelaySignature(BODY, header, 'wrong-secret')).toBe(false);
  });

  it('rejects a missing / malformed header', () => {
    expect(verifyRelaySignature(BODY, null, SECRET)).toBe(false);
    expect(verifyRelaySignature(BODY, undefined, SECRET)).toBe(false);
    expect(verifyRelaySignature(BODY, 'deadbeef', SECRET)).toBe(false); // no sha256= prefix
    expect(verifyRelaySignature(BODY, 'sha256=', SECRET)).toBe(false); // empty digest
    expect(verifyRelaySignature(BODY, 'sha256=zzzz', SECRET)).toBe(false); // non-hex / wrong len
  });

  it('rejects an empty secret', () => {
    const header = signRelayBody(BODY, SECRET);
    expect(verifyRelaySignature(BODY, header, '')).toBe(false);
  });

  it('matches a hand-computed HMAC-SHA256 hex digest', () => {
    const expected = 'sha256=' + createHmac('sha256', SECRET).update(BODY).digest('hex');
    expect(signRelayBody(BODY, SECRET)).toBe(expected);
    expect(verifyRelaySignature(BODY, expected, SECRET)).toBe(true);
  });

  it('accepts an uppercase-hex header (case-insensitive digest)', () => {
    const hex = createHmac('sha256', SECRET).update(BODY).digest('hex').toUpperCase();
    expect(verifyRelaySignature(BODY, `sha256=${hex}`, SECRET)).toBe(true);
  });
});
