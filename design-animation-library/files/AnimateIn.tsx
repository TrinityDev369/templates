"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode, type CSSProperties } from "react";
import { fade, fadeUp, transitions } from "./presets";

type AnimationPreset = "fade" | "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scaleIn" | "blurIn";

interface AnimateInProps {
  children: ReactNode;
  /** Animation preset or custom variants */
  animation?: AnimationPreset | Variants;
  /** Delay in seconds */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Trigger animation when element enters viewport */
  viewport?: boolean;
  /** Only animate once when in viewport */
  once?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** HTML element to render as */
  as?: keyof typeof motion;
}

const presetMap: Record<AnimationPreset, Variants> = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  fadeUp: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
  fadeDown: { hidden: { opacity: 0, y: -16 }, visible: { opacity: 1, y: 0 } },
  fadeLeft: { hidden: { opacity: 0, x: 16 }, visible: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  blurIn: { hidden: { opacity: 0, filter: "blur(8px)" }, visible: { opacity: 1, filter: "blur(0px)" } },
};

/**
 * Animate children into view with preset or custom animations.
 * Automatically disables animation when reduced motion is preferred.
 *
 * @example
 * <AnimateIn animation="fadeUp" delay={0.2}>
 *   <h1>Hello</h1>
 * </AnimateIn>
 *
 * <AnimateIn animation="scaleIn" viewport once>
 *   <Card />
 * </AnimateIn>
 */
export function AnimateIn({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 0.25,
  viewport = false,
  once = true,
  className,
  style,
  as = "div",
}: AnimateInProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  const variants = typeof animation === "string" ? presetMap[animation] : animation;
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      variants={variants}
      initial="hidden"
      animate={viewport ? undefined : "visible"}
      whileInView={viewport ? "visible" : undefined}
      viewport={viewport ? { once, margin: "-50px" } : undefined}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}
