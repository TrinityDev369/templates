"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type IncidentState =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export interface IncidentUpdate {
  state: IncidentState;
  message: string;
  timestamp: Date;
}

export interface Incident {
  id: string;
  title: string;
  state: IncidentState;
  createdAt: Date;
  updatedAt: Date;
  updates: IncidentUpdate[];
}

interface IncidentTimelineProps {
  incidents: Incident[];
}

const STATE_CONFIG: Record<
  IncidentState,
  { label: string; dotClass: string; textClass: string }
> = {
  investigating: {
    label: "Investigating",
    dotClass: "bg-red-500",
    textClass: "text-red-600 dark:text-red-400",
  },
  identified: {
    label: "Identified",
    dotClass: "bg-orange-500",
    textClass: "text-orange-600 dark:text-orange-400",
  },
  monitoring: {
    label: "Monitoring",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  resolved: {
    label: "Resolved",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDate(incidents: Incident[]): Map<string, Incident[]> {
  const groups = new Map<string, Incident[]>();

  for (const incident of incidents) {
    const key = incident.createdAt.toISOString().split("T")[0];
    const existing = groups.get(key);
    if (existing) {
      existing.push(incident);
    } else {
      groups.set(key, [incident]);
    }
  }

  return groups;
}

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  const sortedIncidents = [...incidents].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const groupedByDate = groupByDate(sortedIncidents);

  if (incidents.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Incident History
        </h3>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No incidents reported in the past 90 days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">
        Incident History
      </h3>

      <div className="space-y-6">
        {Array.from(groupedByDate.entries()).map(([dateKey, dayIncidents]) => (
          <div key={dateKey}>
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
              {formatDate(new Date(dateKey + "T12:00:00"))}
            </h4>

            <div className="space-y-4">
              {dayIncidents.map((incident) => {
                const stateConfig = STATE_CONFIG[incident.state];

                return (
                  <div
                    key={incident.id}
                    className="rounded-lg border border-border bg-card"
                  >
                    {/* Incident header */}
                    <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-6">
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                            stateConfig.dotClass
                          )}
                        />
                        <div>
                          <h5 className="font-medium text-foreground">
                            {incident.title}
                          </h5>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              stateConfig.textClass
                            )}
                          >
                            {stateConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Incident updates */}
                    {incident.updates.length > 0 && (
                      <div className="border-t border-border px-4 py-3 sm:px-6">
                        <div className="space-y-3">
                          {incident.updates.map((update, idx) => {
                            const updateState = STATE_CONFIG[update.state];

                            return (
                              <div
                                key={idx}
                                className="relative flex gap-3 pl-4"
                              >
                                {/* Timeline line */}
                                {idx < incident.updates.length - 1 && (
                                  <div className="absolute left-[5px] top-5 h-full w-px bg-border" />
                                )}

                                <div
                                  className={cn(
                                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                    updateState.dotClass
                                  )}
                                />

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "text-xs font-semibold",
                                        updateState.textClass
                                      )}
                                    >
                                      {updateState.label}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {formatTimestamp(update.timestamp)}
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-sm text-muted-foreground">
                                    {update.message}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
