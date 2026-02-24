import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// BentoFeature — data shape for a single feature card
// ---------------------------------------------------------------------------

/**
 * Describes a single feature displayed in the bento grid.
 *
 * @example
 * ```ts
 * const feature: BentoFeature = {
 *   title: "Real-time Sync",
 *   description: "Changes propagate instantly across all connected devices.",
 *   colSpan: 2,
 *   badge: "New",
 * };
 * ```
 */
export interface BentoFeature {
  /** Optional icon rendered above the title. Accepts any ReactNode (inline SVG recommended). */
  icon?: ReactNode;
  /** Feature title displayed as a heading. */
  title: string;
  /** Short description explaining the feature. */
  description: string;
  /** Number of grid columns this card should span. Default: 1 */
  colSpan?: number;
  /** Number of grid rows this card should span. Default: 1 */
  rowSpan?: number;
  /** Optional badge label (e.g. "New", "Popular") shown next to the title. */
  badge?: string;
}

// ---------------------------------------------------------------------------
// BentoFeaturesProps — component props
// ---------------------------------------------------------------------------

/**
 * Props for the `BentoFeatures` component.
 */
export interface BentoFeaturesProps {
  /** Section heading rendered above the grid. */
  title?: string;
  /** Section description rendered below the heading. */
  description?: string;
  /** Array of features to display in the bento grid. */
  features: BentoFeature[];
  /** Additional CSS classes for the outermost wrapper. */
  className?: string;
}
