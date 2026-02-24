"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SystemStatus = "operational" | "degraded" | "major-outage";

interface StatusOverviewProps {
  status: SystemStatus;
  lastUpdated: Date;
}

const STATUS_CONFIG: Record<
  SystemStatus,
  { label: string; description: string; bgClass: string; textClass: string; borderClass: string; icon: typeof CheckCircle }
> = {
  operational: {
    label: "All Systems Operational",
    description: "All services are running normally.",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle,
  },
  degraded: {
    label: "Degraded Performance",
    description: "Some services are experiencing issues.",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800",
    icon: AlertTriangle,
  },
  "major-outage": {
    label: "Major Outage",
    description: "A significant disruption is affecting multiple services.",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-700 dark:text-red-400",
    borderClass: "border-red-200 dark:border-red-800",
    icon: XCircle,
  },
};

function formatLastUpdated(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function StatusOverview({ status, lastUpdated }: StatusOverviewProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-6",
        config.bgClass,
        config.borderClass
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-8 w-8 shrink-0", config.textClass)} />
        <div>
          <h2 className={cn("text-xl font-semibold", config.textClass)}>
            {config.label}
          </h2>
          <p className={cn("text-sm", config.textClass, "opacity-80")}>
            {config.description}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Last updated: {formatLastUpdated(lastUpdated)}
      </p>
    </div>
  );
}
