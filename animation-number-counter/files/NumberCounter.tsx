"use client";

import { useEffect, useRef } from "react";
import {
  useMotionValue,
  useTransform,
  animate,
  useInView,
  useReducedMotion,
} from "framer-motion";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

/** Easing presets for the counter animation. */
export type EasingPreset =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "circIn"
  | "circOut"
  | "circInOut";

export interface NumberCounterProps {
  /** Starting value for the counter. @default 0 */
  from?: number;
  /** Target value the counter animates toward. Required. */
  to: number;
  /** Animation duration in seconds. @default 2 */
  duration?: number;
  /** Delay before animation starts, in seconds. @default 0 */
  delay?: number;
  /** Easing curve for the animation. @default "easeOut" */
  easing?: EasingPreset;
  /**
   * Custom formatter applied to the current numeric value.
   * Receives the interpolated number, returns a display string.
   * Overrides the default integer/decimal formatting when provided.
   */
  format?: (value: number) => string;
  /** String prepended to the displayed value (e.g. "$", "#"). */
  prefix?: string;
  /** String appended to the displayed value (e.g. "%", " users"). */
  suffix?: string;
  /** CSS class name applied to the wrapping `<span>`. */
  className?: string;
  /**
   * When true, animation starts only when the element scrolls into the viewport.
   * When false, animation starts immediately on mount.
   * @default true
   */
  triggerOnView?: boolean;
  /**
   * When true, the animation plays only the first time the element enters
   * the viewport. Subsequent exits and re-entries show the final value.
   * Only relevant when `triggerOnView` is true.
   * @default true
   */
  once?: boolean;
  /**
   * Number of decimal places to display.
   * When 0, values are rounded to integers.
   * @default 0
   */
  decimals?: number;
}

/* -------------------------------------------------------------------------- */
/*                            Formatting Helpers                              */
/* -------------------------------------------------------------------------- */

/**
 * Formats a number with comma-separated thousands.
 *
 * @example
 * formatWithCommas(1234567) // "1,234,567"
 * formatWithCommas(1234.56) // "1,234.56"
 */
export function formatWithCommas(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * Formats a number as USD currency with two decimal places.
 *
 * @example
 * formatCurrency(1234.5) // "$1,234.50"
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/* -------------------------------------------------------------------------- */
/*                           Default Formatter                                */
/* -------------------------------------------------------------------------- */

function defaultFormat(value: number, decimals: number): string {
  if (decimals <= 0) {
    return Math.round(value).toString();
  }
  return value.toFixed(decimals);
}

/* -------------------------------------------------------------------------- */
/*                            NumberCounter                                   */
/* -------------------------------------------------------------------------- */

/**
 * Animated number counter that smoothly interpolates between two values.
 *
 * Uses framer-motion's `useMotionValue` + `animate` for performant,
 * tween-based number interpolation with configurable easing curves.
 *
 * Triggers on scroll into viewport by default (via `useInView`), or
 * can be set to animate immediately on mount with `triggerOnView={false}`.
 *
 * Respects `prefers-reduced-motion` — when enabled the final value
 * renders immediately without any animation.
 *
 * @example
 * ```tsx
 * <NumberCounter to={1500} duration={2} />
 * <NumberCounter to={99.9} decimals={1} prefix="$" />
 * <NumberCounter to={1000000} format={formatWithCommas} suffix=" users" />
 * ```
 */
export function NumberCounter({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  easing = "easeOut",
  format,
  prefix = "",
  suffix = "",
  className,
  triggerOnView = true,
  once = true,
  decimals = 0,
}: NumberCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(from);
  const prefersReducedMotion = useReducedMotion();
  const hasAnimatedRef = useRef(false);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  // useInView for viewport triggering
  const isInView = useInView(ref, {
    once,
    amount: 0.5,
  });

  // Derive displayed text from the motion value
  const displayValue = useTransform(motionValue, (current) => {
    const formatted = format
      ? format(current)
      : defaultFormat(current, decimals);
    return `${prefix}${formatted}${suffix}`;
  });

  // Build the final display string for the aria-label
  const finalDisplay = format
    ? `${prefix}${format(to)}${suffix}`
    : `${prefix}${defaultFormat(to, decimals)}${suffix}`;

  // Sync the display text into the DOM node imperatively to avoid
  // React re-renders on every animation frame.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const unsubscribe = displayValue.on("change", (latest) => {
      node.textContent = latest;
    });

    return unsubscribe;
  }, [displayValue]);

  // Handle reduced motion — show final value immediately
  useEffect(() => {
    if (prefersReducedMotion) {
      motionValue.set(to);
    }
  }, [prefersReducedMotion, to, motionValue]);

  // Animation trigger logic
  useEffect(() => {
    // Skip animation if reduced motion is preferred
    if (prefersReducedMotion) return;

    const shouldAnimate = triggerOnView ? isInView : true;
    if (!shouldAnimate) return;

    // If once mode and already animated, skip
    if (once && hasAnimatedRef.current) return;

    // Reset to starting value before animating
    motionValue.set(from);

    controlsRef.current = animate(motionValue, to, {
      duration,
      delay,
      ease: easing,
    });

    hasAnimatedRef.current = true;

    return () => {
      controlsRef.current?.stop();
    };
  }, [
    isInView,
    triggerOnView,
    from,
    to,
    duration,
    delay,
    easing,
    motionValue,
    prefersReducedMotion,
    once,
  ]);

  // Set initial text content
  const initialText = prefersReducedMotion
    ? finalDisplay
    : format
      ? `${prefix}${format(from)}${suffix}`
      : `${prefix}${defaultFormat(from, decimals)}${suffix}`;

  return (
    <span
      ref={ref}
      className={className}
      aria-label={finalDisplay}
    >
      {initialText}
    </span>
  );
}
