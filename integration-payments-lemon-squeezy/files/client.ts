/**
 * Lemon Squeezy API Client
 *
 * Server-side functions for checkout creation, subscription management,
 * and querying the Lemon Squeezy v1 REST API. Uses native `fetch` with
 * no external SDK dependencies.
 *
 * All responses follow the JSON:API specification -- this client parses
 * `data.attributes` automatically and returns clean typed objects.
 *
 * @example
 * ```ts
 * import { createCheckout, getSubscription } from '@/integrations/lemon-squeezy';
 *
 * const config = {
 *   apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
 *   storeId: process.env.LEMON_SQUEEZY_STORE_ID!,
 *   webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!,
 * };
 *
 * const checkout = await createCheckout(config, {
 *   variantId: '12345',
 *   customerEmail: 'user@example.com',
 *   redirectUrl: 'https://example.com/thanks',
 * });
 *
 * console.log('Redirect to:', checkout.checkoutUrl);
 * ```
 */

import type {
  LemonSqueezyConfig,
  CheckoutOptions,
  CheckoutResult,
  Subscription,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.lemonsqueezy.com/v1';

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Build standard headers for Lemon Squeezy API requests.
 */
function buildHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };
}

/**
 * Execute a fetch request against the Lemon Squeezy API and parse the
 * JSON:API response. Throws a descriptive error on non-2xx status codes.
 */
async function apiRequest<T>(
  url: string,
  apiKey: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(apiKey),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    let detail = '';
    try {
      const errorBody = await response.json();
      detail = JSON.stringify(errorBody.errors ?? errorBody);
    } catch {
      detail = await response.text().catch(() => 'unknown error');
    }
    throw new Error(
      `[LemonSqueezy] API request failed (${response.status} ${response.statusText}): ${detail}`,
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Map a JSON:API subscription resource to our typed `Subscription`.
 */
function toSubscription(resource: {
  id: string;
  attributes: Record<string, unknown>;
}): Subscription {
  const attrs = resource.attributes;
  return {
    id: resource.id,
    status: (attrs.status as Subscription['status']) ?? 'active',
    customerId: String(attrs.customer_id ?? ''),
    variantId: String(attrs.variant_id ?? ''),
    productName: String(attrs.product_name ?? ''),
    variantName: String(attrs.variant_name ?? ''),
    renewsAt: (attrs.renews_at as string) ?? null,
    endsAt: (attrs.ends_at as string) ?? null,
    createdAt: String(attrs.created_at ?? ''),
    updatedAt: String(attrs.updated_at ?? ''),
  };
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

/**
 * Create a Lemon Squeezy checkout session.
 *
 * Returns a checkout URL that you should redirect the customer to.
 * The checkout is pre-configured with the specified variant, optional
 * customer info, and custom data that will be forwarded to webhooks.
 *
 * @param config   Lemon Squeezy API configuration
 * @param options  Checkout options (variant, customer info, redirect URL, etc.)
 * @returns        Checkout URL and ID
 * @throws         If the API request fails or the variant is invalid
 *
 * @example
 * ```ts
 * const checkout = await createCheckout(config, {
 *   variantId: '98765',
 *   customerEmail: 'buyer@example.com',
 *   redirectUrl: 'https://example.com/dashboard',
 *   custom: { userId: 'usr_abc123' },
 * });
 *
 * // Redirect the user to checkout.checkoutUrl
 * ```
 */
export async function createCheckout(
  config: LemonSqueezyConfig,
  options: CheckoutOptions,
): Promise<CheckoutResult> {
  if (!config.apiKey) {
    throw new Error('[LemonSqueezy] API key is required.');
  }

  if (!config.storeId) {
    throw new Error('[LemonSqueezy] Store ID is required.');
  }

  if (!options.variantId) {
    throw new Error('[LemonSqueezy] Variant ID is required to create a checkout.');
  }

  // Build the JSON:API request body
  const checkoutData: Record<string, unknown> = {};
  const productOptions: Record<string, unknown> = {};

  if (options.customerEmail || options.customerName) {
    checkoutData.email = options.customerEmail;
    checkoutData.name = options.customerName;
  }

  if (options.custom) {
    checkoutData.custom = options.custom;
  }

  if (options.redirectUrl) {
    productOptions.redirect_url = options.redirectUrl;
  }

  if (options.receiptButtonText) {
    productOptions.receipt_button_text = options.receiptButtonText;
  }

  if (options.discount) {
    checkoutData.discount_code = options.discount;
  }

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: checkoutData,
        product_options: productOptions,
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: config.storeId,
          },
        },
        variant: {
          data: {
            type: 'variants',
            id: options.variantId,
          },
        },
      },
    },
  };

  const result = await apiRequest<{
    data: { id: string; attributes: { url: string } };
  }>(`${BASE_URL}/checkouts`, config.apiKey, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return {
    checkoutUrl: result.data.attributes.url,
    checkoutId: result.data.id,
  };
}

// ---------------------------------------------------------------------------
// Subscription Management
// ---------------------------------------------------------------------------

/**
 * Fetch details for a specific subscription.
 *
 * @param config          Lemon Squeezy API configuration
 * @param subscriptionId  ID of the subscription to retrieve
 * @returns               Subscription details
 * @throws                If the subscription is not found or the API request fails
 *
 * @example
 * ```ts
 * const sub = await getSubscription(config, '12345');
 * console.log(`Status: ${sub.status}, Renews: ${sub.renewsAt}`);
 * ```
 */
export async function getSubscription(
  config: LemonSqueezyConfig,
  subscriptionId: string,
): Promise<Subscription> {
  if (!subscriptionId) {
    throw new Error('[LemonSqueezy] Subscription ID is required.');
  }

  const result = await apiRequest<{
    data: { id: string; attributes: Record<string, unknown> };
  }>(`${BASE_URL}/subscriptions/${subscriptionId}`, config.apiKey);

  return toSubscription(result.data);
}

/**
 * Cancel a subscription at the end of the current billing period.
 *
 * The subscription remains active until the period ends, then transitions
 * to "cancelled". Use `resumeSubscription` to undo the cancellation
 * before the period ends.
 *
 * @param config          Lemon Squeezy API configuration
 * @param subscriptionId  ID of the subscription to cancel
 * @returns               Updated subscription (status will still be "active" until period end)
 * @throws                If the subscription is not found or already cancelled
 *
 * @example
 * ```ts
 * const sub = await cancelSubscription(config, '12345');
 * console.log(`Cancellation scheduled, ends at: ${sub.endsAt}`);
 * ```
 */
export async function cancelSubscription(
  config: LemonSqueezyConfig,
  subscriptionId: string,
): Promise<Subscription> {
  if (!subscriptionId) {
    throw new Error('[LemonSqueezy] Subscription ID is required.');
  }

  const result = await apiRequest<{
    data: { id: string; attributes: Record<string, unknown> };
  }>(`${BASE_URL}/subscriptions/${subscriptionId}`, config.apiKey, {
    method: 'DELETE',
  });

  return toSubscription(result.data);
}

/**
 * Resume a previously cancelled subscription.
 *
 * Only works if the subscription has been cancelled but the billing
 * period has not yet ended (i.e. status is still "active" with a
 * scheduled cancellation).
 *
 * @param config          Lemon Squeezy API configuration
 * @param subscriptionId  ID of the subscription to resume
 * @returns               Updated subscription with cancellation removed
 * @throws                If the subscription cannot be resumed
 *
 * @example
 * ```ts
 * const sub = await resumeSubscription(config, '12345');
 * console.log(`Resumed! Next renewal: ${sub.renewsAt}`);
 * ```
 */
export async function resumeSubscription(
  config: LemonSqueezyConfig,
  subscriptionId: string,
): Promise<Subscription> {
  if (!subscriptionId) {
    throw new Error('[LemonSqueezy] Subscription ID is required.');
  }

  const body = {
    data: {
      type: 'subscriptions',
      id: subscriptionId,
      attributes: {
        cancelled: false,
      },
    },
  };

  const result = await apiRequest<{
    data: { id: string; attributes: Record<string, unknown> };
  }>(`${BASE_URL}/subscriptions/${subscriptionId}`, config.apiKey, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  return toSubscription(result.data);
}

/**
 * List subscriptions, optionally filtered by customer ID.
 *
 * Automatically paginates through all result pages and returns the
 * complete list.
 *
 * @param config      Lemon Squeezy API configuration
 * @param customerId  Optional customer ID to filter by
 * @returns           Array of subscriptions
 *
 * @example
 * ```ts
 * // List all subscriptions for a specific customer
 * const subs = await listSubscriptions(config, '67890');
 * for (const sub of subs) {
 *   console.log(`${sub.productName}: ${sub.status}`);
 * }
 *
 * // List all subscriptions in the store
 * const allSubs = await listSubscriptions(config);
 * ```
 */
export async function listSubscriptions(
  config: LemonSqueezyConfig,
  customerId?: string,
): Promise<Subscription[]> {
  const subscriptions: Subscription[] = [];
  let url = `${BASE_URL}/subscriptions?filter[store_id]=${config.storeId}`;

  if (customerId) {
    url += `&filter[customer_id]=${customerId}`;
  }

  interface ListResponse {
    data: Array<{ id: string; attributes: Record<string, unknown> }>;
    links?: { next?: string };
  }

  let nextUrl: string | null = url;

  while (nextUrl) {
    const result: ListResponse = await apiRequest<ListResponse>(
      nextUrl,
      config.apiKey,
    );

    for (const resource of result.data) {
      subscriptions.push(toSubscription(resource));
    }

    nextUrl = result.links?.next ?? null;
  }

  return subscriptions;
}
