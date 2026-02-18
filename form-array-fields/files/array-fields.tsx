"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrayFieldRow } from "./array-field-row";
import type { ArrayFieldsProps, ArrayFieldConfig } from "./array-fields.types";

/* ------------------------------------------------------------------ */
/*  Inline SVG Icon                                                    */
/* ------------------------------------------------------------------ */

function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Build a default empty row object from field configs.
 * Uses `defaultValue` from config if provided, otherwise sensible defaults.
 */
function buildEmptyRow(
  fields: ArrayFieldConfig[]
): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      row[field.name] = field.defaultValue;
    } else if (field.type === "number") {
      row[field.name] = 0;
    } else {
      row[field.name] = "";
    }
  }
  return row;
}

/* ------------------------------------------------------------------ */
/*  ArrayFields Component                                              */
/* ------------------------------------------------------------------ */

/**
 * Dynamic repeatable field groups with add, remove, and reorder controls.
 *
 * Built on React Hook Form's `useFieldArray` with Zod validation.
 * Supports text, number, and select field types in each row,
 * configurable min/max constraints, and row reordering.
 *
 * @example
 * ```tsx
 * import { ArrayFields } from "@/components/form-array-fields/array-fields";
 * import { z } from "zod";
 *
 * const schema = z.object({
 *   members: z.array(z.object({
 *     name: z.string().min(1, "Name is required"),
 *     email: z.string().email("Invalid email"),
 *     role: z.string().min(1, "Role is required"),
 *   })).min(1, "Add at least one member").max(10, "Maximum 10 members"),
 * });
 *
 * <ArrayFields
 *   name="members"
 *   label="Team Members"
 *   fields={[
 *     { name: "name", label: "Name", placeholder: "Jane Doe" },
 *     { name: "email", label: "Email", type: "text", placeholder: "jane@example.com" },
 *     { name: "role", label: "Role", type: "select", options: [
 *       { value: "dev", label: "Developer" },
 *       { value: "design", label: "Designer" },
 *       { value: "pm", label: "Product Manager" },
 *     ]},
 *   ]}
 *   schema={schema}
 *   min={1}
 *   max={10}
 *   onSubmit={(data) => console.log(data)}
 * />
 * ```
 */
export function ArrayFields<TSchema extends z.ZodType = z.ZodType>({
  name,
  fields: fieldConfigs,
  schema,
  label,
  description,
  min = 0,
  max = Infinity,
  defaultValues,
  addLabel = "Add Item",
  onSubmit,
  submitLabel = "Submit",
  className = "",
  disabled = false,
}: ArrayFieldsProps<TSchema>) {
  // Build initial rows: use provided defaults or create min-count empty rows
  const initialRows =
    defaultValues && defaultValues.length > 0
      ? defaultValues
      : Array.from({ length: Math.max(min, 1) }, () =>
          buildEmptyRow(fieldConfigs)
        );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      [name]: initialRows,
    } as Record<string, unknown>,
  });

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name,
  });

  const canAdd = fields.length < max;
  const canRemoveRow = fields.length > min;

  function handleAdd() {
    if (canAdd) {
      append(buildEmptyRow(fieldConfigs));
    }
  }

  function handleRemove(index: number) {
    if (canRemoveRow) {
      remove(index);
    }
  }

  function handleMoveUp(index: number) {
    if (index > 0) {
      swap(index, index - 1);
    }
  }

  function handleMoveDown(index: number) {
    if (index < fields.length - 1) {
      swap(index, index + 1);
    }
  }

  function handleFormSubmit(data: Record<string, unknown>) {
    onSubmit?.(data as z.infer<TSchema>);
  }

  // Extract the array-level error (e.g. "Add at least one member")
  const arrayError = errors[name] as
    | { message?: string; root?: { message?: string } }
    | undefined;
  const arrayErrorMessage =
    arrayError?.root?.message ?? arrayError?.message;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={`space-y-4 ${className}`}
      noValidate
    >
      {/* Header */}
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <h2 className="text-lg font-semibold text-slate-900">{label}</h2>
          )}
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <ArrayFieldRow
            key={field.id}
            index={index}
            arrayName={name}
            fields={fieldConfigs}
            register={register}
            errors={errors}
            canRemove={canRemoveRow}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
            disabled={disabled}
            onRemove={() => handleRemove(index)}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
          />
        ))}
      </div>

      {/* Array-level error */}
      {arrayErrorMessage && typeof arrayErrorMessage === "string" && (
        <p className="text-sm text-red-600" role="alert">
          {arrayErrorMessage}
        </p>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd || disabled}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PlusIcon />
          {addLabel}
        </button>

        {onSubmit && (
          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </button>
        )}
      </div>

      {/* Row count indicator */}
      <p className="text-xs text-slate-400">
        {fields.length} {fields.length === 1 ? "item" : "items"}
        {max < Infinity && ` / ${max} max`}
        {min > 0 && ` (min ${min})`}
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo: Team Members Example                                         */
/* ------------------------------------------------------------------ */

/**
 * Ready-to-use demo showcasing the ArrayFields component with a
 * "Team Members" use case. Drop this into any page for a quick preview.
 */
export function ArrayFieldsDemo() {
  const teamSchema = z.object({
    members: z
      .array(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email address"),
          role: z.string().min(1, "Please select a role"),
        })
      )
      .min(1, "Add at least one team member")
      .max(10, "Maximum 10 team members"),
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <ArrayFields
        name="members"
        label="Team Members"
        description="Add your team members below. Each person needs a name, email, and role."
        schema={teamSchema}
        min={1}
        max={10}
        addLabel="Add Member"
        submitLabel="Save Team"
        defaultValues={[
          { name: "Sergej Goetz", email: "sergej@trinity.agency", role: "lead" },
        ]}
        fields={[
          {
            name: "name",
            label: "Full Name",
            type: "text",
            placeholder: "Jane Doe",
            className: "sm:col-span-2",
          },
          {
            name: "email",
            label: "Email Address",
            type: "text",
            placeholder: "jane@example.com",
            className: "sm:col-span-2",
          },
          {
            name: "role",
            label: "Role",
            type: "select",
            placeholder: "Select role...",
            className: "sm:col-span-2",
            options: [
              { value: "lead", label: "Team Lead" },
              { value: "dev", label: "Developer" },
              { value: "design", label: "Designer" },
              { value: "pm", label: "Product Manager" },
              { value: "qa", label: "QA Engineer" },
            ],
          },
        ]}
        onSubmit={(data) => {
          console.log("Team submitted:", data);
          alert(JSON.stringify(data, null, 2));
        }}
      />
    </div>
  );
}
