import type { ReactNode } from "react";
import type { z } from "zod";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/* ------------------------------------------------------------------ */
/*  Step Definition                                                    */
/* ------------------------------------------------------------------ */

/**
 * A single step in the wizard.
 *
 * @template T - Zod schema type for this step's form data.
 */
export interface WizardStepConfig<T extends z.ZodType = z.ZodType> {
  /** Unique identifier for this step. */
  id: string;
  /** Human-readable label shown in the step indicator. */
  label: string;
  /** Optional description shown below the label. */
  description?: string;
  /** Zod schema used to validate this step before proceeding. */
  schema: T;
  /** Default values for the form fields in this step. */
  defaultValues?: Partial<z.infer<T>>;
  /** If true, the user may skip this step without validation. */
  optional?: boolean;
  /**
   * Render function for the step content.
   * Receives the react-hook-form instance so the step can render its own fields.
   */
  render: (form: UseFormReturn<z.infer<T>>) => ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Wizard Props                                                       */
/* ------------------------------------------------------------------ */

export interface WizardProps {
  /** Ordered array of step configurations. */
  steps: WizardStepConfig[];
  /**
   * Called when the user completes all steps.
   * Receives merged data from every step keyed by step id.
   */
  onComplete: (data: Record<string, FieldValues>) => void;
  /** Optional CSS class applied to the outermost wrapper. */
  className?: string;
  /** Label for the final submit button. Defaults to "Submit". */
  submitLabel?: string;
  /** If true, shows a "Skip" button on optional steps. Defaults to true. */
  allowSkip?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Internal Types                                                     */
/* ------------------------------------------------------------------ */

/** Tracks the completion state of a step. */
export type StepStatus = "upcoming" | "active" | "completed" | "skipped";

export interface StepState {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
  data: FieldValues | null;
}

/** Direction of the step transition animation. */
export type TransitionDirection = "forward" | "backward";
