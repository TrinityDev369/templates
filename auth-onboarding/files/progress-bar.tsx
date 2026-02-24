"use client";

import { type FC } from "react";

import { cn } from "@/lib/utils";

import type { ProgressBarProps } from "./onboarding-wizard.types";

/* -- Icons --------------------------------------------------------- */

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* -- ProgressBar --------------------------------------------------- */

/**
 * Visual step indicator with numbered circles connected by lines.
 *
 * Each step can be in one of three states:
 * - **completed**: filled circle with checkmark
 * - **current**: highlighted circle with step number
 * - **upcoming**: muted circle with step number
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   steps={["Welcome", "Profile", "Preferences", "Done"]}
 *   currentStep={1}
 * />
 * ```
 */
const ProgressBar: FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full px-2" role="navigation" aria-label="Onboarding progress">
      <ol className="flex items-center justify-between">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={label}
              className={cn("flex items-center", !isLast && "flex-1")}
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-background text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 bg-background text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? <CheckIcon /> : index + 1}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-[11px] font-medium leading-tight text-center whitespace-nowrap",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground",
                    !isCompleted && !isCurrent && "text-muted-foreground/50"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "mx-2 mt-[-1rem] h-0.5 flex-1 transition-colors",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export { ProgressBar };
