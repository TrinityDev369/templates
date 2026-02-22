/**
 * Lemon Squeezy Payment Integration
 *
 * Checkout creation, subscription management, and webhook handling
 * for Lemon Squeezy payments. Zero external dependencies -- uses only
 * native `fetch` and Node.js `crypto`.
 *
 * @example
 * ```ts
 * import {
 *   createCheckout,
 *   getSubscription,
 *   cancelSubscription,
 *   resumeSubscription,
 *   listSubscriptions,
 *   handleWebhook,
 * } from '@/integrations/lemon-squeezy';
 *
 * const config = {
 *   apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
 *   storeId: process.env.LEMON_SQUEEZY_STORE_ID!,
 *   webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!,
 * };
 *
 * // Create a checkout
 * const checkout = await createCheckout(config, { variantId: '12345' });
 *
 * // Handle incoming webhooks
 * const event = await handleWebhook(request, config);
 * ```
 */

// Client
export {
  createCheckout,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  listSubscriptions,
} from './client';

// Webhook
export {
  verifyWebhookSignature,
  parseWebhookEvent,
  handleWebhook,
} from './webhook-handler';

// Types
export type {
  LemonSqueezyConfig,
  CheckoutOptions,
  CheckoutResult,
  Subscription,
  WebhookEvent,
  WebhookEventType,
} from './types';
