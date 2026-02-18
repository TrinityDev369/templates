"use client";

/**
 * ConditionalForm — A form component with rule-based conditional field visibility.
 *
 * Features:
 * - Define show/hide conditions per field based on other field values
 * - Condition types: equals, not-equals, contains, greater-than, less-than, is-empty, is-not-empty
 * - Logical operators: AND/OR for combining multiple conditions
 * - Supported field types: text, number, select, radio, checkbox, textarea
 * - Animated transitions: smooth show/hide with CSS transitions
 * - Validation: only visible fields are validated; hidden fields are skipped
 *
 * @example
 * ```tsx
 * import { ConditionalForm } from "@/components/form-conditional-logic/conditional-form";
 * import type { FieldConfig } from "@/components/form-conditional-logic/conditional-form.types";
 *
 * const fields: FieldConfig[] = [
 *   {
 *     name: "contactMethod",
 *     label: "Preferred Contact Method",
 *     type: "select",
 *     required: true,
 *     options: [
 *       { label: "Email", value: "email" },
 *       { label: "Phone", value: "phone" },
 *       { label: "Other", value: "other" },
 *     ],
 *   },
 *   {
 *     name: "email",
 *     label: "Email Address",
 *     type: "text",
 *     required: true,
 *     placeholder: "you@example.com",
 *     visibilityRule: {
 *       conditions: [{ field: "contactMethod", operator: "equals", value: "email" }],
 *     },
 *   },
 *   {
 *     name: "phone",
 *     label: "Phone Number",
 *     type: "text",
 *     required: true,
 *     placeholder: "+1 (555) 123-4567",
 *     visibilityRule: {
 *       conditions: [{ field: "contactMethod", operator: "equals", value: "phone" }],
 *     },
 *   },
 *   {
 *     name: "otherMethod",
 *     label: "Please specify",
 *     type: "textarea",
 *     required: true,
 *     placeholder: "Describe your preferred contact method...",
 *     visibilityRule: {
 *       conditions: [{ field: "contactMethod", operator: "equals", value: "other" }],
 *     },
 *   },
 * ];
 *
 * function MyPage() {
 *   return (
 *     <ConditionalForm
 *       fields={fields}
 *       onSubmit={(data) => console.log("Submitted:", data)}
 *       submitLabel="Send"
 *     />
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo, type FormEvent } from "react";
import { z } from "zod";
import type {
  ConditionalFormProps,
  FieldConfig,
  FormValues,
} from "./conditional-form.types";
import {
  computeVisibility,
  validateVisibleFields,
} from "./condition-engine";
import { FieldRenderer } from "./field-renderer";

// ---------------------------------------------------------------------------
// Zod schema builder — generates a Zod schema from field configs,
// filtered to only include currently visible fields.
// ---------------------------------------------------------------------------

function buildZodSchema(
  fields: FieldConfig[],
  visibility: Record<string, boolean>
): z.ZodType<FormValues> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (!visibility[field.name]) continue;

    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "number": {
        let numSchema = z.number({ invalid_type_error: `${field.label} must be a number` });
        if (field.min !== undefined) {
          numSchema = numSchema.min(field.min, `${field.label} must be at least ${field.min}`);
        }
        if (field.max !== undefined) {
          numSchema = numSchema.max(field.max, `${field.label} must be at most ${field.max}`);
        }
        schema = field.required
          ? numSchema
          : z.union([numSchema, z.literal("")]).transform((v) =>
              v === "" ? undefined : v
            );
        break;
      }
      case "checkbox": {
        schema = field.required
          ? z.literal(true, {
              errorMap: () => ({ message: `${field.label} is required` }),
            })
          : z.boolean();
        break;
      }
      default: {
        let strSchema = z.string();
        if (field.required) {
          strSchema = strSchema.min(1, `${field.label} is required`);
        }
        if (
          (field.type === "text" || field.type === "textarea") &&
          field.min !== undefined &&
          field.required
        ) {
          strSchema = strSchema.min(
            field.min,
            `${field.label} must be at least ${field.min} characters`
          );
        }
        if (
          (field.type === "text" || field.type === "textarea") &&
          field.max !== undefined
        ) {
          strSchema = strSchema.max(
            field.max,
            `${field.label} must be at most ${field.max} characters`
          );
        }
        schema = strSchema;
        break;
      }
    }

    shape[field.name] = schema;
  }

  return z.object(shape).passthrough() as z.ZodType<FormValues>;
}

// ---------------------------------------------------------------------------
// ConditionalForm Component
// ---------------------------------------------------------------------------

export function ConditionalForm({
  fields,
  onSubmit,
  className,
  submitLabel = "Submit",
  isSubmitting = false,
}: ConditionalFormProps) {
  // Initialize form values from field defaults
  const [values, setValues] = useState<FormValues>(() => {
    const initial: FormValues = {};
    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      } else {
        initial[field.name] = field.type === "checkbox" ? false : "";
      }
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Compute which fields are visible based on current values
  const visibility = useMemo(
    () => computeVisibility(fields, values),
    [fields, values]
  );

  // Handle field value changes
  const handleChange = useCallback(
    (name: string, value: string | number | boolean) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field on change
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors]
  );

  // Validate and submit the form
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setSubmitted(true);

      // Only validate visible fields
      const validationErrors = validateVisibleFields(
        fields,
        visibility,
        values
      );

      if (validationErrors.length > 0) {
        const errorMap: Record<string, string> = {};
        for (const err of validationErrors) {
          // Keep only the first error per field
          if (!errorMap[err.field]) {
            errorMap[err.field] = err.message;
          }
        }
        setErrors(errorMap);
        return;
      }

      // Also run Zod validation for type coercion and consistency
      const schema = buildZodSchema(fields, visibility);
      const result = schema.safeParse(values);

      if (!result.success) {
        const errorMap: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const fieldName = String(issue.path[0]);
          if (!errorMap[fieldName]) {
            errorMap[fieldName] = issue.message;
          }
        }
        setErrors(errorMap);
        return;
      }

      // Build the submission payload — only include visible fields
      const payload: FormValues = {};
      for (const field of fields) {
        if (visibility[field.name]) {
          payload[field.name] = values[field.name];
        }
      }

      setErrors({});
      onSubmit(payload);
    },
    [fields, values, visibility, onSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-0 ${className ?? ""}`.trim()}
      noValidate
    >
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={handleChange}
          error={submitted ? errors[field.name] : undefined}
          visible={visibility[field.name]}
        />
      ))}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
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
              Submitting...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Demo Configuration — a ready-to-use example showing conditional logic
// ---------------------------------------------------------------------------

/**
 * Example field configuration demonstrating conditional form logic.
 *
 * Usage:
 * ```tsx
 * import { ConditionalForm } from "@/components/form-conditional-logic/conditional-form";
 * import { demoFields } from "@/components/form-conditional-logic/conditional-form";
 *
 * <ConditionalForm fields={demoFields} onSubmit={console.log} />
 * ```
 */
export const demoFields: FieldConfig[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Jane Doe",
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Developer", value: "developer" },
      { label: "Designer", value: "designer" },
      { label: "Manager", value: "manager" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "otherRole",
    label: "Please specify your role",
    type: "text",
    required: true,
    placeholder: "e.g., Product Owner",
    visibilityRule: {
      conditions: [{ field: "role", operator: "equals", value: "other" }],
    },
  },
  {
    name: "experience",
    label: "Years of Experience",
    type: "number",
    required: true,
    placeholder: "5",
    min: 0,
    max: 50,
  },
  {
    name: "isLead",
    label: "Are you a team lead?",
    type: "checkbox",
    helperText: "Check if you lead a team of 2 or more people",
    visibilityRule: {
      conditions: [
        { field: "experience", operator: "greater-than", value: 3 },
      ],
    },
  },
  {
    name: "teamSize",
    label: "Team Size",
    type: "number",
    required: true,
    placeholder: "4",
    min: 2,
    max: 100,
    visibilityRule: {
      logicalOperator: "AND",
      conditions: [
        { field: "isLead", operator: "equals", value: "true" },
        { field: "experience", operator: "greater-than", value: 3 },
      ],
    },
  },
  {
    name: "contactMethod",
    label: "Preferred Contact",
    type: "radio",
    required: true,
    options: [
      { label: "Email", value: "email" },
      { label: "Phone", value: "phone" },
    ],
  },
  {
    name: "email",
    label: "Email Address",
    type: "text",
    required: true,
    placeholder: "you@example.com",
    visibilityRule: {
      conditions: [
        { field: "contactMethod", operator: "equals", value: "email" },
      ],
    },
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    required: true,
    placeholder: "+1 (555) 123-4567",
    visibilityRule: {
      conditions: [
        { field: "contactMethod", operator: "equals", value: "phone" },
      ],
    },
  },
  {
    name: "notes",
    label: "Additional Notes",
    type: "textarea",
    placeholder: "Anything else you'd like to share...",
    rows: 4,
    visibilityRule: {
      conditions: [{ field: "name", operator: "is-not-empty" }],
    },
  },
];
