"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  type CSSProperties,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Shape variants for individual confetti particles. */
type ParticleShape = "rect" | "circle";

/** Options passed to `fire()` to customise a single confetti burst. */
export interface ConfettiFireOptions {
  /** Number of particles to emit. @default 100 */
  particleCount?: number;
  /** Angular spread in degrees (0 = narrow column, 180 = full hemisphere). @default 70 */
  spread?: number;
  /** Initial launch velocity in pixels/frame. @default 45 */
  startVelocity?: number;
  /** Gravity acceleration in pixels/frame^2. @default 1 */
  gravity?: number;
  /** Per-frame velocity multiplier simulating air resistance (0-1). @default 0.94 */
  decay?: number;
  /** Palette of CSS colour strings particles are randomly picked from. */
  colors?: string[];
  /** Normalised origin point where particles emit from ({0,0} = top-left, {1,1} = bottom-right). @default {x:0.5, y:0.3} */
  origin?: { x: number; y: number };
}

/** Props for the `<Confetti>` component. */
export interface ConfettiProps {
  /** Additional CSS class name applied to the canvas element. */
  className?: string;
  /** Additional inline styles merged onto the canvas element. */
  style?: CSSProperties;
}

/** Handle exposed via the forwarded ref / `useConfetti` hook. */
export interface ConfettiHandle {
  /** Launch a burst of confetti with optional overrides. */
  fire: (options?: ConfettiFireOptions) => void;
}

/* ------------------------------------------------------------------ */
/*  Internal particle representation                                   */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Remaining velocity multiplier — decreases each frame by `decay`. */
  drag: number;
  decay: number;
  gravity: number;
  color: string;
  shape: ParticleShape;
  /** Width of the rectangular particle (or diameter for circles). */
  w: number;
  /** Height of the rectangular particle. */
  h: number;
  /** Current rotation angle in radians. */
  rotation: number;
  /** Rotation speed in radians/frame. */
  rotationSpeed: number;
  /** Wobble phase — creates the characteristic fluttering fall. */
  wobble: number;
  wobbleSpeed: number;
  /** Overall opacity — fades as drag approaches zero. */
  opacity: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_COLORS = [
  "#ff577f", // pink-red
  "#ff884b", // orange
  "#ffd384", // gold
  "#fff9b0", // yellow
  "#3ec70b", // green
  "#3b44f6", // blue
  "#a149fa", // purple
  "#00c2cb", // teal
  "#ff6f91", // salmon
  "#845ec2", // violet
];

const DEG_TO_RAD = Math.PI / 180;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Random float in [min, max). */
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Detect user preference for reduced motion. */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ------------------------------------------------------------------ */
/*  Particle factory                                                   */
/* ------------------------------------------------------------------ */

function createParticles(
  canvasWidth: number,
  canvasHeight: number,
  options: Required<ConfettiFireOptions>,
): Particle[] {
  const {
    particleCount,
    spread,
    startVelocity,
    gravity,
    decay,
    colors,
    origin,
  } = options;

  const originX = origin.x * canvasWidth;
  const originY = origin.y * canvasHeight;
  const halfSpread = (spread / 2) * DEG_TO_RAD;

  /** Base launch angle — straight up. */
  const baseAngle = -Math.PI / 2;

  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = baseAngle + rand(-halfSpread, halfSpread);
    const velocity = startVelocity * rand(0.4, 1);
    const shape: ParticleShape = Math.random() > 0.35 ? "rect" : "circle";

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      drag: 1,
      decay,
      gravity,
      color: pick(colors),
      shape,
      w: shape === "rect" ? rand(4, 10) : rand(3, 7),
      h: shape === "rect" ? rand(2, 6) : 0,
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.2, 0.2),
      wobble: rand(0, Math.PI * 2),
      wobbleSpeed: rand(0.03, 0.12),
      opacity: 1,
    });
  }

  return particles;
}

/* ------------------------------------------------------------------ */
/*  Physics step                                                       */
/* ------------------------------------------------------------------ */

/**
 * Advance all particles by one frame. Returns `true` while at least one
 * particle is still visible on screen — when it returns `false` the
 * caller can stop the animation loop.
 */
function stepParticles(
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  let alive = false;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    /* Apply air resistance. */
    p.drag *= p.decay;

    /* Velocity with drag applied. */
    p.x += p.vx * p.drag;
    p.y += p.vy * p.drag;

    /* Gravity pulls downward every frame. */
    p.vy += p.gravity;

    /* Wobble for the fluttering effect. */
    p.wobble += p.wobbleSpeed;
    p.x += Math.sin(p.wobble) * 0.8;

    /* Spin. */
    p.rotation += p.rotationSpeed;

    /* Fade as drag decreases. */
    p.opacity = Math.max(0, p.drag);

    /* Remove particles that have fallen well below the canvas or fully
       faded. We keep a generous margin below (200px) so particles that
       are still partially visible while leaving the bottom edge aren't
       abruptly removed. */
    if (
      p.y > canvasHeight + 200 ||
      p.opacity < 0.01
    ) {
      particles.splice(i, 1);
      continue;
    }

    alive = true;
  }

  return alive;
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                           */
/* ------------------------------------------------------------------ */

function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
): void {
  ctx.clearRect(0, 0, canvasWidth * dpr, canvasHeight * dpr);
  ctx.save();
  ctx.scale(dpr, dpr);

  for (const p of particles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;

    if (p.shape === "rect") {
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * `Confetti` renders a fixed-position, fullscreen canvas overlay that
 * displays particle-based confetti bursts.
 *
 * The canvas uses `pointer-events: none` and `z-index: 99999` so it
 * never interferes with underlying page interactions.
 *
 * Control the component via the imperative `ConfettiHandle` obtained
 * through `forwardRef` or the companion `useConfetti` hook.
 *
 * Multiple `fire()` calls stack additively -- earlier particles
 * continue their trajectory while new ones are added.
 *
 * Respects `prefers-reduced-motion` -- when the user's OS-level
 * setting requests reduced motion, `fire()` silently becomes a no-op.
 *
 * @example
 * ```tsx
 * const ref = useRef<ConfettiHandle>(null);
 * <Confetti ref={ref} />
 * <button onClick={() => ref.current?.fire({ particleCount: 200 })}>
 *   Celebrate!
 * </button>
 * ```
 */
export const Confetti = forwardRef<ConfettiHandle, ConfettiProps>(
  ({ className, style }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const runningRef = useRef(false);

    /* ---- Sync canvas size to viewport -------------------------------- */

    const syncSize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    }, []);

    /* ---- Animation loop --------------------------------------------- */

    const tick = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      const alive = stepParticles(particlesRef.current, width, height);
      renderParticles(ctx, particlesRef.current, width, height, dpr);

      if (alive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        runningRef.current = false;
        /* Clear canvas fully when done so no stale pixels remain. */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, []);

    const startLoop = useCallback(() => {
      if (runningRef.current) return;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    /* ---- fire() ----------------------------------------------------- */

    const fire = useCallback(
      (options?: ConfettiFireOptions) => {
        /* Respect reduced-motion preference. */
        if (prefersReducedMotion()) return;

        syncSize();

        const width = window.innerWidth;
        const height = window.innerHeight;

        const resolved: Required<ConfettiFireOptions> = {
          particleCount: options?.particleCount ?? 100,
          spread: options?.spread ?? 70,
          startVelocity: options?.startVelocity ?? 45,
          gravity: options?.gravity ?? 1,
          decay: options?.decay ?? 0.94,
          colors: options?.colors ?? DEFAULT_COLORS,
          origin: options?.origin ?? { x: 0.5, y: 0.3 },
        };

        const newParticles = createParticles(width, height, resolved);

        /* Stack onto existing particles so concurrent bursts coexist. */
        particlesRef.current.push(...newParticles);

        startLoop();
      },
      [syncSize, startLoop],
    );

    /* ---- Expose handle ---------------------------------------------- */

    useImperativeHandle(ref, () => ({ fire }), [fire]);

    /* ---- Resize listener -------------------------------------------- */

    useEffect(() => {
      syncSize();

      const onResize = () => syncSize();
      window.addEventListener("resize", onResize, { passive: true });

      return () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(rafRef.current);
        runningRef.current = false;
      };
    }, [syncSize]);

    /* ---- Styles ----------------------------------------------------- */

    const canvasStyle: CSSProperties = {
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 99999,
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
  },
);

Confetti.displayName = "Confetti";

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * `useConfetti` is a convenience hook that creates and manages a
 * `ConfettiHandle` ref. Spread the returned `ref` onto `<Confetti>`
 * and call `fire()` to launch bursts.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { fire, ref } = useConfetti();
 *   return (
 *     <>
 *       <Confetti ref={ref} />
 *       <button onClick={() => fire({ particleCount: 200 })}>
 *         Celebrate!
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */
export function useConfetti() {
  const ref = useRef<ConfettiHandle>(null);

  const fire = useCallback((options?: ConfettiFireOptions) => {
    ref.current?.fire(options);
  }, []);

  return { fire, ref } as const;
}

export default Confetti;
