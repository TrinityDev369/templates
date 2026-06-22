/**
 * Trinity Mail — crypto-shreddable body storage.
 *
 * A retained rendered body ("view in browser") is NEVER stored as plaintext
 * (doctrine: subjects/bodies are content). It is encrypted with AES-256-GCM and
 * the ciphertext + iv + tag are what reach the database. DSGVO erasure =
 * "crypto-shred" = destroy the key (and/or the row), after which the ciphertext is
 * mathematically undecryptable — no DELETE-and-hope.
 *
 * Key source (Phase A): env `MAIL_BODY_KEY` — a 32-byte key, base64-encoded.
 *   Generate one with:  openssl rand -base64 32
 *
 * KEY GRADUATION (Phase C): the body key moves into the Tresor vault (D-3) on its
 * dedicated, swarm-walled server. `loadBodyKey()` is the single seam to repoint at
 * the vault — keep callers passing an explicit key in (do not read env elsewhere),
 * and per-message keys (a fresh key per body, wrapped by the project key) become a
 * drop-in: crypto-shred one message by destroying its wrapped key, not the whole
 * project key.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { EncryptedBody } from './types';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit nonce — the GCM standard
const KEY_BYTES = 32; // AES-256

/**
 * Decode a base64 32-byte key. Throws on a wrong-length or absent key — a
 * misconfigured key must fail loud, never silently store recoverable plaintext.
 */
export function loadBodyKey(env: NodeJS.ProcessEnv = process.env): Buffer {
  const raw = env.MAIL_BODY_KEY;
  if (!raw) {
    throw new Error(
      'MAIL_BODY_KEY is not set. Generate one with `openssl rand -base64 32`. ' +
        '(Phase C: this key graduates to the Tresor vault.)',
    );
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `MAIL_BODY_KEY must decode to ${KEY_BYTES} bytes (got ${key.length}). Use \`openssl rand -base64 32\`.`,
    );
  }
  return key;
}

/** Encrypt a UTF-8 body into crypto-shreddable AES-256-GCM ciphertext. */
export function encryptBody(plaintext: string, key: Buffer): EncryptedBody {
  if (key.length !== KEY_BYTES) {
    throw new Error(`encryptBody: key must be ${KEY_BYTES} bytes (got ${key.length}).`);
  }
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext, iv, tag };
}

/**
 * Decrypt a body. Throws if the key is wrong/destroyed or the ciphertext/tag was
 * tampered with (GCM auth failure) — which is exactly the "crypto-shred" property:
 * once the key is gone the body is unrecoverable.
 */
export function decryptBody(enc: EncryptedBody, key: Buffer): string {
  if (key.length !== KEY_BYTES) {
    throw new Error(`decryptBody: key must be ${KEY_BYTES} bytes (got ${key.length}).`);
  }
  const decipher = createDecipheriv(ALGO, key, toBuffer(enc.iv));
  decipher.setAuthTag(toBuffer(enc.tag));
  const out = Buffer.concat([decipher.update(toBuffer(enc.ciphertext)), decipher.final()]);
  return out.toString('utf8');
}

function toBuffer(v: Uint8Array): Buffer {
  return Buffer.isBuffer(v) ? v : Buffer.from(v);
}
