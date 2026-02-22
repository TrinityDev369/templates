import type React from "react";

/**
 * Represents a single statistic card within the dashboard.
 */
export interface StatCard {
  /** Unique identifier for the stat card */
  id: string;
  /** Display label shown above the value */
  label: string;
  /** Current numeric value to display */
  value: number;
  /** Previous value used to calculate trend direction and percentage change */
  previousValue?: number;
  /** Prefix rendered before the value, e.g. "$" */
  prefix?: string;
  /** Suffix rendered after the value, e.g. "%" */
  suffix?: string;
  /** Number formatting mode */
  format?: "number" | "compact" | "currency" | "percent";
  /** Icon element rendered in the top-right corner of the card */
  icon?: React.ReactNode;
  /** Tailwind color class applied to the icon container, e.g. "text-blue-500" */
  color?: string;
  /** Array of numeric values rendered as a mini sparkline bar chart */
  sparkline?: number[];
  /** Optional link — makes the card navigate on click */
  href?: string;
}

/**
 * Props for the StatsDashboard component.
 */
export interface StatsDashboardProps {
  /** Array of stat cards to render */
  stats: StatCard[];
  /** Responsive column counts at each breakpoint */
  columns?: { sm?: number; md?: number; lg?: number };
  /** Whether to animate count-up on mount (default: true) */
  animated?: boolean;
  /** Duration of the count-up animation in milliseconds (default: 1000) */
  animationDuration?: number;
  /** Additional CSS class names applied to the outer container */
  className?: string;
  /** Callback invoked when a stat card is clicked */
  onStatClick?: (stat: StatCard) => void;
}
