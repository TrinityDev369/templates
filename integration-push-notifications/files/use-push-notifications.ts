"use client";

/**
 * Push Notifications — React Hook
 *
 * Provides a declarative interface for subscribing to and unsubscribing from
 * web push notifications. Manages permission state, subscription lifecycle,
 * and browser-support detection.
 *
 * @example
 * ```tsx
 * import { usePushNotifications } from "@/integrations/push-notifications/use-push-notifications";
 *
 * function NotificationBanner() {
 *   const { subscribe, unsubscribe, permission, subscription, isSupported } =
 *     usePushNotifications({
 *       vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_KEY!,
 *       onSubscribe: (sub) => fetch("/api/push/register", {
 *         method: "POST",
 *         body: JSON.stringify(sub),
 *       }),
 *     });
 *
 *   if (!isSupported) return <p>Push notifications are not supported.</p>;
 *
 *   return permission === "granted" ? (
 *     <button onClick={unsubscribe}>Disable notifications</button>
 *   ) : (
 *     <button onClick={subscribe}>Enable notifications</button>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";

import type { PushSubscriptionData, PushPermissionState } from "./types";
import {
  registerServiceWorker,
  requestPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getExistingSubscription,
  getPermissionState,
} from "./client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Options accepted by the `usePushNotifications` hook. */
export interface UsePushNotificationsOptions {
  /**
   * Base64url-encoded VAPID public key.
   * Must match the private key on your application server.
   */
  vapidPublicKey: string;

  /**
   * Path to the service worker file relative to the site root.
   * @default "/service-worker.js"
   */
  serviceWorkerPath?: string;

  /**
   * Called after a successful subscription with the serialised subscription
   * data. Use this to persist the subscription on your backend.
   */
  onSubscribe?: (subscription: PushSubscriptionData) => void | Promise<void>;

  /**
   * Called after a successful unsubscription. Use this to remove the
   * subscription from your backend.
   */
  onUnsubscribe?: () => void | Promise<void>;

  /**
   * Called when an error occurs during subscribe/unsubscribe.
   */
  onError?: (error: Error) => void;
}

/** Return value of the `usePushNotifications` hook. */
export interface UsePushNotificationsReturn {
  /** Subscribe to push notifications (requests permission if needed). */
  subscribe: () => Promise<void>;
  /** Unsubscribe from push notifications. */
  unsubscribe: () => Promise<void>;
  /** Current browser notification permission state. */
  permission: PushPermissionState;
  /** Current push subscription data, or `null` if not subscribed. */
  subscription: PushSubscriptionData | null;
  /** Whether the browser supports push notifications. */
  isSupported: boolean;
  /** Whether a subscribe/unsubscribe operation is in progress. */
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Support detection
// ---------------------------------------------------------------------------

/**
 * Check whether the current browser supports all APIs required for
 * web push notifications.
 */
function checkBrowserSupport(): boolean {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!("PushManager" in window)) return false;
  if (!("Notification" in window)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook for managing web push notification subscriptions.
 *
 * Handles service-worker registration, permission requests, subscription
 * creation/teardown, and browser-support detection. Exposes a clean
 * declarative API for UI components.
 */
export function usePushNotifications(
  options: UsePushNotificationsOptions,
): UsePushNotificationsReturn {
  const {
    vapidPublicKey,
    serviceWorkerPath = "/service-worker.js",
    onSubscribe,
    onUnsubscribe,
    onError,
  } = options;

  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported] = useState(() => checkBrowserSupport());

  // Keep a ref to the SW registration so we don't re-register on every call.
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // --------------------------------------------------
  // Initialisation — check existing permission & subscription
  // --------------------------------------------------
  useEffect(() => {
    if (!isSupported) return;

    const init = async () => {
      setPermission(getPermissionState());

      try {
        const reg = await registerServiceWorker(serviceWorkerPath);
        registrationRef.current = reg;

        const existing = await getExistingSubscription(reg);
        if (existing) {
          setSubscription(existing);
        }
      } catch {
        // Service worker registration may fail in dev (HTTP) — degrade
        // gracefully; the user can still attempt to subscribe later.
      }
    };

    init();
  }, [isSupported, serviceWorkerPath]);

  // --------------------------------------------------
  // Subscribe
  // --------------------------------------------------
  const subscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      // Ensure we have a service worker registration.
      if (!registrationRef.current) {
        registrationRef.current = await registerServiceWorker(serviceWorkerPath);
      }

      // Request permission (no-op if already granted).
      const perm = await requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        return;
      }

      const sub = await subscribeToPush(registrationRef.current, vapidPublicKey);
      setSubscription(sub);

      await onSubscribe?.(sub);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, vapidPublicKey, serviceWorkerPath, onSubscribe, onError]);

  // --------------------------------------------------
  // Unsubscribe
  // --------------------------------------------------
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      if (!registrationRef.current) {
        registrationRef.current = await registerServiceWorker(serviceWorkerPath);
      }

      const didUnsubscribe = await unsubscribeFromPush(registrationRef.current);

      if (didUnsubscribe) {
        setSubscription(null);
        await onUnsubscribe?.();
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, serviceWorkerPath, onUnsubscribe, onError]);

  return {
    subscribe,
    unsubscribe,
    permission,
    subscription,
    isSupported,
    isLoading,
  };
}
