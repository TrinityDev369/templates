"use client";

import * as React from "react";
import { Smartphone, Shield, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TwoFactorStatus {
  enabled: boolean;
  enabledAt?: string;
  backupCodesRemaining?: number;
  backupCodesTotal?: number;
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_STATUS: TwoFactorStatus = {
  enabled: true,
  enabledAt: "2025-11-20T14:00:00Z",
  backupCodesRemaining: 7,
  backupCodesTotal: 10,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TwoFactorCardProps {
  status?: TwoFactorStatus;
  onToggle?: (enabled: boolean) => void;
  onViewBackupCodes?: () => void;
}

export function TwoFactorCard({
  status = SAMPLE_STATUS,
  onToggle,
  onViewBackupCodes,
}: TwoFactorCardProps) {
  const [isEnabled, setIsEnabled] = React.useState(status.enabled);

  function handleToggle() {
    const next = !isEnabled;
    setIsEnabled(next);
    onToggle?.(next);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Two-Factor Authentication
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add an extra layer of security
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 space-y-4">
        {/* Status + toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" aria-hidden="true" />
                Enabled
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <X className="h-4 w-4" aria-hidden="true" />
                Disabled
              </div>
            )}
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            aria-label="Toggle two-factor authentication"
            onClick={handleToggle}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              isEnabled ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                isEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Enabled info banner */}
        {isEnabled && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950">
            <div className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-200">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Your account is protected with two-factor authentication.
                You will be asked for a verification code when signing in.
              </span>
            </div>
          </div>
        )}

        {/* Disabled warning banner */}
        {!isEnabled && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
            <div className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Two-factor authentication is not enabled. Enable it to
                add an extra layer of security to your account.
              </span>
            </div>
          </div>
        )}

        {/* Backup codes hint */}
        {isEnabled &&
          status.backupCodesRemaining !== undefined &&
          status.backupCodesTotal !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Backup codes</span>
                <span
                  className={cn(
                    "font-medium",
                    status.backupCodesRemaining <= 2
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                  )}
                >
                  {status.backupCodesRemaining} of {status.backupCodesTotal}{" "}
                  remaining
                </span>
              </div>

              {status.backupCodesRemaining <= 2 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  You are running low on backup codes. Consider generating new
                  ones.
                </p>
              )}

              <button
                type="button"
                onClick={onViewBackupCodes}
                className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                View Backup Codes
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}

        {/* Setup CTA when disabled */}
        {!isEnabled && (
          <button
            type="button"
            onClick={handleToggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            Enable Two-Factor Authentication
          </button>
        )}
      </div>
    </div>
  );
}
