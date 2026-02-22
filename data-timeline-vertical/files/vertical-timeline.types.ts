import type { ReactNode } from "react";

/**
 * A single event displayed on the vertical timeline.
 */
export interface TimelineEvent {
  /** Unique identifier for the event. */
  id: string;

  /**
   * Date of the event. Accepts a `Date` object or any string parseable
   * by the `dateFormat` callback (ISO-8601 recommended).
   */
  date: Date | string;

  /** Primary label shown as the event heading. */
  title: string;

  /** Optional short description rendered below the title. */
  description?: string;

  /**
   * Category key used for grouping and filtering.
   * Must match a `key` in the `categories` array when filters are enabled.
   */
  category?: string;

  /**
   * Custom icon rendered inside the timeline dot.
   * When provided, replaces the default filled circle.
   */
  icon?: ReactNode;

  /**
   * Tailwind background-color class applied to the dot and connector accent.
   * Example: `"bg-blue-500"`, `"bg-emerald-400"`.
   * Falls back to category color, then to `"bg-neutral-400"`.
   */
  color?: string;

  /** Arbitrary React content rendered below the description. */
  content?: ReactNode;
}

/**
 * Category definition used for filter buttons.
 */
export interface TimelineCategory {
  /** Unique key matching `TimelineEvent.category`. */
  key: string;

  /** Human-readable label displayed on the filter button. */
  label: string;

  /**
   * Tailwind background-color class for the category badge / filter button.
   * Example: `"bg-blue-500"`.
   */
  color?: string;
}

/**
 * Props for the `VerticalTimeline` component.
 */
export interface VerticalTimelineProps {
  /** Array of timeline events to display (sorted chronologically on render). */
  events: TimelineEvent[];

  /**
   * Layout mode.
   * - `"left"` — all event cards appear to the right of the vertical line.
   * - `"alternating"` — cards alternate left/right (collapses to `"left"` on mobile).
   * @default "left"
   */
  layout?: "left" | "alternating";

  /**
   * When `true`, renders category filter buttons above the timeline.
   * Requires the `categories` prop to be provided.
   * @default false
   */
  showFilters?: boolean;

  /**
   * Category definitions rendered as toggle filters.
   * Each event's `category` field should correspond to a `key` here.
   */
  categories?: TimelineCategory[];

  /** Additional CSS classes applied to the outermost wrapper. */
  className?: string;

  /**
   * Custom date formatter. Receives the event's `date` value and should
   * return a display string.
   *
   * @default (date) => new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
   */
  dateFormat?: (date: Date | string) => string;

  /**
   * Content displayed when the event list is empty or all events are
   * filtered out.
   * @default "No events to display"
   */
  emptyMessage?: ReactNode;
}
