"use client";

import React, { useRef, useMemo } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variant,
} from "framer-motion";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Preset =
  | "fadeUp"
  | "fadeDown"
  | "fadeLeft"
  | "fadeRight"
  | "scale"
  | "blur"
  | "none";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Animation preset. @default "fadeUp" */
  preset?: Preset;
  /** Delay in seconds before the animation starts. @default 0 */
  delay?: number;
  /** Duration of the animation in seconds. @default 0.6 */
  duration?: number;
  /**
   * Intersection Observer threshold (0-1).
   * Fraction of the element that must be visible to trigger.
   * @default 0.15
   */
  threshold?: number;
  /** If true, the animation only plays once. @default true */
  once?: boolean;
  /** Optional CSS class name applied to the wrapper element. */
  className?: string;
  /**
   * The HTML element or React component to render as the wrapper.
   * @default "div"
   */
  as?: React.ElementType;
}

interface StaggerRevealProps {
  children: React.ReactNode;
  /** Delay between each child animation in seconds. @default 0.1 */
  stagger?: number;
  /** Animation preset applied to each child. @default "fadeUp" */
  preset?: Preset;
  /**
   * Intersection Observer threshold (0-1).
   * @default 0.15
   */
  threshold?: number;
  /** If true, each child only animates once. @default true */
  once?: boolean;
  /** Optional CSS class name applied to the outer wrapper. */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Preset Variants                               */
/* -------------------------------------------------------------------------- */

interface PresetVariants {
  hidden: Variant;
  visible: Variant;
}

const presets: Record<Preset, PresetVariants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(8px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  none: {
    hidden: {},
    visible: {},
  },
};

/* -------------------------------------------------------------------------- */
/*                              ScrollReveal                                  */
/* -------------------------------------------------------------------------- */

/**
 * Reveals its children with scroll-triggered animation.
 *
 * Uses Intersection Observer via framer-motion's `useInView` for
 * performant, off-main-thread visibility detection.
 *
 * Respects `prefers-reduced-motion` — when enabled, content renders
 * immediately without any animation.
 */
export function ScrollReveal({
  children,
  preset = "fadeUp",
  delay = 0,
  duration = 0.6,
  threshold = 0.15,
  once = true,
  className,
  as: Component = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const prefersReducedMotion = useReducedMotion();

  const MotionComponent = useMemo(
    () => motion.create(Component),
    [Component],
  );

  // Respect prefers-reduced-motion: render immediately, no animation
  if (prefersReducedMotion) {
    return (
      <Component ref={ref} className={className}>
        {children}
      </Component>
    );
  }

  const { hidden, visible } = presets[preset];

  return (
    <MotionComponent
      ref={ref}
      initial={hidden}
      animate={isInView ? visible : hidden}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier easeOut
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

/* -------------------------------------------------------------------------- */
/*                             StaggerReveal                                  */
/* -------------------------------------------------------------------------- */

/**
 * Wraps each child in a `ScrollReveal` with an incrementing delay,
 * creating a staggered reveal effect as the group scrolls into view.
 *
 * Each child receives `delay = index * stagger`, so the first child
 * animates immediately and subsequent children follow in sequence.
 */
export function StaggerReveal({
  children,
  stagger = 0.1,
  preset = "fadeUp",
  threshold = 0.15,
  once = true,
  className,
}: StaggerRevealProps) {
  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => (
        <ScrollReveal
          key={
            React.isValidElement(child) && child.key != null
              ? child.key
              : index
          }
          preset={preset}
          delay={index * stagger}
          threshold={threshold}
          once={once}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
