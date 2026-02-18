"use client";

import React from "react";
import type { StepState } from "./types";

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 8.5L6.5 12L13 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */

interface StepIndicatorProps {
  steps: StepState[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}

/**
 * Horizontal progress indicator showing numbered steps with labels,
 * connecting lines, and completion/skip states.
 */
export function StepIndicator({
  steps,
  currentIndex,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Form progress" className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isClickable =
            onStepClick && step.status === "completed";

          return (
            <li
              key={step.id}
              className={`flex items-center ${isLast ? "" : "flex-1"}`}
            >
              {/* Step circle + label */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={`
                  flex flex-col items-center gap-1 group relative
                  ${isClickable ? "cursor-pointer" : "cursor-default"}
                `}
                aria-current={step.status === "active" ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step.label}`}
              >
                {/* Circle */}
                <span
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full
                    text-sm font-semibold transition-all duration-300 shrink-0
                    ${
                      step.status === "completed"
                        ? "bg-emerald-600 text-white"
                        : step.status === "skipped"
                          ? "bg-zinc-400 text-white"
                          : step.status === "active"
                            ? "bg-blue-600 text-white ring-4 ring-blue-600/20"
                            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                    }
                    ${isClickable ? "group-hover:ring-4 group-hover:ring-emerald-600/20" : ""}
                  `}
                >
                  {step.status === "completed" ? (
                    <CheckIcon />
                  ) : step.status === "skipped" ? (
                    <SkipIcon />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Label */}
                <span
                  className={`
                    text-xs font-medium text-center whitespace-nowrap
                    transition-colors duration-300
                    ${
                      step.status === "active"
                        ? "text-blue-600 dark:text-blue-400"
                        : step.status === "completed"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-500 dark:text-zinc-400"
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-3 transition-colors duration-500
                    ${
                      index < currentIndex
                        ? "bg-emerald-600"
                        : "bg-zinc-200 dark:bg-zinc-700"
                    }
                  `}
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
