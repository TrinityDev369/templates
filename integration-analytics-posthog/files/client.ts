/**
 * PostHog Analytics Client
 *
 * Singleton wrapper around posthog-js that provides a typed API for event
 * tracking, user identification, group analytics, and feature flags.
 *
 * SSR-safe — all methods are no-ops when running on the server.
 *
 * @example
 * ```ts
 * import { posthogClient } from "@/integrations/posthog/client";
 *
 * // Initialize once (typically in your provider)
 * posthogClient.init({ apiKey: "phc_xxx", apiHost: "https://us.i.posthog.com" });
 *
 * // Track events
 * posthogClient.capture("button_clicked", { variant: "primary" });
 *
 * // Identify users
 * posthogClient.identify("user_123", { email: "user@example.com", plan: "pro" });
 *
 * // Feature flags
 * const enabled = posthogClient.isFeatureEnabled("new-dashboard");
 * ```
 */

import posthog from "posthog-js";

import type {
  PostHogConfig,
  EventProperties,
  UserProperties,
  GroupProperties,
  CaptureOptions,
} from "./types";

// ---------------------------------------------------------------------------
// Environment guard
// ---------------------------------------------------------------------------

/** Returns `true` when running in a browser environment. */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

/** Whether the PostHog SDK has been initialized. */
let initialized = false;

/**
 * Initialize the PostHog SDK.
 *
 * Safe to call multiple times — subsequent calls are ignored.
 * No-op on the server.
 *
 * @param config - PostHog configuration (API key, host, options).
 */
function init(config: PostHogConfig): void {
  if (!isBrowser() || initialized) return;

  posthog.init(config.apiKey, {
    api_host: config.apiHost,
    autocapture: config.autocapture ?? true,
    persistence: config.persistence ?? "localStorage+cookie",
    capture_pageview: config.capturePageview ?? false,
    capture_pageleave: config.capturePageleave ?? true,
    loaded: () => {
      initialized = true;
    },
  });

  // Mark as initialized immediately — `loaded` may fire asynchronously
  // but the SDK is ready to queue events right after `init()`.
  initialized = true;
}

/**
 * Track a named event with optional properties.
 *
 * @param event      - Event name, e.g. `"signup_completed"`.
 * @param properties - Arbitrary key-value properties attached to the event.
 * @param options    - Optional capture settings (timestamp, groups).
 */
function capture(
  event: string,
  properties?: EventProperties,
  options?: CaptureOptions,
): void {
  if (!isBrowser() || !initialized) return;

  posthog.capture(event, {
    ...properties,
    ...(options?.timestamp ? { $timestamp: options.timestamp } : {}),
    ...(options?.groups ? { $groups: options.groups } : {}),
  });
}

/**
 * Identify the current user with a distinct ID and optional properties.
 *
 * Call this after login or when the user's identity is known.
 *
 * @param distinctId - Unique user identifier (e.g. database user ID).
 * @param properties - User properties to set (email, name, plan, etc.).
 */
function identify(distinctId: string, properties?: UserProperties): void {
  if (!isBrowser() || !initialized) return;

  posthog.identify(distinctId, properties);
}

/**
 * Reset the current user's identity.
 *
 * Call this on logout to generate a new anonymous distinct ID.
 */
function reset(): void {
  if (!isBrowser() || !initialized) return;

  posthog.reset();
}

/**
 * Associate the current user with a group (company, team, etc.).
 *
 * @param type       - Group type, e.g. `"company"`.
 * @param key        - Unique group key, e.g. `"acme-corp"`.
 * @param properties - Optional properties to set on the group.
 */
function group(type: string, key: string, properties?: GroupProperties): void {
  if (!isBrowser() || !initialized) return;

  posthog.group(type, key, properties);
}

/**
 * Get the current value of a feature flag.
 *
 * Returns `undefined` if the flag has not been loaded yet or does not exist.
 *
 * @param key - Feature flag key as defined in PostHog.
 * @returns The flag value — `true`/`false` for boolean flags, a string for multivariate.
 */
function getFeatureFlag(key: string): boolean | string | undefined {
  if (!isBrowser() || !initialized) return undefined;

  return posthog.getFeatureFlag(key) ?? undefined;
}

/**
 * Check whether a boolean feature flag is enabled.
 *
 * @param key - Feature flag key.
 * @returns `true` if the flag evaluates to a truthy value, `false` otherwise.
 */
function isFeatureEnabled(key: string): boolean {
  if (!isBrowser() || !initialized) return false;

  return !!posthog.isFeatureEnabled(key);
}

/**
 * Register a callback that fires when feature flags are loaded or updated.
 *
 * @param callback - Function called with the updated flag keys.
 * @returns An unsubscribe function.
 */
function onFeatureFlags(callback: (flags: string[]) => void): () => void {
  if (!isBrowser() || !initialized) return () => {};

  posthog.onFeatureFlags((flags) => {
    callback(flags);
  });

  // posthog-js does not provide a built-in unsubscribe for `onFeatureFlags`.
  // Return a no-op unsubscribe for API consistency.
  return () => {};
}

/**
 * Get the underlying posthog-js instance for advanced use cases.
 *
 * Returns `null` on the server or before initialization.
 */
function getPostHogInstance(): typeof posthog | null {
  if (!isBrowser() || !initialized) return null;

  return posthog;
}

/**
 * Check whether the PostHog SDK has been initialized.
 */
function isInitialized(): boolean {
  return initialized;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const posthogClient = {
  init,
  capture,
  identify,
  reset,
  group,
  getFeatureFlag,
  isFeatureEnabled,
  onFeatureFlags,
  getPostHogInstance,
  isInitialized,
} as const;
