"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { StatItem, StatsSectionProps } from "./stats-section.types";

// ---------------------------------------------------------------------------
//  Count-up animation hook (IntersectionObserver + requestAnimationFrame)
// ---------------------------------------------------------------------------

/** Easing function: ease-out cubic for a natural deceleration feel. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Duration of the count-up animation in milliseconds. */
const ANIMATION_DURATION_MS = 2000;

/**
 * Hook that animates a number from 0 to `target` when the returned ref
 * element scrolls into the viewport. Returns `[ref, displayValue]`.
 *
 * - Uses IntersectionObserver with `threshold: 0.3` for triggering.
 * - Animates via requestAnimationFrame with ease-out-cubic easing.
 * - Respects `prefers-reduced-motion` and the `enabled` flag.
 * - Fires only once per mount (no re-trigger on scroll out/in).
 */
function useCountUp(
  target: number,
  enabled: boolean,
): [React.RefCallback<HTMLElement>, number] {
  const [displayValue, setDisplayValue] = useState(enabled ? 0 : target);
  const hasAnimatedRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);

  // Cleanup function to cancel animation frame and observer
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const refCallback = useCallback(
    (node: HTMLElement | null) => {
      // Cleanup previous observer
      if (observerRef.current && nodeRef.current) {
        observerRef.current.unobserve(nodeRef.current);
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      nodeRef.current = node;

      if (!node || !enabled || hasAnimatedRef.current) return;

      // Check for reduced motion preference
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setDisplayValue(target);
        hasAnimatedRef.current = true;
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting || hasAnimatedRef.current) return;

          hasAnimatedRef.current = true;
          observer.disconnect();

          const startTime = performance.now();

          function step(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
            const easedProgress = easeOutCubic(progress);
            const currentValue = easedProgress * target;

            setDisplayValue(currentValue);

            if (progress < 1) {
              frameRef.current = requestAnimationFrame(step);
            } else {
              setDisplayValue(target);
              frameRef.current = null;
            }
          }

          frameRef.current = requestAnimationFrame(step);
        },
        { threshold: 0.3 },
      );

      observerRef.current = observer;
      observer.observe(node);
    },
    [target, enabled],
  );

  return [refCallback, displayValue];
}

// ---------------------------------------------------------------------------
//  Format helper
// ---------------------------------------------------------------------------

/** Format a number for display: integers show rounded, decimals preserved. */
function formatStatValue(value: number, target: number): string {
  // If target is an integer, always display as rounded integer
  if (Number.isInteger(target)) {
    return Math.round(value).toLocaleString("en-US");
  }
  // Otherwise preserve the same number of decimal places as the target
  const decimalPlaces = target.toString().split(".")[1]?.length ?? 0;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

// ---------------------------------------------------------------------------
//  Single stat display
// ---------------------------------------------------------------------------

function StatDisplay({
  stat,
  animate: shouldAnimate,
}: {
  stat: StatItem;
  animate: boolean;
}) {
  const [ref, displayValue] = useCountUp(stat.value, shouldAnimate);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4 py-6">
      <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {stat.prefix ?? ""}
        {formatStatValue(displayValue, stat.value)}
        {stat.suffix ?? ""}
      </span>
      <span className="text-sm font-medium text-muted-foreground">
        {stat.label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Main Section
// ---------------------------------------------------------------------------

/**
 * StatsSection renders a responsive grid of stat items with optional
 * animated count-up numbers, vertical/horizontal separators, and a
 * configurable section heading.
 *
 * Uses IntersectionObserver + requestAnimationFrame for performant,
 * dependency-free count-up animation that triggers on scroll into viewport.
 * Respects `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * <StatsSection
 *   title="Our Impact"
 *   description="Numbers that speak for themselves"
 *   stats={[
 *     { value: 500, label: "Clients", suffix: "+" },
 *     { value: 99.9, label: "Uptime", suffix: "%" },
 *     { value: 24, label: "Support", suffix: "/7" },
 *     { value: 10, label: "Revenue", prefix: "$", suffix: "M+" },
 *   ]}
 * />
 * ```
 */
export function StatsSection({
  title,
  description,
  stats,
  animate = true,
  className,
}: StatsSectionProps) {
  return (
    <section className={cn("w-full py-16 px-4 sm:px-6 lg:px-8", className)}>
      {/* Section header */}
      {(title || description) && (
        <div className="mx-auto max-w-2xl text-center mb-12">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-3 text-base text-muted-foreground text-balance">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div
        className={cn(
          "mx-auto max-w-5xl",
          // Grid: 1 col on mobile, 2 on sm, then adapt to item count on lg
          "grid grid-cols-1 sm:grid-cols-2",
          stats.length === 3 && "lg:grid-cols-3",
          stats.length !== 3 && "lg:grid-cols-4",
        )}
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className="relative">
            {/* Vertical separator between items (desktop only) */}
            {index > 0 && (
              <Separator
                orientation="vertical"
                className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block h-12"
              />
            )}

            {/* Horizontal separator between rows (mobile/tablet) */}
            {index > 0 && (
              <Separator
                orientation="horizontal"
                className="block lg:hidden mx-auto w-16"
              />
            )}

            <StatDisplay stat={stat} animate={animate} />
          </div>
        ))}
      </div>
    </section>
  );
}
