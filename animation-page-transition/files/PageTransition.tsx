"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Available animation presets for page transitions. */
export type TransitionPreset = "fade" | "slide" | "scale" | "flip" | "none";

/** Slide direction — determines entry and exit directions. */
export type SlideDirection = "left" | "right" | "up" | "down";

/** AnimatePresence mode forwarded directly to Framer Motion. */
export type PresenceMode = "wait" | "sync" | "popLayout";

export interface PageTransitionProps {
  children: ReactNode;
  /**
   * Animation preset to use for the transition.
   * @default "fade"
   */
  preset?: TransitionPreset;
  /**
   * Direction for the `slide` preset. Ignored by other presets.
   * @default "left"
   */
  direction?: SlideDirection;
  /**
   * Duration of the transition in seconds.
   * @default 0.4
   */
  duration?: number;
  /**
   * Optional CSS class applied to the wrapping `motion.div`.
   */
  className?: string;
  /**
   * AnimatePresence `mode` — controls how entering and exiting children
   * are orchestrated.
   * @default "wait"
   */
  mode?: PresenceMode;
  /**
   * Callback fired when the enter animation completes.
   */
  onAnimationComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Preset Definitions
// ---------------------------------------------------------------------------

/**
 * Offset map for the slide preset. The *initial* state slides in from the
 * given direction; the *exit* state slides out in the opposite direction.
 */
const slideOffsets: Record<SlideDirection, { x?: string; y?: string }> = {
  left: { x: "-100%" },
  right: { x: "100%" },
  up: { y: "-100%" },
  down: { y: "100%" },
};

const oppositeDirection: Record<SlideDirection, SlideDirection> = {
  left: "right",
  right: "left",
  up: "down",
  down: "up",
};

/**
 * Build Framer Motion variants for a given preset and direction.
 *
 * Each preset returns an object with `initial`, `animate`, and `exit` keys
 * matching Framer Motion's variant convention.
 */
function buildVariants(
  preset: TransitionPreset,
  direction: SlideDirection,
): Variants {
  switch (preset) {
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

    case "slide": {
      const enter = slideOffsets[direction];
      const exit = slideOffsets[oppositeDirection[direction]];
      return {
        initial: { opacity: 0, ...enter },
        animate: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, ...exit },
      };
    }

    case "scale":
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
      };

    case "flip":
      return {
        initial: { opacity: 0, rotateY: 90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: -90 },
      };

    case "none":
    default:
      return {
        initial: {},
        animate: {},
        exit: {},
      };
  }
}

// ---------------------------------------------------------------------------
// Exported presets object
// ---------------------------------------------------------------------------

/**
 * Pre-built preset variant objects. Use these if you need to extend or
 * compose custom transitions from the built-in presets.
 *
 * @example
 * ```tsx
 * import { pageTransitionPresets } from './PageTransition';
 *
 * const custom: Variants = {
 *   ...pageTransitionPresets.fade,
 *   animate: { ...pageTransitionPresets.fade.animate, scale: 1.02 },
 * };
 * ```
 */
export const pageTransitionPresets: Record<TransitionPreset, Variants> = {
  fade: buildVariants("fade", "left"),
  slide: buildVariants("slide", "left"),
  scale: buildVariants("scale", "left"),
  flip: buildVariants("flip", "left"),
  none: buildVariants("none", "left"),
};

// ---------------------------------------------------------------------------
// Reduced-motion hook
// ---------------------------------------------------------------------------

/**
 * Detects `prefers-reduced-motion: reduce` at runtime and reacts to changes.
 * When reduced motion is preferred the component falls back to the `none`
 * preset, satisfying WCAG 2.3.3 (Animation from Interactions).
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleChange(event: MediaQueryListEvent): void {
      setPrefersReduced(event.matches);
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}

// ---------------------------------------------------------------------------
// Perspective wrapper style (for flip preset)
// ---------------------------------------------------------------------------

const perspectiveStyle: CSSProperties = {
  perspective: 1200,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `PageTransition` wraps page content with enter/exit animations powered by
 * Framer Motion's `AnimatePresence`.
 *
 * **Important**: You _must_ pass a unique `key` to `PageTransition` so that
 * `AnimatePresence` can detect when the page changes. Typically this is the
 * current route path.
 *
 * @example
 * ```tsx
 * // React Router v6
 * import { useLocation } from 'react-router-dom';
 *
 * function App() {
 *   const location = useLocation();
 *   return (
 *     <AnimatePresence mode="wait">
 *       <PageTransition key={location.pathname} preset="slide" direction="left">
 *         <Routes location={location}>
 *           <Route path="/" element={<Home />} />
 *           <Route path="/about" element={<About />} />
 *         </Routes>
 *       </PageTransition>
 *     </AnimatePresence>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Next.js App Router (layout.tsx)
 * 'use client';
 * import { usePathname } from 'next/navigation';
 *
 * export default function Template({ children }: { children: React.ReactNode }) {
 *   const pathname = usePathname();
 *   return (
 *     <PageTransition key={pathname} preset="fade">
 *       {children}
 *     </PageTransition>
 *   );
 * }
 * ```
 */
export function PageTransition({
  children,
  preset = "fade",
  direction = "left",
  duration = 0.4,
  className,
  mode = "wait",
  onAnimationComplete,
}: PageTransitionProps): JSX.Element {
  const prefersReduced = usePrefersReducedMotion();

  // When the user prefers reduced motion, disable all animations.
  const effectivePreset: TransitionPreset = prefersReduced ? "none" : preset;

  const variants = buildVariants(effectivePreset, direction);

  const transition = {
    duration: effectivePreset === "none" ? 0 : duration,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };

  // The flip preset requires a perspective container so the 3D rotation
  // is visible. We wrap the AnimatePresence in a div with perspective.
  const needsPerspective = effectivePreset === "flip";

  const content = (
    <AnimatePresence mode={mode}>
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        onAnimationComplete={onAnimationComplete}
        className={className}
        style={needsPerspective ? { transformStyle: "preserve-3d" } : undefined}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );

  if (needsPerspective) {
    return <div style={perspectiveStyle}>{content}</div>;
  }

  return content;
}
