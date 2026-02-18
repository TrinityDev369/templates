"use client";

import * as React from "react";

export interface BillingToggleProps {
  /** Currently selected billing interval */
  interval: "monthly" | "annual";
  /** Callback fired when the user switches interval */
  onIntervalChange: (interval: "monthly" | "annual") => void;
  /** Percentage saved on annual billing (shown in the badge). Defaults to 20. */
  savingsPercentage?: number;
}

/**
 * A pill-shaped billing interval toggle with a sliding indicator.
 *
 * Renders "Monthly" and "Annual" options side-by-side. The active option is
 * highlighted with a filled background that slides smoothly between states.
 * A small green badge next to "Annual" communicates savings.
 */
export function BillingToggle({
  interval,
  onIntervalChange,
  savingsPercentage = 20,
}: BillingToggleProps) {
  const isAnnual = interval === "annual";

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center rounded-full bg-gray-100 p-1 dark:bg-gray-800">
        {/* Sliding indicator */}
        <span
          aria-hidden="true"
          className={[
            "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm",
            "transition-transform duration-300 ease-in-out",
            "dark:bg-gray-700",
            isAnnual ? "translate-x-[calc(100%+4px)]" : "translate-x-0",
          ].join(" ")}
        />

        {/* Monthly button */}
        <button
          type="button"
          role="radio"
          aria-checked={!isAnnual}
          aria-label="Monthly billing"
          onClick={() => onIntervalChange("monthly")}
          className={[
            "relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium",
            "transition-colors duration-200",
            !isAnnual
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
          ].join(" ")}
        >
          Monthly
        </button>

        {/* Annual button */}
        <button
          type="button"
          role="radio"
          aria-checked={isAnnual}
          aria-label="Annual billing"
          onClick={() => onIntervalChange("annual")}
          className={[
            "relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium",
            "transition-colors duration-200",
            isAnnual
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
          ].join(" ")}
        >
          Annual
        </button>
      </div>

      {/* Savings badge */}
      {savingsPercentage > 0 && (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30">
          Save {savingsPercentage}% with annual billing
        </span>
      )}
    </div>
  );
}
