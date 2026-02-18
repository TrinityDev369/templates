/**
 * Type definitions for the multi-step form builder.
 *
 * Defines the configuration shapes for steps, fields, and the
 * overall form builder component.
 */

import type { z } from "zod";

/* -- Field types ----------------------------------------------------------- */

/**
 * Supported HTML input types for form fields.
 */
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "checkbox";

/* -- Field configuration --------------------------------------------------- */

/**
 * Configuration for a single form field.
 *
 * Each field maps to a specific input element determined by its `type`.
 * For `select` fields, provide `options` with label/value pairs.
 */
export interface FormFieldConfig {
  /** Unique field name (maps to form data key). */
  name: string;

  /** Human-readable label displayed above the input. */
  label: string;

  /** Determines which input component to render. */
  type: FieldType;

  /** Placeholder text shown inside the input (not applicable to checkbox). */
  placeholder?: string;

  /** Help text displayed below the input. */
  description?: string;

  /** Options for `select` field type. Ignored for other types. */
  options?: { label: string; value: string }[];

  /** Default value to pre-populate the field. */
  defaultValue?: string | number | boolean;
}

/* -- Step configuration ---------------------------------------------------- */

/**
 * Configuration for a single step in the multi-step form.
 *
 * Each step groups related fields together with its own Zod validation
 * schema. The user must pass validation before advancing to the next step.
 */
export interface FormStep {
  /** Step title displayed in the step indicator and step header. */
  title: string;

  /** Optional description displayed below the step title. */
  description?: string;

  /** Array of field configurations to render in this step. */
  fields: FormFieldConfig[];

  /** Zod schema for validating this step's fields. */
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
}

/* -- Component props ------------------------------------------------------- */

/**
 * Props for the top-level FormBuilder component.
 */
export interface FormBuilderProps {
  /** Ordered array of step configurations. */
  steps: FormStep[];

  /**
   * Called when the user completes the final step and submits.
   * Receives the merged data from all steps.
   */
  onSubmit: (data: Record<string, unknown>) => Promise<void>;

  /** Optional className applied to the outermost container. */
  className?: string;
}
