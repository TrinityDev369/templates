"use client";

import {
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type ElementType,
  type CSSProperties,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionStyle,
  type SpringOptions,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Offset for centering the followed element on the cursor. */
export interface CursorFollowOffset {
  /** Horizontal pixel offset subtracted from cursor x. @default 0 */
  x: number;
  /** Vertical pixel offset subtracted from cursor y. @default 0 */
  y: number;
}

/**
 * Props for the `CursorFollow` component.
 *
 * All spring physics parameters map directly to framer-motion's
 * `useSpring` options, giving you full control over the feel of the
 * trailing motion.
 */
export interface CursorFollowProps {
  /** Content that will follow the cursor. */
  children: ReactNode;
  /**
   * Spring stiffness — higher values create snappier tracking.
   * @default 150
   */
  stiffness?: number;
  /**
   * Spring damping — higher values reduce oscillation.
   * @default 15
   */
  damping?: number;
  /**
   * Spring mass — higher values create heavier, more sluggish motion.
   * @default 1
   */
  mass?: number;
  /**
   * Additional CSS class applied to the outer tracking container.
   */
  className?: string;
  /**
   * Additional inline styles merged onto the outer container.
   */
  style?: CSSProperties;
  /**
   * The HTML element type to render as the motion wrapper.
   * @default 'div'
   */
  as?: ElementType;
  /**
   * Pixel offset subtracted from the raw cursor position. Useful for
   * centering the followed element on the pointer — set to half the
   * element's width/height.
   * @default { x: 0, y: 0 }
   */
  offset?: CursorFollowOffset;
  /**
   * When `"window"`, mouse tracking listens on the window (the element
   * follows the cursor anywhere on the page). When `"container"`, it
   * only tracks within the bounds of the container element itself.
   * @default "window"
   */
  mode?: "window" | "container";
  /**
   * When true the element is hidden (opacity 0) until the first mouse
   * move event fires. Prevents the element from flashing at (0, 0) on
   * mount.
   * @default true
   */
  hideUntilMove?: boolean;
}

/* ------------------------------------------------------------------ */
/*  useMousePosition hook                                              */
/* ------------------------------------------------------------------ */

/** Options for the `useMousePosition` hook. */
export interface UseMousePositionOptions {
  /**
   * Spring stiffness.
   * @default 150
   */
  stiffness?: number;
  /**
   * Spring damping.
   * @default 15
   */
  damping?: number;
  /**
   * Spring mass.
   * @default 1
   */
  mass?: number;
  /**
   * Pixel offset subtracted from raw cursor position.
   * @default { x: 0, y: 0 }
   */
  offset?: CursorFollowOffset;
  /**
   * When true, snap immediately instead of springing (for reduced
   * motion preference).
   * @default false
   */
  immediate?: boolean;
}

/** Return value of the `useMousePosition` hook. */
export interface UseMousePositionReturn {
  /** Spring-animated x motion value. */
  x: ReturnType<typeof useSpring>;
  /** Spring-animated y motion value. */
  y: ReturnType<typeof useSpring>;
  /** Whether the mouse has moved at least once. */
  hasMoved: boolean;
}

/**
 * Standalone hook that tracks the mouse position on `window` and
 * returns spring-animated `x` and `y` motion values.
 *
 * @example
 * ```tsx
 * function Dot() {
 *   const { x, y, hasMoved } = useMousePosition({ stiffness: 200 });
 *   return (
 *     <motion.div
 *       style={{
 *         x,
 *         y,
 *         position: "fixed",
 *         top: 0,
 *         left: 0,
 *         opacity: hasMoved ? 1 : 0,
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function useMousePosition(
  options: UseMousePositionOptions = {}
): UseMousePositionReturn {
  const {
    stiffness = 150,
    damping = 15,
    mass = 1,
    offset = { x: 0, y: 0 },
    immediate = false,
  } = options;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const hasMovedRef = useRef(false);

  /* When `immediate` is true we use an extremely stiff, critically
     damped spring that effectively snaps with no perceptible delay.
     This satisfies the prefers-reduced-motion requirement without
     branching into a completely different code-path. */
  const springConfig: SpringOptions = immediate
    ? { stiffness: 10000, damping: 500, mass: 0.1 }
    : { stiffness, damping, mass };

  const springX = useSpring(rawX, springConfig);
  const springY = useSpring(rawY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      hasMovedRef.current = true;
      rawX.set(e.clientX - offset.x);
      rawY.set(e.clientY - offset.y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [rawX, rawY, offset.x, offset.y]);

  return {
    x: springX,
    y: springY,
    hasMoved: hasMovedRef.current,
  };
}

/* ------------------------------------------------------------------ */
/*  CursorFollow component                                             */
/* ------------------------------------------------------------------ */

/**
 * `CursorFollow` wraps any content to make it magnetically track the
 * mouse pointer with configurable spring physics.
 *
 * The component renders a `motion.div` (or any element via `as`) that
 * is positioned with `position: fixed` at (0, 0) and translated to the
 * cursor location using spring-animated `x` / `y` transforms. This
 * avoids layout shifts and works regardless of scroll position.
 *
 * Accessibility: when the user prefers reduced motion the spring is
 * replaced with an instant snap (effectively `stiffness: Infinity`),
 * removing all oscillation and trailing.
 *
 * @example
 * ```tsx
 * <CursorFollow stiffness={150} damping={15} offset={{ x: 16, y: 16 }}>
 *   <div style={{
 *     width: 32, height: 32,
 *     borderRadius: '50%',
 *     background: 'rgba(99, 102, 241, 0.6)',
 *   }} />
 * </CursorFollow>
 * ```
 *
 * @example Using container mode — element only tracks within the box.
 * ```tsx
 * <CursorFollow mode="container" stiffness={200} damping={20}>
 *   <span>Magnetic label</span>
 * </CursorFollow>
 * ```
 */
export function CursorFollow({
  children,
  stiffness = 150,
  damping = 15,
  mass = 1,
  className,
  style,
  as = "div",
  offset = { x: 0, y: 0 },
  mode = "window",
  hideUntilMove = true,
}: CursorFollowProps) {
  /* ---- reduced motion -------------------------------------------- */
  const prefersReducedMotion = useReducedMotion();

  /* ---- motion values --------------------------------------------- */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  /* When the user prefers reduced motion we snap immediately. */
  const springConfig: SpringOptions = prefersReducedMotion
    ? { stiffness: 10000, damping: 500, mass: 0.1 }
    : { stiffness, damping, mass };

  const springX = useSpring(rawX, springConfig);
  const springY = useSpring(rawY, springConfig);

  /* Track first move so we can hide the element at (0, 0). */
  const hasMovedRef = useRef(false);
  const opacityMv = useMotionValue(hideUntilMove ? 0 : 1);

  /* ---- container ref (for mode="container") ---------------------- */
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- window-level tracking ------------------------------------- */
  useEffect(() => {
    if (mode !== "window") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        opacityMv.set(1);
      }
      rawX.set(e.clientX - offset.x);
      rawY.set(e.clientY - offset.y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [rawX, rawY, offset.x, offset.y, mode, opacityMv]);

  /* ---- container-level tracking ---------------------------------- */
  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (mode !== "container") return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        opacityMv.set(1);
      }

      /* In container mode we track position relative to the
         container's top-left corner. */
      rawX.set(e.clientX - rect.left - offset.x);
      rawY.set(e.clientY - rect.top - offset.y);
    },
    [rawX, rawY, offset.x, offset.y, mode, opacityMv]
  );

  const handleContainerMouseLeave = useCallback(() => {
    if (mode !== "container") return;
    if (hideUntilMove) {
      opacityMv.set(0);
      hasMovedRef.current = false;
    }
  }, [mode, hideUntilMove, opacityMv]);

  /* ---- render ---------------------------------------------------- */

  /*
   * Build the motion component. We use `motion[as]` to support the
   * polymorphic `as` prop. The component is wrapped in a positioned
   * container that defines the tracking region.
   *
   * For `mode="window"` the inner motion element is `position: fixed`
   * and translated from (0, 0).
   *
   * For `mode="container"` we render a relative wrapper so the
   * follower stays inside the container bounds using
   * `position: absolute`.
   */

  /* Resolve the motion component for the given element type. */
  const MotionComponent = getMotionComponent(as);

  const innerMotionStyle: MotionStyle = {
    x: springX,
    y: springY,
    opacity: opacityMv,
    position: mode === "window" ? "fixed" : "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none" as const,
    willChange: "transform",
    zIndex: 50,
  };

  if (mode === "container") {
    /* Container mode: relative wrapper catches mouse events. */
    const containerStyle: CSSProperties = {
      position: "relative",
      overflow: "hidden",
      ...style,
    };

    return (
      <div
        ref={containerRef}
        className={className}
        style={containerStyle}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
      >
        <MotionComponent style={innerMotionStyle}>
          {children}
        </MotionComponent>
      </div>
    );
  }

  /* Window mode: no outer wrapper needed, motion element is fixed. */
  return (
    <MotionComponent
      className={className}
      style={{
        ...innerMotionStyle,
        ...(style as MotionStyle),
      }}
    >
      {children}
    </MotionComponent>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Resolve an `ElementType` to the matching `motion.*` component.
 *
 * Framer Motion exposes `motion.div`, `motion.span`, etc. for native
 * HTML elements. For custom components we fall back to `motion.div`
 * to avoid runtime errors.
 */
function getMotionComponent(as: ElementType) {
  if (typeof as === "string" && as in motion) {
    return (motion as unknown as Record<string, typeof motion.div>)[as];
  }
  return motion.div;
}

/* ------------------------------------------------------------------ */
/*  Re-exports for convenience                                         */
/* ------------------------------------------------------------------ */

export type { SpringOptions } from "framer-motion";
