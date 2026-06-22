/**
 * Trinity Mail — client (public surface).
 *
 * Installed by `npx @trinity369/use mail-client` into `src/mail`. Self-contained;
 * pairs with mail-templates (rendering), mail-webhook (delivery events + suppression),
 * mail-dns (DNS manifest), and mail-tresor (env contract).
 */
export { createMailClient } from './sendMail';
export type { MailClient, MailClientOptions } from './sendMail';

export { loadMailConfig } from './config';
export type { MailConfig, RelayConfig } from './config';

export { selectDriver, createRelayDriver, createConsoleDriver } from './drivers';
export { createPostgresStore, createMemoryStore } from './outbox/store';
export type { PostgresClient } from './outbox/store';
export { drainOnce, startWorker } from './outbox/worker';
export type { WorkerDeps, DrainResult, LoopHandle } from './outbox/worker';

export {
  createMemoryRateLimiter,
  allowAllConsent,
  MailRateLimitError,
  ConsentRequiredError,
} from './guards';
export type { RateLimiter, ConsentChecker } from './guards';

export { htmlToText } from './lib/plaintext';
export { buildHeaders, HEADER } from './lib/headers';
export { streamForCategory, MARKETING_CATEGORIES } from './lib/types';
export type {
  Address,
  MailMessage,
  MailCategory,
  MailStream,
  NormalizedMessage,
  MailDriver,
  MailStore,
  OutboxRecord,
  OutboxStatus,
  SendResult,
  DeliveryResult,
} from './lib/types';
