"use client";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface TrustStat {
  label: string;
  value: string;
  sublabel?: string;
}

/* ------------------------------------------------------------------ */
/* TrustStats                                                          */
/* ------------------------------------------------------------------ */

interface TrustStatsProps {
  stats: TrustStat[];
  className?: string;
}

export function TrustStats({ stats, className }: TrustStatsProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm",
            "dark:border-gray-800 dark:bg-gray-950"
          )}
        >
          <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {stat.value}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
            {stat.label}
          </p>
          {stat.sublabel && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
              {stat.sublabel}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
