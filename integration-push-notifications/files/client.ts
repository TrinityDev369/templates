/**
 * Push Notifications — Browser Client
 *
 * Zero-dependency client that manages push subscriptions using the native
 * Web Push API, Service Worker registration, and Notification permission
 * requests. All operations rely on standard browser APIs — no external
 * libraries are required.
 *
 * @example
 * ```ts
 * import {
 *   registerServiceWorker,
 *   requestPermission,
 *   subscribeToPush,
 * } from "@/integrations/push-notifications/client";
 *
 * const reg = await registerServiceWorker();
 * const perm = await requestPermission();
 *
 * if (perm === "granted") {
 *   const sub = await subscribeToPush(reg, process.env.NEXT_PUBLIC_VAPID_KEY!);
 *   // Send `sub` to your backend for storage
 * }
 * ```
 */

import type { PushSubscriptionData, PushPermissionState } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a base64url-encoded VAPID public key into the `Uint8Array` that
 * `PushManager.subscribe()` expects as `applicationServerKey`.
 *
 * Handles the URL-safe base64 alphabet (`-` and `_`) and any stripped padding.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Serialise a native `PushSubscription` into a plain object that is safe
 * to `JSON.stringify` and send to a server.
 */
function serializeSubscription(
  subscription: PushSubscription,
): PushSubscriptionData {
  const json = subscription.toJSON();

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
    expirationTime: subscription.expirationTime,
  };
}

// ---------------------------------------------------------------------------
// Service Worker
// ---------------------------------------------------------------------------

/**
 * Register (or re-use) the push-notifications service worker.
 *
 * @param path - Path to the service worker file relative to the site root.
 *               Defaults to `"/service-worker.js"`.
 * @returns The active `ServiceWorkerRegistration`.
 * @throws If `navigator.serviceWorker` is not available.
 */
export async function registerServiceWorker(
  path: string = "/service-worker.js",
): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Service workers are not supported in this browser.",
    );
  }

  const registration = await navigator.serviceWorker.register(path, {
    scope: "/",
  });

  // Wait until the service worker is active before returning.
  if (registration.installing) {
    await new Promise<void>((resolve) => {
      registration.installing!.addEventListener("statechange", function handler() {
        if (this.state === "activated") {
          this.removeEventListener("statechange", handler);
          resolve();
        }
      });
    });
  }

  return registration;
}

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------

/**
 * Request the user's permission to show notifications.
 *
 * Wraps `Notification.requestPermission()` and normalises the result into
 * a typed `PushPermissionState`.
 *
 * @returns The resulting permission state.
 */
export async function requestPermission(): Promise<PushPermissionState> {
  if (!("Notification" in window)) {
    throw new Error("Notifications are not supported in this browser.");
  }

  const result = await Notification.requestPermission();
  return result as PushPermissionState;
}

/**
 * Return the current notification permission without triggering a prompt.
 */
export function getPermissionState(): PushPermissionState {
  if (!("Notification" in window)) {
    return "denied";
  }

  return Notification.permission as PushPermissionState;
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/**
 * Create a new push subscription using the browser's Push API.
 *
 * The subscription is bound to the provided VAPID public key so that
 * your application server (which holds the matching private key) is the
 * only entity that can send push messages to this client.
 *
 * @param registration   - An active service worker registration.
 * @param vapidPublicKey - Base64url-encoded VAPID public key.
 * @returns Serialised push subscription data.
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string,
): Promise<PushSubscriptionData> {
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  return serializeSubscription(subscription);
}

/**
 * Unsubscribe from push notifications.
 *
 * @param registration - The service worker registration that holds the subscription.
 * @returns `true` if an active subscription was found and unsubscribed,
 *          `false` if there was no existing subscription.
 */
export async function unsubscribeFromPush(
  registration: ServiceWorkerRegistration,
): Promise<boolean> {
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return false;
  }

  return subscription.unsubscribe();
}

/**
 * Retrieve the current push subscription without modifying it.
 *
 * @param registration - The service worker registration to query.
 * @returns The serialised subscription, or `null` if no subscription exists.
 */
export async function getExistingSubscription(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscriptionData | null> {
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return null;
  }

  return serializeSubscription(subscription);
}
