"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  TimelineEvent,
  TimelineCategory,
  VerticalTimelineProps,
} from "./vertical-timeline.types";

export type { TimelineEvent, TimelineCategory, VerticalTimelineProps };

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_DOT_COLOR = "bg-neutral-400";

function defaultDateFormat(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Resolve the dot color for a single event.
 * Priority: event.color > category color > default.
 */
function resolveDotColor(
  event: TimelineEvent,
  categoryMap: Map<string, TimelineCategory>,
): string {
  if (event.color) return event.color;
  if (event.category) {
    const cat = categoryMap.get(event.category);
    if (cat?.color) return cat.color;
  }
  return DEFAULT_DOT_COLOR;
}

/**
 * Sort events by date ascending, preserving original order for equal dates.
 */
function sortByDate(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const da = typeof a.date === "string" ? new Date(a.date) : a.date;
    const db = typeof b.date === "string" ? new Date(b.date) : b.date;
    return da.getTime() - db.getTime();
  });
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

/** Category filter toggle button. */
function FilterButton({
  category,
  isActive,
  onToggle,
}: {
  category: TimelineCategory;
  isActive: boolean;
  onToggle: () => void;
}) {
  const colorClass = category.color ?? DEFAULT_DOT_COLOR;

  // Extract the base color for the ring/border by deriving from the bg class
  // e.g. "bg-blue-500" -> "ring-blue-500"
  const ringClass = colorClass.replace(/^bg-/, "ring-");

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
        "ring-1 ring-inset transition-all duration-200",
        isActive
          ? `${colorClass} text-white ${ringClass}`
          : `bg-transparent ${ringClass} text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800`,
      ].join(" ")}
      aria-pressed={isActive}
    >
      <span
        className={[
          "inline-block h-2 w-2 rounded-full",
          isActive ? "bg-white" : colorClass,
        ].join(" ")}
        aria-hidden="true"
      />
      {category.label}
    </button>
  );
}

/** The circular dot on the timeline line. */
function TimelineDot({
  color,
  icon,
}: {
  color: string;
  icon?: React.ReactNode;
}) {
  if (icon) {
    return (
      <div
        className={[
          "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
          "ring-4 ring-white dark:ring-neutral-950",
          color,
          "text-white",
        ].join(" ")}
      >
        {icon}
      </div>
    );
  }

  return (
    <div
      className={[
        "relative z-10 h-4 w-4 rounded-full",
        "ring-4 ring-white dark:ring-neutral-950",
        color,
      ].join(" ")}
    />
  );
}

/** A single event card (content panel). */
function EventCard({
  event,
  formatDate,
}: {
  event: TimelineEvent;
  formatDate: (date: Date | string) => string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <time className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {formatDate(event.date)}
      </time>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {event.title}
      </h3>
      {event.description && (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {event.description}
        </p>
      )}
      {event.content && <div className="mt-3">{event.content}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Left layout                                                                */
/* -------------------------------------------------------------------------- */

function LeftLayout({
  events,
  categoryMap,
  formatDate,
}: {
  events: TimelineEvent[];
  categoryMap: Map<string, TimelineCategory>;
  formatDate: (date: Date | string) => string;
}) {
  return (
    <div className="relative">
      {/* Vertical line — positioned at 16px from left (center of the dot area) */}
      <div
        className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700"
        aria-hidden="true"
      />

      <div className="space-y-8">
        {events.map((event) => {
          const dotColor = resolveDotColor(event, categoryMap);
          const hasIcon = !!event.icon;

          return (
            <div
              key={event.id}
              className="relative grid grid-cols-[32px_1fr] items-start gap-3"
            >
              {/* Dot — centered in the 32px column, vertically nudged to align with card heading */}
              <div
                className={[
                  "flex items-center justify-center",
                  hasIcon ? "pt-0" : "pt-1",
                ].join(" ")}
              >
                <TimelineDot color={dotColor} icon={event.icon} />
              </div>

              {/* Card */}
              <EventCard event={event} formatDate={formatDate} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Alternating layout                                                         */
/* -------------------------------------------------------------------------- */

function AlternatingLayout({
  events,
  categoryMap,
  formatDate,
}: {
  events: TimelineEvent[];
  categoryMap: Map<string, TimelineCategory>;
  formatDate: (date: Date | string) => string;
}) {
  return (
    <>
      {/* Mobile: left-aligned (same as LeftLayout) */}
      <div className="md:hidden">
        <LeftLayout
          events={events}
          categoryMap={categoryMap}
          formatDate={formatDate}
        />
      </div>

      {/* Desktop: alternating zig-zag */}
      <div className="relative hidden md:block">
        {/* Vertical center line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-neutral-200 dark:bg-neutral-700"
          aria-hidden="true"
        />

        <div className="space-y-8">
          {events.map((event, index) => {
            const dotColor = resolveDotColor(event, categoryMap);
            const isLeft = index % 2 === 0;

            return (
              <div
                key={event.id}
                className="relative grid grid-cols-[1fr_auto_1fr] items-start gap-4"
              >
                {/* Left content or spacer */}
                {isLeft ? (
                  <div className="pr-4 text-right">
                    <EventCard event={event} formatDate={formatDate} />
                  </div>
                ) : (
                  <div aria-hidden="true" />
                )}

                {/* Center dot */}
                <div className="flex items-start justify-center pt-1.5">
                  <TimelineDot color={dotColor} icon={event.icon} />
                </div>

                {/* Right content or spacer */}
                {isLeft ? (
                  <div aria-hidden="true" />
                ) : (
                  <div className="pl-4">
                    <EventCard event={event} formatDate={formatDate} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  VerticalTimeline                                                           */
/* -------------------------------------------------------------------------- */

/**
 * A chronological vertical timeline with optional category filtering and
 * two layout modes: left-aligned or alternating zig-zag.
 *
 * Fully self-contained — no external dependencies beyond React and Tailwind CSS.
 *
 * @example Basic left-aligned timeline
 * ```tsx
 * <VerticalTimeline
 *   events={[
 *     { id: "1", date: "2024-01-15", title: "Project kickoff" },
 *     { id: "2", date: "2024-02-01", title: "Design phase", description: "Wireframes & prototypes" },
 *     { id: "3", date: "2024-03-10", title: "Development starts", color: "bg-blue-500" },
 *   ]}
 * />
 * ```
 *
 * @example Alternating layout with category filters
 * ```tsx
 * <VerticalTimeline
 *   events={events}
 *   layout="alternating"
 *   showFilters
 *   categories={[
 *     { key: "feature", label: "Feature", color: "bg-blue-500" },
 *     { key: "bugfix", label: "Bug Fix", color: "bg-red-500" },
 *     { key: "release", label: "Release", color: "bg-green-500" },
 *   ]}
 * />
 * ```
 */
export function VerticalTimeline({
  events,
  layout = "left",
  showFilters = false,
  categories = [],
  className = "",
  dateFormat,
  emptyMessage = "No events to display",
}: VerticalTimelineProps) {
  /* ---- Filter state ---- */
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.key)),
  );

  /** Build a lookup map for categories. */
  const categoryMap = useMemo<Map<string, TimelineCategory>>(() => {
    const m = new Map<string, TimelineCategory>();
    for (const cat of categories) {
      m.set(cat.key, cat);
    }
    return m;
  }, [categories]);

  /** Toggle a single category in the active set. */
  const toggleCategory = useCallback((key: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  /** Formatter, with fallback to our default. */
  const formatDate = dateFormat ?? defaultDateFormat;

  /* ---- Filter & sort events ---- */
  const visibleEvents = useMemo(() => {
    let filtered = events;

    // Only apply category filter when filters are shown and categories are defined
    if (showFilters && categories.length > 0) {
      filtered = events.filter((e) => {
        // Events without a category are always visible
        if (!e.category) return true;
        return activeCategories.has(e.category);
      });
    }

    return sortByDate(filtered);
  }, [events, showFilters, categories, activeCategories]);

  /* ---- Render ---- */
  return (
    <div
      className={["w-full", className].filter(Boolean).join(" ")}
      role="feed"
      aria-label="Timeline"
    >
      {/* Category filter bar */}
      {showFilters && categories.length > 0 && (
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Category filters"
        >
          {categories.map((cat) => (
            <FilterButton
              key={cat.key}
              category={cat}
              isActive={activeCategories.has(cat.key)}
              onToggle={() => toggleCategory(cat.key)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {visibleEvents.length === 0 && (
        <div
          className="flex items-center justify-center py-16 text-neutral-500"
          role="status"
          aria-label="Empty timeline"
        >
          {typeof emptyMessage === "string" ? (
            <p className="text-sm">{emptyMessage}</p>
          ) : (
            emptyMessage
          )}
        </div>
      )}

      {/* Timeline content */}
      {visibleEvents.length > 0 && layout === "left" && (
        <LeftLayout
          events={visibleEvents}
          categoryMap={categoryMap}
          formatDate={formatDate}
        />
      )}

      {visibleEvents.length > 0 && layout === "alternating" && (
        <AlternatingLayout
          events={visibleEvents}
          categoryMap={categoryMap}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
