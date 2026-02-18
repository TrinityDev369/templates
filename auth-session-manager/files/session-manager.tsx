"use client";

import * as React from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
  Loader2,
  Shield,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { DeviceType, Session, SessionManagerProps } from "./session-manager.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEVICE_ICONS: Record<DeviceType, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const DEVICE_LABELS: Record<DeviceType, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};

/**
 * Formats a Date or ISO string into a human-readable relative time string.
 * Handles seconds, minutes, hours, days, and weeks. Falls back to
 * `toLocaleDateString` for anything older than 4 weeks.
 */
function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = date instanceof Date ? date.getTime() : new Date(date).getTime();

  if (Number.isNaN(then)) {
    return "Unknown";
  }

  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  if (diffWeek <= 4) return `${diffWeek} week${diffWeek === 1 ? "" : "s"} ago`;

  return new Date(then).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Skeleton / Loading state
// ---------------------------------------------------------------------------

function SessionSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Loading sessions">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <div className="h-10 w-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
          <div className="h-8 w-16 rounded bg-muted" />
        </div>
      ))}
      <span className="sr-only">Loading sessions...</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <Shield className="mb-3 h-10 w-10 opacity-50" aria-hidden="true" />
      <p className="text-sm font-medium">No active sessions</p>
      <p className="mt-1 text-xs">
        When you sign in on a device, it will appear here.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmation dialog (inline, no external dependency)
// ---------------------------------------------------------------------------

interface ConfirmRevokeProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ConfirmRevoke({
  title,
  description,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmRevokeProps) {
  return (
    <div
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
      role="alertdialog"
      aria-labelledby="confirm-revoke-title"
      aria-describedby="confirm-revoke-desc"
    >
      <p id="confirm-revoke-title" className="text-sm font-semibold text-destructive">
        {title}
      </p>
      <p id="confirm-revoke-desc" className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={onConfirm}
          disabled={isLoading}
          aria-disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" aria-hidden="true" />
              Revoking...
            </>
          ) : (
            "Confirm"
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single session row
// ---------------------------------------------------------------------------

interface SessionRowProps {
  session: Session;
  isCurrent: boolean;
  isRevoking: boolean;
  isConfirming: boolean;
  onRevokeClick: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function SessionRow({
  session,
  isCurrent,
  isRevoking,
  isConfirming,
  onRevokeClick,
  onConfirm,
  onCancel,
}: SessionRowProps) {
  const DeviceIcon = DEVICE_ICONS[session.deviceType];
  const deviceLabel = DEVICE_LABELS[session.deviceType];

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4",
          isCurrent && "border-primary/30 bg-primary/5",
          isConfirming && "border-destructive/20"
        )}
      >
        {/* Device icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            isCurrent
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
          aria-label={deviceLabel}
        >
          <DeviceIcon className="h-5 w-5" aria-hidden="true" />
        </div>

        {/* Session details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium leading-none">
              {session.deviceName}
            </p>
            {isCurrent && (
              <Badge
                variant="default"
                className="text-[10px] px-1.5 py-0 leading-tight"
              >
                Current session
              </Badge>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {session.browser}
            <span className="mx-1.5" aria-hidden="true">
              &middot;
            </span>
            {session.ipAddress}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {session.location && (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" aria-hidden="true" />
                {session.location}
              </span>
            )}
            <span>
              Active{" "}
              <time
                dateTime={
                  session.lastActive instanceof Date
                    ? session.lastActive.toISOString()
                    : session.lastActive
                }
              >
                {formatRelativeTime(session.lastActive)}
              </time>
            </span>
          </div>
        </div>

        {/* Revoke button (hidden for current session) */}
        {!isCurrent && (
          <div className="shrink-0 sm:ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onRevokeClick}
              disabled={isRevoking || isConfirming}
              aria-label={`Revoke session on ${session.deviceName}`}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Revoke
            </Button>
          </div>
        )}
      </div>

      {/* Inline confirmation */}
      {isConfirming && (
        <ConfirmRevoke
          title={`Revoke session on ${session.deviceName}?`}
          description="This will immediately sign out the device. The user will need to sign in again."
          onConfirm={onConfirm}
          onCancel={onCancel}
          isLoading={isRevoking}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SessionManager({
  sessions,
  currentSessionId,
  onRevoke,
  onRevokeAll,
}: SessionManagerProps) {
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = React.useState(false);
  const [isRevokingAll, setIsRevokingAll] = React.useState(false);
  const [isLoading] = React.useState(false);

  const otherSessionCount = sessions.filter((s) => s.id !== currentSessionId).length;

  // Sort sessions: current first, then by lastActive descending
  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.id === currentSessionId) return -1;
      if (b.id === currentSessionId) return 1;
      const aTime =
        a.lastActive instanceof Date
          ? a.lastActive.getTime()
          : new Date(a.lastActive).getTime();
      const bTime =
        b.lastActive instanceof Date
          ? b.lastActive.getTime()
          : new Date(b.lastActive).getTime();
      return bTime - aTime;
    });
  }, [sessions, currentSessionId]);

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    try {
      await onRevoke(sessionId);
    } finally {
      setRevokingId(null);
      setConfirmingId(null);
    }
  }

  async function handleRevokeAll() {
    setIsRevokingAll(true);
    try {
      await onRevokeAll();
    } finally {
      setIsRevokingAll(false);
      setConfirmRevokeAll(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Active Sessions</CardTitle>
            <CardDescription className="mt-1">
              Manage your active sessions across devices.{" "}
              {otherSessionCount > 0 && (
                <span className="text-muted-foreground">
                  {otherSessionCount} other{" "}
                  {otherSessionCount === 1 ? "session" : "sessions"}
                </span>
              )}
            </CardDescription>
          </div>

          {otherSessionCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmRevokeAll(true)}
              disabled={isRevokingAll || confirmRevokeAll}
              aria-label="Revoke all other sessions"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Revoke all other sessions
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Revoke-all confirmation banner */}
        {confirmRevokeAll && (
          <ConfirmRevoke
            title="Revoke all other sessions?"
            description={`This will immediately sign out ${otherSessionCount} other ${
              otherSessionCount === 1 ? "session" : "sessions"
            }. Only your current session will remain active.`}
            onConfirm={handleRevokeAll}
            onCancel={() => setConfirmRevokeAll(false)}
            isLoading={isRevokingAll}
          />
        )}

        {/* Loading state */}
        {isLoading && <SessionSkeleton />}

        {/* Empty state */}
        {!isLoading && sessions.length === 0 && <EmptyState />}

        {/* Session list */}
        {!isLoading && sessions.length > 0 && (
          <div className="space-y-2" role="list" aria-label="Active sessions">
            {sortedSessions.map((session) => (
              <div key={session.id} role="listitem">
                <SessionRow
                  session={session}
                  isCurrent={session.id === currentSessionId}
                  isRevoking={revokingId === session.id}
                  isConfirming={confirmingId === session.id}
                  onRevokeClick={() => setConfirmingId(session.id)}
                  onConfirm={() => handleRevoke(session.id)}
                  onCancel={() => setConfirmingId(null)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Re-export types for consumer convenience
export type { Session, SessionManagerProps, DeviceType } from "./session-manager.types";
