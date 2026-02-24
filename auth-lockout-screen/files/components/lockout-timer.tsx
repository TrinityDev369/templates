"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface LockoutTimerProps {
  /** Total lockout duration in seconds. */
  durationSeconds: number;
  /** Called once the countdown reaches zero. */
  onExpired: () => void;
  /** Optional extra class names for the wrapper. */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** Percentage of time remaining (0..100) for the progress ring. */
function progressPercent(remaining: number, total: number): number {
  if (total <= 0) return 0;
  return (remaining / total) * 100;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Circular countdown timer that ticks once per second.
 *
 * Displays remaining time as mm:ss inside a progress ring that gradually
 * depletes. Fires `onExpired` exactly once when the countdown hits zero.
 */
export function LockoutTimer({
  durationSeconds,
  onExpired,
  className,
}: LockoutTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const hasFiredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setRemaining(durationSeconds);
    hasFiredRef.current = false;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          if (!hasFiredRef.current) {
            hasFiredRef.current = true;
            // Fire in a microtask to avoid setState-during-render warnings.
            queueMicrotask(onExpired);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [durationSeconds, onExpired, clearTimer]);

  /* -- SVG ring dimensions ------------------------------------------------ */

  const size = 160;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (progressPercent(remaining, durationSeconds) / 100) * circumference;

  const isExpired = remaining <= 0;
  const isUrgent = remaining > 0 && remaining <= 60;

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      role="timer"
      aria-live="polite"
      aria-label={
        isExpired
          ? "Lockout expired"
          : `${formatTime(remaining)} remaining until unlock`
      }
    >
      {/* Progress ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-800"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(
              "transition-[stroke-dashoffset] duration-1000 ease-linear",
              isExpired && "text-emerald-500",
              isUrgent && !isExpired && "text-amber-500",
              !isUrgent && !isExpired && "text-red-500"
            )}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock
            className={cn(
              "w-5 h-5 mb-1",
              isExpired && "text-emerald-500",
              isUrgent && !isExpired && "text-amber-500",
              !isUrgent && !isExpired && "text-gray-400"
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "text-2xl font-mono font-bold tabular-nums tracking-tight",
              isExpired && "text-emerald-600",
              isUrgent && !isExpired && "text-amber-600",
              !isUrgent && !isExpired && "text-gray-900 dark:text-gray-100"
            )}
          >
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Label */}
      <p
        className={cn(
          "text-sm font-medium",
          isExpired
            ? "text-emerald-600"
            : "text-gray-500 dark:text-gray-400"
        )}
      >
        {isExpired ? "Account unlocked" : "until auto-unlock"}
      </p>
    </div>
  );
}
