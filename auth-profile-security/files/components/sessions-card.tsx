"use client";

import * as React from "react";
import { Monitor, Smartphone, Globe, Clock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();

  if (Number.isNaN(then)) return "Unknown";

  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getDeviceIcon(device: string): React.ElementType {
  const lower = device.toLowerCase();
  if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) {
    return Smartphone;
  }
  return Monitor;
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_SESSIONS: Session[] = [
  {
    id: "sess-1",
    device: "MacBook Pro",
    browser: "Chrome 121",
    location: "Berlin, Germany",
    ip: "192.168.1.42",
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "sess-2",
    device: "iPhone 15",
    browser: "Safari 17",
    location: "Berlin, Germany",
    ip: "192.168.1.55",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
  },
  {
    id: "sess-3",
    device: "Windows Desktop",
    browser: "Firefox 122",
    location: "Munich, Germany",
    ip: "10.0.0.12",
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
  },
  {
    id: "sess-4",
    device: "Android Phone",
    browser: "Chrome Mobile 121",
    location: "Hamburg, Germany",
    ip: "172.16.0.8",
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SessionsCardProps {
  sessions?: Session[];
  onSignOut?: (sessionId: string) => void;
  onSignOutAll?: () => void;
}

export function SessionsCard({
  sessions = SAMPLE_SESSIONS,
  onSignOut,
  onSignOutAll,
}: SessionsCardProps) {
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-none tracking-tight">
                Active Sessions
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {sessions.length} active{" "}
                {sessions.length === 1 ? "session" : "sessions"}
              </p>
            </div>
          </div>

          {otherSessions.length > 0 && (
            <button
              type="button"
              onClick={onSignOutAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-3 w-3" aria-hidden="true" />
              Sign out all others
            </button>
          )}
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="space-y-2" role="list" aria-label="Active sessions">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device);

            return (
              <div
                key={session.id}
                role="listitem"
                className={cn(
                  "flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4",
                  session.isCurrent && "border-primary/30 bg-primary/5"
                )}
              >
                {/* Device icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    session.isCurrent
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <DeviceIcon className="h-5 w-5" aria-hidden="true" />
                </div>

                {/* Session details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {session.device}
                    </p>
                    {session.isCurrent && (
                      <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {session.browser}
                    <span className="mx-1.5" aria-hidden="true">
                      &middot;
                    </span>
                    {session.ip}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3 w-3" aria-hidden="true" />
                      {session.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatRelativeTime(session.lastActive)}
                    </span>
                  </div>
                </div>

                {/* Sign out button */}
                {!session.isCurrent && (
                  <div className="shrink-0 sm:ml-auto">
                    <button
                      type="button"
                      onClick={() => onSignOut?.(session.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                      aria-label={`Sign out session on ${session.device}`}
                    >
                      <LogOut className="h-3 w-3" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
