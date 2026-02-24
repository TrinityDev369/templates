"use client";

import { cn } from "@/lib/utils";
import {
  BentoGrid,
  BentoGridItem,
} from "@/components/bento-grid-base/bento-grid";
import { Badge } from "@/components/ui/badge";

import type { BentoStat, BentoStatsProps } from "./bento-stats.types";

// ---------------------------------------------------------------------------
// Trend Arrow — inline SVG indicators for up / down / neutral
// ---------------------------------------------------------------------------

function TrendIndicator({ trend, change }: Pick<BentoStat, "trend" | "change">) {
  if (!trend && !change) return null;

  const colors: Record<string, string> = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  const colorClass = colors[trend ?? "neutral"];

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", colorClass)}>
      {trend === "up" && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M8 3v10M8 3l4 4M8 3L4 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {trend === "down" && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M8 13V3M8 13l4-4M8 13L4 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {trend === "neutral" && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M3 8h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {change && <span>{change}</span>}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Mini Sparkline — CSS bar chart with 4-5 bars
// ---------------------------------------------------------------------------

function MiniSparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;

  // Normalize values to 0-100 range
  const max = Math.max(...data, 1);
  const normalized = data.map((v) => Math.round((v / max) * 100));

  return (
    <div
      className="mt-3 flex items-end gap-1"
      style={{ height: 32 }}
      aria-hidden="true"
    >
      {normalized.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-primary/20"
          style={{
            height: `${Math.max(height, 4)}%`,
            transition: "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard — individual metric card content
// ---------------------------------------------------------------------------

function StatCard({ stat }: { stat: BentoStat }) {
  return (
    <div className="flex h-full flex-col justify-between">
      {/* Header: label + optional badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {stat.label}
        </span>
        {stat.badge && (
          <Badge variant="secondary" className="shrink-0">
            {stat.badge}
          </Badge>
        )}
      </div>

      {/* Value */}
      <div className="mt-2 text-3xl font-bold tracking-tight">
        {stat.value}
      </div>

      {/* Trend + change */}
      <div className="mt-1">
        <TrendIndicator trend={stat.trend} change={stat.change} />
      </div>

      {/* Optional sparkline */}
      {stat.sparkline && stat.sparkline.length > 0 && (
        <MiniSparkline data={stat.sparkline} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BentoStats — main exported component
// ---------------------------------------------------------------------------

/**
 * Dashboard-style metrics rendered in a bento grid layout.
 *
 * Each stat is displayed as a card with a label, large value, optional trend
 * indicator (up/down/neutral arrow), optional badge, and optional mini
 * sparkline bar chart.
 *
 * @example
 * ```tsx
 * <BentoStats
 *   title="Key Metrics"
 *   description="Performance overview for the current period"
 *   stats={[
 *     { label: "Revenue", value: "$12,450", change: "+12.5%", trend: "up", badge: "MRR" },
 *     { label: "Users", value: "1,234", change: "+5.2%", trend: "up", sparkline: [30, 45, 60, 80, 95] },
 *     { label: "Churn", value: "2.1%", change: "-0.3%", trend: "down" },
 *     { label: "NPS", value: "72", trend: "neutral", change: "0%" },
 *   ]}
 * />
 * ```
 */
export function BentoStats({
  title,
  description,
  stats,
  className,
}: BentoStatsProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {/* Section heading */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Bento grid — 4 columns as specified */}
      <BentoGrid cols={4} gap="md">
        {stats.map((stat) => (
          <BentoGridItem
            key={stat.label}
            colSpan={stat.colSpan}
          >
            <StatCard stat={stat} />
          </BentoGridItem>
        ))}
      </BentoGrid>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Re-export types for consumer convenience
// ---------------------------------------------------------------------------

export type { BentoStat, BentoStatsProps } from "./bento-stats.types";
