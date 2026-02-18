"use client";

/**
 * PostHog Provider
 *
 * React context provider that initializes the PostHog SDK and automatically
 * tracks page views on Next.js route changes.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { PostHogProvider } from "@/integrations/posthog/posthog-provider";
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <PostHogProvider
 *           apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY!}
 *           apiHost={process.env.NEXT_PUBLIC_POSTHOG_HOST!}
 *         >
 *           {children}
 *         </PostHogProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

import { createContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { posthogClient } from "./client";
import type { PostHogPersistence } from "./types";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface PostHogContextValue {
  /** Whether the PostHog SDK has been initialized. */
  isReady: boolean;
}

export const PostHogContext = createContext<PostHogContextValue>({
  isReady: false,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface PostHogProviderProps {
  children: ReactNode;
  /** PostHog project API key (starts with `phc_`). */
  apiKey: string;
  /** PostHog API host URL. */
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
}

/**
 * Wraps child components with PostHog initialization and automatic page-view
 * tracking for Next.js App Router.
 *
 * Initialization happens once on mount. Page views are captured whenever the
 * URL path or search params change.
 */
export function PostHogProvider({
  children,
  apiKey,
  apiHost,
  autocapture,
  persistence,
}: PostHogProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  // -------------------------------------------------------------------------
  // Initialize PostHog once
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    posthogClient.init({
      apiKey,
      apiHost,
      autocapture,
      persistence,
      // Disable built-in pageview capture — we handle it with the route listener below.
      capturePageview: false,
    });
  }, [apiKey, apiHost, autocapture, persistence]);

  // -------------------------------------------------------------------------
  // Track page views on route change
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!posthogClient.isInitialized()) return;

    let url = window.origin + pathname;
    const params = searchParams.toString();
    if (params) {
      url += "?" + params;
    }

    posthogClient.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return (
    <PostHogContext.Provider value={{ isReady: posthogClient.isInitialized() }}>
      {children}
    </PostHogContext.Provider>
  );
}
