/**
 * Trinity Mail — local suppression mirror.
 *
 * The relay holds the authoritative GLOBAL suppression list (it alone sees every
 * tenant's bounces). This is the tenant-local check-before-send mirror, populated
 * from hard bounces + complaints arriving on the webhooks. Always gate a send on
 * `isSuppressed(recipient)` first — sending to a known-bad address burns the shared
 * relay reputation for every tenant.
 *
 * Recipients are normalized (trimmed + lowercased) so a casing/whitespace variant
 * can't slip a suppressed address past the check.
 */
import type { WebhookStore } from './store';
import type { SuppressionEntry, SuppressionReason, SuppressionSource } from './types';

/** Canonical recipient form used as the suppression key everywhere. */
export function normalizeRecipient(recipient: string): string {
  return recipient.trim().toLowerCase();
}

/** Check-before-send gate. Call this before every `mail.send(...)`. */
export async function isSuppressed(store: WebhookStore, recipient: string): Promise<boolean> {
  return store.isSuppressed(normalizeRecipient(recipient));
}

/** Add a recipient to the local suppression mirror (idempotent). */
export async function addSuppression(
  store: WebhookStore,
  recipient: string,
  reason: SuppressionReason,
  source: SuppressionSource,
): Promise<void> {
  await store.suppress(normalizeRecipient(recipient), reason, source);
}

/**
 * Remove a recipient from the local mirror (e.g. a confirmed re-opt-in). This only
 * clears the LOCAL copy — the relay's global list is authoritative and may re-add.
 */
export async function removeSuppression(store: WebhookStore, recipient: string): Promise<void> {
  await store.unsuppress(normalizeRecipient(recipient));
}

/** Read a suppression entry's detail, if present. */
export async function getSuppression(
  store: WebhookStore,
  recipient: string,
): Promise<SuppressionEntry | null> {
  return store.getSuppression(normalizeRecipient(recipient));
}
