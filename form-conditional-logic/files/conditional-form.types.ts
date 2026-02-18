/**
 * Type definitions for the conditional form system.
 *
 * Defines field configurations, condition operators, visibility rules,
 * and logical groupings (AND/OR) for conditional field rendering.
 */

/** Supported comparison operators for field conditions. */
export type ConditionOperator =
  | "equals"
  | "not-equals"
  | "contains"
  | "greater-than"
  | "less-than"
  | "is-empty"
  | "is-not-empty";

/** Logical operator for combining multiple conditions. */
export type LogicalOperator = "AND" | "OR";

/** Supported form field types. */
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea";

/**
 * A single condition that evaluates a field's value against
 * an expected value using a comparison operator.
 */
export interface Condition {
  /** The `name` of the field whose value is checked. */
  field: string;
  /** The comparison operator to apply. */
  operator: ConditionOperator;
  /**
   * The expected value to compare against.
   * Not required for `is-empty` / `is-not-empty` operators.
   */
  value?: string | number | boolean;
}

/**
 * A visibility rule controlling when a field is shown.
 * Combines one or more conditions with a logical operator.
 */
export interface VisibilityRule {
  /** How to combine multiple conditions. Defaults to "AND". */
  logicalOperator?: LogicalOperator;
  /** The conditions that determine field visibility. */
  conditions: Condition[];
}

/** An option for select and radio field types. */
export interface FieldOption {
  label: string;
  value: string;
}

/**
 * Configuration for a single form field.
 * Includes its type, validation constraints, and optional visibility rules.
 */
export interface FieldConfig {
  /** Unique field identifier used as the form data key. */
  name: string;
  /** Human-readable label displayed above the field. */
  label: string;
  /** The input type to render. */
  type: FieldType;
  /** Placeholder text for text, number, and textarea fields. */
  placeholder?: string;
  /** Whether the field is required (when visible). Defaults to false. */
  required?: boolean;
  /** Default value for the field. */
  defaultValue?: string | number | boolean;
  /** Options for select and radio field types. */
  options?: FieldOption[];
  /** Visibility rule. If omitted, the field is always visible. */
  visibilityRule?: VisibilityRule;
  /** Minimum value for number fields or min length for text/textarea. */
  min?: number;
  /** Maximum value for number fields or max length for text/textarea. */
  max?: number;
  /** Number of rows for textarea fields. Defaults to 3. */
  rows?: number;
  /** Additional helper text displayed below the field. */
  helperText?: string;
}

/** The shape of form data: a record mapping field names to their values. */
export type FormValues = Record<string, string | number | boolean>;

/** Props for the main ConditionalForm component. */
export interface ConditionalFormProps {
  /** Array of field configurations defining the form structure. */
  fields: FieldConfig[];
  /** Callback invoked with validated form data on successful submission. */
  onSubmit: (data: FormValues) => void;
  /** Optional CSS class name applied to the form wrapper. */
  className?: string;
  /** Text displayed on the submit button. Defaults to "Submit". */
  submitLabel?: string;
  /** Whether the form is in a submitting state. */
  isSubmitting?: boolean;
}

/** Props for the FieldRenderer component. */
export interface FieldRendererProps {
  /** The field configuration to render. */
  field: FieldConfig;
  /** Current value of this field. */
  value: string | number | boolean;
  /** Change handler called with the field name and new value. */
  onChange: (name: string, value: string | number | boolean) => void;
  /** Validation error message, if any. */
  error?: string;
  /** Whether the field is currently visible (controls animation). */
  visible: boolean;
}
