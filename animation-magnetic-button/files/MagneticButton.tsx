"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
} from "framer-motion";

/* ── Types ──────────────────────────────────────────────── */

/**
 * Props that conflict between React's HTML button attributes and
 * framer-motion's motion component props (e.g. onDrag, onAnimationStart).
 * We omit them so the spread into `motion.button` is type-safe.
 */
type ConflictingMotionProps =
  | "onDrag"
  | "onDragEnd"
  | "onDragStart"
  | "onAnimationStart"
  | "onAnimationEnd";

export interface MagneticButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    ConflictingMotionProps
  > {
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS class appended to the root element */
  className?: string;
  /**
   * Magnetic pull strength (0 to 1).
   * 0 = no movement, 1 = cursor offset fully applied.
   * @default 0.35
   */
  strength?: number;
  /**
   * Detection radius in pixels. Controls the conceptual proximity
   * zone. Currently the effect activates on native hover; the radius
   * value is available for consumers who implement custom proximity
   * detection around the button.
   * @default 120
   */
  radius?: number;
}

/* ── Spring config ──────────────────────────────────────── */

/**
 * A single spring config tuned for both attraction and snap-back.
 * Low mass + moderate stiffness = responsive follow; moderate damping
 * prevents oscillation on release.
 */
const SPRING_CONFIG: SpringOptions = {
  stiffness: 150,
  damping: 15,
  mass: 0.1,
};

/* ── Styles ─────────────────────────────────────────────── */

const rootStyle: React.CSSProperties = {
  /* Layout */
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  /* Appearance — fully overridable via CSS custom properties */
  padding: "0.75em 1.75em",
  fontSize: "1rem",
  lineHeight: 1.5,
  fontFamily: "inherit",
  fontWeight: 500,
  color: "var(--mb-text, #1a1a1a)",
  background: "var(--mb-bg, transparent)",
  border: "1px solid var(--mb-border, #d0d0d0)",
  borderRadius: "var(--mb-radius, 8px)",
  cursor: "pointer",
  /* Reset */
  outline: "none",
  WebkitTapHighlightColor: "transparent",
  userSelect: "none",
  willChange: "transform",
};

const innerStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  willChange: "transform",
};

/* ── Helpers ────────────────────────────────────────────── */

/** Returns true when the user prefers reduced motion. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/* ── Component ──────────────────────────────────────────── */

/**
 * MagneticButton
 *
 * An interactive button that magnetically attracts toward the cursor
 * when hovering. The button body translates by an amount proportional
 * to `strength`, and the inner content (text / icons) translates 1.5x
 * further for a subtle parallax depth effect.
 *
 * Spring physics (via framer-motion) drive both the attraction and the
 * snap-back on mouse leave, creating an organic, physical feel.
 *
 * Style with CSS custom properties:
 *   --mb-bg      Background color  (default: transparent)
 *   --mb-text    Text color         (default: #1a1a1a)
 *   --mb-border  Border color       (default: #d0d0d0)
 *   --mb-radius  Border radius      (default: 8px)
 *
 * @example
 * ```tsx
 * <MagneticButton strength={0.4} radius={150} onClick={handleClick}>
 *   Get Started
 * </MagneticButton>
 * ```
 */
export const MagneticButton = React.forwardRef<
  HTMLButtonElement,
  MagneticButtonProps
>(
  (
    {
      children,
      className,
      strength = 0.35,
      radius: _radius = 120,
      disabled,
      style,
      onMouseMove: externalMouseMove,
      onMouseLeave: externalMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    /* ── Refs ──────────────────────────────────────────────── */
    const btnRef = useRef<HTMLButtonElement | null>(null);

    /* Merge forwarded ref with internal ref */
    const setRef = useCallback(
      (el: HTMLButtonElement | null) => {
        btnRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref)
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      },
      [ref],
    );

    /* ── Motion values ────────────────────────────────────── */

    /*
     * Architecture: each axis has a raw MotionValue that we `.set()`
     * imperatively, piped into a `useSpring` that smooths the output.
     * The spring output is bound to the `style.x / style.y` of the
     * motion elements — framer-motion handles the GPU-accelerated
     * transform updates.
     */

    /* Raw target offsets for the button body */
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    /* Springified values for the button body */
    const springX = useSpring(x, SPRING_CONFIG);
    const springY = useSpring(y, SPRING_CONFIG);

    /* Raw target offsets for inner content (parallax) */
    const innerX = useMotionValue(0);
    const innerY = useMotionValue(0);

    /* Springified values for the inner content */
    const springInnerX = useSpring(innerX, SPRING_CONFIG);
    const springInnerY = useSpring(innerY, SPRING_CONFIG);

    /* ── Derived values ───────────────────────────────────── */
    const clampedStrength = Math.max(0, Math.min(1, strength));
    const innerMultiplier = 1.5;

    /* ── Handlers ─────────────────────────────────────────── */

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        externalMouseMove?.(e);

        if (disabled || prefersReducedMotion) return;

        const el = btnRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();

        /* Center of the button */
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        /* Offset from center */
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;

        /* Apply strength factor */
        const offsetX = distX * clampedStrength;
        const offsetY = distY * clampedStrength;

        x.set(offsetX);
        y.set(offsetY);

        /* Inner parallax: content moves further than the button body */
        innerX.set(offsetX * innerMultiplier);
        innerY.set(offsetY * innerMultiplier);
      },
      [
        clampedStrength,
        disabled,
        prefersReducedMotion,
        x,
        y,
        innerX,
        innerY,
        externalMouseMove,
      ],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        externalMouseLeave?.(e);

        /* Reset all targets to origin — the springs animate back smoothly */
        x.set(0);
        y.set(0);
        innerX.set(0);
        innerY.set(0);
      },
      [x, y, innerX, innerY, externalMouseLeave],
    );

    /* ── Render ────────────────────────────────────────────── */

    const mergedStyle: React.CSSProperties = { ...rootStyle, ...style };

    return (
      <motion.button
        ref={setRef}
        type="button"
        className={className}
        disabled={disabled}
        style={{
          ...mergedStyle,
          x: prefersReducedMotion ? 0 : springX,
          y: prefersReducedMotion ? 0 : springY,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <motion.span
          style={{
            ...innerStyle,
            x: prefersReducedMotion ? 0 : springInnerX,
            y: prefersReducedMotion ? 0 : springInnerY,
          }}
        >
          {children}
        </motion.span>
      </motion.button>
    );
  },
);

MagneticButton.displayName = "MagneticButton";
