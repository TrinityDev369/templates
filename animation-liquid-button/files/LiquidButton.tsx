import React, { useEffect, useRef, useCallback } from 'react';
import styles from './LiquidButton.module.css';

/* ── Types ──────────────────────────────────────────────── */

export type LiquidButtonVariant = 'primary' | 'secondary';
export type LiquidButtonSize = 'sm' | 'md' | 'lg';

export interface LiquidButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Additional CSS class appended to the root element */
  className?: string;
  /** Visual variant — `primary` is a filled button, `secondary` is outlined */
  variant?: LiquidButtonVariant;
  /** Size preset controlling padding and font size */
  size?: LiquidButtonSize;
}

/* ── Unique filter ID generation ────────────────────────── */

let filterIdCounter = 0;

/* ── Component ──────────────────────────────────────────── */

/**
 * LiquidButton
 *
 * A button with a liquid / morphing hover effect powered by an inline SVG
 * `feTurbulence` + `feDisplacementMap` filter. On hover the turbulence
 * `baseFrequency` is animated to create the distortion, giving the button
 * surface a fluid, organic feel.
 *
 * Fully self-contained — no external animation libraries required.
 *
 * @example
 * ```tsx
 * <LiquidButton variant="primary" size="lg" onClick={handleClick}>
 *   Get Started
 * </LiquidButton>
 * ```
 */
export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    {
      children,
      onClick,
      className,
      variant = 'primary',
      size = 'md',
      ...rest
    },
    ref
  ) => {
    /* Each instance gets a unique filter ID so multiple buttons on the same
       page don't conflict. */
    const filterIdRef = useRef<string>('');
    if (filterIdRef.current === '') {
      filterIdCounter += 1;
      filterIdRef.current = `liquid-filter-${filterIdCounter}`;
    }
    const filterId = filterIdRef.current;

    /* Refs for animating the SVG turbulence on hover */
    const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
    const animationFrameRef = useRef<number>(0);
    const isHoveredRef = useRef(false);

    /* Animate the turbulence baseFrequency to create the liquid wobble */
    const animate = useCallback(() => {
      const el = turbulenceRef.current;
      if (!el) return;

      if (isHoveredRef.current) {
        const t = Date.now() / 1000;
        /* Oscillate between 0.01 and 0.04 for a subtle organic motion */
        const freq = 0.02 + Math.sin(t * 3) * 0.015;
        el.setAttribute('baseFrequency', `${freq.toFixed(4)} ${(freq * 0.8).toFixed(4)}`);
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        /* Reset to zero — no distortion */
        el.setAttribute('baseFrequency', '0 0');
      }
    }, []);

    const handleMouseEnter = useCallback(() => {
      isHoveredRef.current = true;
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    }, [animate]);

    const handleMouseLeave = useCallback(() => {
      isHoveredRef.current = false;
      /* animate() will set baseFrequency to 0 on next tick and stop */
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    }, [animate]);

    /* Clean up rAF on unmount */
    useEffect(() => {
      return () => {
        cancelAnimationFrame(animationFrameRef.current);
      };
    }, []);

    /* ── Class composition ────────────────────────────────── */
    const rootClass = [
      styles.root,
      styles[variant],
      styles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        {/* Inline SVG filter — hidden visually, referenced by the button */}
        <svg className={styles.filterContainer} aria-hidden="true">
          <defs>
            <filter id={filterId}>
              <feTurbulence
                ref={turbulenceRef}
                type="fractalNoise"
                baseFrequency="0 0"
                numOctaves={3}
                seed={42}
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale={12}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <button
          ref={ref}
          type="button"
          className={rootClass}
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
          style={{ filter: isHoveredRef.current ? `url(#${filterId})` : undefined }}
          {...rest}
        >
          {/* Decorative blob that reacts to hover with the filter */}
          <span className={styles.blob} style={{ filter: `url(#${filterId})` }} />

          {/* Button label */}
          <span className={styles.content}>{children}</span>
        </button>
      </>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';
