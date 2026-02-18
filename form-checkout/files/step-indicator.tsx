"use client";

import React from "react";
import type { StepIndicatorProps } from "./types";

/**
 * Horizontal step progress indicator.
 * Shows completed, active, and upcoming steps with connecting lines.
 */
export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  return (
    <nav aria-label="Checkout progress" className="w-full mb-8">
      <ol className="flex items-center justify-between">
        {labels.map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <li
              key={label}
              className="flex flex-1 items-center last:flex-none"
            >
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    flex h-9 w-9 items-center justify-center rounded-full
                    text-sm font-semibold transition-colors duration-200
                    ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isActive
                          ? "bg-slate-900 text-white"
                          : "bg-slate-200 text-slate-500"
                    }
                  `}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    text-xs font-medium whitespace-nowrap
                    ${
                      isCompleted
                        ? "text-emerald-700"
                        : isActive
                          ? "text-slate-900"
                          : "text-slate-400"
                    }
                  `}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {index < labels.length - 1 && (
                <div
                  className={`
                    mx-2 mt-[-1.25rem] h-0.5 flex-1 transition-colors duration-200
                    ${index < currentStep ? "bg-emerald-600" : "bg-slate-200"}
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
