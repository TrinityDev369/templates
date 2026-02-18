"use client";

import type { ImpersonationBannerProps } from "./impersonation-banner.types";

/**
 * Inline SVG shield-alert icon.
 * Avoids external icon library dependency.
 */
function ShieldAlertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

/**
 * A fixed-position banner displayed when an admin is impersonating another user.
 *
 * Features:
 * - Fixed to the top of the viewport with z-50
 * - High-contrast amber/yellow warning style
 * - Shows impersonated user identity and admin identity
 * - "Stop Impersonating" button to end the session
 * - Responsive: stacks vertically on mobile, horizontal on desktop
 *
 * @example
 * ```tsx
 * <ImpersonationBanner
 *   impersonatedUser={{ name: "Jane Doe", email: "jane@example.com" }}
 *   adminUser={{ name: "Admin", email: "admin@example.com" }}
 *   onStopImpersonating={() => endImpersonation()}
 * />
 * ```
 */
export function ImpersonationBanner({
  impersonatedUser,
  adminUser,
  onStopImpersonating,
  className,
}: ImpersonationBannerProps) {
  return (
    <div
      role="alert"
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "bg-amber-500 text-amber-950",
        "shadow-md",
        "px-4 py-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 sm:flex-row sm:justify-between sm:gap-4">
        {/* Left: Icon + Label */}
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlertIcon className="h-5 w-5 shrink-0" />
          <span className="text-sm uppercase tracking-wide">
            Impersonating
          </span>
        </div>

        {/* Center: User info */}
        <div className="flex flex-col items-center gap-0.5 text-center sm:flex-1 sm:text-left">
          <span className="text-sm font-bold leading-tight">
            {impersonatedUser.name}{" "}
            <span className="font-normal opacity-80">
              ({impersonatedUser.email})
            </span>
          </span>
          <span className="text-xs opacity-70">
            as {adminUser.name} ({adminUser.email})
          </span>
        </div>

        {/* Right: Stop button */}
        <button
          type="button"
          onClick={onStopImpersonating}
          className={[
            "shrink-0 rounded-md px-3 py-1.5",
            "bg-white text-amber-700 font-medium text-sm",
            "shadow-sm",
            "transition-colors duration-150",
            "hover:bg-amber-50 hover:text-amber-800",
            "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-amber-500",
          ].join(" ")}
        >
          Stop Impersonating
        </button>
      </div>
    </div>
  );
}
