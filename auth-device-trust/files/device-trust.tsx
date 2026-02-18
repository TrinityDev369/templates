"use client";

import * as React from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Trash2,
  Shield,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  DeviceType,
  TrustedDevice,
  DeviceTrustProps,
} from "./device-trust.types";

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

function DeviceSkeleton() {
  return (
    <div className="animate-pulse space-y-3" role="status" aria-label="Loading devices">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <div className="h-10 w-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
          <div className="h-8 w-8 rounded bg-muted" />
        </div>
      ))}
      <span className="sr-only">Loading trusted devices...</span>
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
      <p className="text-sm font-medium">No trusted devices</p>
      <p className="mt-1 text-xs">
        When you sign in on a device, it will appear here.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single device row
// ---------------------------------------------------------------------------

interface DeviceRowProps {
  device: TrustedDevice;
  onRevokeClick: () => void;
  isRevoking: boolean;
}

function DeviceRow({ device, onRevokeClick, isRevoking }: DeviceRowProps) {
  const DeviceIcon = DEVICE_ICONS[device.deviceType];
  const deviceLabel = DEVICE_LABELS[device.deviceType];

  return (
    <div
      className={
        "flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4" +
        (device.isCurrent ? " border-primary/30 bg-primary/5" : "")
      }
    >
      {/* Device icon */}
      <div
        className={
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" +
          (device.isCurrent
            ? " bg-primary/10 text-primary"
            : " bg-muted text-muted-foreground")
        }
        aria-label={deviceLabel}
      >
        <DeviceIcon className="h-5 w-5" aria-hidden="true" />
      </div>

      {/* Device details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium leading-none">{device.name}</p>
          {device.isCurrent && (
            <Badge
              variant="default"
              className="bg-emerald-600 text-[10px] px-1.5 py-0 leading-tight hover:bg-emerald-600"
            >
              <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
              This device
            </Badge>
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {device.browser}
          <span className="mx-1.5" aria-hidden="true">
            &middot;
          </span>
          {device.os}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {device.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {device.location}
            </span>
          )}
          {device.ip && (
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3 w-3" aria-hidden="true" />
              {device.ip}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <time
              dateTime={
                device.lastActive instanceof Date
                  ? device.lastActive.toISOString()
                  : device.lastActive
              }
            >
              {formatRelativeTime(device.lastActive)}
            </time>
          </span>
        </div>
      </div>

      {/* Revoke button (hidden for current device) */}
      {!device.isCurrent && (
        <div className="shrink-0 sm:ml-auto">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRevokeClick}
            disabled={isRevoking}
            aria-label={`Revoke ${device.name}`}
          >
            {isRevoking ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Displays a list of trusted devices with browser, OS, location, and
 * last-active time. The current device is highlighted with a green badge.
 * Other devices can be revoked individually via a confirmation dialog,
 * or all at once with the "Revoke all other devices" action.
 *
 * @example
 * ```tsx
 * <DeviceTrust
 *   devices={devices}
 *   onRevoke={async (id) => { await api.revokeDevice(id) }}
 *   onRevokeAll={async () => { await api.revokeAllDevices() }}
 * />
 * ```
 */
export function DeviceTrust({
  devices,
  onRevoke,
  onRevokeAll,
  isLoading = false,
}: DeviceTrustProps) {
  const [revokeTarget, setRevokeTarget] = React.useState<TrustedDevice | null>(null);
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = React.useState(false);
  const [isRevokingAll, setIsRevokingAll] = React.useState(false);

  const otherDeviceCount = devices.filter((d) => !d.isCurrent).length;

  // Sort devices: current first, then by lastActive descending
  const sortedDevices = React.useMemo(() => {
    return [...devices].sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
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
  }, [devices]);

  async function handleRevoke() {
    if (!revokeTarget) return;
    setIsRevoking(true);
    setRevokingId(revokeTarget.id);
    try {
      await onRevoke(revokeTarget.id);
    } finally {
      setIsRevoking(false);
      setRevokingId(null);
      setRevokeTarget(null);
    }
  }

  async function handleRevokeAll() {
    if (!onRevokeAll) return;
    setIsRevokingAll(true);
    try {
      await onRevokeAll();
    } finally {
      setIsRevokingAll(false);
      setShowRevokeAllDialog(false);
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold">
                    Trusted Devices
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {devices.length} {devices.length === 1 ? "device" : "devices"}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  Manage devices that have access to your account.
                </CardDescription>
              </div>
            </div>

            {onRevokeAll && otherDeviceCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setShowRevokeAllDialog(true)}
                disabled={isRevokingAll}
                aria-label="Revoke all other devices"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Revoke all other devices
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Loading state */}
          {isLoading && <DeviceSkeleton />}

          {/* Empty state */}
          {!isLoading && devices.length === 0 && <EmptyState />}

          {/* Device list */}
          {!isLoading && devices.length > 0 && (
            <div className="space-y-2" role="list" aria-label="Trusted devices">
              {sortedDevices.map((device) => (
                <div key={device.id} role="listitem">
                  <DeviceRow
                    device={device}
                    isRevoking={revokingId === device.id}
                    onRevokeClick={() => setRevokeTarget(device)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke single device confirmation dialog */}
      <Dialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isRevoking) setRevokeTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke device access</DialogTitle>
            <DialogDescription>
              Revoke access from{" "}
              <span className="font-medium text-foreground">
                {revokeTarget?.name}
              </span>
              ? This device will need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRevokeTarget(null)}
              disabled={isRevoking}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleRevoke()}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Revoking...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Revoke device
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke all other devices confirmation dialog */}
      <Dialog
        open={showRevokeAllDialog}
        onOpenChange={(open) => {
          if (!open && !isRevokingAll) setShowRevokeAllDialog(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke all other devices</DialogTitle>
            <DialogDescription>
              This will immediately sign out{" "}
              <span className="font-medium text-foreground">
                {otherDeviceCount} other {otherDeviceCount === 1 ? "device" : "devices"}
              </span>
              . Only your current device will remain trusted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowRevokeAllDialog(false)}
              disabled={isRevokingAll}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleRevokeAll()}
              disabled={isRevokingAll}
            >
              {isRevokingAll ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Revoking...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Revoke all devices
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Re-export types for consumer convenience
export type {
  TrustedDevice,
  DeviceTrustProps,
  DeviceType,
} from "./device-trust.types";
