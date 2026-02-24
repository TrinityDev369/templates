"use client";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type DayStatus = "operational" | "degraded" | "outage";

export interface UptimeDay {
  date: string;
  status: DayStatus;
  uptime: number;
}

/* ------------------------------------------------------------------ */
/* Color mapping                                                       */
/* ------------------------------------------------------------------ */

const barColor: Record<DayStatus, string> = {
  operational: "bg-emerald-500 hover:bg-emerald-400",
  degraded: "bg-amber-500 hover:bg-amber-400",
  outage: "bg-red-500 hover:bg-red-400",
};

/* ------------------------------------------------------------------ */
/* UptimeChart                                                         */
/* ------------------------------------------------------------------ */

interface UptimeChartProps {
  days: UptimeDay[];
  label?: string;
  className?: string;
}

export function UptimeChart({
  days,
  label = "Uptime over the last 30 days",
  className,
}: UptimeChartProps) {
  const overallUptime =
    days.length > 0
      ? days.reduce((sum, d) => sum + d.uptime, 0) / days.length
      : 100;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        "dark:border-gray-800 dark:bg-gray-950",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {label}
        </h3>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {overallUptime.toFixed(2)}%
        </span>
      </div>

      {/* Bar chart */}
      <div className="mt-4 flex items-end gap-[2px]">
        {days.map((day) => (
          <div
            key={day.date}
            className="group relative flex-1"
            title={`${day.date}: ${day.uptime.toFixed(2)}%`}
          >
            <div
              className={cn(
                "h-8 w-full rounded-sm transition-colors cursor-default",
                barColor[day.status]
              )}
            />

            {/* Tooltip */}
            <div
              className={cn(
                "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2",
                "rounded-md border border-gray-200 bg-white px-2.5 py-1.5 shadow-lg",
                "opacity-0 transition-opacity group-hover:opacity-100",
                "dark:border-gray-700 dark:bg-gray-900"
              )}
            >
              <p className="whitespace-nowrap text-xs font-medium text-gray-900 dark:text-gray-100">
                {day.date}
              </p>
              <p className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                {day.uptime.toFixed(2)}% uptime
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Date labels */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 dark:text-gray-600">
          {days.length > 0 ? days[0].date : ""}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-600">
          {days.length > 0 ? days[days.length - 1].date : ""}
        </span>
      </div>
    </div>
  );
}
