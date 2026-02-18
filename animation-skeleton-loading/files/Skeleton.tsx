"use client";

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Shimmer keyframe injection (once per document)                     */
/* ------------------------------------------------------------------ */

let shimmerInjected = false;
const SHIMMER_NAME = "skeleton-shimmer";

function injectShimmerKeyframes(): void {
  if (shimmerInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = [
    `@keyframes ${SHIMMER_NAME}{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`,
    `@media(prefers-reduced-motion:reduce){.skeleton-shimmer-overlay{animation:none !important;display:none !important}}`,
  ].join("");
  document.head.appendChild(style);
  shimmerInjected = true;
}

/* ------------------------------------------------------------------ */
/*  Reduced-motion detection hook                                      */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

const ROUNDED_MAP = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

export interface SkeletonProps {
  /** Additional Tailwind classes (use for width/height sizing). */
  className?: string;
  /** Whether the shimmer animation is active. @default true */
  animate?: boolean;
  /** Border-radius preset. @default 'md' */
  rounded?: "sm" | "md" | "lg" | "full";
  /** Inline styles forwarded to the root element. */
  style?: React.CSSProperties;
}

export interface SkeletonTextProps {
  /** Number of text lines to render. @default 3 */
  lines?: number;
  /** Vertical gap between lines in pixels. @default 12 */
  gap?: number;
  /** Additional Tailwind classes applied to the wrapper. */
  className?: string;
}

export interface SkeletonAvatarProps {
  /** Predefined size: sm=32px, md=48px, lg=64px. @default 'md' */
  size?: "sm" | "md" | "lg";
  /** Additional Tailwind classes applied to the avatar element. */
  className?: string;
}

export interface SkeletonCardProps {
  /** Additional Tailwind classes applied to the card wrapper. */
  className?: string;
}

export interface SkeletonTableProps {
  /** Number of table rows. @default 5 */
  rows?: number;
  /** Number of columns per row. @default 4 */
  cols?: number;
  /** Additional Tailwind classes applied to the table wrapper. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Skeleton (base)                                                    */
/* ------------------------------------------------------------------ */

/**
 * Base skeleton placeholder with an animated shimmer gradient.
 *
 * Apply sizing via Tailwind utility classes on `className`, e.g.
 * `<Skeleton className="h-4 w-3/4" />`.
 *
 * When the user has `prefers-reduced-motion` enabled, the shimmer is
 * disabled and a static gray bar is displayed instead.
 */
export function Skeleton({
  className = "",
  animate = true,
  rounded = "md",
  style,
}: SkeletonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    injectShimmerKeyframes();
  }, []);

  const showShimmer = animate && !prefersReducedMotion;

  const roundedClass = ROUNDED_MAP[rounded];

  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${roundedClass} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {showShimmer && (
        <div
          className="skeleton-shimmer-overlay absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
            animation: `${SHIMMER_NAME} 1.5s ease-in-out infinite`,
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SkeletonText                                                       */
/* ------------------------------------------------------------------ */

/**
 * Renders multiple horizontal skeleton bars simulating a block of text.
 * The last line is rendered at 60% width to mimic a natural paragraph ending.
 */
export function SkeletonText({
  lines = 3,
  gap = 12,
  className = "",
}: SkeletonTextProps) {
  const count = Math.max(1, lines);

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: `${gap}px` }}>
      {Array.from({ length: count }, (_, i) => {
        const isLast = i === count - 1 && count > 1;
        return (
          <Skeleton
            key={i}
            className={`h-4 ${isLast ? "w-3/5" : "w-full"}`}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SkeletonAvatar                                                     */
/* ------------------------------------------------------------------ */

const AVATAR_SIZE_MAP: Record<"sm" | "md" | "lg", number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

/**
 * Circular skeleton placeholder for user avatars.
 */
export function SkeletonAvatar({
  size = "md",
  className = "",
}: SkeletonAvatarProps) {
  const px = AVATAR_SIZE_MAP[size];

  return (
    <Skeleton
      className={`shrink-0 ${className}`}
      rounded="full"
      style={{ width: px, height: px }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  SkeletonCard                                                       */
/* ------------------------------------------------------------------ */

/**
 * Composite skeleton simulating a media card layout:
 * - 16:9 image placeholder
 * - 3-line text block
 * - Avatar + short name bar row
 */
export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Image placeholder — 16:9 aspect ratio */}
      <Skeleton className="w-full" rounded="sm" style={{ aspectRatio: "16/9" }} />

      {/* Content area */}
      <div className="p-4">
        <SkeletonText lines={3} gap={10} />

        {/* Author row */}
        <div className="mt-4 flex items-center gap-3">
          <SkeletonAvatar size="sm" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SkeletonTable                                                      */
/* ------------------------------------------------------------------ */

/**
 * Grid of skeleton cells simulating a data table.
 * Renders a header row (slightly taller, bolder shade) followed by
 * `rows` data rows, each containing `cols` cells.
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
  className = "",
}: SkeletonTableProps) {
  const rowCount = Math.max(1, rows);
  const colCount = Math.max(1, cols);

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header row */}
      <div
        className="grid gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
        style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
      >
        {Array.from({ length: colCount }, (_, c) => (
          <Skeleton key={`h-${c}`} className="h-4 w-3/4" />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rowCount }, (_, r) => (
        <div
          key={`r-${r}`}
          className="grid gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-800"
          style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
        >
          {Array.from({ length: colCount }, (_, c) => (
            <Skeleton
              key={`r-${r}-c-${c}`}
              className={`h-3 ${c === 0 ? "w-4/5" : "w-3/5"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Default export                                                     */
/* ------------------------------------------------------------------ */

export default Skeleton;
