"use client"

import * as React from "react"
import { AlertTriangle, Gauge } from "lucide-react"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface UsageMeterProps {
  /** Current usage count */
  used: number
  /** Maximum allowed quota */
  limit: number
  /** Descriptive label shown next to the gauge icon (e.g. "API Calls") */
  label?: string
  /** Unit suffix for the counter text (e.g. "requests") */
  unit?: string
  /** Whether to render the percentage badge. Defaults to true. */
  showPercentage?: boolean
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Resolve the bar color based on the usage percentage.
 *   <60 %  -> green
 *   60-85% -> yellow / amber
 *   >85 %  -> red
 */
function resolveColor(percentage: number): {
  bar: string
  badge: string
  track: string
} {
  if (percentage > 85) {
    return {
      bar: "bg-red-500",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      track: "bg-red-100 dark:bg-red-900/30",
    }
  }
  if (percentage >= 60) {
    return {
      bar: "bg-amber-500",
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      track: "bg-amber-100 dark:bg-amber-900/30",
    }
  }
  return {
    bar: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    track: "bg-emerald-100 dark:bg-emerald-900/30",
  }
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US")
}

/* -------------------------------------------------------------------------- */
/*  UsageMeter                                                                */
/* -------------------------------------------------------------------------- */

export function UsageMeter({
  used,
  limit,
  label,
  unit,
  showPercentage = true,
}: UsageMeterProps) {
  const percentage = limit > 0 ? (used / limit) * 100 : 0
  const isOverLimit = used > limit
  const displayPercentage = Math.round(percentage)
  const barWidth = clamp(percentage, 0, 100)
  const colors = resolveColor(percentage)

  return (
    <div className="w-full space-y-3">
      {/* ---- Header row: label + counter ---- */}
      <div className="flex items-center justify-between gap-2">
        {/* Label area */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Gauge className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
          {label && <span>{label}</span>}
        </div>

        {/* Counter + optional percentage badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums text-gray-600 dark:text-gray-300">
            {formatNumber(used)}{" "}
            <span className="text-gray-400 dark:text-gray-500">/</span>{" "}
            {formatNumber(limit)}
            {unit && (
              <span className="ml-1 text-gray-400 dark:text-gray-500">
                {unit}
              </span>
            )}
          </span>

          {showPercentage && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${colors.badge}`}
            >
              {displayPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* ---- Progress bar ---- */}
      <div
        className={`h-2.5 w-full overflow-hidden rounded-full ${colors.track}`}
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={label ?? "Usage meter"}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* ---- Overage warning ---- */}
      {isOverLimit && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Over limit by{" "}
            <span className="font-bold tabular-nums">
              {formatNumber(used - limit)}
            </span>
            {unit && <span> {unit}</span>}. Upgrade your plan to avoid
            disruptions.
          </p>
        </div>
      )}
    </div>
  )
}
