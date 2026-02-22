import type React from 'react';

/**
 * A single item (column) in the comparison table.
 * Must have `id` and `name`; all other properties are feature values
 * keyed by their `ComparisonFeature.key`.
 */
export interface ComparisonItem {
  id: string;
  name: string;
  image?: string;
  [key: string]: unknown;
}

/**
 * Describes one feature row in the comparison table.
 *
 * - `key`      — maps to a property on `ComparisonItem`
 * - `label`    — human-readable name rendered in the first column
 * - `category` — optional grouping; features with the same category are
 *                visually grouped with a section header
 * - `render`   — optional custom renderer; receives the raw value and the
 *                owning item so you can render rich cells
 */
export interface ComparisonFeature {
  key: string;
  label: string;
  category?: string;
  render?: (value: unknown, item: ComparisonItem) => React.ReactNode;
}

/**
 * Props for the `<ComparisonTable />` component.
 *
 * - `items`                — columns to compare (min 2 recommended)
 * - `features`             — rows describing each comparable attribute
 * - `highlightDifferences` — when true, cells whose values differ across
 *                            items receive a subtle background tint
 * - `highlightBest`        — optional callback returning the 0-based index
 *                            of the "best" item for a given feature, or
 *                            `null` if no winner
 * - `stickyHeader`         — pin the header row while scrolling (default true)
 * - `maxItems`             — cap the number of items shown (first N used)
 * - `className`            — additional CSS class on the wrapper
 * - `onRemoveItem`         — callback when the user clicks the X on a column
 */
export interface ComparisonTableProps {
  items: ComparisonItem[];
  features: ComparisonFeature[];
  highlightDifferences?: boolean;
  highlightBest?: (feature: ComparisonFeature, values: unknown[]) => number | null;
  stickyHeader?: boolean;
  maxItems?: number;
  className?: string;
  onRemoveItem?: (id: string) => void;
}
