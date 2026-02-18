"use client";

import * as React from "react";
import { Mail, Clock, RefreshCw, X, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Invitation, InviteListProps } from "./invite-flow.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps a role to its display badge variant classes. */
function getRoleBadgeClasses(role: Invitation["role"]): string {
  switch (role) {
    case "admin":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300";
    case "member":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300";
    case "viewer":
      return "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300";
  }
}

/** Maps a status to its display badge variant classes. */
function getStatusBadgeClasses(status: Invitation["status"]): string {
  switch (status) {
    case "pending":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300";
    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "expired":
      return "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400";
  }
}

/** Returns a status icon component based on the invitation status. */
function StatusIcon({ status }: { status: Invitation["status"] }) {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" aria-hidden="true" />;
    case "accepted":
      return <CheckCircle2 className="h-3 w-3" aria-hidden="true" />;
    case "expired":
      return <X className="h-3 w-3" aria-hidden="true" />;
  }
}

/**
 * Formats a Date or ISO string into a human-readable relative time string.
 * Falls back to `toLocaleDateString` for anything older than 4 weeks.
 */
function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();

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
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek <= 4) return `${diffWeek}w ago`;

  return new Date(then).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Capitalizes the first letter of a string. */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <Mail className="mb-3 h-10 w-10 opacity-50" aria-hidden="true" />
      <p className="text-sm font-medium">No pending invitations</p>
      <p className="mt-1 text-xs">
        When you invite team members, they will appear here.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single invitation row
// ---------------------------------------------------------------------------

interface InvitationRowProps {
  invitation: Invitation;
  onResend?: (id: string) => Promise<void>;
  onRevoke?: (id: string) => Promise<void>;
  resendingId: string | null;
  revokingId: string | null;
}

function InvitationRow({
  invitation,
  onResend,
  onRevoke,
  resendingId,
  revokingId,
}: InvitationRowProps) {
  const isResending = resendingId === invitation.id;
  const isRevoking = revokingId === invitation.id;
  const isBusy = isResending || isRevoking;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4">
      {/* Email icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Mail className="h-4 w-4" aria-hidden="true" />
      </div>

      {/* Invitation details */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-none">
          {invitation.email}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/* Role badge */}
          <Badge
            variant="outline"
            className={getRoleBadgeClasses(invitation.role)}
          >
            {capitalize(invitation.role)}
          </Badge>

          {/* Status badge */}
          <Badge
            variant="outline"
            className={getStatusBadgeClasses(invitation.status)}
          >
            <StatusIcon status={invitation.status} />
            <span className="ml-1">{capitalize(invitation.status)}</span>
          </Badge>

          {/* Time since invited */}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <time dateTime={invitation.invitedAt}>
              {formatRelativeTime(invitation.invitedAt)}
            </time>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
        {onResend && invitation.status === "pending" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void onResend(invitation.id)}
            disabled={isBusy}
            aria-label={`Resend invitation to ${invitation.email}`}
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Resend
          </Button>
        )}

        {onRevoke && invitation.status === "pending" && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => void onRevoke(invitation.id)}
            disabled={isBusy}
            aria-label={`Revoke invitation for ${invitation.email}`}
          >
            <X className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InviteList component
// ---------------------------------------------------------------------------

/**
 * Displays a list of pending and past invitations with resend/revoke actions.
 *
 * @example
 * ```tsx
 * <InviteList
 *   invitations={pendingInvitations}
 *   onResend={async (id) => api.resendInvitation(id)}
 *   onRevoke={async (id) => api.revokeInvitation(id)}
 * />
 * ```
 */
export function InviteList({
  invitations,
  onResend,
  onRevoke,
}: InviteListProps) {
  const [resendingId, setResendingId] = React.useState<string | null>(null);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);

  const pendingCount = invitations.filter((inv) => inv.status === "pending").length;

  async function handleResend(id: string) {
    if (!onResend) return;
    setResendingId(id);
    try {
      await onResend(id);
    } finally {
      setResendingId(null);
    }
  }

  async function handleRevoke(id: string) {
    if (!onRevoke) return;
    setRevokingId(id);
    try {
      await onRevoke(id);
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-semibold">
            Pending Invitations
          </CardTitle>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="tabular-nums">
              {pendingCount}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {invitations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2" role="list" aria-label="Invitations">
            {invitations.map((invitation) => (
              <div key={invitation.id} role="listitem">
                <InvitationRow
                  invitation={invitation}
                  onResend={onResend ? handleResend : undefined}
                  onRevoke={onRevoke ? handleRevoke : undefined}
                  resendingId={resendingId}
                  revokingId={revokingId}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
