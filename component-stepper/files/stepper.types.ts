/**
 * Type definitions for the Stepper component.
 *
 * Defines step status, individual step configuration, and props
 * for both the composite Stepper and the StepIndicator sub-component.
 */

import type { ReactNode } from "react";

/* -- Step status ----------------------------------------------------------- */

/**
 * Visual status of a single step in the stepper.
 *
 * - `completed` — step has been finished successfully (shows check icon)
 * - `current`   — the active step the user is on
 * - `upcoming`  — a future step not yet reached
 * - `error`     — step has a validation error (shows X icon)
 */
export type StepStatus = "completed" | "current" | "upcoming" | "error";

/* -- Step configuration ---------------------------------------------------- */

/**
 * Configuration for a single step.
 */
export interface Step {
  /** Unique identifier for the step. */
  id: string;

  /** Display label shown next to the step indicator. */
  label: string;

  /** Optional description shown below the label. */
  description?: string;

  /** Optional custom icon rendered inside the step circle. Overrides the default number/check/X. */
  icon?: ReactNode;

  /** Whether this step can be skipped. Shown as "(optional)" in the label. */
  optional?: boolean;
}

/* -- Stepper props --------------------------------------------------------- */

/**
 * Props for the top-level Stepper component.
 */
export interface StepperProps {
  /** Ordered array of step definitions. */
  steps: Step[];

  /** Zero-based index of the current active step. */
  currentStep: number;

  /** Layout direction. Defaults to `"horizontal"`. */
  orientation?: "horizontal" | "vertical";

  /** Callback fired when a step circle is clicked. Receives the step index. */
  onStepClick?: (index: number) => void;

  /** Whether completed/error steps can be clicked to navigate back. Defaults to `false`. */
  allowClickNavigation?: boolean;

  /** Size variant affecting circle diameter and text size. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";

  /** Visual variant for step indicators. Defaults to `"default"`. */
  variant?: "default" | "outline" | "dots";
}

/* -- Individual StepIndicator props ---------------------------------------- */

/**
 * Props for the StepIndicator sub-component (the circle + optional label).
 */
export interface StepProps {
  /** Step configuration object. */
  step: Step;

  /** Zero-based index of this step. */
  index: number;

  /** Computed status based on currentStep and any error state. */
  status: StepStatus;

  /** Whether this is the last step (no trailing connector line). */
  isLast: boolean;

  /** Layout direction inherited from the parent Stepper. */
  orientation: "horizontal" | "vertical";

  /** Size variant inherited from the parent Stepper. */
  size: "sm" | "md" | "lg";

  /** Click handler passed from the parent Stepper when navigation is enabled. */
  onClick?: () => void;

  /** Whether this specific step is clickable. */
  clickable: boolean;
}
