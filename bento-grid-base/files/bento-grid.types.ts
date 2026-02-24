import type { ReactNode } from "react";

/**
 * Gap size presets for the bento grid.
 * - "sm" = gap-2 (8px)
 * - "md" = gap-4 (16px)
 * - "lg" = gap-6 (24px)
 */
export type BentoGap = "sm" | "md" | "lg";

/**
 * Props for the BentoGrid container component.
 */
export interface BentoGridProps {
  /** Number of columns at the lg breakpoint. Default: 3 */
  cols?: number;
  /** Number of explicit rows (optional — grid auto-generates rows if omitted) */
  rows?: number;
  /** Gap size preset between grid items. Default: "md" */
  gap?: BentoGap;
  /** Additional CSS classes for the grid container */
  className?: string;
  /** Grid items (typically BentoGridItem components) */
  children: ReactNode;
}

/**
 * Props for the BentoGridItem child component.
 */
export interface BentoGridItemProps {
  /** Number of columns this item spans. Default: 1 */
  colSpan?: number;
  /** Number of rows this item spans. Default: 1 */
  rowSpan?: number;
  /** Additional CSS classes for the item wrapper (Card) */
  className?: string;
  /** Content rendered inside the Card */
  children?: ReactNode;
}
