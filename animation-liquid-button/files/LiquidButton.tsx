import React, { useEffect, useRef, useCallback } from 'react';
import styles from './LiquidButton.module.css';

/* ── Types ──────────────────────────────────────────────── */

export type LiquidButtonVariant = 'primary' | 'secondary' | 'ghost';
export type LiquidButtonSize = 'sm' | 'md' | 'lg';

export interface LiquidButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS class appended to the root element */
  className?: string;
  /** Visual variant */
  variant?: LiquidButtonVariant;
  /** Size preset controlling padding and font size */
  size?: LiquidButtonSize;
  /** Distortion intensity (0–1). Defaults to 0.6 */
  intensity?: number;
}

/* ── Unique filter ID per instance ─────────────────────── */

let idCounter = 0;

/* ── Component ──────────────────────────────────────────── */

/**
 * LiquidButton
 *
 * A button with a viscous, gooey hover effect driven by an inline SVG
 * `feTurbulence` → `feDisplacementMap` filter chain. On hover the
 * turbulence seed animates frame-by-frame while displacement scale
 * ramps up, creating an organic, fluid distortion across the entire
 * button surface.
 *
 * Fully self-contained — no animation libraries required.
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
      className,
      variant = 'primary',
      size = 'md',
      intensity = 0.6,
      disabled,
      ...rest
    },
    ref,
  ) => {
    /* ── Unique filter ID ─────────────────────────────────── */
    const filterIdRef = useRef('');
    if (filterIdRef.current === '') {
      idCounter += 1;
      filterIdRef.current = `lqb-${idCounter}`;
    }
    const filterId = filterIdRef.current;

    /* ── Refs ──────────────────────────────────────────────── */
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const turbRef = useRef<SVGFETurbulenceElement | null>(null);
    const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
    const rafRef = useRef(0);
    const hoveredRef = useRef(false);
    const scaleRef = useRef(0); // current displacement scale (0 → max)

    const maxScale = Math.round(18 * Math.max(0, Math.min(1, intensity)));

    /* Merge forwarded ref with internal ref */
    const setRef = useCallback(
      (el: HTMLButtonElement | null) => {
        btnRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      },
      [ref],
    );

    /* ── Animation loop ───────────────────────────────────── */
    const tick = useCallback(() => {
      const turb = turbRef.current;
      const disp = dispRef.current;
      const btn = btnRef.current;
      if (!turb || !disp || !btn) return;

      const target = hoveredRef.current ? maxScale : 0;
      /* Smooth lerp toward target */
      scaleRef.current += (target - scaleRef.current) * 0.12;

      /* Snap to zero when close enough to avoid stuck sub-pixel noise */
      if (Math.abs(scaleRef.current) < 0.3) scaleRef.current = 0;

      const s = scaleRef.current;

      if (s > 0.3) {
        /* Animate turbulence seed every frame for a boiling-liquid look */
        const t = performance.now() / 1000;
        const freq = 0.012 + Math.sin(t * 2.5) * 0.006;
        turb.setAttribute('baseFrequency', `${freq.toFixed(4)} ${(freq * 1.3).toFixed(4)}`);
        turb.setAttribute('seed', String(Math.floor(t * 8) % 200));
        disp.setAttribute('scale', s.toFixed(1));
        btn.style.filter = `url(#${filterId})`;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        /* Fully settled — remove filter for crisp resting state */
        turb.setAttribute('baseFrequency', '0 0');
        disp.setAttribute('scale', '0');
        btn.style.filter = '';
        /* Keep ticking only while transitioning out */
        if (scaleRef.current !== 0) {
          scaleRef.current = 0;
        }
      }
    }, [filterId, maxScale]);

    const enter = useCallback(() => {
      if (disabled) return;
      hoveredRef.current = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }, [tick, disabled]);

    const leave = useCallback(() => {
      hoveredRef.current = false;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    /* Cleanup on unmount */
    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    /* ── Class composition ─────────────────────────────────── */
    const rootClass = [styles.root, styles[variant], styles[size], className]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        {/* Inline SVG filter — visually hidden, referenced by ID */}
        <svg className={styles.svgDefs} aria-hidden="true">
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB">
              <feTurbulence
                ref={turbRef}
                type="fractalNoise"
                baseFrequency="0 0"
                numOctaves={3}
                seed={1}
                result="noise"
              />
              <feDisplacementMap
                ref={dispRef}
                in="SourceGraphic"
                in2="noise"
                scale={0}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <button
          ref={setRef}
          type="button"
          className={rootClass}
          disabled={disabled}
          onMouseEnter={enter}
          onMouseLeave={leave}
          onFocus={enter}
          onBlur={leave}
          {...rest}
        >
          <span className={styles.fill} />
          <span className={styles.label}>{children}</span>
        </button>
      </>
    );
  },
);

LiquidButton.displayName = 'LiquidButton';
