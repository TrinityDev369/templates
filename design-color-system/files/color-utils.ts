/**
 * Color utilities for the HSL-based design token system.
 * Works with CSS custom properties in "H S% L%" format.
 */

/** Parsed HSL components. */
export interface HSLComponents {
  h: number;
  s: number;
  l: number;
}

/** RGB components in 0-1 range. */
interface RGBComponents {
  r: number;
  g: number;
  b: number;
}

// ── Public API ──────────────────────────────────────────────

/** Parse an HSL string like "240 10% 3.9%" into components. */
export function parseHSL(hsl: string): HSLComponents {
  const trimmed = hsl.trim();
  if (!trimmed) return { h: 0, s: 0, l: 0 };
  const parts = trimmed.split(/\s+/);
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]);
  const l = parseFloat(parts[2]);
  return {
    h: Number.isFinite(h) ? h : 0,
    s: Number.isFinite(s) ? s : 0,
    l: Number.isFinite(l) ? l : 0,
  };
}

/** Convert HSL components back to token string format. */
export function toHSLString(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${s.toFixed(1)}% ${l.toFixed(1)}%`;
}

/** Get a CSS variable value at runtime. */
export function getCSSVar(name: string, el?: Element): string {
  const target = el ?? document.documentElement;
  return getComputedStyle(target).getPropertyValue(`--${name}`).trim();
}

/** Set a CSS variable at runtime. */
export function setCSSVar(
  name: string,
  value: string,
  el?: Element,
): void {
  const target = el ?? document.documentElement;
  (target as HTMLElement).style.setProperty(`--${name}`, value);
}

/**
 * Calculate the WCAG contrast ratio between two HSL token values.
 * Returns a value between 1 and 21.
 */
export function contrastRatio(hsl1: string, hsl2: string): number {
  const lum1 = relativeLuminance(hslToRgb(parseHSL(hsl1)));
  const lum2 = relativeLuminance(hslToRgb(parseHSL(hsl2)));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if the contrast between two colors meets WCAG requirements.
 *
 * Thresholds:
 *   AA  normal text: 4.5:1
 *   AA  large text:  3:1
 *   AAA normal text: 7:1
 *   AAA large text:  4.5:1
 */
export function meetsWCAG(
  hsl1: string,
  hsl2: string,
  level: "AA" | "AAA" = "AA",
  largeText = false,
): boolean {
  const ratio = contrastRatio(hsl1, hsl2);
  if (level === "AAA") return largeText ? ratio >= 4.5 : ratio >= 7;
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Generate an alpha variant from a token value.
 * Returns a complete `hsl()` string with alpha channel.
 *
 * @example
 * withAlpha("240 5.9% 10%", 0.5) // "hsl(240 5.9% 10% / 0.5)"
 */
export function withAlpha(tokenValue: string, alpha: number): string {
  return `hsl(${tokenValue} / ${alpha})`;
}

// ── Internal helpers ────────────────────────────────────────

function hslToRgb({ h, s, l }: HSLComponents): RGBComponents {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return { r: r + m, g: g + m, b: b + m };
}

function relativeLuminance({ r, g, b }: RGBComponents): number {
  const [rs, gs, bs] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
