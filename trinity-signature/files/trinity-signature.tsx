"use client";

import React from "react";
import { TriangleBackground } from "./triangle-background/triangle-background";

/* ------------------------------------------------------------------ */
/*  Shade generator — metallic palette from one accent hex             */
/* ------------------------------------------------------------------ */

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
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

function hslToHex(h: number, s: number, l: number): string {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  if (sNorm === 0) {
    const v = Math.round(lNorm * 255);
    return `#${v.toString(16).padStart(2, "0").repeat(3)}`;
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Generate 4 metallic shades from one accent color.
 * Keeps hue, adjusts saturation and lightness for a
 * highlight → base → shadow → deep gradient feel.
 */
function metallicShades(hex: string): [string, string, string, string] {
  const [h, s] = hexToHsl(hex);
  return [
    hslToHex(h, Math.min(s, 75), 62), // highlight — bright, slightly desaturated
    hslToHex(h, Math.min(s + 5, 90), 48), // primary — vivid mid-tone
    hslToHex(h, Math.min(s + 10, 95), 32), // shadow — rich and dark
    hslToHex(h, Math.min(s + 5, 80), 18), // deep — nearly black, tinted
  ];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface TrinitySignatureProps {
  /** Client brand accent color (hex). Metallic shades are derived from this. */
  accentColor?: string;
  /** Override the link URL. Default "https://trinity.agency" */
  href?: string;
  /** Override the credit text. Default "Design + Code by" */
  label?: string;
  /** Override the agency name. Default "Trinity Agency" */
  agencyName?: string;
  /** Height in px. Default 300 */
  height?: number;
  /** Triangle animation type. Default "flow" */
  animation?: "swarm" | "wave" | "pulse" | "vortex" | "breathe" | "flow";
  /** Animation speed. Default 0.5 */
  speed?: number;
  /** Animation intensity. Default 0.4 */
  intensity?: number;
}

/**
 * Easter-egg footer signature for client projects.
 * Hidden behind the page — revealed on overscroll bounce.
 *
 * Pair with `<OverscrollReveal>` for the full effect:
 * ```tsx
 * <OverscrollReveal background={<TrinitySignature accentColor="#00C9DB" />}>
 *   <YourPage />
 * </OverscrollReveal>
 * ```
 */
export function TrinitySignature({
  accentColor = "#0099DA",
  href = "https://trinity.agency",
  label = "Design + Code by",
  agencyName = "Trinity Agency",
  height = 300,
  animation = "flow",
  speed = 0.5,
  intensity = 0.4,
}: TrinitySignatureProps) {
  const shades = metallicShades(accentColor);

  return (
    <div
      style={{ position: "relative", width: "100%", height }}
      aria-hidden="true"
    >
      {/* Animated triangle grid */}
      <TriangleBackground
        animation={animation}
        colors={shades}
        colorMode="gradient"
        intensity={intensity}
        noiseScale={2}
        speed={speed}
        backgroundColor="oklch(5% 0.005 260)"
        baseOpacity={0.9}
        sideLength={22}
        gap={1}
        className="h-full w-full"
      />

      {/* Dark overlay + text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at center, oklch(3% 0.003 260 / 80%) 0%, oklch(3% 0.003 260 / 55%) 60%, oklch(3% 0.003 260 / 80%) 100%)",
          zIndex: 1,
        }}
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            textDecoration: "none",
            color: "oklch(70% 0.01 260)",
            transition: "color 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = `oklch(85% 0.03 260)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = `oklch(70% 0.01 260)`;
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              opacity: 0.7,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
            }}
          >
            {agencyName}
          </span>
        </a>
      </div>
    </div>
  );
}
