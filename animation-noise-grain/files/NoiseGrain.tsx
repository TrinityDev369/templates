"use client";

import {
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Supported CSS mix-blend-mode values for the grain overlay. */
export type NoiseGrainBlend = "overlay" | "multiply" | "screen" | "soft-light";

export interface NoiseGrainProps {
  /** Overall opacity of the grain layer (0-1). @default 0.05 */
  opacity?: number;
  /** Target refresh rate in frames per second (1-60). @default 24 */
  speed?: number;
  /** CSS mix-blend-mode applied to the canvas. @default "overlay" */
  blend?: NoiseGrainBlend;
  /** When true, grain is monochrome (greyscale). When false, each channel randomises independently. @default true */
  monochrome?: boolean;
  /** Pixel size of each grain dot (1-4). Larger values create coarser grain. @default 1 */
  size?: number;
  /** When true the overlay uses `position: fixed` covering the viewport. When false uses `position: absolute` relative to nearest positioned ancestor. @default true */
  fixed?: boolean;
  /** Additional CSS class name applied to the canvas element. */
  className?: string;
  /** Additional inline styles merged onto the canvas element. */
  style?: CSSProperties;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Clamp a number between min and max (inclusive).
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * `NoiseGrain` renders a full-screen (or container-sized) canvas overlay
 * that draws animated film grain / noise on every frame.
 *
 * The canvas uses `pointer-events: none` so it never blocks user interaction.
 * All drawing is performed via `ImageData` for maximum performance — no
 * `fillRect` or path calls per pixel.
 *
 * @example
 * ```tsx
 * <NoiseGrain opacity={0.04} speed={24} blend="overlay" />
 * ```
 */
export function NoiseGrain({
  opacity: rawOpacity = 0.05,
  speed: rawSpeed = 24,
  blend = "overlay",
  monochrome = true,
  size: rawSize = 1,
  fixed = true,
  className,
  style,
}: NoiseGrainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

  /* Clamp user values to safe ranges. */
  const opacity = clamp(rawOpacity, 0, 1);
  const speed = clamp(Math.round(rawSpeed), 1, 60);
  const size = clamp(Math.round(rawSize), 1, 4);

  /**
   * Draw a single frame of noise into the canvas.
   *
   * For performance we write directly into an `ImageData` buffer and
   * `putImageData` once per frame. When `size` > 1 we work on a
   * down-scaled buffer and let the canvas upscale via CSS, avoiding
   * the cost of filling multiple pixels per grain dot.
   */
  const drawNoise = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      /* When size > 1 we render at a reduced resolution and rely on
         CSS `image-rendering: pixelated` + canvas scaling to produce
         the blocky grain look. The canvas element dimensions are set
         to the reduced size and CSS stretches it to full coverage.   */
      const w = Math.ceil(width / size);
      const h = Math.ceil(height / size);

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data; // Uint8ClampedArray — RGBA

      const len = w * h;
      for (let i = 0; i < len; i++) {
        const offset = i * 4;

        if (monochrome) {
          const v = (Math.random() * 256) | 0;
          data[offset] = v;     // R
          data[offset + 1] = v; // G
          data[offset + 2] = v; // B
        } else {
          data[offset] = (Math.random() * 256) | 0;     // R
          data[offset + 1] = (Math.random() * 256) | 0; // G
          data[offset + 2] = (Math.random() * 256) | 0; // B
        }

        data[offset + 3] = 255; // A — fully opaque (overall opacity handled via CSS)
      }

      ctx.putImageData(imageData, 0, 0);
    },
    [monochrome, size]
  );

  /* ---- animation loop ---------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    const frameDuration = 1000 / speed;
    let running = true;

    /**
     * Resize the canvas internal dimensions to match the element's
     * CSS layout size, accounting for device pixel ratio only when
     * grain size is 1 (at larger sizes the intentionally-blocky look
     * means we can skip the DPR scaling).
     */
    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.ceil(rect.width / size);
      const h = Math.ceil(rect.height / size);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const tick = (timestamp: number) => {
      if (!running) return;

      const elapsed = timestamp - lastFrameRef.current;

      if (elapsed >= frameDuration) {
        lastFrameRef.current = timestamp - (elapsed % frameDuration);
        syncSize();
        drawNoise(ctx, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    /* Kick off the loop. */
    syncSize();
    rafRef.current = requestAnimationFrame(tick);

    /* Handle window resize — just sync size; next tick redraws. */
    const onResize = () => syncSize();
    window.addEventListener("resize", onResize, { passive: true });

    /* Cleanup on unmount. */
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [speed, size, drawNoise]);

  /* ---- styles ------------------------------------------------------ */

  const canvasStyle: CSSProperties = {
    position: fixed ? "fixed" : "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 9999,
    opacity,
    mixBlendMode: blend,
    imageRendering: size > 1 ? "pixelated" : undefined,
    ...style,
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={canvasStyle}
      aria-hidden="true"
    />
  );
}

export default NoiseGrain;
