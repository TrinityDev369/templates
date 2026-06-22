/**
 * Trinity Mail — mail-webhook (public surface).
 *
 * Installed by `npx @trinity369/use mail-webhook` into `src/mail`. Self-contained;
 * pairs with mail-client (transport), mail-templates (rendering), mail-dns (DNS),
 * and mail-tresor (env contract).
 *
 * Receives the relay's signature-verified delivery-lifecycle webhooks, advances a
 * local email_logs/email_events view, and mirrors hard bounces + complaints into a
 * check-before-send suppression list. Retained bodies are stored only as
 * crypto-shreddable AES-256-GCM ciphertext.
 */
export { verifyRelaySignature, signRelayBody } from './signature';

export { handleEventWebhook, nextStatus, isHardBounce } from './events';
export { handleBounceWebhook } from './bounce';

export {
  isSuppressed,
  addSuppression,
  removeSuppression,
  getSuppression,
  normalizeRecipient,
} from './suppression';

export { encryptBody, decryptBody, loadBodyKey } from './crypto';

export { createPostgresStore, createMemoryStore } from './store';
export type {
  PostgresClient,
  WebhookStore,
  WebhookDeps,
  LogSeed,
  EventAppend,
} from './store';

export type {
  MailEventType,
  MailLogStatus,
  MailEventPayload,
  MailBouncePayload,
  SuppressionReason,
  SuppressionSource,
  SuppressionEntry,
  EmailEvent,
  EmailLog,
  EncryptedBody,
  WebhookResult,
} from './types';
