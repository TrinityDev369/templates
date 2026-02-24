/**
 * Type definitions for the StatsSection component.
 *
 * StatItem represents a single statistic entry with a numeric value,
 * label, and optional prefix/suffix decorators.
 *
 * StatsSectionProps defines the full section configuration including
 * heading, description, stat items, and animation toggle.
 */

/** A single statistic entry displayed in the stats grid. */
export interface StatItem {
  /** The numeric value to display (and animate toward when count-up is enabled). */
  value: number;
  /** Descriptive label rendered below the stat value. */
  label: string;
  /** Optional string prepended to the value (e.g. "$", "#"). */
  prefix?: string;
  /** Optional string appended to the value (e.g. "%", "+", " users"). */
  suffix?: string;
}

/** Props for the StatsSection component. */
export interface StatsSectionProps {
  /** Optional section heading displayed above the stats grid. */
  title?: string;
  /** Optional description paragraph rendered below the heading. */
  description?: string;
  /** Array of stat items to render in the grid. Recommended: 3 or 4 items. */
  stats: StatItem[];
  /**
   * When true, stat values animate from 0 to their target value on scroll
   * using IntersectionObserver and requestAnimationFrame.
   * When false, values render statically without animation.
   * @default true
   */
  animate?: boolean;
  /** Additional CSS class names applied to the root section element. */
  className?: string;
}
