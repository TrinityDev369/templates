"use client";

import { CheckCircle2, AlertCircle, XCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ServiceStatus = "operational" | "degraded" | "outage";

export interface Service {
  name: string;
  status: ServiceStatus;
  responseTime: number;
  uptime: number;
}

/* ------------------------------------------------------------------ */
/* Status helpers                                                      */
/* ------------------------------------------------------------------ */

const statusConfig: Record<
  ServiceStatus,
  { label: string; dotClass: string; icon: typeof CheckCircle2 }
> = {
  operational: {
    label: "Operational",
    dotClass: "bg-emerald-500",
    icon: CheckCircle2,
  },
  degraded: {
    label: "Degraded",
    dotClass: "bg-amber-500",
    icon: AlertCircle,
  },
  outage: {
    label: "Outage",
    dotClass: "bg-red-500",
    icon: XCircle,
  },
};

/* ------------------------------------------------------------------ */
/* StatusCard                                                          */
/* ------------------------------------------------------------------ */

interface StatusCardProps {
  service: Service;
  className?: string;
}

export function StatusCard({ service, className }: StatusCardProps) {
  const config = statusConfig[service.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        "dark:border-gray-800 dark:bg-gray-950",
        className
      )}
    >
      {/* Header: name + status dot */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {service.name}
        </h3>
        <span className="relative flex h-3 w-3">
          {service.status === "operational" ? null : (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                config.dotClass
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex h-3 w-3 rounded-full",
              config.dotClass
            )}
          />
        </span>
      </div>

      {/* Status label */}
      <div className="mt-3 flex items-center gap-1.5">
        <Icon
          className={cn(
            "h-4 w-4",
            service.status === "operational" && "text-emerald-500",
            service.status === "degraded" && "text-amber-500",
            service.status === "outage" && "text-red-500"
          )}
        />
        <span
          className={cn(
            "text-xs font-medium",
            service.status === "operational" &&
              "text-emerald-600 dark:text-emerald-400",
            service.status === "degraded" &&
              "text-amber-600 dark:text-amber-400",
            service.status === "outage" && "text-red-600 dark:text-red-400"
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Metrics */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {service.responseTime}ms
          </span>
        </div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {service.uptime.toFixed(2)}% uptime
        </span>
      </div>
    </div>
  );
}
