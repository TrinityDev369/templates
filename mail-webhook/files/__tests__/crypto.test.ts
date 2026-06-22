import { describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { decryptBody, encryptBody, loadBodyKey } from '../webhook/crypto';

const KEY = randomBytes(32);
const BODY = '<html><body><h1>Dein Beleg</h1><p>Danke für deine Bestellung.</p></body></html>';

describe('crypto — AES-256-GCM body storage', () => {
  it('round-trips a body', () => {
    const enc = encryptBody(BODY, KEY);
    expect(Buffer.from(enc.ciphertext).equals(Buffer.from(BODY, 'utf8'))).toBe(false); // actually encrypted
    expect(decryptBody(enc, KEY)).toBe(BODY);
  });

  it('produces a fresh IV per call (no nonce reuse)', () => {
    const a = encryptBody(BODY, KEY);
    const b = encryptBody(BODY, KEY);
    expect(Buffer.from(a.iv).equals(Buffer.from(b.iv))).toBe(false);
    expect(Buffer.from(a.ciphertext).equals(Buffer.from(b.ciphertext))).toBe(false);
  });

  it('CRYPTO-SHRED: a lost/destroyed key makes the body undecryptable', () => {
    const enc = encryptBody(BODY, KEY);
    const shreddedKey = randomBytes(32); // the per-message key is gone; a different key cannot decrypt
    expect(() => decryptBody(enc, shreddedKey)).toThrow();
  });

  it('rejects tampered ciphertext (GCM auth failure)', () => {
    const enc = encryptBody(BODY, KEY);
    const tampered = { ...enc, ciphertext: Uint8Array.from(enc.ciphertext) };
    tampered.ciphertext[0] ^= 0xff;
    expect(() => decryptBody(tampered, KEY)).toThrow();
  });

  it('rejects a tampered auth tag', () => {
    const enc = encryptBody(BODY, KEY);
    const tampered = { ...enc, tag: Uint8Array.from(enc.tag) };
    tampered.tag[0] ^= 0xff;
    expect(() => decryptBody(tampered, KEY)).toThrow();
  });

  it('rejects a wrong-length key', () => {
    expect(() => encryptBody(BODY, randomBytes(16))).toThrow();
  });
});

describe('crypto — loadBodyKey from env', () => {
  it('loads a valid base64 32-byte key', () => {
    const env = { MAIL_BODY_KEY: randomBytes(32).toString('base64') } as NodeJS.ProcessEnv;
    expect(loadBodyKey(env).length).toBe(32);
  });

  it('throws when MAIL_BODY_KEY is absent', () => {
    expect(() => loadBodyKey({} as NodeJS.ProcessEnv)).toThrow(/MAIL_BODY_KEY/);
  });

  it('throws on a wrong-length key', () => {
    const env = { MAIL_BODY_KEY: randomBytes(16).toString('base64') } as NodeJS.ProcessEnv;
    expect(() => loadBodyKey(env)).toThrow(/32 bytes/);
  });

  it('a key loaded from env round-trips with encrypt/decrypt', () => {
    const env = { MAIL_BODY_KEY: KEY.toString('base64') } as NodeJS.ProcessEnv;
    const key = loadBodyKey(env);
    expect(decryptBody(encryptBody(BODY, key), key)).toBe(BODY);
  });
});
