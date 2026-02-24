"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, AlertTriangle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { LockoutTimer } from "./components/lockout-timer";
import { UnlockOptions } from "./components/unlock-options";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** Default lockout duration in seconds (15 minutes). */
const DEFAULT_DURATION = 900;
const DEFAULT_ATTEMPTS = 5;
const DEFAULT_MAX_ATTEMPTS = 5;

/* -------------------------------------------------------------------------- */
/*  Animated Lock Icon                                                         */
/* -------------------------------------------------------------------------- */

function AnimatedLockIcon({ isLocked }: { isLocked: boolean }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-20 h-20 rounded-full",
        isLocked
          ? "bg-red-100 dark:bg-red-950"
          : "bg-emerald-100 dark:bg-emerald-950"
      )}
    >
      {/* Pulse ring (only while locked) */}
      {isLocked && (
        <span
          className="absolute inset-0 rounded-full bg-red-200 dark:bg-red-900 animate-ping opacity-20"
          aria-hidden="true"
        />
      )}

      <Lock
        className={cn(
          "w-9 h-9 transition-colors duration-300",
          isLocked
            ? "text-red-600 dark:text-red-400 animate-[lockShake_0.6s_ease-in-out_infinite_3s]"
            : "text-emerald-600 dark:text-emerald-400"
        )}
        aria-hidden="true"
      />

      {/* Inline keyframes for the shake animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes lockShake {
              0%, 100% { transform: rotate(0deg); }
              15% { transform: rotate(-8deg); }
              30% { transform: rotate(8deg); }
              45% { transform: rotate(-6deg); }
              60% { transform: rotate(6deg); }
              75% { transform: rotate(-3deg); }
              90% { transform: rotate(3deg); }
            }
          `,
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Attempt Badge                                                              */
/* -------------------------------------------------------------------------- */

function AttemptBadge({
  attempts,
  maxAttempts,
}: {
  attempts: number;
  maxAttempts: number;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300"
      role="status"
    >
      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
      Too many failed attempts: {attempts}/{maxAttempts}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Account lockout page displayed after too many failed login attempts.
 *
 * Reads configuration from URL search params:
 * - `attempts`  -- number of failed attempts (default 5)
 * - `maxAttempts` -- maximum allowed before lockout (default 5)
 * - `duration` -- lockout duration in seconds (default 900 = 15 min)
 *
 * When the countdown expires the "Try again" link becomes active.
 */
export default function LockoutPage() {
  const searchParams = useSearchParams();

  const attempts = Number(searchParams.get("attempts")) || DEFAULT_ATTEMPTS;
  const maxAttempts =
    Number(searchParams.get("maxAttempts")) || DEFAULT_MAX_ATTEMPTS;
  const durationSeconds =
    Number(searchParams.get("duration")) || DEFAULT_DURATION;

  const [isExpired, setIsExpired] = useState(false);

  const handleExpired = useCallback(() => {
    setIsExpired(true);
  }, []);

  async function handleSendUnlockEmail() {
    // Replace with your actual API call.
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-2 text-center">
            <AnimatedLockIcon isLocked={!isExpired} />

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {isExpired ? "Account Unlocked" : "Account Locked"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {isExpired
                  ? "Your lockout period has ended. You may now attempt to sign in again."
                  : "Your account has been temporarily locked due to multiple failed sign-in attempts. Please wait for the timer to expire or use an alternative method below."}
              </p>
            </div>

            <AttemptBadge attempts={attempts} maxAttempts={maxAttempts} />
          </div>

          {/* Timer */}
          <div className="px-6 py-6">
            <LockoutTimer
              durationSeconds={durationSeconds}
              onExpired={handleExpired}
            />
          </div>

          {/* Divider */}
          <div className="relative px-6">
            <div
              className="absolute inset-0 flex items-center px-6"
              aria-hidden="true"
            >
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs uppercase tracking-wider text-gray-400 dark:bg-gray-900 dark:text-gray-500">
                or
              </span>
            </div>
          </div>

          {/* Unlock options */}
          <div className="px-6 py-6">
            <UnlockOptions
              onSendUnlockEmail={handleSendUnlockEmail}
              supportHref="mailto:support@example.com"
            />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
            {isExpired ? (
              <a
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Try again
              </a>
            ) : (
              <span
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                aria-disabled="true"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Try again
              </span>
            )}
          </div>
        </div>

        {/* Back to login (subtle link below card) */}
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
