"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUpRight, X } from "lucide-react";

export interface QuotaWarningProps {
  /** Current usage count */
  used: number;
  /** Maximum allowed count */
  limit: number;
  /** Label for the resource being tracked (e.g. "API calls", "storage") */
  resourceName?: string;
  /** Percentage threshold at which the warning becomes visible (0-100) */
  threshold?: number;
  /** Callback fired when the user clicks the upgrade button */
  onUpgrade?: () => void;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
}

export function QuotaWarning({
  used,
  limit,
  resourceName = "resources",
  threshold = 80,
  onUpgrade,
  dismissible = true,
}: QuotaWarningProps) {
  const [dismissed, setDismissed] = useState(false);

  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isOverLimit = used > limit;

  if (dismissed || percentage < threshold) {
    return null;
  }

  const formattedUsed = used.toLocaleString();
  const formattedLimit = limit.toLocaleString();
  const displayPercentage = Math.round(percentage);

  const message = isOverLimit
    ? `You've exceeded your ${resourceName} limit (${formattedUsed} / ${formattedLimit})`
    : `You've used ${displayPercentage}% of your ${resourceName} (${formattedUsed} / ${formattedLimit})`;

  return (
    <div
      role="alert"
      className={[
        "flex items-center gap-3 rounded-lg border px-4 py-3",
        isOverLimit
          ? "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
          : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
      ].join(" ")}
    >
      <AlertTriangle
        className={[
          "h-5 w-5 shrink-0",
          isOverLimit
            ? "text-red-600 dark:text-red-400"
            : "text-amber-600 dark:text-amber-400",
        ].join(" ")}
        aria-hidden="true"
      />

      <p className="flex-1 text-sm font-medium">{message}</p>

      {onUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            isOverLimit
              ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 dark:bg-red-500 dark:hover:bg-red-600"
              : "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600",
          ].join(" ")}
        >
          Upgrade
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className={[
            "inline-flex shrink-0 items-center justify-center rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            isOverLimit
              ? "text-red-600 hover:bg-red-200 hover:text-red-800 focus-visible:ring-red-600 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-200"
              : "text-amber-600 hover:bg-amber-200 hover:text-amber-800 focus-visible:ring-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-200",
          ].join(" ")}
          aria-label="Dismiss warning"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
