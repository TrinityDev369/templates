"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues } from "react-hook-form";
import type { WizardStepConfig, TransitionDirection } from "./types";

/* ------------------------------------------------------------------ */
/*  Wizard Step                                                        */
/* ------------------------------------------------------------------ */

interface WizardStepProps {
  config: WizardStepConfig;
  /** Previously-submitted data for this step (used to restore values). */
  savedData: FieldValues | null;
  /** Called when the step form is successfully validated and submitted. */
  onSubmit: (data: FieldValues) => void;
  /** Called when the user clicks "Back". */
  onBack: () => void;
  /** Called when the user skips this optional step. */
  onSkip: () => void;
  /** Whether this is the first step (hides "Back" button). */
  isFirst: boolean;
  /** Whether this is the last step (shows submit label instead of "Next"). */
  isLast: boolean;
  /** Label for the final step submit button. */
  submitLabel: string;
  /** Whether to show the "Skip" button on optional steps. */
  allowSkip: boolean;
  /** The direction of the current transition. */
  direction: TransitionDirection;
  /** Whether the step is currently animating in. */
  isAnimating: boolean;
}

/**
 * Individual step wrapper. Creates its own react-hook-form instance
 * scoped to the step's Zod schema, delegates rendering to the
 * step config's `render` function.
 */
export function WizardStep({
  config,
  savedData,
  onSubmit,
  onBack,
  onSkip,
  isFirst,
  isLast,
  submitLabel,
  allowSkip,
  direction,
  isAnimating,
}: WizardStepProps) {
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: savedData ?? config.defaultValues ?? {},
    mode: "onTouched",
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${
          isAnimating
            ? direction === "forward"
              ? "animate-slide-in-right"
              : "animate-slide-in-left"
            : ""
        }
      `}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Step header */}
        {config.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {config.description}
          </p>
        )}

        {/* Step content rendered by config */}
        <div className="space-y-4">{config.render(form)}</div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div>
            {!isFirst && (
              <button
                type="button"
                onClick={onBack}
                className="
                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                  text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800
                  rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  dark:focus:ring-offset-zinc-900
                "
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M10 3L5 8L10 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {config.optional && allowSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="
                  px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400
                  hover:text-zinc-700 dark:hover:text-zinc-200
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  dark:focus:ring-offset-zinc-900 rounded-lg
                "
              >
                Skip
              </button>
            )}

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="
                inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold
                text-white bg-blue-600 rounded-lg
                hover:bg-blue-700 active:bg-blue-800
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                dark:focus:ring-offset-zinc-900
              "
            >
              {form.formState.isSubmitting ? (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : null}
              {isLast ? submitLabel : "Next"}
              {!isLast && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
