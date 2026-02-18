"use client";

import {
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type MouseEvent,
} from "react";
import styles from "./3d-card-tilt.module.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Card3DTiltProps {
  /** Content rendered inside the tilt card. */
  children: ReactNode;
  /** Additional CSS class applied to the outer wrapper. */
  className?: string;
  /** Maximum tilt angle in degrees. @default 15 */
  maxTilt?: number;
  /** Scale factor applied on hover. @default 1.05 */
  scale?: number;
  /** Transition duration in milliseconds for enter/leave easing. @default 400 */
  speed?: number;
  /** Whether to render a glare (light reflection) overlay. @default true */
  glare?: boolean;
  /** Peak opacity of the glare highlight. @default 0.35 */
  glareMaxOpacity?: number;
  /** CSS perspective value in pixels. @default 1000 */
  perspective?: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Card3DTilt({
  children,
  className,
  maxTilt = 15,
  scale = 1.05,
  speed = 400,
  glare = true,
  glareMaxOpacity = 0.35,
  perspective = 1000,
}: Card3DTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  /* Track whether the pointer is currently inside the card so we can
     distinguish "actively hovering" from "transitioning out".          */
  const [isHovering, setIsHovering] = useState(false);

  /* Inline transform + glare values updated via rAF for performance.  */
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({});
  const [glareVars, setGlareVars] = useState<Record<string, string>>({});

  /* ---- helpers ---------------------------------------------------- */

  const updateTilt = useCallback(
    (clientX: number, clientY: number) => {
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      /* Normalised position: -0.5 .. +0.5 from center */
      const xNorm = (clientX - rect.left) / width - 0.5;
      const yNorm = (clientY - rect.top) / height - 0.5;

      /* rotateX is driven by vertical position (positive yNorm = tilt
         away from viewer = negative rotateX) and vice-versa.           */
      const rotateX = -(yNorm * maxTilt * 2);
      const rotateY = xNorm * maxTilt * 2;

      setTiltStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
      });

      if (glare) {
        /* Move glare spot to follow the mouse.  The spot centre should
           be roughly where the cursor is, mapped into the oversized
           pseudo-element coordinate space.                              */
        const glareX = (xNorm + 0.5) * 100;
        const glareY = (yNorm + 0.5) * 100;

        /* Opacity scales with distance from centre — brighter at edges */
        const distFromCenter = Math.sqrt(xNorm * xNorm + yNorm * yNorm);
        const opacity = Math.min(
          distFromCenter * 2 * glareMaxOpacity,
          glareMaxOpacity
        );

        setGlareVars({
          "--glare-top": `${-50 + glareY}%`,
          "--glare-left": `${-50 + glareX}%`,
          "--glare-translate-x": "0%",
          "--glare-translate-y": "0%",
          "--glare-opacity": opacity.toFixed(3),
        });
      }
    },
    [maxTilt, scale, speed, perspective, glare, glareMaxOpacity]
  );

  /* ---- event handlers -------------------------------------------- */

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      /* Debounce to the next animation frame to avoid layout thrash. */
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateTilt(e.clientX, e.clientY);
      });
    },
    [updateTilt]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setIsHovering(false);

    /* Smoothly reset to the flat resting state. */
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
    });

    if (glare) {
      setGlareVars({
        "--glare-top": "-50%",
        "--glare-left": "-50%",
        "--glare-translate-x": "0%",
        "--glare-translate-y": "0%",
        "--glare-opacity": "0",
      });
    }
  }, [perspective, speed, glare]);

  /* ---- render ---------------------------------------------------- */

  const outerClasses = [styles.card, className].filter(Boolean).join(" ");

  return (
    <div
      ref={cardRef}
      className={outerClasses}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      /* Accessibility: the tilt is purely decorative, so we keep the
         element out of the tab order and hide the motion from screen
         readers.                                                       */
      aria-hidden="true"
    >
      {children}

      {glare && isHovering && (
        <div
          className={styles.glare}
          style={glareVars as CSSProperties}
        />
      )}
    </div>
  );
}
