"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ColorFormat,
  ColorPickerProps,
  ColorPreset,
  HSLColor,
  RGBColor,
} from "./color-picker.types";

// Re-export types for convenience
export type {
  ColorFormat,
  ColorPickerProps,
  ColorPreset,
  ColorValue,
  HSLColor,
  RGBColor,
} from "./color-picker.types";

/* -------------------------------------------------------------------------- */
/*  Color conversion utilities                                                 */
/* -------------------------------------------------------------------------- */

/** Clamp a number to [min, max]. */
function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/** Parse a hex string (3, 4, 6, or 8 digits) to RGBA. */
export function hexToRgb(hex: string): RGBColor {
  let h = hex.replace(/^#/, "");
  // Expand shorthand: #RGB -> #RRGGBB, #RGBA -> #RRGGBBAA
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(h.slice(0, 6), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : undefined;
  return a !== undefined ? { r, g, b, a } : { r, g, b };
}

/** Convert RGB(A) to a hex string. */
export function rgbToHex(color: RGBColor): string {
  const r = clamp(Math.round(color.r), 0, 255);
  const g = clamp(Math.round(color.g), 0, 255);
  const b = clamp(Math.round(color.b), 0, 255);
  const hex = `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  if (color.a !== undefined && color.a < 1) {
    const a = clamp(Math.round(color.a * 255), 0, 255);
    return hex + a.toString(16).padStart(2, "0");
  }
  return hex;
}

/** Convert hex to HSL. */
export function hexToHsl(hex: string): HSLColor {
  return rgbToHsl(hexToRgb(hex));
}

/** Convert HSL to hex. */
export function hslToHex(color: HSLColor): string {
  return rgbToHex(hslToRgb(color));
}

/** Convert RGB to HSL. */
function rgbToHsl(c: RGBColor): HSLColor {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: l * 100, ...(c.a !== undefined && { a: c.a }) };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    ...(c.a !== undefined && { a: c.a }),
  };
}

/** Convert HSL to RGB. */
function hslToRgb(c: HSLColor): RGBColor {
  const h = c.h / 360;
  const s = c.s / 100;
  const l = c.l / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v, ...(c.a !== undefined && { a: c.a }) };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    ...(c.a !== undefined && { a: c.a }),
  };
}

/** Convert HSV (h:0-360, s:0-100, v:0-100) to RGB. */
function hsvToRgb(h: number, s: number, v: number): RGBColor {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;
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
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** Convert RGB to HSV (h:0-360, s:0-100, v:0-100). */
function rgbToHsv(c: RGBColor): { h: number; s: number; v: number } {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (((g - b) / d) % 6) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h, s, v };
}

/** Produce a 6-digit hex from any potentially short/invalid hex string. */
function normalizeHex(hex: string): string {
  try {
    return rgbToHex(hexToRgb(hex));
  } catch {
    return "#000000";
  }
}

/** Format a color for display in the selected format. */
function formatColor(hex: string, format: ColorFormat, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (format === "hex") {
    if (alpha < 1) {
      return rgbToHex({ ...rgb, a: alpha });
    }
    return hex;
  }
  if (format === "rgb") {
    if (alpha < 1) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;
    }
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }
  const hsl = hexToHsl(hex);
  if (alpha < 1) {
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha.toFixed(2)})`;
  }
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/* -------------------------------------------------------------------------- */
/*  Inline SVG icons                                                           */
/* -------------------------------------------------------------------------- */

function EyeDropperIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3L15 6" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Size configuration                                                         */
/* -------------------------------------------------------------------------- */

const SIZE_CONFIG = {
  sm: { trigger: "h-7 w-7 rounded", popover: "w-56", swatch: 16, canvas: 140 },
  md: { trigger: "h-9 w-9 rounded-md", popover: "w-64", swatch: 20, canvas: 176 },
  lg: { trigger: "h-11 w-11 rounded-lg", popover: "w-72", swatch: 24, canvas: 208 },
} as const;

/* -------------------------------------------------------------------------- */
/*  Default presets                                                            */
/* -------------------------------------------------------------------------- */

const DEFAULT_PRESETS: ColorPreset[] = [
  { label: "Black", value: "#000000" },
  { label: "Dark Gray", value: "#374151" },
  { label: "Gray", value: "#6b7280" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Yellow", value: "#eab308" },
  { label: "Lime", value: "#84cc16" },
  { label: "Green", value: "#22c55e" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Rose", value: "#f43f5e" },
  { label: "White", value: "#ffffff" },
];

/* -------------------------------------------------------------------------- */
/*  Saturation/Brightness Canvas                                               */
/* -------------------------------------------------------------------------- */

interface SatCanvasProps {
  hue: number;
  saturation: number;
  brightness: number;
  width: number;
  height: number;
  disabled?: boolean;
  onchange: (s: number, v: number) => void;
}

function SaturationCanvas({
  hue,
  saturation,
  brightness,
  width,
  height,
  disabled,
  onchange,
}: SatCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Base hue fill
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // White gradient (left to right)
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
    whiteGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // Black gradient (top to bottom)
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, "rgba(0,0,0,0)");
    blackGrad.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
  }, [hue, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  const pick = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || disabled) return;
      const rect = canvas.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, width);
      const y = clamp(clientY - rect.top, 0, height);
      const s = (x / width) * 100;
      const v = (1 - y / height) * 100;
      onchange(s, v);
    },
    [disabled, width, height, onchange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      pick(e.clientX, e.clientY);
    },
    [disabled, pick],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      pick(e.clientX, e.clientY);
    },
    [pick],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Thumb position
  const thumbX = (saturation / 100) * width;
  const thumbY = (1 - brightness / 100) * height;

  return (
    <div className="relative cursor-crosshair" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-sm"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div
        className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: thumbX, top: thumbY }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hue Slider                                                                 */
/* -------------------------------------------------------------------------- */

interface HueSliderProps {
  hue: number;
  width: number;
  disabled?: boolean;
  onChange: (h: number) => void;
}

function HueSlider({ hue, width, disabled, onChange }: HueSliderProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pick = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar || disabled) return;
      const rect = bar.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      onChange(Math.round((x / rect.width) * 360));
    },
    [disabled, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      pick(e.clientX);
    },
    [disabled, pick],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      pick(e.clientX);
    },
    [pick],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const thumbX = (hue / 360) * width;

  return (
    <div
      ref={barRef}
      className={cn(
        "relative h-3 cursor-pointer rounded-full",
        disabled && "pointer-events-none opacity-50",
      )}
      style={{
        width,
        background:
          "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: thumbX }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Alpha Slider                                                               */
/* -------------------------------------------------------------------------- */

interface AlphaSliderProps {
  alpha: number;
  hex: string;
  width: number;
  disabled?: boolean;
  onChange: (a: number) => void;
}

function AlphaSlider({
  alpha,
  hex,
  width,
  disabled,
  onChange,
}: AlphaSliderProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pick = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar || disabled) return;
      const rect = bar.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      onChange(parseFloat((x / rect.width).toFixed(2)));
    },
    [disabled, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      pick(e.clientX);
    },
    [disabled, pick],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      pick(e.clientX);
    },
    [pick],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const thumbX = alpha * width;

  return (
    <div
      ref={barRef}
      className={cn(
        "relative h-3 cursor-pointer rounded-full",
        disabled && "pointer-events-none opacity-50",
      )}
      style={{
        width,
        background: `linear-gradient(to right, transparent, ${hex}), repeating-conic-gradient(#d4d4d4 0% 25%, white 0% 50%) 50% / 8px 8px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: thumbX }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ColorPicker Component                                                      */
/* -------------------------------------------------------------------------- */

export function ColorPicker({
  value,
  defaultValue = "#3b82f6",
  onChange,
  format = "hex",
  presets,
  showEyeDropper = false,
  showAlpha = false,
  showInput = true,
  disabled = false,
  size = "md",
}: ColorPickerProps) {
  /* ---- Controlled / uncontrolled ---- */
  const isControlled = value !== undefined;
  const [internalColor, setInternalColor] = useState(
    normalizeHex(defaultValue),
  );
  const hex = normalizeHex(isControlled ? value! : internalColor);

  const [alpha, setAlpha] = useState(1);
  const [activeFormat, setActiveFormat] = useState<ColorFormat>(format);
  const [copied, setCopied] = useState(false);

  // Derive HSV from current hex for the canvas
  const hsv = rgbToHsv(hexToRgb(hex));
  const [hue, setHue] = useState(hsv.h);
  const [sat, setSat] = useState(hsv.s);
  const [bri, setBri] = useState(hsv.v);

  // Sync HSV when the external value changes
  useEffect(() => {
    if (isControlled && value) {
      const normalized = normalizeHex(value);
      const next = rgbToHsv(hexToRgb(normalized));
      setHue(next.h);
      setSat(next.s);
      setBri(next.v);
    }
  }, [isControlled, value]);

  /* ---- Commit a new hex color ---- */
  const commit = useCallback(
    (newHex: string) => {
      const normalized = normalizeHex(newHex);
      if (!isControlled) {
        setInternalColor(normalized);
      }
      onChange?.(normalized);
    },
    [isControlled, onChange],
  );

  /* ---- Handlers for canvas / sliders ---- */
  const handleSatBriChange = useCallback(
    (s: number, v: number) => {
      setSat(s);
      setBri(v);
      const rgb = hsvToRgb(hue, s, v);
      commit(rgbToHex(rgb));
    },
    [hue, commit],
  );

  const handleHueChange = useCallback(
    (h: number) => {
      setHue(h);
      const rgb = hsvToRgb(h, sat, bri);
      commit(rgbToHex(rgb));
    },
    [sat, bri, commit],
  );

  const handleAlphaChange = useCallback((a: number) => {
    setAlpha(a);
  }, []);

  /* ---- Preset click ---- */
  const handlePresetClick = useCallback(
    (presetHex: string) => {
      const normalized = normalizeHex(presetHex);
      const next = rgbToHsv(hexToRgb(normalized));
      setHue(next.h);
      setSat(next.s);
      setBri(next.v);
      commit(normalized);
    },
    [commit],
  );

  /* ---- Text input ---- */
  const [inputText, setInputText] = useState("");
  const inputFocused = useRef(false);

  // Keep input text in sync when not being edited
  useEffect(() => {
    if (!inputFocused.current) {
      setInputText(formatColor(hex, activeFormat, alpha));
    }
  }, [hex, activeFormat, alpha]);

  const handleInputBlur = useCallback(() => {
    inputFocused.current = false;
    const trimmed = inputText.trim();
    // Try to parse as hex
    if (/^#?[0-9a-fA-F]{3,8}$/.test(trimmed)) {
      const h = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
      handlePresetClick(h);
      return;
    }
    // Try to parse rgb(r, g, b) or rgba(r, g, b, a)
    const rgbMatch = trimmed.match(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
    );
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined;
      if (a !== undefined) setAlpha(clamp(a, 0, 1));
      handlePresetClick(rgbToHex({ r, g, b }));
      return;
    }
    // Try to parse hsl(h, s%, l%) or hsla(h, s%, l%, a)
    const hslMatch = trimmed.match(
      /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)/,
    );
    if (hslMatch) {
      const h = parseInt(hslMatch[1], 10);
      const s = parseInt(hslMatch[2], 10);
      const l = parseInt(hslMatch[3], 10);
      const a = hslMatch[4] ? parseFloat(hslMatch[4]) : undefined;
      if (a !== undefined) setAlpha(clamp(a, 0, 1));
      handlePresetClick(hslToHex({ h, s, l }));
      return;
    }
    // Revert to current
    setInputText(formatColor(hex, activeFormat, alpha));
  }, [inputText, hex, activeFormat, alpha, handlePresetClick]);

  /* ---- EyeDropper ---- */
  const handleEyeDropper = useCallback(async () => {
    if (disabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Dropper = (window as any).EyeDropper;
      if (!Dropper) return;
      const dropper = new Dropper();
      const result = await dropper.open();
      if (result?.sRGBHex) {
        handlePresetClick(result.sRGBHex);
      }
    } catch {
      // User cancelled or API unavailable
    }
  }, [disabled, handlePresetClick]);

  /* ---- Copy to clipboard ---- */
  const handleCopy = useCallback(async () => {
    const text = formatColor(hex, activeFormat, alpha);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable
    }
  }, [hex, activeFormat, alpha]);

  /* ---- Cycle format ---- */
  const cycleFormat = useCallback(() => {
    setActiveFormat((prev) => {
      if (prev === "hex") return "rgb";
      if (prev === "rgb") return "hsl";
      return "hex";
    });
  }, []);

  /* ---- Config ---- */
  const cfg = SIZE_CONFIG[size];
  const displayPresets = presets ?? DEFAULT_PRESETS;
  const eyeDropperSupported =
    showEyeDropper && typeof window !== "undefined" && "EyeDropper" in window;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "border border-input ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
            "transition-colors",
            disabled && "cursor-not-allowed opacity-50",
            cfg.trigger,
          )}
          style={{ backgroundColor: alpha < 1 ? undefined : hex }}
          aria-label={`Color picker: ${hex}`}
        >
          {alpha < 1 && (
            <span
              className="block h-full w-full rounded-[inherit]"
              style={{
                backgroundColor: hex,
                opacity: alpha,
              }}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={cn("p-3", cfg.popover)}
        align="start"
        sideOffset={8}
      >
        <div className="flex flex-col gap-3">
          {/* Saturation / brightness canvas */}
          <SaturationCanvas
            hue={hue}
            saturation={sat}
            brightness={bri}
            width={cfg.canvas}
            height={Math.round(cfg.canvas * 0.75)}
            disabled={disabled}
            onchange={handleSatBriChange}
          />

          {/* Hue slider */}
          <HueSlider
            hue={hue}
            width={cfg.canvas}
            disabled={disabled}
            onChange={handleHueChange}
          />

          {/* Alpha slider */}
          {showAlpha && (
            <AlphaSlider
              alpha={alpha}
              hex={hex}
              width={cfg.canvas}
              disabled={disabled}
              onChange={handleAlphaChange}
            />
          )}

          {/* Input row */}
          {showInput && (
            <div className="flex items-center gap-1.5">
              <Input
                className="h-7 flex-1 px-2 text-xs font-mono"
                value={inputFocused.current ? inputText : formatColor(hex, activeFormat, alpha)}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => {
                  inputFocused.current = true;
                  setInputText(formatColor(hex, activeFormat, alpha));
                }}
                onBlur={handleInputBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                disabled={disabled}
                spellCheck={false}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={cycleFormat}
                disabled={disabled}
                type="button"
                title={`Format: ${activeFormat.toUpperCase()}`}
              >
                <span className="text-[10px] font-bold uppercase leading-none">
                  {activeFormat}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleCopy}
                disabled={disabled}
                type="button"
                title="Copy color"
              >
                {copied ? (
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : (
                  <CopyIcon className="h-3.5 w-3.5" />
                )}
              </Button>
              {eyeDropperSupported && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={handleEyeDropper}
                  disabled={disabled}
                  type="button"
                  title="Pick color from screen"
                >
                  <EyeDropperIcon className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}

          {/* Preset swatches */}
          {displayPresets.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displayPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={cn(
                    "rounded-sm border border-input transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    disabled && "pointer-events-none opacity-50",
                    normalizeHex(preset.value) === hex &&
                      "ring-2 ring-ring ring-offset-1",
                  )}
                  style={{
                    width: cfg.swatch,
                    height: cfg.swatch,
                    backgroundColor: preset.value,
                  }}
                  title={preset.label}
                  onClick={() => handlePresetClick(preset.value)}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
