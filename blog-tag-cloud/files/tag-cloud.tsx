"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TagCloudTag {
  name: string;
  count: number;
  href?: string;
}

export interface TagCloudProps {
  /** Array of tags with name, count, and optional href. */
  tags: TagCloudTag[];
  /** Maximum font size in rem for the highest-count tag. @default 2.5 */
  maxFontSize?: number;
  /** Minimum font size in rem for the lowest-count tag. @default 0.875 */
  minFontSize?: number;
  /** Additional class names forwarded to the root container. */
  className?: string;
  /** Callback fired when a tag without an href is clicked. */
  onTagClick?: (tag: string) => void;
}

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------

/**
 * A curated progression from muted slate to vibrant blue/violet.
 * Index 0 = lowest weight, last index = highest weight.
 */
const COLOR_STOPS: readonly string[] = [
  "text-slate-400 hover:text-slate-500",
  "text-slate-500 hover:text-slate-600",
  "text-zinc-500 hover:text-zinc-600",
  "text-sky-500 hover:text-sky-600",
  "text-blue-500 hover:text-blue-600",
  "text-blue-600 hover:text-blue-700",
  "text-indigo-500 hover:text-indigo-600",
  "text-indigo-600 hover:text-indigo-700",
  "text-violet-500 hover:text-violet-600",
  "text-violet-600 hover:text-violet-700",
] as const;

const BADGE_COLOR_STOPS: readonly string[] = [
  "bg-slate-100 text-slate-500",
  "bg-slate-100 text-slate-600",
  "bg-zinc-100 text-zinc-600",
  "bg-sky-100 text-sky-700",
  "bg-blue-100 text-blue-700",
  "bg-blue-100 text-blue-800",
  "bg-indigo-100 text-indigo-700",
  "bg-indigo-100 text-indigo-800",
  "bg-violet-100 text-violet-700",
  "bg-violet-100 text-violet-800",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Linearly interpolate between `a` and `b` by ratio `t` (0..1). */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp `v` between `lo` and `hi`. */
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Map a value within `[min, max]` to a 0..1 ratio. */
function normalise(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

// ---------------------------------------------------------------------------
// Keyframes (injected once)
// ---------------------------------------------------------------------------

const KEYFRAMES_ID = "__tag-cloud-fadein";

function ensureKeyframes(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;

  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes tagCloudFadeIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.92);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TagCloud({
  tags,
  maxFontSize = 2.5,
  minFontSize = 0.875,
  className,
  onTagClick,
}: TagCloudProps) {
  // Inject keyframes on first render (client only, idempotent).
  useMemo(() => ensureKeyframes(), []);

  // Derive min/max counts for scaling.
  const { minCount, maxCount } = useMemo(() => {
    if (tags.length === 0) return { minCount: 0, maxCount: 0 };
    let lo = Infinity;
    let hi = -Infinity;
    for (const t of tags) {
      if (t.count < lo) lo = t.count;
      if (t.count > hi) hi = t.count;
    }
    return { minCount: lo, maxCount: hi };
  }, [tags]);

  if (tags.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-3 gap-y-2.5",
        className,
      )}
      role="list"
      aria-label="Tag cloud"
    >
      {tags.map((tag, index) => {
        const ratio = normalise(tag.count, minCount, maxCount);
        const fontSize = lerp(minFontSize, maxFontSize, ratio);
        const colorIndex = Math.round(ratio * (COLOR_STOPS.length - 1));
        const colorClass = COLOR_STOPS[colorIndex];
        const badgeColorClass = BADGE_COLOR_STOPS[colorIndex];

        // Stagger delay: 40ms per tag, capped at 800ms total.
        const delay = Math.min(index * 40, 800);

        const sharedStyle: React.CSSProperties = {
          fontSize: `${fontSize}rem`,
          lineHeight: 1.2,
          animation: `tagCloudFadeIn 0.4s ease-out ${delay}ms both`,
        };

        const sharedClassName = cn(
          // Layout
          "relative inline-flex items-baseline gap-1",
          // Typography
          "font-medium leading-none",
          // Colour (dynamic per weight)
          colorClass,
          // Transitions
          "transition-all duration-200 ease-out",
          // Hover
          "hover:scale-105",
          // Active / pressed
          "active:scale-95 active:opacity-80",
          // Focus-visible
          "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2",
        );

        const badge = (
          <sup
            className={cn(
              "ml-0.5 inline-flex items-center justify-center",
              "rounded-full px-1.5 py-0.5",
              "text-[0.625rem] font-semibold leading-none tabular-nums",
              "transition-colors duration-200",
              badgeColorClass,
            )}
            aria-label={`${tag.count} posts`}
          >
            {tag.count}
          </sup>
        );

        const content = (
          <>
            {tag.name}
            {badge}
          </>
        );

        // --- Render as link ---
        if (tag.href) {
          return (
            <a
              key={tag.name}
              href={tag.href}
              role="listitem"
              className={sharedClassName}
              style={sharedStyle}
            >
              {content}
            </a>
          );
        }

        // --- Render as button ---
        if (onTagClick) {
          return (
            <button
              key={tag.name}
              type="button"
              role="listitem"
              className={cn(sharedClassName, "cursor-pointer")}
              style={sharedStyle}
              onClick={() => onTagClick(tag.name)}
            >
              {content}
            </button>
          );
        }

        // --- Render as static span ---
        return (
          <span
            key={tag.name}
            role="listitem"
            className={sharedClassName}
            style={sharedStyle}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}
