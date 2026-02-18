"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Plan color mapping                                                        */
/* -------------------------------------------------------------------------- */

const PLAN_STYLES: Record<
  string,
  { bg: string; text: string; ring: string; premium: boolean }
> = {
  free: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    ring: "ring-gray-300 dark:ring-gray-600",
    premium: false,
  },
  pro: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-300 dark:ring-blue-700",
    premium: true,
  },
  plus: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-300 dark:ring-blue-700",
    premium: true,
  },
  enterprise: {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-700 dark:text-purple-300",
    ring: "ring-purple-300 dark:ring-purple-700",
    premium: true,
  },
  business: {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-700 dark:text-purple-300",
    ring: "ring-purple-300 dark:ring-purple-700",
    premium: true,
  },
};

const DEFAULT_STYLE: (typeof PLAN_STYLES)[string] = {
  bg: "bg-gray-100 dark:bg-gray-800",
  text: "text-gray-700 dark:text-gray-300",
  ring: "ring-gray-300 dark:ring-gray-600",
  premium: false,
};

function getStyle(plan: string) {
  return PLAN_STYLES[plan.toLowerCase()] ?? DEFAULT_STYLE;
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface PlanBadgeProps {
  /** Display name of the current plan (e.g. "Free", "Pro", "Enterprise"). */
  plan: string;
  /** When true, an upgrade indicator is rendered next to the badge. */
  showUpgrade?: boolean;
  /** Callback fired when the upgrade indicator is clicked. */
  onUpgrade?: () => void;
  /**
   * Visual variant.
   * - `"default"` -- standard size, suitable for settings pages and cards.
   * - `"compact"` -- smaller text and padding, designed for navbars.
   */
  variant?: "default" | "compact";
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function PlanBadge({
  plan,
  showUpgrade = false,
  onUpgrade,
  variant = "default",
}: PlanBadgeProps) {
  const style = getStyle(plan);

  const isCompact = variant === "compact";

  const sizeClasses = isCompact
    ? "px-1.5 py-0.5 text-xs gap-1"
    : "px-2.5 py-1 text-sm gap-1.5";

  return (
    <span className="inline-flex items-center gap-1">
      {/* ---- Badge pill ---- */}
      <span
        className={[
          "inline-flex items-center font-medium rounded-full ring-1 ring-inset",
          sizeClasses,
          style.bg,
          style.text,
          style.ring,
        ].join(" ")}
      >
        {style.premium && (
          <Sparkles
            className={isCompact ? "size-3" : "size-3.5"}
            aria-hidden="true"
          />
        )}
        {plan}
      </span>

      {/* ---- Upgrade indicator ---- */}
      {showUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          aria-label={`Upgrade from ${plan} plan`}
          className={[
            "inline-flex items-center justify-center rounded-full",
            "transition-colors duration-150",
            "hover:bg-gray-200 dark:hover:bg-gray-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
            isCompact ? "size-5" : "size-6",
            style.text,
          ].join(" ")}
        >
          <ArrowUpRight
            className={isCompact ? "size-3" : "size-3.5"}
            aria-hidden="true"
          />
        </button>
      )}
    </span>
  );
}
