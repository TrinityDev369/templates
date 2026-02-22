"use client";

import { useEffect, useRef, useState } from "react";
import type { StatCard, StatsDashboardProps } from "./stats-dashboard.types";

export type { StatCard, StatsDashboardProps };

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Ease-out exponential curve.
 * Starts fast, decelerates towards the end for a satisfying count-up feel.
 */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Format a number according to the requested mode.
 * All formatting is handled with `Intl.NumberFormat` for locale-awareness.
 */
function formatValue(
  value: number,
  format: StatCard["format"] = "number",
  prefix?: string,
  suffix?: string,
): string {
  let formatted: string;

  switch (format) {
    case "compact": {
      formatted = new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
      break;
    }
    case "currency": {
      formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
      break;
    }
    case "percent": {
      formatted = new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(value / 100);
      break;
    }
    default: {
      formatted = new Intl.NumberFormat("en-US").format(value);
      break;
    }
  }

  // For currency format, the "$" is already included by Intl, so skip prefix
  const pre = format === "currency" ? "" : (prefix ?? "");
  const suf = format === "percent" ? "" : (suffix ?? "");

  return `${pre}${formatted}${suf}`;
}

/**
 * Compute the percentage change between previous and current values.
 */
function computeTrendPercent(
  current: number,
  previous: number | undefined,
): number | null {
  if (previous === undefined || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Map column count to a Tailwind grid-cols class.
 * We use a lookup to ensure Tailwind can statically extract the classes.
 */
const colsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

function gridClasses(columns?: {
  sm?: number;
  md?: number;
  lg?: number;
}): string {
  const sm = columns?.sm ?? 2;
  const md = columns?.md ?? 3;
  const lg = columns?.lg ?? 4;

  return [
    "grid-cols-1",
    `sm:${colsMap[sm] ?? "grid-cols-2"}`,
    `md:${colsMap[md] ?? "grid-cols-3"}`,
    `lg:${colsMap[lg] ?? "grid-cols-4"}`,
  ].join(" ");
}

/* -------------------------------------------------------------------------- */
/*  Animated Counter Hook                                                      */
/* -------------------------------------------------------------------------- */

function useAnimatedValue(
  target: number,
  enabled: boolean,
  duration: number,
): number {
  const [displayValue, setDisplayValue] = useState(enabled ? 0 : target);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(target);
      return;
    }

    // Reset for new target
    startTimeRef.current = null;

    function tick(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setDisplayValue(Math.round(easedProgress * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Ensure we land exactly on target
        setDisplayValue(target);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, enabled, duration]);

  return displayValue;
}

/* -------------------------------------------------------------------------- */
/*  Sparkline SVG                                                              */
/* -------------------------------------------------------------------------- */

interface SparklineProps {
  data: number[];
  color?: string;
}

function Sparkline({ data, color }: SparklineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1); // Avoid division by zero
  const barCount = data.length;
  const svgWidth = 80;
  const svgHeight = 28;
  const gap = 1;
  const barWidth = Math.max((svgWidth - gap * (barCount - 1)) / barCount, 2);

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="mt-2"
      aria-hidden="true"
    >
      {data.map((value, index) => {
        const barHeight = Math.max((value / max) * svgHeight, 1);
        const x = index * (barWidth + gap);
        const y = svgHeight - barHeight;

        // Last bar gets full opacity, others are faded
        const isLast = index === barCount - 1;
        const opacity = isLast ? 1 : 0.3 + (index / barCount) * 0.4;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={1}
            className={color ?? "fill-blue-500"}
            style={{ opacity }}
          />
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trend Indicator                                                            */
/* -------------------------------------------------------------------------- */

interface TrendIndicatorProps {
  current: number;
  previous: number | undefined;
}

function TrendIndicator({ current, previous }: TrendIndicatorProps) {
  const trendPercent = computeTrendPercent(current, previous);

  if (trendPercent === null) return null;

  const isPositive = trendPercent > 0;
  const isNeutral = trendPercent === 0;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-500">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 6h8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        0%
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive ? "text-emerald-600" : "text-red-600"
      }`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className={isPositive ? "" : "rotate-180"}
      >
        <path
          d="M6 2.5v7M6 2.5L3 5.5M6 2.5l3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {Math.abs(trendPercent).toFixed(1)}%
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Single Stat Card                                                           */
/* -------------------------------------------------------------------------- */

interface StatCardComponentProps {
  stat: StatCard;
  animated: boolean;
  animationDuration: number;
  onClick?: (stat: StatCard) => void;
}

function StatCardComponent({
  stat,
  animated,
  animationDuration,
  onClick,
}: StatCardComponentProps) {
  const displayValue = useAnimatedValue(stat.value, animated, animationDuration);
  const isClickable = !!(stat.href || onClick);

  const formattedValue = formatValue(
    displayValue,
    stat.format,
    stat.prefix,
    stat.suffix,
  );

  const cardContent = (
    <>
      {/* Header: label + icon */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {stat.label}
        </p>
        {stat.icon && (
          <span className={`${stat.color ?? "text-gray-400"} flex-shrink-0`}>
            {stat.icon}
          </span>
        )}
      </div>

      {/* Value + trend */}
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          {formattedValue}
        </span>
        <TrendIndicator current={stat.value} previous={stat.previousValue} />
      </div>

      {/* Sparkline */}
      {stat.sparkline && stat.sparkline.length > 0 && (
        <Sparkline
          data={stat.sparkline}
          color={stat.color ? stat.color.replace("text-", "fill-") : undefined}
        />
      )}
    </>
  );

  const baseClasses = [
    "rounded-xl border border-gray-200 dark:border-gray-800",
    "bg-white dark:bg-gray-950",
    "p-5",
    "shadow-sm",
    "transition-all duration-200 ease-out",
    isClickable
      ? "cursor-pointer hover:scale-[1.02] hover:shadow-md active:scale-[0.99]"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Render as anchor if href is provided
  if (stat.href) {
    return (
      <a
        href={stat.href}
        className={baseClasses}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick(stat);
          }
        }}
      >
        {cardContent}
      </a>
    );
  }

  // Render as interactive div if onClick is provided
  if (onClick) {
    return (
      <button
        type="button"
        className={`${baseClasses} text-left w-full`}
        onClick={() => onClick(stat)}
      >
        {cardContent}
      </button>
    );
  }

  // Static card
  return <div className={baseClasses}>{cardContent}</div>;
}

/* -------------------------------------------------------------------------- */
/*  Stats Dashboard                                                            */
/* -------------------------------------------------------------------------- */

/**
 * StatsDashboard renders a responsive grid of statistic cards with animated
 * count-up values, trend indicators, and optional sparkline bar charts.
 *
 * @example
 * ```tsx
 * <StatsDashboard
 *   stats={[
 *     { id: "revenue", label: "Revenue", value: 48250, format: "currency", previousValue: 42100 },
 *     { id: "users", label: "Active Users", value: 3842, format: "compact", sparkline: [20,35,45,30,55,60,72] },
 *     { id: "uptime", label: "Uptime", value: 9987, format: "percent", prefix: "", suffix: "" },
 *   ]}
 *   animated
 *   animationDuration={1200}
 *   onStatClick={(stat) => console.log(stat.id)}
 * />
 * ```
 */
export function StatsDashboard({
  stats,
  columns,
  animated = true,
  animationDuration = 1000,
  className = "",
  onStatClick,
}: StatsDashboardProps) {
  const gridCols = gridClasses(columns);

  return (
    <div className={`grid gap-4 ${gridCols} ${className}`.trim()}>
      {stats.map((stat) => (
        <StatCardComponent
          key={stat.id}
          stat={stat}
          animated={animated}
          animationDuration={animationDuration}
          onClick={onStatClick}
        />
      ))}
    </div>
  );
}
