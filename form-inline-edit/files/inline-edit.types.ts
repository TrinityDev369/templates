/** Supported inline-edit field types. */
export type InlineEditFieldType = "text" | "number" | "textarea" | "select";

/** A single option for the select field variant. */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Validation result returned by the `validate` prop.
 * Return `true` (or `undefined`) for valid, or a string error message for invalid.
 */
export type ValidationResult = true | string | undefined;

/** Core props shared by all inline-edit field variants. */
export interface InlineEditBaseProps {
  /** Current persisted value displayed in read mode. */
  value: string;

  /**
   * Called when the user confirms an edit (Enter key or click-outside).
   * May be async -- the component will show a loading state while the promise resolves.
   * If the callback throws, the edit is rolled back and the error is shown.
   */
  onSave: (nextValue: string) => void | Promise<void>;

  /** Optional synchronous validation. Return `true` or `undefined` to pass, or a string error message to fail. */
  validate?: (nextValue: string) => ValidationResult;

  /** Format the persisted value for display mode (e.g. currency, date). */
  formatDisplay?: (value: string) => string;

  /** Placeholder text when the value is empty. */
  placeholder?: string;

  /** Whether the field is disabled (non-editable). */
  disabled?: boolean;

  /** Optional label rendered above the field. */
  label?: string;

  /** Additional class names applied to the outermost wrapper. */
  className?: string;
}

/** Props for the text variant. */
export interface InlineEditTextProps extends InlineEditBaseProps {
  fieldType?: "text";
}

/** Props for the number variant. */
export interface InlineEditNumberProps extends InlineEditBaseProps {
  fieldType: "number";
  /** Minimum value (HTML min attribute). */
  min?: number;
  /** Maximum value (HTML max attribute). */
  max?: number;
  /** Step value (HTML step attribute). */
  step?: number;
}

/** Props for the textarea variant. */
export interface InlineEditTextareaProps extends InlineEditBaseProps {
  fieldType: "textarea";
  /** Number of visible rows in edit mode. @default 3 */
  rows?: number;
}

/** Props for the select variant. */
export interface InlineEditSelectProps extends InlineEditBaseProps {
  fieldType: "select";
  /** Options to display in the dropdown. */
  options: SelectOption[];
}

/** Discriminated union of all inline-edit prop shapes. */
export type InlineEditProps =
  | InlineEditTextProps
  | InlineEditNumberProps
  | InlineEditTextareaProps
  | InlineEditSelectProps;
