"use client";

import { Shield, Monitor, Smartphone, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordCard } from "./components/password-card";
import { TwoFactorCard } from "./components/two-factor-card";
import { SessionsCard } from "./components/sessions-card";
import { SecurityEvents } from "./components/security-events";

// ---------------------------------------------------------------------------
// Trusted devices — inline in page since it shares the same output dir
// ---------------------------------------------------------------------------

interface TrustedDevice {
  id: string;
  name: string;
  lastUsed: string;
  isMobile: boolean;
}

const SAMPLE_DEVICES: TrustedDevice[] = [
  {
    id: "dev-1",
    name: "MacBook Pro - Chrome",
    lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isMobile: false,
  },
  {
    id: "dev-2",
    name: "iPhone 15 - Safari",
    lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isMobile: true,
  },
  {
    id: "dev-3",
    name: "iPad Air - Safari",
    lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isMobile: true,
  },
];

function formatDeviceTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Unknown";

  const diffMin = Math.floor((now - then) / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function TrustedDevicesCard({
  devices = SAMPLE_DEVICES,
  onRemove,
}: {
  devices?: TrustedDevice[];
  onRemove?: (deviceId: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Monitor className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Trusted Devices
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Devices that skip 2FA verification
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Monitor className="mb-2 h-8 w-8 opacity-50" aria-hidden="true" />
            <p className="text-sm font-medium">No trusted devices</p>
            <p className="mt-1 text-xs">
              Trust a device during sign-in to skip 2FA next time.
            </p>
          </div>
        ) : (
          <div className="space-y-2" role="list" aria-label="Trusted devices">
            {devices.map((device) => {
              const DeviceIcon = device.isMobile ? Smartphone : Monitor;

              return (
                <div
                  key={device.id}
                  role="listitem"
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <DeviceIcon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {device.name}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      Last used {formatDeviceTime(device.lastUsed)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove?.(device.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                      "text-destructive transition-colors hover:bg-destructive/10"
                    )}
                    aria-label={`Remove trusted device ${device.name}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SecuritySettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Shield className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Security Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account security and review recent activity
          </p>
        </div>
      </div>

      {/* Top row: Password + 2FA side by side */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PasswordCard
          onChangePassword={() => {
            /* TODO: open password change modal/route */
          }}
        />
        <TwoFactorCard
          onToggle={(enabled) => {
            /* TODO: call API to toggle 2FA */
            console.log("2FA toggled:", enabled);
          }}
          onViewBackupCodes={() => {
            /* TODO: open backup codes modal/route */
          }}
        />
      </div>

      {/* Active sessions - full width */}
      <SessionsCard
        onSignOut={(sessionId) => {
          /* TODO: call API to revoke session */
          console.log("Sign out session:", sessionId);
        }}
        onSignOutAll={() => {
          /* TODO: call API to revoke all other sessions */
          console.log("Sign out all other sessions");
        }}
      />

      {/* Trusted devices - full width */}
      <TrustedDevicesCard
        onRemove={(deviceId) => {
          /* TODO: call API to remove trusted device */
          console.log("Remove trusted device:", deviceId);
        }}
      />

      {/* Recent security events - full width */}
      <SecurityEvents />
    </div>
  );
}
