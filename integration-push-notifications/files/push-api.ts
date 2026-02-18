/**
 * Push Notifications — Server-side API
 *
 * Thin wrapper around the `web-push` npm package that reads VAPID credentials
 * from environment variables and provides a typed `sendPushNotification`
 * function with automatic handling of expired/invalid subscriptions.
 *
 * @example
 * ```ts
 * import { sendPushNotification } from "@/integrations/push-notifications/push-api";
 *
 * const result = await sendPushNotification(
 *   {
 *     endpoint: "https://fcm.googleapis.com/fcm/send/...",
 *     keys: { p256dh: "...", auth: "..." },
 *     expirationTime: null,
 *   },
 *   {
 *     title: "New message",
 *     body: "You have a new message from Alice.",
 *     data: { url: "/messages/42" },
 *   },
 * );
 *
 * if (!result.success) {
 *   console.error("Push failed:", result.statusCode, result.error);
 * }
 * ```
 */

import webPush from "web-push";

import type { PushSubscriptionData, NotificationPayload } from "./types";

// ---------------------------------------------------------------------------
// VAPID configuration
// ---------------------------------------------------------------------------

/**
 * Read VAPID credentials from environment variables and configure `web-push`.
 *
 * Required env vars:
 * - `VAPID_PUBLIC_KEY`  — Base64url-encoded public key
 * - `VAPID_PRIVATE_KEY` — Base64url-encoded private key
 * - `VAPID_SUBJECT`     — Contact URI, e.g. `mailto:admin@example.com`
 *
 * Call this once at server startup or let `sendPushNotification` call it
 * lazily on first use.
 */
let vapidConfigured = false;

function ensureVapidConfigured(): void {
  if (vapidConfigured) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "Missing VAPID environment variables. " +
        "Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT " +
        "(e.g. mailto:you@example.com). " +
        "Generate keys with: npx web-push generate-vapid-keys",
    );
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of a push notification send attempt. */
export interface SendPushResult {
  /** Whether the push service accepted the message (2xx response). */
  success: boolean;
  /** HTTP status code returned by the push service. */
  statusCode: number;
  /**
   * When `true`, the subscription is no longer valid (HTTP 404 or 410)
   * and should be removed from your database.
   */
  isExpired: boolean;
  /** Error message, if any. */
  error?: string;
}

// ---------------------------------------------------------------------------
// Send
// ---------------------------------------------------------------------------

/**
 * Send a push notification to a single subscriber.
 *
 * Automatically configures VAPID credentials from environment variables on
 * first call. Handles common failure modes:
 *
 * - **410 Gone / 404 Not Found** — subscription expired or was revoked.
 *   Returns `{ success: false, isExpired: true }` so the caller can clean
 *   up its database.
 * - **429 Too Many Requests** — rate-limited by the push service.
 * - **Other errors** — network issues, invalid payloads, etc.
 *
 * @param subscription - Target push subscription (endpoint + keys).
 * @param payload      - Notification content to deliver.
 * @param options      - Optional `web-push` send options (TTL, headers, etc.).
 * @returns A result object indicating success/failure and expiration status.
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload,
  options?: webPush.RequestOptions,
): Promise<SendPushResult> {
  ensureVapidConfigured();

  const pushSubscription: webPush.PushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };

  const payloadString = JSON.stringify(payload);

  try {
    const response = await webPush.sendNotification(
      pushSubscription,
      payloadString,
      {
        TTL: 60 * 60 * 24, // 24 hours default
        ...options,
      },
    );

    return {
      success: true,
      statusCode: response.statusCode,
      isExpired: false,
    };
  } catch (error: unknown) {
    // web-push throws WebPushError with a `statusCode` property.
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as Error & { statusCode: number }).statusCode
        : 0;

    // 404 or 410 means the subscription is no longer valid.
    const isExpired = statusCode === 410 || statusCode === 404;

    const message =
      error instanceof Error ? error.message : String(error);

    return {
      success: false,
      statusCode,
      isExpired,
      error: message,
    };
  }
}

/**
 * Send a push notification to multiple subscribers in parallel.
 *
 * Returns one `SendPushResult` per subscription, in the same order.
 * Expired subscriptions are flagged — the caller should remove them from
 * storage.
 *
 * @param subscriptions - Array of target push subscriptions.
 * @param payload       - Notification content to deliver to all subscribers.
 * @param options       - Optional `web-push` send options.
 * @returns Array of results, one per subscription.
 */
export async function sendPushNotificationBatch(
  subscriptions: PushSubscriptionData[],
  payload: NotificationPayload,
  options?: webPush.RequestOptions,
): Promise<SendPushResult[]> {
  return Promise.all(
    subscriptions.map((sub) => sendPushNotification(sub, payload, options)),
  );
}
