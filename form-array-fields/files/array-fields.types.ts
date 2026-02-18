import type { z } from "zod";
import type {
  FieldValues,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";

/* ------------------------------------------------------------------ */
/*  Field Configuration                                                */
/* ------------------------------------------------------------------ */

/** Supported field types within each repeatable row. */
export type ArrayFieldType = "text" | "number" | "select";

/** A single select option for fields with type "select". */
export interface SelectOption {
  /** The value submitted with the form. */
  value: string;
  /** The human-readable label displayed in the dropdown. */
  label: string;
}

/**
 * Describes one field inside each repeatable row.
 *
 * @example
 * ```ts
 * const nameField: ArrayFieldConfig = {
 *   name: "name",
 *   label: "Full Name",
 *   type: "text",
 *   placeholder: "Jane Doe",
 * };
 * ```
 */
export interface ArrayFieldConfig {
  /** Unique key for this field within the row (used as the form field name). */
  name: string;
  /** Human-readable label displayed above the input. */
  label: string;
  /** Input type. Defaults to "text". */
  type?: ArrayFieldType;
  /** Placeholder text shown when the field is empty. */
  placeholder?: string;
  /** Options for select-type fields. Ignored for other types. */
  options?: SelectOption[];
  /** Default value when a new row is added. */
  defaultValue?: string | number;
  /**
   * Relative width hint using Tailwind column classes.
   * E.g. "col-span-2" to make a field span two columns.
   */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component Props                                                    */
/* ------------------------------------------------------------------ */

/**
 * Props for the main `ArrayFields` component.
 *
 * @template TSchema - The Zod schema type for the entire form.
 */
export interface ArrayFieldsProps<TSchema extends z.ZodType = z.ZodType> {
  /**
   * The form field name that holds the array.
   * Must correspond to a `z.array(...)` field in your Zod schema.
   */
  name: string;
  /** Configuration for each field rendered inside every row. */
  fields: ArrayFieldConfig[];
  /** Zod schema for the entire form (the array field is validated as part of this). */
  schema: TSchema;
  /** Label displayed above the array section. */
  label?: string;
  /** Helper text displayed below the label. */
  description?: string;
  /** Minimum number of rows. Defaults to 0. */
  min?: number;
  /** Maximum number of rows. Defaults to Infinity. */
  max?: number;
  /** Default rows to pre-fill when the form mounts. */
  defaultValues?: Array<Record<string, unknown>>;
  /** Label for the "Add row" button. Defaults to "Add Item". */
  addLabel?: string;
  /** Called with the validated form data on submit. */
  onSubmit?: (data: z.infer<TSchema>) => void;
  /** Submit button label. Defaults to "Submit". */
  submitLabel?: string;
  /** Additional CSS class applied to the outermost wrapper. */
  className?: string;
  /** Whether all inputs are disabled. */
  disabled?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Row Props (internal)                                               */
/* ------------------------------------------------------------------ */

/**
 * Props for a single `ArrayFieldRow`.
 * Used internally by `ArrayFields` -- not intended for direct consumption.
 */
export interface ArrayFieldRowProps {
  /** Zero-based index of this row in the array. */
  index: number;
  /** The array field name on the parent form. */
  arrayName: string;
  /** Field configurations to render in this row. */
  fields: ArrayFieldConfig[];
  /** react-hook-form register function. */
  register: UseFormRegister<FieldValues>;
  /** Validation errors for this row's fields. */
  errors: FieldErrors;
  /** Whether this row can be removed (respects min constraint). */
  canRemove: boolean;
  /** Whether this row can be moved up. */
  canMoveUp: boolean;
  /** Whether this row can be moved down. */
  canMoveDown: boolean;
  /** Whether all inputs in this row are disabled. */
  disabled?: boolean;
  /** Callback to remove this row. */
  onRemove: () => void;
  /** Callback to move this row up. */
  onMoveUp: () => void;
  /** Callback to move this row down. */
  onMoveDown: () => void;
}
