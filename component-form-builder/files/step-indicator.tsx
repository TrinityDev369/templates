"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* -- Props ----------------------------------------------------------------- */

export interface StepIndicatorProps {
  /** Array of step titles to display. */
  steps: string[];

  /** Zero-based index of the current active step. */
  currentStep: number;
}

/* -- Component ------------------------------------------------------------- */

/**
 * Step progress indicator with numbered circles and connecting lines.
 *
 * - Completed steps show a checkmark icon.
 * - The current step is highlighted with the primary color.
 * - Future steps are dimmed.
 * - Fully responsive: titles hidden on mobile, visible on sm+ screens.
 */
export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Form progress" className="w-full">
      <ol className="flex items-center justify-between" role="list">
        {steps.map((title, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li
              key={title}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Circle + label group */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step title - hidden on very small screens */}
                <span
                  className={cn(
                    "hidden text-center text-xs font-medium sm:block",
                    isCompleted && "text-primary",
                    isCurrent && "text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "text-muted-foreground/50"
                  )}
                >
                  {title}
                </span>

                {/* Accessible text for screen readers */}
                <span className="sr-only">
                  {title}
                  {isCompleted
                    ? " (completed)"
                    : isCurrent
                      ? " (current)"
                      : " (upcoming)"}
                </span>
              </div>

              {/* Connecting line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-5 h-0.5 flex-1 transition-colors sm:mb-6",
                    isCompleted
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
