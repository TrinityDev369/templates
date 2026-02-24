/**
 * Types for the BentoStats dashboard metrics component.
 *
 * Each BentoStat represents a single metric card within the bento grid,
 * supporting trend indicators, optional badges, and mini sparkline data.
 */

/**
 * A single stat entry displayed as a card in the bento grid.
 */
export interface BentoStat {
  /** Human-readable metric label (e.g. "Revenue", "Active Users") */
  label: string;
  /** Formatted display value (e.g. "$12,450", "1,234") */
  value: string;
  /** Change indicator string (e.g. "+12.5%", "-3.2%") */
  change?: string;
  /** Trend direction for the arrow indicator */
  trend?: "up" | "down" | "neutral";
  /** Number of grid columns this card spans. Default: 1 */
  colSpan?: number;
  /** Optional badge text displayed in the card header */
  badge?: string;
  /** Optional sparkline data — array of 4-5 values (0-100) for the mini bar chart */
  sparkline?: number[];
}

/**
 * Props for the BentoStats component.
 */
export interface BentoStatsProps {
  /** Optional section heading above the grid */
  title?: string;
  /** Optional description text below the heading */
  description?: string;
  /** Array of stat entries to render as cards */
  stats: BentoStat[];
  /** Additional CSS classes for the root wrapper */
  className?: string;
}
