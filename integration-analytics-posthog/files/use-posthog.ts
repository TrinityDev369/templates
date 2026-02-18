"use client";

/**
 * usePostHog Hook
 *
 * Provides typed access to PostHog event tracking, user identification,
 * and group analytics from any client component.
 *
 * @example
 * ```tsx
 * "use client";
 * import { usePostHog } from "@/integrations/posthog/use-posthog";
 *
 * export function SignupButton() {
 *   const { capture, identify, isReady } = usePostHog();
 *
 *   const handleSignup = (userId: string) => {
 *     identify(userId, { email: "user@example.com", plan: "free" });
 *     capture("signup_completed", { method: "email" });
 *   };
 *
 *   return <button onClick={() => handleSignup("user_123")}>Sign Up</button>;
 * }
 * ```
 */

import { useContext, useCallback } from "react";

import { PostHogContext } from "./posthog-provider";
import { posthogClient } from "./client";
import type {
  EventProperties,
  UserProperties,
  GroupProperties,
  CaptureOptions,
} from "./types";

export interface UsePostHogReturn {
  /** Track a named event with optional properties. */
  capture: (event: string, properties?: EventProperties, options?: CaptureOptions) => void;
  /** Identify the current user. */
  identify: (distinctId: string, properties?: UserProperties) => void;
  /** Reset the user identity (call on logout). */
  reset: () => void;
  /** Associate the current user with a group. */
  group: (type: string, key: string, properties?: GroupProperties) => void;
  /** Whether the PostHog SDK has been initialized. */
  isReady: boolean;
}

/**
 * Hook providing PostHog analytics operations.
 *
 * Must be used inside a `<PostHogProvider>`.
 */
export function usePostHog(): UsePostHogReturn {
  const context = useContext(PostHogContext);

  const capture = useCallback(
    (event: string, properties?: EventProperties, options?: CaptureOptions) => {
      posthogClient.capture(event, properties, options);
    },
    [],
  );

  const identify = useCallback(
    (distinctId: string, properties?: UserProperties) => {
      posthogClient.identify(distinctId, properties);
    },
    [],
  );

  const reset = useCallback(() => {
    posthogClient.reset();
  }, []);

  const group = useCallback(
    (type: string, key: string, properties?: GroupProperties) => {
      posthogClient.group(type, key, properties);
    },
    [],
  );

  return {
    capture,
    identify,
    reset,
    group,
    isReady: context.isReady,
  };
}
