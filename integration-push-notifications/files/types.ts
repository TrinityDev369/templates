/**
 * Push Notifications — Type Definitions
 *
 * Strongly-typed interfaces for push subscription management, notification
 * payloads, permission states, and VAPID configuration.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** VAPID-based configuration for initialising the push subscription. */
export interface PushConfig {
  /**
   * Base64-encoded VAPID public key used by the browser to validate that
   * incoming push messages originate from your application server.
   *
   * Generate with: `npx web-push generate-vapid-keys`
   */
  vapidPublicKey: string;

  /**
   * Path to the service worker file relative to the site root.
   * @default "/service-worker.js"
   */
  serviceWorkerPath?: string;

  /**
   * Raw application server key (Uint8Array). When provided this takes
   * precedence over `vapidPublicKey` (which is the base64 string form).
   * Typically you do NOT set this — the client converts `vapidPublicKey`
   * automatically.
   */
  applicationServerKey?: Uint8Array;
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/** Serialisable representation of a push subscription (safe to send to a server). */
export interface PushSubscriptionData {
  /** The push service endpoint URL that your server POSTs messages to. */
  endpoint: string;

  /** Cryptographic keys required by the push service. */
  keys: {
    /** Diffie-Hellman public key (base64url-encoded). */
    p256dh: string;
    /** Authentication secret (base64url-encoded). */
    auth: string;
  };

  /**
   * Timestamp (ms since epoch) when the subscription expires, or `null`
   * if the subscription has no fixed expiry.
   */
  expirationTime: number | null;
}

// ---------------------------------------------------------------------------
// Notification Payload
// ---------------------------------------------------------------------------

/** Action button displayed alongside a notification. */
export interface NotificationAction {
  /** Programmatic identifier returned in the `notificationclick` event. */
  action: string;
  /** Human-readable label shown on the button. */
  title: string;
  /** Optional icon URL displayed next to the action label. */
  icon?: string;
}

/**
 * Payload describing a single push notification.
 *
 * All fields except `title` are optional — the service worker fills in
 * sensible defaults for missing values.
 */
export interface NotificationPayload {
  /** Primary notification heading (required). */
  title: string;
  /** Body text shown beneath the title. */
  body?: string;
  /** URL of the notification icon (small square image). */
  icon?: string;
  /** URL of the notification badge (monochrome, shown on mobile). */
  badge?: string;
  /** URL of a large image displayed in the notification body. */
  image?: string;
  /**
   * Arbitrary key-value data attached to the notification.
   * Use `event.notification.data` inside the service worker to read this.
   * Commonly includes a `url` field for click-through navigation.
   */
  data?: Record<string, unknown>;
  /** Interactive action buttons (max 2 on most platforms). */
  actions?: NotificationAction[];
  /**
   * Tag used to group/replace notifications. A new notification with the
   * same tag silently replaces an existing one instead of stacking.
   */
  tag?: string;
  /**
   * When `true`, the notification remains visible until the user explicitly
   * interacts with it (not auto-dismissed).
   */
  requireInteraction?: boolean;
}

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------

/** Current Notification permission state as reported by the browser. */
export type PushPermissionState = "default" | "granted" | "denied";

// ---------------------------------------------------------------------------
// Server-side
// ---------------------------------------------------------------------------

/** Request body for sending a push notification from the server. */
export interface SendPushRequest {
  /** The target subscription (endpoint + keys). */
  subscription: PushSubscriptionData;
  /** The notification content to deliver. */
  payload: NotificationPayload;
}
