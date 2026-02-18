"use client";

import * as React from "react";
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import type { RateLimitState, RateLimitUIProps } from "./rate-limit-ui.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive the visual state from the attempt ratio.
 *
 * - **ok**: more than 50 % of attempts remaining
 * - **warning**: between 1 % and 50 % remaining (inclusive)
 * - **locked**: zero remaining *or* lockout timer still active
 */
function deriveState(
  remaining: number,
  max: number,
  lockoutEnd: Date | null,
): RateLimitState {
  if (remaining <= 0 || (lockoutEnd && lockoutEnd.getTime() > Date.now())) {
    return "locked";
  }
  if (remaining / max <= 0.5) {
    return "warning";
  }
  return "ok";
}

/**
 * Parse the optional lockout timestamp into a `Date` or `null`.
 */
function parseLockoutEnd(value?: Date | string | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format a remaining duration in milliseconds as `MM:SS`.
 */
function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

interface ProgressBarProps {
  remaining: number;
  max: number;
  state: RateLimitState;
}

function ProgressBar({ remaining, max, state }: ProgressBarProps) {
  const ratio = Math.max(0, Math.min(1, remaining / max));
  const percent = ratio * 100;

  const barColor: Record<RateLimitState, string> = {
    ok: "bg-emerald-500",
    warning: "bg-amber-500",
    locked: "bg-red-500",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Attempts remaining</span>
        <span className="tabular-nums font-medium">
          {remaining} / {max}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={remaining}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${remaining} of ${max} attempts remaining`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barColor[state],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Countdown timer hook
// ---------------------------------------------------------------------------

/**
 * Tick every second while the lockout is active. Returns the milliseconds
 * remaining and a boolean indicating whether the lockout has expired.
 */
function useCountdown(lockoutEnd: Date | null) {
  const [msRemaining, setMsRemaining] = React.useState<number>(() =>
    lockoutEnd ? Math.max(0, lockoutEnd.getTime() - Date.now()) : 0,
  );

  const expired = lockoutEnd !== null && msRemaining <= 0;

  React.useEffect(() => {
    if (!lockoutEnd) {
      setMsRemaining(0);
      return;
    }

    function tick() {
      const diff = lockoutEnd!.getTime() - Date.now();
      setMsRemaining(Math.max(0, diff));
    }

    tick(); // sync immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockoutEnd]);

  return { msRemaining, expired };
}

// ---------------------------------------------------------------------------
// State-specific panels
// ---------------------------------------------------------------------------

function OkPanel({
  remaining,
  max,
}: {
  remaining: number;
  max: number;
}) {
  return (
    <div className="flex items-start gap-3 text-sm text-muted-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
      <p>
        <span className="font-medium text-foreground">{remaining}</span> of{" "}
        <span className="font-medium text-foreground">{max}</span> attempts
        remaining. You are in good standing.
      </p>
    </div>
  );
}

function WarningPanel({
  remaining,
  max,
}: {
  remaining: number;
  max: number;
}) {
  return (
    <Alert
      variant="default"
      className="border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="font-semibold">Almost locked out</AlertTitle>
      <AlertDescription className="mt-1 text-sm">
        Only <span className="font-semibold">{remaining}</span>{" "}
        {remaining === 1 ? "attempt" : "attempts"} remaining. Your account will
        be temporarily locked after{" "}
        <span className="font-semibold">{max}</span> failed attempts.
      </AlertDescription>
    </Alert>
  );
}

interface LockedPanelProps {
  msRemaining: number;
  expired: boolean;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

function LockedPanel({
  msRemaining,
  expired,
  onRetry,
  onContactSupport,
}: LockedPanelProps) {
  if (expired) {
    return (
      <div className="space-y-4">
        <Alert
          variant="default"
          className="border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
        >
          <Unlock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="font-semibold">You can try again now</AlertTitle>
          <AlertDescription className="mt-1 text-sm">
            The lockout period has ended. You may retry your request.
          </AlertDescription>
        </Alert>

        {onRetry && (
          <Button onClick={onRetry} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertTitle className="font-semibold">Account temporarily locked</AlertTitle>
        <AlertDescription className="mt-1 text-sm">
          Too many failed attempts. Please wait before trying again.
        </AlertDescription>
      </Alert>

      {/* Countdown */}
      <div
        className="flex items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 py-4"
        aria-live="polite"
        aria-atomic="true"
      >
        <Clock className="h-5 w-5 text-destructive" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">Try again in</span>
        <span className="font-mono text-xl font-bold tabular-nums text-destructive">
          {formatCountdown(msRemaining)}
        </span>
      </div>

      {onContactSupport && (
        <p className="text-center text-xs text-muted-foreground">
          Locked out?{" "}
          <button
            type="button"
            onClick={onContactSupport}
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Contact Support
          </button>
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RateLimitUI({
  maxAttempts,
  remainingAttempts,
  lockoutEndTime,
  onRetry,
  onContactSupport,
  className,
}: RateLimitUIProps) {
  const lockoutEnd = React.useMemo(
    () => parseLockoutEnd(lockoutEndTime),
    [lockoutEndTime],
  );

  const { msRemaining, expired } = useCountdown(lockoutEnd);

  const state = deriveState(remainingAttempts, maxAttempts, lockoutEnd);

  // When the timer expires and there is an onRetry callback, treat as
  // auto-transition: the parent can decide to refetch state.
  const hasAutoFired = React.useRef(false);
  React.useEffect(() => {
    if (expired && onRetry && !hasAutoFired.current) {
      hasAutoFired.current = true;
    }
  }, [expired, onRetry]);

  // Reset auto-fire ref when lockout changes
  React.useEffect(() => {
    hasAutoFired.current = false;
  }, [lockoutEndTime]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <ShieldAlert
            className={cn(
              "h-5 w-5",
              state === "ok" && "text-emerald-500",
              state === "warning" && "text-amber-500",
              state === "locked" && "text-destructive",
            )}
            aria-hidden="true"
          />
          Rate Limit Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar — always visible */}
        <ProgressBar
          remaining={state === "locked" ? 0 : remainingAttempts}
          max={maxAttempts}
          state={state}
        />

        {/* State-specific content */}
        {state === "ok" && (
          <OkPanel remaining={remainingAttempts} max={maxAttempts} />
        )}

        {state === "warning" && (
          <WarningPanel remaining={remainingAttempts} max={maxAttempts} />
        )}

        {state === "locked" && (
          <LockedPanel
            msRemaining={msRemaining}
            expired={expired}
            onRetry={onRetry}
            onContactSupport={onContactSupport}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Re-export types for consumer convenience
export type { RateLimitState, RateLimitUIProps } from "./rate-limit-ui.types";
