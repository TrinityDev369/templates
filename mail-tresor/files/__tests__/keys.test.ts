import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mailSecrets, mailSecretKeys, type TresorKeySpec } from '../mail.tresor';

// The single source of truth: the exact env keys the Trinity Mail tenant family
// reads. If this list and `mailSecrets` ever drift, the contract is broken.
const EXPECTED_KEYS = [
  'MAIL_DRIVER',
  'MAIL_PROJECT',
  'MAIL_FROM',
  'MAIL_FROM_NAME',
  'MAIL_REPLY_TO',
  'MAIL_BOUNCE_DOMAIN',
  'RELAY_SMTP_HOST',
  'RELAY_SMTP_PORT',
  'RELAY_SMTP_USER',
  'RELAY_SMTP_PASS',
  'RELAY_SMTP_SECURE',
  'MAIL_OUTBOX_MAX_ATTEMPTS',
  'MAIL_OUTBOX_BACKOFF_MS',
  'MAIL_RATE_MAX',
  'MAIL_RATE_WINDOW_MS',
  'DATABASE_URL',
  'RELAY_WEBHOOK_SECRET',
  'MAIL_BODY_KEY',
] as const;

const VALID_RISK = new Set(['critical', 'high', 'medium', 'low']);
const VALID_ROTATION = new Set(['30d', '90d', '180d', '365d', 'never']);

// `satisfies TresorKeyMap` keeps literal types, so reading values directly off
// `mailSecrets` narrows risk/rotation to a single literal and tsc would flag the
// runtime guards below as provably-false comparisons. Read through the widened
// `TresorKeySpec` interface so the guards stay genuine runtime checks.
const specEntries: Array<[string, TresorKeySpec]> = Object.entries(mailSecrets);

describe('mailSecrets — key coverage', () => {
  const actual = Object.keys(mailSecrets).sort();
  const expected = [...EXPECTED_KEYS].sort();

  it('covers exactly the documented key set (no missing, no extra)', () => {
    expect(actual).toEqual(expected);
  });

  it('has no missing keys', () => {
    const missing = expected.filter((k) => !actual.includes(k));
    expect(missing).toEqual([]);
  });

  it('has no extra keys', () => {
    const extra = actual.filter((k) => !expected.includes(k as (typeof expected)[number]));
    expect(extra).toEqual([]);
  });

  it('exports mailSecretKeys consistent with mailSecrets', () => {
    expect([...mailSecretKeys].sort()).toEqual(actual);
  });
});

describe('mailSecrets — well-formed specs', () => {
  for (const [key, spec] of Object.entries(mailSecrets) as Array<[string, TresorKeySpec]>) {
    describe(key, () => {
      it('has a valid risk level', () => {
        expect(VALID_RISK.has(spec.risk)).toBe(true);
      });
      it('has a valid rotation policy', () => {
        expect(VALID_ROTATION.has(spec.rotation)).toBe(true);
      });
      it('has a non-empty description', () => {
        expect(spec.description.length).toBeGreaterThan(0);
      });
      it('has a boolean secret flag', () => {
        expect(typeof spec.secret).toBe('boolean');
      });
      it('has a RegExp or null pattern', () => {
        expect(spec.pattern === null || spec.pattern instanceof RegExp).toBe(true);
      });
    });
  }
});

describe('mailSecrets — governance invariants', () => {
  it('secret keys never declare rotation "never"', () => {
    const offenders = specEntries
      .filter(([, s]) => s.secret && s.rotation === 'never')
      .map(([k]) => k);
    expect(offenders).toEqual([]);
  });

  it('non-secret config keys are not classified critical/high', () => {
    const offenders = specEntries
      .filter(([, s]) => !s.secret && (s.risk === 'critical' || s.risk === 'high'))
      .map(([k]) => k);
    expect(offenders).toEqual([]);
  });

  it('the high/secret keys are classified as secrets', () => {
    for (const k of ['RELAY_SMTP_PASS', 'RELAY_WEBHOOK_SECRET', 'MAIL_BODY_KEY', 'DATABASE_URL']) {
      expect(mailSecrets[k as keyof typeof mailSecrets].secret).toBe(true);
    }
  });
});

describe('mail.env.example — parity with schema', () => {
  const examplePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'mail.env.example');
  const example = readFileSync(examplePath, 'utf8');

  // Keys that appear as `KEY=...` lines in the example.
  const exampleKeys = example
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))
    .map((l) => l.split('=')[0].trim())
    .filter(Boolean);

  it('declares every schema key in the example file', () => {
    const missingFromExample = Object.keys(mailSecrets).filter((k) => !exampleKeys.includes(k));
    expect(missingFromExample).toEqual([]);
  });

  it('introduces no env key the schema does not govern', () => {
    const ungoverned = exampleKeys.filter((k) => !(k in mailSecrets));
    expect(ungoverned).toEqual([]);
  });
});
