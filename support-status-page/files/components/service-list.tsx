"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ServiceStatus =
  | "operational"
  | "degraded"
  | "partial-outage"
  | "major-outage";

export interface DayStatus {
  date: string;
  status: ServiceStatus;
}

export interface Service {
  name: string;
  status: ServiceStatus;
  uptimePercent: number;
  dailyHistory: DayStatus[];
}

interface ServiceListProps {
  services: Service[];
}

const SERVICE_STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; dotClass: string; badgeClass: string; icon: typeof CheckCircle }
> = {
  operational: {
    label: "Operational",
    dotClass: "bg-emerald-500",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    icon: CheckCircle,
  },
  degraded: {
    label: "Degraded",
    dotClass: "bg-amber-500",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    icon: AlertTriangle,
  },
  "partial-outage": {
    label: "Partial Outage",
    dotClass: "bg-orange-500",
    badgeClass:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    icon: AlertTriangle,
  },
  "major-outage": {
    label: "Major Outage",
    dotClass: "bg-red-500",
    badgeClass:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    icon: XCircle,
  },
};

const DAY_BAR_COLORS: Record<ServiceStatus, string> = {
  operational: "bg-emerald-500 hover:bg-emerald-400",
  degraded: "bg-amber-500 hover:bg-amber-400",
  "partial-outage": "bg-orange-500 hover:bg-orange-400",
  "major-outage": "bg-red-500 hover:bg-red-400",
};

function UptimeBar({ dailyHistory }: { dailyHistory: DayStatus[] }) {
  return (
    <div className="flex items-center gap-px" title="90-day uptime history">
      {dailyHistory.map((day) => (
        <div
          key={day.date}
          className={cn(
            "h-8 w-[3px] rounded-full transition-colors",
            DAY_BAR_COLORS[day.status]
          )}
          title={`${day.date}: ${SERVICE_STATUS_CONFIG[day.status].label}`}
        />
      ))}
    </div>
  );
}

export function ServiceList({ services }: ServiceListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Services</h3>
      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {services.map((service) => {
          const config = SERVICE_STATUS_CONFIG[service.status];
          const Icon = config.icon;

          return (
            <div key={service.name} className="px-4 py-4 sm:px-6">
              {/* Top row: name + badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      service.status === "operational"
                        ? "text-emerald-500"
                        : service.status === "degraded"
                          ? "text-amber-500"
                          : service.status === "partial-outage"
                            ? "text-orange-500"
                            : "text-red-500"
                    )}
                  />
                  <span className="font-medium text-foreground">
                    {service.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    config.badgeClass
                  )}
                >
                  {config.label}
                </span>
              </div>

              {/* Uptime bar */}
              <div className="mt-3">
                <UptimeBar dailyHistory={service.dailyHistory} />
              </div>

              {/* Uptime percentage row */}
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>90 days ago</span>
                <span>{service.uptimePercent.toFixed(2)}% uptime</span>
                <span>Today</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
