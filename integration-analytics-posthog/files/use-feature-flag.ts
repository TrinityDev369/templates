"use client";

/**
 * useFeatureFlag Hook
 *
 * Subscribe to a PostHog feature flag and re-render when its value changes.
 * Handles loading state while flags are fetched from the PostHog server.
 *
 * @example
 * ```tsx
 * "use client";
 * import { useFeatureFlag } from "@/integrations/posthog/use-feature-flag";
 *
 * export function NewDashboard() {
 *   const { enabled, value, loading } = useFeatureFlag("new-dashboard");
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!enabled) return <div>Classic dashboard</div>;
 *
 *   // Multivariate: value could be "control", "variant-a", "variant-b"
 *   return <div>New dashboard (variant: {String(value)})</div>;
 * }
 * ```
 */

import { useState, useEffect, useContext } from "react";

import { PostHogContext } from "./posthog-provider";
import { posthogClient } from "./client";
import type { FeatureFlagState } from "./types";

/**
 * Subscribe to a PostHog feature flag by key.
 *
 * Returns the current flag state including whether it is enabled, its raw
 * value (boolean or multivariate string), and whether the flag data is still
 * loading from the server.
 *
 * Re-renders the component whenever the flag value changes (e.g. after flags
 * are fetched or updated by PostHog).
 *
 * @param key - Feature flag key as defined in PostHog.
 * @returns The current feature flag state.
 */
export function useFeatureFlag(key: string): FeatureFlagState {
  const { isReady } = useContext(PostHogContext);

  const [state, setState] = useState<FeatureFlagState>(() => {
    // Attempt to read the flag synchronously if PostHog is already initialized.
    if (isReady) {
      const value = posthogClient.getFeatureFlag(key);
      if (value !== undefined) {
        return {
          enabled: !!value,
          value,
          loading: false,
        };
      }
    }

    return {
      enabled: false,
      value: undefined,
      loading: true,
    };
  });

  useEffect(() => {
    if (!isReady) return;

    // Read the current value immediately in case it became available
    // between the initial render and this effect running.
    const currentValue = posthogClient.getFeatureFlag(key);
    if (currentValue !== undefined) {
      setState({
        enabled: !!currentValue,
        value: currentValue,
        loading: false,
      });
    }

    // Subscribe to flag updates so we re-render when they change.
    const unsubscribe = posthogClient.onFeatureFlags(() => {
      const updatedValue = posthogClient.getFeatureFlag(key);
      setState({
        enabled: !!updatedValue,
        value: updatedValue ?? undefined,
        loading: false,
      });
    });

    return unsubscribe;
  }, [key, isReady]);

  return state;
}
