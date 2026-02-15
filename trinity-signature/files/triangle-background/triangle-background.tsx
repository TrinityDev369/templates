"use client";

import React, { useEffect, useRef } from "react";
import { seed, animatedNoise } from "./noise";
import {
  animations,
  type AnimationType,
  type AnimationConfig,
  type AnimationContext,
  type TrianglePosition,
} from "./animations";

/** Minimal class-name merge utility (replaces external cn/clsx dependency) */
function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

const TRINITY_PALETTE = {
  lightBlue: "#1BB1E7",
  mediumBlue: "#0099DA",
  darkBlue: "#0060AF",
  deepBlue: "#143F91",
} as const;

function triangleHeight(sideLength: number): number {
  return (sideLength * Math.sqrt(3)) / 2;
}

/** Parse hex color (#RRGGBB) → [h 0-360, s 0-100, l 0-100] */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

/** HSL → hex (#RRGGBB) */
function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100, lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = lN - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * Math.max(0, Math.min(1, c))).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Linearly interpolate two hex colors via HSL */
function lerpHex(a: string, b: string, t: number): string {
  const [h1, s1, l1] = hexToHsl(a);
  const [h2, s2, l2] = hexToHsl(b);
  // Shortest-arc hue interpolation
  let dh = h2 - h1;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return hslToHex(
    ((h1 + dh * t) % 360 + 360) % 360,
    s1 + (s2 - s1) * t,
    l1 + (l2 - l1) * t,
  );
}

export interface TriangleBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: AnimationType;
  speed?: number;
  intensity?: number;
  noiseScale?: number;
  sideLength?: number;
  gap?: number;
  colors?: string[];
  colorMode?: "solid" | "random" | "position" | "gradient";
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  baseOpacity?: number;
  mouseRadius?: number;
  mouseStrength?: number;
  /** Subtle hue cycling intensity (0 = off, 0.1–0.3 = subtle, 1 = vivid). Default 0. */
  colorShift?: number;
  /** Speed of the color shift cycle in Hz. Default 0.08 (very slow). */
  colorShiftSpeed?: number;
  /** Emergent color exchange: triangles swap palette shades via noise. Overrides colorShift. Default false. */
  colorExchange?: boolean;
  /** Spatial scale for color exchange noise (higher = smaller regions). Default 2.5. */
  colorExchangeScale?: number;
  /** Speed of color exchange. Default 0.3. */
  colorExchangeSpeed?: number;
}

export const TriangleBackground: React.FC<TriangleBackgroundProps> = ({
  animation = "flow",
  speed = 0.7,
  intensity = 0.6,
  noiseScale = 3,
  sideLength = 24,
  gap = 1,
  colors = [
    TRINITY_PALETTE.lightBlue,
    TRINITY_PALETTE.mediumBlue,
    TRINITY_PALETTE.darkBlue,
    TRINITY_PALETTE.deepBlue,
  ],
  colorMode = "position",
  backgroundColor = "#0a0f1a",
  strokeColor = "rgba(30, 41, 59, 0.5)",
  strokeWidth = 0.5,
  baseOpacity = 0.85,
  mouseRadius = 0.12,
  mouseStrength = 0.9,
  colorShift = 0,
  colorShiftSpeed = 0.08,
  colorExchange = false,
  colorExchangeScale = 2.5,
  colorExchangeSpeed = 0.3,
  className,
  style,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    mouseX: 0.5,
    mouseY: 0.5,
    mouseActive: false,
    destroyed: false,
    rafId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const state = stateRef.current;
    state.destroyed = false;

    seed(Math.random() * 10000);

    const animConfig: AnimationConfig = {
      speed,
      intensity,
      noiseScale,
      mouseRadius,
      mouseStrength,
    };

    interface TriData {
      centerX: number;
      centerY: number;
      nx: number;
      ny: number;
      orientation: "up" | "down";
      color: string;
      h: number; s: number; l: number; // HSL for color shifting
      index: number;
    }

    let triangles: TriData[] = [];
    let width = 0;
    let height = 0;

    function generateGrid() {
      triangles = [];
      const h = triangleHeight(sideLength);
      const effectiveSide = sideLength + gap;
      const halfCol = effectiveSide / 2;
      const halfW = width / 2;
      const halfH = height / 2;
      const rowMin = Math.floor(-halfH / h) - 1;
      const rowMax = Math.ceil(halfH / h) + 1;
      const colMin = Math.floor(-halfW / halfCol) - 1;
      const colMax = Math.ceil(halfW / halfCol) + 1;
      let idx = 0;

      for (let row = rowMin; row <= rowMax && idx < 14000; row++) {
        for (let col = colMin; col <= colMax && idx < 14000; col++) {
          const isUp = (row + col) % 2 === 0;
          const x = halfW + col * halfCol;
          const y = halfH + row * h + (isUp ? h * 2 / 3 : h / 3);
          if (x < -sideLength * 2 || x > width + sideLength * 2) continue;
          if (y < -h * 2 || y > height + h * 2) continue;

          let color: string;
          if (colorMode === "solid") {
            color = colors[0];
          } else if (colorMode === "random") {
            color = colors[Math.floor(Math.random() * colors.length)];
          } else if (colorMode === "gradient") {
            // Smooth radial gradient — interpolate between palette stops
            const nx = x / width;
            const ny = y / height;
            const t = Math.min(Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2, 0.999);
            const segment = t * (colors.length - 1);
            const ci = Math.floor(segment);
            color = lerpHex(colors[ci], colors[Math.min(ci + 1, colors.length - 1)], segment - ci);
          } else {
            const nx = x / width;
            const ny = y / height;
            const centerDist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
            color = colors[Math.floor(centerDist * 2 * colors.length) % colors.length];
          }

          const [ch, cs, cl] = hexToHsl(color);
          triangles.push({
            centerX: x,
            centerY: y,
            nx: x / width,
            ny: y / height,
            orientation: isUp ? "up" : "down",
            color,
            h: ch, s: cs, l: cl,
            index: idx,
          });
          idx++;
        }
      }
    }

    function resize() {
      if (state.destroyed || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateGrid();
    }

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      state.mouseX = (e.clientX - rect.left) / rect.width;
      state.mouseY = (e.clientY - rect.top) / rect.height;
      state.mouseActive = true;
    };
    const onMouseLeave = () => { state.mouseActive = false; };
    const onMouseEnter = () => { state.mouseActive = true; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("mouseenter", onMouseEnter);

    // Visibility
    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    const animFn = animations[animation] || animations.flow;
    const startTime = performance.now();
    const h = triangleHeight(sideLength);

    function render() {
      if (state.destroyed) return;
      if (visible) {
        const elapsed = (performance.now() - startTime) / 1000;
        const animCtx: AnimationContext = {
          time: elapsed,
          mouseX: state.mouseX,
          mouseY: state.mouseY,
          mouseActive: state.mouseActive,
        };

        ctx!.fillStyle = backgroundColor;
        ctx!.fillRect(0, 0, width, height);

        for (const tri of triangles) {
          const pos: TrianglePosition = { x: tri.nx, y: tri.ny, index: tri.index };
          const s = animFn(pos, animCtx, animConfig);

          if (s.opacity * baseOpacity < 0.01 || s.scale < 0.01) continue;

          const halfSide = (sideLength * s.scale) / 2;
          const scaledH = h * s.scale;

          ctx!.save();
          ctx!.translate(tri.centerX, tri.centerY);
          if (s.rotationOffset !== 0) ctx!.rotate((s.rotationOffset * Math.PI) / 180);

          ctx!.beginPath();
          if (tri.orientation === "up") {
            ctx!.moveTo(0, -scaledH * (2 / 3));
            ctx!.lineTo(-halfSide, scaledH / 3);
            ctx!.lineTo(halfSide, scaledH / 3);
          } else {
            ctx!.moveTo(0, scaledH * (2 / 3));
            ctx!.lineTo(halfSide, -scaledH / 3);
            ctx!.lineTo(-halfSide, -scaledH / 3);
          }
          ctx!.closePath();

          ctx!.globalAlpha = s.opacity * baseOpacity;
          if (colorExchange) {
            // Emergent color exchange: noise picks a discrete palette index per triangle per frame
            const n = animatedNoise(
              tri.nx * colorExchangeScale,
              tri.ny * colorExchangeScale,
              elapsed * colorExchangeSpeed,
            );
            // n is in [-1, 1], map to [0, colors.length)
            const ci = Math.abs(n * 1.7) % 1; // normalize to [0,1) with spread
            const colorIdx = Math.floor(ci * colors.length);
            ctx!.fillStyle = colors[colorIdx];
          } else if (colorShift > 0) {
            // Subtle hue shift based on time + position
            const hueOffset = Math.sin(elapsed * colorShiftSpeed * Math.PI * 2 + tri.nx * 3 + tri.ny * 2) * colorShift * 30;
            const lShift = Math.sin(elapsed * colorShiftSpeed * Math.PI * 1.3 + tri.ny * 4) * colorShift * 5;
            ctx!.fillStyle = `hsl(${tri.h + hueOffset}, ${tri.s}%, ${Math.max(0, Math.min(100, tri.l + lShift))}%)`;
          } else {
            ctx!.fillStyle = tri.color;
          }
          ctx!.fill();

          if (strokeWidth > 0) {
            ctx!.globalAlpha = s.opacity * baseOpacity * 0.5;
            ctx!.strokeStyle = strokeColor;
            ctx!.lineWidth = strokeWidth;
            ctx!.stroke();
          }

          ctx!.restore();
        }
      }
      state.rafId = requestAnimationFrame(render);
    }

    state.rafId = requestAnimationFrame(render);

    return () => {
      state.destroyed = true;
      cancelAnimationFrame(state.rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [animation, speed, intensity, noiseScale, sideLength, gap, colors, colorMode, backgroundColor, strokeColor, strokeWidth, baseOpacity, mouseRadius, mouseStrength, colorShift, colorShiftSpeed, colorExchange, colorExchangeScale, colorExchangeSpeed]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full", className)}
      style={style}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-auto absolute inset-0"
      />
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
};

export type { AnimationType };
