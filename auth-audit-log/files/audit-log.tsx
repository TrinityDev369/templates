"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Key,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Monitor,
  Search,
  ShieldAlert,
  Smartphone,
  Unlock,
  UserCog,
  UserPlus,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  AuditEvent,
  AuditEventType,
  AuditLogFilters,
  AuditLogProps,
  RiskLevel,
} from "./audit-log.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats an ISO timestamp into a human-readable relative time string.
 * Handles seconds, minutes, hours, days, and weeks. Falls back to
 * `toLocaleDateString` for anything older than 4 weeks.
 */
function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();

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

/** Returns a human-readable label for each audit event type. */
function getEventLabel(type: AuditEventType): string {
  const labels: Record<AuditEventType, string> = {
    login_success: "Login successful",
    login_failed: "Login failed",
    logout: "Logged out",
    password_changed: "Password changed",
    password_reset_requested: "Password reset requested",
    mfa_enabled: "MFA enabled",
    mfa_disabled: "MFA disabled",
    api_key_created: "API key created",
    api_key_revoked: "API key revoked",
    role_changed: "Role changed",
    invite_sent: "Invite sent",
    invite_accepted: "Invite accepted",
    account_locked: "Account locked",
    account_unlocked: "Account unlocked",
  };
  return labels[type];
}

/** Returns the appropriate lucide icon component for a given event type. */
function getEventIcon(type: AuditEventType): React.ElementType {
  const icons: Record<AuditEventType, React.ElementType> = {
    login_success: LogIn,
    login_failed: ShieldAlert,
    logout: LogOut,
    password_changed: KeyRound,
    password_reset_requested: KeyRound,
    mfa_enabled: Smartphone,
    mfa_disabled: Smartphone,
    api_key_created: Key,
    api_key_revoked: Key,
    role_changed: UserCog,
    invite_sent: UserPlus,
    invite_accepted: UserPlus,
    account_locked: Lock,
    account_unlocked: Unlock,
  };
  return icons[type];
}

/** Returns tailwind color classes for badge styling based on risk level. */
function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
    medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
    high: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
    critical: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  };
  return colors[level];
}

/** Human-readable labels for event type dropdown. */
const EVENT_TYPE_LABELS: Record<AuditEventType, string> = {
  login_success: "Login success",
  login_failed: "Login failed",
  logout: "Logout",
  password_changed: "Password changed",
  password_reset_requested: "Password reset",
  mfa_enabled: "MFA enabled",
  mfa_disabled: "MFA disabled",
  api_key_created: "API key created",
  api_key_revoked: "API key revoked",
  role_changed: "Role changed",
  invite_sent: "Invite sent",
  invite_accepted: "Invite accepted",
  account_locked: "Account locked",
  account_unlocked: "Account unlocked",
};

const ALL_EVENT_TYPES: AuditEventType[] = [
  "login_success",
  "login_failed",
  "logout",
  "password_changed",
  "password_reset_requested",
  "mfa_enabled",
  "mfa_disabled",
  "api_key_created",
  "api_key_revoked",
  "role_changed",
  "invite_sent",
  "invite_accepted",
  "account_locked",
  "account_unlocked",
];

const ALL_RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

// ---------------------------------------------------------------------------
// Skeleton / Loading state
// ---------------------------------------------------------------------------

function AuditLogSkeleton() {
  return (
    <div className="animate-pulse space-y-3" role="status" aria-label="Loading audit events">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
          <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 rounded bg-muted" />
            <div className="h-3 w-3/5 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
          </div>
          <div className="h-5 w-14 rounded-full bg-muted" />
        </div>
      ))}
      <span className="sr-only">Loading audit events...</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <Filter className="mb-3 h-10 w-10 opacity-50" aria-hidden="true" />
      <p className="text-sm font-medium">No events found</p>
      <p className="mt-1 text-xs">
        Try adjusting your filters or check back later.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single event row
// ---------------------------------------------------------------------------

interface EventRowProps {
  event: AuditEvent;
}

function EventRow({ event }: EventRowProps) {
  const Icon = getEventIcon(event.type);
  const label = getEventLabel(event.type);
  const riskColor = getRiskColor(event.riskLevel);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-start sm:gap-4",
        !event.success && "border-red-500/20 bg-red-500/5",
        event.riskLevel === "critical" && event.success && "border-orange-500/20"
      )}
    >
      {/* Event icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          event.success
            ? "bg-muted text-muted-foreground"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Event details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium leading-none">
            {label}
          </p>
          {event.riskLevel === "critical" && (
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-label="Critical risk" />
          )}
          {/* Success/failure indicator */}
          {event.success ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-label="Successful" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-label="Failed" />
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {event.userEmail}
          {event.userName && (
            <>
              <span className="mx-1.5" aria-hidden="true">&middot;</span>
              {event.userName}
            </>
          )}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            <time dateTime={event.timestamp}>
              {formatRelativeTime(event.timestamp)}
            </time>
          </span>
          {event.ipAddress && (
            <span className="inline-flex items-center gap-1">
              <Monitor className="h-3 w-3" aria-hidden="true" />
              {event.ipAddress}
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {event.location}
            </span>
          )}
        </div>
      </div>

      {/* Risk badge */}
      <div className="shrink-0 sm:ml-auto">
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 leading-tight capitalize", riskColor)}
        >
          {event.riskLevel}
        </Badge>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AuditLog({
  events,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onFilterChange,
  className,
}: AuditLogProps) {
  const [search, setSearch] = React.useState("");
  const [eventTypeFilter, setEventTypeFilter] = React.useState<string>("all");
  const [riskLevelFilter, setRiskLevelFilter] = React.useState<string>("all");
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  // Build the current filters object
  const currentFilters = React.useMemo<AuditLogFilters>(() => ({
    search: search || undefined,
    eventType: eventTypeFilter !== "all" ? (eventTypeFilter as AuditEventType) : undefined,
    riskLevel: riskLevelFilter !== "all" ? (riskLevelFilter as RiskLevel) : undefined,
  }), [search, eventTypeFilter, riskLevelFilter]);

  // Notify parent when filters change
  const prevFiltersRef = React.useRef(currentFilters);
  React.useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.search !== currentFilters.search ||
      prev.eventType !== currentFilters.eventType ||
      prev.riskLevel !== currentFilters.riskLevel
    ) {
      prevFiltersRef.current = currentFilters;
      onFilterChange?.(currentFilters);
    }
  }, [currentFilters, onFilterChange]);

  // Client-side filtering
  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      // Event type filter
      if (currentFilters.eventType && event.type !== currentFilters.eventType) {
        return false;
      }

      // Risk level filter
      if (currentFilters.riskLevel && event.riskLevel !== currentFilters.riskLevel) {
        return false;
      }

      // Search filter (email, name, IP)
      if (currentFilters.search) {
        const query = currentFilters.search.toLowerCase();
        const searchable = [
          event.userEmail,
          event.userName,
          event.ipAddress,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [events, currentFilters]);

  async function handleLoadMore() {
    if (!onLoadMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold">
            Authentication Audit Log
            {!isLoading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredEvents.length}{" "}
                {filteredEvents.length === 1 ? "event" : "events"})
              </span>
            )}
          </CardTitle>
        </div>

        {/* Filter bar */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search by email, name, or IP..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search audit events"
            />
          </div>

          {/* Event type dropdown */}
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by event type">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {ALL_EVENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {EVENT_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Risk level dropdown */}
          <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
            <SelectTrigger className="w-full sm:w-[140px]" aria-label="Filter by risk level">
              <SelectValue placeholder="Risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {ALL_RISK_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {RISK_LABELS[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Loading state */}
        {isLoading && <AuditLogSkeleton />}

        {/* Empty state */}
        {!isLoading && filteredEvents.length === 0 && <EmptyState />}

        {/* Event list */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="space-y-2" role="list" aria-label="Audit events">
            {filteredEvents.map((event) => (
              <div key={event.id} role="listitem">
                <EventRow event={event} />
              </div>
            ))}
          </div>
        )}

        {/* Load more button */}
        {!isLoading && hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              aria-disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Loading...
                </>
              ) : (
                "Load more events"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Re-export types for consumer convenience
export type {
  AuditEvent,
  AuditEventType,
  AuditLogFilters,
  AuditLogProps,
  RiskLevel,
} from "./audit-log.types";
