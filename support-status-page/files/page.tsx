"use client";

import { Bell } from "lucide-react";
import { StatusOverview } from "./components/status-overview";
import type { SystemStatus } from "./components/status-overview";
import { ServiceList } from "./components/service-list";
import type { Service, ServiceStatus, DayStatus } from "./components/service-list";
import { IncidentTimeline } from "./components/incident-timeline";
import type { Incident, IncidentUpdate } from "./components/incident-timeline";

// ---------------------------------------------------------------------------
// Sample data -- replace with your real data source (API, CMS, database)
// ---------------------------------------------------------------------------

function generateDailyHistory(
  days: number,
  badDays: Record<number, ServiceStatus> = {}
): DayStatus[] {
  const history: DayStatus[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    history.push({
      date: dateStr,
      status: badDays[i] ?? "operational",
    });
  }

  return history;
}

const SERVICES: Service[] = [
  {
    name: "Web Application",
    status: "operational",
    uptimePercent: 99.98,
    dailyHistory: generateDailyHistory(90),
  },
  {
    name: "API",
    status: "operational",
    uptimePercent: 99.95,
    dailyHistory: generateDailyHistory(90, { 12: "degraded" }),
  },
  {
    name: "Authentication",
    status: "operational",
    uptimePercent: 99.99,
    dailyHistory: generateDailyHistory(90),
  },
  {
    name: "Database",
    status: "degraded",
    uptimePercent: 99.87,
    dailyHistory: generateDailyHistory(90, {
      0: "degraded",
      5: "partial-outage",
      22: "degraded",
    }),
  },
  {
    name: "Email Delivery",
    status: "operational",
    uptimePercent: 99.92,
    dailyHistory: generateDailyHistory(90, { 30: "major-outage", 31: "degraded" }),
  },
  {
    name: "CDN / Static Assets",
    status: "operational",
    uptimePercent: 100.0,
    dailyHistory: generateDailyHistory(90),
  },
];

function deriveOverallStatus(services: Service[]): SystemStatus {
  const hasMajor = services.some(
    (s) => s.status === "major-outage"
  );
  if (hasMajor) return "major-outage";

  const hasDegraded = services.some(
    (s) => s.status === "degraded" || s.status === "partial-outage"
  );
  if (hasDegraded) return "degraded";

  return "operational";
}

const INCIDENTS: Incident[] = [
  {
    id: "inc-003",
    title: "Elevated database latency",
    state: "monitoring",
    createdAt: new Date("2026-02-24T09:15:00Z"),
    updatedAt: new Date("2026-02-24T11:00:00Z"),
    updates: [
      {
        state: "investigating",
        message:
          "We are investigating reports of slow database queries affecting the dashboard.",
        timestamp: new Date("2026-02-24T09:15:00Z"),
      },
      {
        state: "identified",
        message:
          "Root cause identified: an inefficient query plan following a schema migration. Rolling back the migration.",
        timestamp: new Date("2026-02-24T09:45:00Z"),
      },
      {
        state: "monitoring",
        message:
          "The migration has been rolled back and latency is returning to normal. Monitoring for stability.",
        timestamp: new Date("2026-02-24T11:00:00Z"),
      },
    ] satisfies IncidentUpdate[],
  },
  {
    id: "inc-002",
    title: "Partial email delivery delays",
    state: "resolved",
    createdAt: new Date("2026-01-25T14:00:00Z"),
    updatedAt: new Date("2026-01-25T18:30:00Z"),
    updates: [
      {
        state: "investigating",
        message:
          "We are investigating reports of delayed email notifications.",
        timestamp: new Date("2026-01-25T14:00:00Z"),
      },
      {
        state: "identified",
        message:
          "The issue has been traced to a rate-limiting change at our email provider. Working with them to resolve.",
        timestamp: new Date("2026-01-25T15:20:00Z"),
      },
      {
        state: "monitoring",
        message:
          "Rate limits have been lifted. Email queue is draining. Monitoring delivery times.",
        timestamp: new Date("2026-01-25T17:00:00Z"),
      },
      {
        state: "resolved",
        message:
          "Email delivery is back to normal. All queued messages have been delivered.",
        timestamp: new Date("2026-01-25T18:30:00Z"),
      },
    ] satisfies IncidentUpdate[],
  },
  {
    id: "inc-001",
    title: "API degraded performance",
    state: "resolved",
    createdAt: new Date("2026-01-03T06:30:00Z"),
    updatedAt: new Date("2026-01-03T08:45:00Z"),
    updates: [
      {
        state: "investigating",
        message:
          "We are seeing increased error rates on the API. Investigating the root cause.",
        timestamp: new Date("2026-01-03T06:30:00Z"),
      },
      {
        state: "identified",
        message:
          "A sudden traffic spike triggered auto-scaling limits. Increasing capacity.",
        timestamp: new Date("2026-01-03T07:10:00Z"),
      },
      {
        state: "resolved",
        message:
          "Additional capacity has been provisioned. API response times are back to normal.",
        timestamp: new Date("2026-01-03T08:45:00Z"),
      },
    ] satisfies IncidentUpdate[],
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function StatusPage() {
  const overallStatus = deriveOverallStatus(SERVICES);
  const lastUpdated = new Date();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Service Status
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time status and incident history for all services.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => {
            // Placeholder: integrate with your notification system
            alert("Subscribe to status updates (placeholder)");
          }}
        >
          <Bell className="h-4 w-4" />
          Subscribe
        </button>
      </div>

      {/* Overall status banner */}
      <div className="mb-8">
        <StatusOverview status={overallStatus} lastUpdated={lastUpdated} />
      </div>

      {/* Service list with uptime bars */}
      <div className="mb-10">
        <ServiceList services={SERVICES} />
      </div>

      {/* Incident timeline */}
      <IncidentTimeline incidents={INCIDENTS} />
    </div>
  );
}
