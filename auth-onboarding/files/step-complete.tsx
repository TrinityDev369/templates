"use client";

import { type FC } from "react";

import { Button } from "@/components/ui/button";

import type { StepCompleteProps } from "./onboarding-wizard.types";

/* -- Icons --------------------------------------------------------- */

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* -- StepComplete -------------------------------------------------- */

/**
 * Completion step showing a success state with checkmark.
 * Single action: "Go to Dashboard" button to finish onboarding.
 */
const StepComplete: FC<StepCompleteProps> = ({ onFinish }) => {
  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircleIcon />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          You&apos;re all set!
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your account is ready. Start exploring your dashboard.
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          You can update your profile and preferences at any time from the
          settings page.
        </p>
      </div>

      <Button type="button" className="w-full" onClick={onFinish}>
        Go to Dashboard
        <span className="ml-1.5">
          <ArrowRightIcon />
        </span>
      </Button>
    </div>
  );
};

export { StepComplete };
