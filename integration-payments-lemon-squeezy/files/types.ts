/**
 * Lemon Squeezy Payment Integration -- Type Definitions
 *
 * Core interfaces for checkout creation, subscription management,
 * webhook event handling, and API configuration.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Lemon Squeezy API configuration.
 *
 * Obtain credentials from https://app.lemonsqueezy.com/settings/api
 *
 * @example
 * ```ts
 * const config: LemonSqueezyConfig = {
 *   apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
 *   storeId: process.env.LEMON_SQUEEZY_STORE_ID!,
 *   webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!,
 * };
 * ```
 */
export interface LemonSqueezyConfig {
  /** Lemon Squeezy API key for Bearer authentication */
  apiKey: string;
  /** Lemon Squeezy store ID (numeric string) */
  storeId: string;
  /** Secret used to verify incoming webhook signatures (HMAC-SHA256) */
  webhookSecret: string;
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

/**
 * Options for creating a Lemon Squeezy checkout session.
 */
export interface CheckoutOptions {
  /** Variant ID of the product to purchase */
  variantId: string;
  /** Pre-fill the customer email on the checkout page */
  customerEmail?: string;
  /** Pre-fill the customer name on the checkout page */
  customerName?: string;
  /** Custom key-value data attached to the checkout (passed through to webhooks) */
  custom?: Record<string, string>;
  /** URL to redirect the customer to after a successful purchase */
  redirectUrl?: string;
  /** Text shown on the receipt button (e.g. "Go to Dashboard") */
  receiptButtonText?: string;
  /** Discount code to apply to the checkout */
  discount?: string;
}

/**
 * Result of a successfully created checkout session.
 */
export interface CheckoutResult {
  /** Full URL to redirect the customer to for payment */
  checkoutUrl: string;
  /** Unique identifier of the checkout session */
  checkoutId: string;
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/**
 * Represents a Lemon Squeezy subscription with its current state.
 */
export interface Subscription {
  /** Unique subscription identifier */
  id: string;
  /** Current subscription status */
  status:
    | "active"
    | "paused"
    | "cancelled"
    | "expired"
    | "past_due"
    | "on_trial"
    | "unpaid";
  /** ID of the customer who owns this subscription */
  customerId: string;
  /** Variant ID of the subscribed product */
  variantId: string;
  /** Human-readable product name */
  productName: string;
  /** Human-readable variant name */
  variantName: string;
  /** ISO-8601 timestamp of the next renewal (null if not renewing) */
  renewsAt: string | null;
  /** ISO-8601 timestamp when the subscription ends (null if ongoing) */
  endsAt: string | null;
  /** ISO-8601 timestamp when the subscription was created */
  createdAt: string;
  /** ISO-8601 timestamp of the last update */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------

/**
 * Parsed Lemon Squeezy webhook event payload.
 */
export interface WebhookEvent {
  /** Event name (e.g. "subscription_created", "order_created") */
  event: string;
  /** Event payload data -- structure varies by event type */
  data: Record<string, unknown>;
}

/**
 * Known Lemon Squeezy webhook event types.
 *
 * Configure which events to receive in your Lemon Squeezy dashboard
 * under Settings > Webhooks.
 */
export type WebhookEventType =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_resumed"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_unpaused"
  | "order_created"
  | "order_refunded"
  | "license_key_created";
