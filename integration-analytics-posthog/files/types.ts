/**
 * PostHog Analytics — Type Definitions
 *
 * Strongly-typed interfaces for configuration, event tracking,
 * user identification, group analytics, and feature flags.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Persistence strategy for PostHog identity and properties. */
export type PostHogPersistence = "localStorage" | "sessionStorage" | "cookie" | "memory" | "localStorage+cookie";

/** Configuration options for initializing the PostHog client. */
export interface PostHogConfig {
  /** PostHog project API key (starts with `phc_`). */
  apiKey: string;
  /** PostHog API host URL, e.g. `"https://us.i.posthog.com"`. */
  apiHost: string;
  /**
   * Whether to automatically capture click, change, and submit events.
   * @default true
   */
  autocapture?: boolean;
  /**
   * How PostHog stores the distinct ID and super properties.
   * @default "localStorage+cookie"
   */
  persistence?: PostHogPersistence;
  /**
   * Whether to capture page view events automatically.
   * Disable when using the provider's built-in Next.js route tracking.
   * @default false
   */
  capturePageview?: boolean;
  /**
   * Whether to capture pageleave events automatically.
   * @default true
   */
  capturePageleave?: boolean;
}

// ---------------------------------------------------------------------------
// Event Tracking
// ---------------------------------------------------------------------------

/** Properties attached to a tracked event. */
export type EventProperties = Record<string, string | number | boolean | null>;

/** Additional options for a capture call. */
export interface CaptureOptions {
  /** Custom timestamp (ISO 8601). If omitted, PostHog uses the current time. */
  timestamp?: string;
  /**
   * Groups to associate with this event.
   * Keys are group types (e.g. `"company"`), values are group keys (e.g. `"acme-corp"`).
   */
  groups?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// User Identification
// ---------------------------------------------------------------------------

/** Properties for identifying a user. */
export interface UserProperties {
  /** User's email address. */
  email?: string;
  /** User's display name. */
  name?: string;
  /** Current subscription plan. */
  plan?: string;
  /** Allow arbitrary custom properties. */
  [key: string]: string | number | boolean | null | undefined;
}

// ---------------------------------------------------------------------------
// Group Analytics
// ---------------------------------------------------------------------------

/** Properties for a group (company, team, organization, etc.). */
export interface GroupProperties {
  /** Group display name. */
  name?: string;
  /** Allow arbitrary custom properties. */
  [key: string]: string | number | boolean | null | undefined;
}

// ---------------------------------------------------------------------------
// Feature Flags
// ---------------------------------------------------------------------------

/** A feature flag with its current evaluation result. */
export interface FeatureFlag {
  /** Feature flag key as defined in PostHog. */
  key: string;
  /** Evaluated value — `true`/`false` for boolean flags, a string for multivariate flags. */
  value: boolean | string;
  /** Optional JSON payload attached to the flag in PostHog. */
  payload?: unknown;
}

/** The state of a feature flag as returned by the `useFeatureFlag` hook. */
export interface FeatureFlagState {
  /** Whether the flag is enabled (truthy value). */
  enabled: boolean;
  /** The raw flag value — `true`/`false` for boolean flags, a string for multivariate. */
  value: boolean | string | undefined;
  /** Whether the flag value is still loading from the PostHog server. */
  loading: boolean;
}
