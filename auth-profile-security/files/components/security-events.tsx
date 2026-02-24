"use client";

import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  Globe,
  Clock,
  LogOut,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "password_changed"
  | "two_factor_enabled"
  | "two_factor_disabled"
  | "session_revoked"
  | "device_trusted"
  | "device_removed"
  | "account_locked"
  | "account_unlocked";

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  timestamp: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  success: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEventLabel(type: SecurityEventType): string {
  const labels: Record<SecurityEventType, string> = {
    login_success: "Successful sign-in",
    login_failed: "Failed sign-in attempt",
    password_changed: "Password changed",
    two_factor_enabled: "Two-factor authentication enabled",
    two_factor_disabled: "Two-factor authentication disabled",
    session_revoked: "Session revoked",
    device_trusted: "Device marked as trusted",
    device_removed: "Trusted device removed",
    account_locked: "Account locked",
    account_unlocked: "Account unlocked",
  };
  return labels[type];
}

function getEventIcon(type: SecurityEventType): React.ElementType {
  const icons: Record<SecurityEventType, React.ElementType> = {
    login_success: Check,
    login_failed: X,
    password_changed: Key,
    two_factor_enabled: Smartphone,
    two_factor_disabled: Smartphone,
    session_revoked: LogOut,
    device_trusted: Monitor,
    device_removed: Monitor,
    account_locked: AlertTriangle,
    account_unlocked: Shield,
  };
  return icons[type];
}

function getEventColor(type: SecurityEventType, success: boolean): string {
  if (!success) return "bg-red-500/10 text-red-600 dark:text-red-400";

  switch (type) {
    case "login_success":
    case "two_factor_enabled":
    case "device_trusted":
    case "account_unlocked":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "login_failed":
    case "account_locked":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "password_changed":
    case "session_revoked":
    case "device_removed":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "two_factor_disabled":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";

  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_EVENTS: SecurityEvent[] = [
  {
    id: "evt-1",
    type: "login_success",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    device: "MacBook Pro",
    browser: "Chrome 121",
    location: "Berlin, Germany",
    ip: "192.168.1.42",
    success: true,
  },
  {
    id: "evt-2",
    type: "two_factor_enabled",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    device: "MacBook Pro",
    browser: "Chrome 121",
    location: "Berlin, Germany",
    ip: "192.168.1.42",
    success: true,
  },
  {
    id: "evt-3",
    type: "login_failed",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    device: "Unknown Device",
    browser: "Chrome 120",
    location: "Lagos, Nigeria",
    ip: "41.58.120.3",
    success: false,
  },
  {
    id: "evt-4",
    type: "password_changed",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    device: "MacBook Pro",
    browser: "Chrome 121",
    location: "Berlin, Germany",
    ip: "192.168.1.42",
    success: true,
  },
  {
    id: "evt-5",
    type: "session_revoked",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    device: "Windows Desktop",
    browser: "Firefox 122",
    location: "Munich, Germany",
    ip: "10.0.0.12",
    success: true,
  },
  {
    id: "evt-6",
    type: "device_trusted",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    device: "iPhone 15",
    browser: "Safari 17",
    location: "Berlin, Germany",
    ip: "192.168.1.55",
    success: true,
  },
  {
    id: "evt-7",
    type: "login_success",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    device: "iPhone 15",
    browser: "Safari 17",
    location: "Berlin, Germany",
    ip: "192.168.1.55",
    success: true,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SecurityEventsProps {
  events?: SecurityEvent[];
}

export function SecurityEvents({ events = SAMPLE_EVENTS }: SecurityEventsProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Recent Security Events
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Activity from the last 30 days
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Shield className="mb-2 h-8 w-8 opacity-50" aria-hidden="true" />
            <p className="text-sm font-medium">No recent events</p>
            <p className="mt-1 text-xs">
              Security events will appear here as they occur.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-[18px] top-2 bottom-2 w-px bg-border"
              aria-hidden="true"
            />

            <div className="space-y-1" role="list" aria-label="Security events timeline">
              {events.map((event) => {
                const Icon = getEventIcon(event.type);
                const colorClass = getEventColor(event.type, event.success);

                return (
                  <div
                    key={event.id}
                    role="listitem"
                    className="relative flex gap-4 py-3"
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        colorClass
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>

                    {/* Event content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">
                          {getEventLabel(event.type)}
                        </p>
                        {!event.success && (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                            Failed
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Monitor className="h-3 w-3" aria-hidden="true" />
                          {event.device}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3 w-3" aria-hidden="true" />
                          {event.location}
                        </span>
                        <span>{event.ip}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <time dateTime={event.timestamp}>
                            {formatEventTime(event.timestamp)}
                          </time>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
