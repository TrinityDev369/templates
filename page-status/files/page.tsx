"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Bell,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusCard } from "./components/status-card";
import type { Service } from "./components/status-card";
import { UptimeChart } from "./components/uptime-chart";
import type { UptimeDay, DayStatus } from "./components/uptime-chart";

/* ================================================================== */
/* Sample data -- replace with your own API calls or static config     */
/* ================================================================== */

const SERVICES: Service[] = [
  { name: "Web Application", status: "operational", responseTime: 124, uptime: 99.98 },
  { name: "API Gateway", status: "operational", responseTime: 89, uptime: 99.99 },
  { name: "Database Cluster", status: "operational", responseTime: 12, uptime: 99.97 },
  { name: "Authentication", status: "operational", responseTime: 201, uptime: 99.95 },
  { name: "CDN / Static Assets", status: "degraded", responseTime: 342, uptime: 99.82 },
  { name: "Background Jobs", status: "operational", responseTime: 45, uptime: 99.96 },
];

/* ------------------------------------------------------------------ */
/* Uptime data (last 30 days)                                          */
/* ------------------------------------------------------------------ */

function generateUptimeData(): UptimeDay[] {
  const days: UptimeDay[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let status: DayStatus = "operational";
    let uptime = 99.9 + Math.random() * 0.1;

    /* Simulate occasional degraded/outage days */
    if (i === 12) {
      status = "degraded";
      uptime = 98.5;
    } else if (i === 22) {
      status = "outage";
      uptime = 95.2;
    }

    days.push({ date: dateStr, status, uptime });
  }

  return days;
}

const UPTIME_DATA = generateUptimeData();

/* ------------------------------------------------------------------ */
/* Incident data                                                       */
/* ------------------------------------------------------------------ */

type IncidentStatus = "resolved" | "monitoring" | "investigating";

interface Incident {
  id: string;
  date: string;
  title: string;
  status: IncidentStatus;
  description: string;
}

const INCIDENTS: Incident[] = [
  {
    id: "inc-5",
    date: "Feb 22, 2026",
    title: "CDN latency spike",
    status: "monitoring",
    description:
      "Elevated response times on static asset delivery. CDN provider has identified the issue and is deploying a fix.",
  },
  {
    id: "inc-4",
    date: "Feb 18, 2026",
    title: "Scheduled database maintenance",
    status: "resolved",
    description:
      "Planned PostgreSQL upgrade completed successfully. Brief read-only window of approximately 4 minutes.",
  },
  {
    id: "inc-3",
    date: "Feb 12, 2026",
    title: "API intermittent 502 errors",
    status: "resolved",
    description:
      "A misconfigured load balancer caused intermittent 502 responses for approximately 18 minutes. Root cause identified and patched.",
  },
  {
    id: "inc-2",
    date: "Feb 2, 2026",
    title: "Authentication service outage",
    status: "resolved",
    description:
      "Authentication service was unavailable for 23 minutes due to an expired TLS certificate. Automated renewal has been configured to prevent recurrence.",
  },
  {
    id: "inc-1",
    date: "Jan 25, 2026",
    title: "Elevated error rates on background jobs",
    status: "resolved",
    description:
      "Queue consumer experienced OOM errors under high load. Memory limits increased and a circuit breaker was added.",
  },
];

/* ================================================================== */
/* Helpers                                                             */
/* ================================================================== */

function getOverallStatus(services: Service[]): {
  label: string;
  sublabel: string;
  icon: typeof CheckCircle2;
  iconClass: string;
  bgClass: string;
} {
  const hasOutage = services.some((s) => s.status === "outage");
  const hasDegraded = services.some((s) => s.status === "degraded");

  if (hasOutage) {
    return {
      label: "Major Outage",
      sublabel: "One or more systems are currently experiencing an outage.",
      icon: XCircle,
      iconClass: "text-red-500",
      bgClass: "bg-red-50 dark:bg-red-950/30",
    };
  }

  if (hasDegraded) {
    return {
      label: "Issues Detected",
      sublabel: "Some systems are experiencing degraded performance.",
      icon: AlertCircle,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-50 dark:bg-amber-950/30",
    };
  }

  return {
    label: "All Systems Operational",
    sublabel: "All services are running normally.",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
  };
}

const incidentStatusConfig: Record<
  IncidentStatus,
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  resolved: {
    label: "Resolved",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  monitoring: {
    label: "Monitoring",
    badgeClass:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    icon: AlertCircle,
  },
  investigating: {
    label: "Investigating",
    badgeClass:
      "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    icon: XCircle,
  },
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/* ================================================================== */
/* Page component                                                      */
/* ================================================================== */

export default function SystemStatusPage() {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  /* Refresh timestamp every 60 seconds */
  useEffect(() => {
    const interval = setInterval(() => setLastChecked(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      /* Replace with your API call */
      setSubscribed(true);
      setEmail("");
    },
    [email]
  );

  const overall = getOverallStatus(SERVICES);
  const OverallIcon = overall.icon;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ---------------------------------------------------------- */}
      {/* Hero — overall status indicator                             */}
      {/* ---------------------------------------------------------- */}
      <section
        className={cn(
          "border-b border-gray-200 dark:border-gray-800",
          overall.bgClass
        )}
      >
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-900">
            <OverallIcon className={cn("h-9 w-9", overall.iconClass)} />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {overall.label}
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            {overall.sublabel}
          </p>

          {/* Last checked */}
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            Last checked: {formatTimestamp(lastChecked)}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* -------------------------------------------------------- */}
        {/* Service cards grid                                        */}
        {/* -------------------------------------------------------- */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Services
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Current status and response times for all monitored services.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <StatusCard key={service.name} service={service} />
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Uptime chart                                              */}
        {/* -------------------------------------------------------- */}
        <section className="mt-10">
          <UptimeChart days={UPTIME_DATA} />
        </section>

        {/* -------------------------------------------------------- */}
        {/* Recent incidents                                          */}
        {/* -------------------------------------------------------- */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Incidents
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Last {INCIDENTS.length} reported incidents.
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            {INCIDENTS.map((incident) => {
              const cfg = incidentStatusConfig[incident.status];
              const IncidentIcon = cfg.icon;

              return (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 last:border-0 dark:border-gray-800"
                >
                  <IncidentIcon
                    className={cn(
                      "mt-0.5 h-5 w-5 flex-shrink-0",
                      incident.status === "resolved" && "text-emerald-500",
                      incident.status === "monitoring" && "text-amber-500",
                      incident.status === "investigating" && "text-red-500"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {incident.title}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                          cfg.badgeClass
                        )}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {incident.description}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-600">
                      {incident.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Subscribe to updates                                      */}
        {/* -------------------------------------------------------- */}
        <section className="mt-10 mb-16">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Subscribe to Updates
            </h2>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-500">
              Get notified when services go down or incidents are reported.
            </p>

            {subscribed ? (
              <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Subscribed successfully
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="mx-auto mt-5 flex max-w-md gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={cn(
                    "flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm",
                    "text-gray-900 placeholder:text-gray-400",
                    "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                    "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-600",
                    "dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                  )}
                />
                <button
                  type="submit"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white",
                    "transition-colors hover:bg-blue-700",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                    "dark:bg-blue-500 dark:hover:bg-blue-600"
                  )}
                >
                  <Bell className="h-4 w-4" />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
