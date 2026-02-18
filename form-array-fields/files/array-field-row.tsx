"use client";

import React from "react";
import type { ArrayFieldRowProps } from "./array-fields.types";

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

function TrashIcon() {
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function ChevronUpIcon() {
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
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
}

function ChevronDownIcon() {
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
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  ArrayFieldRow                                                      */
/* ------------------------------------------------------------------ */

/**
 * Renders a single repeatable row with its configured fields and action buttons
 * (remove, move up, move down).
 *
 * This component is used internally by `ArrayFields` and is not intended to be
 * rendered standalone.
 */
export function ArrayFieldRow({
  index,
  arrayName,
  fields,
  register,
  errors,
  canRemove,
  canMoveUp,
  canMoveDown,
  disabled,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ArrayFieldRowProps) {
  /**
   * Resolve the nested error message for a given field at `arrayName.index.fieldName`.
   */
  function getFieldError(fieldName: string): string | undefined {
    const arrayErrors = errors[arrayName] as
      | Record<string, Record<string, { message?: string }>>
      | undefined;
    if (!arrayErrors) return undefined;

    const rowErrors = arrayErrors[index];
    if (!rowErrors) return undefined;

    return rowErrors[fieldName]?.message;
  }

  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      {/* Row number badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
          {index + 1}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp || disabled}
            aria-label={`Move item ${index + 1} up`}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronUpIcon />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown || disabled}
            aria-label={`Move item ${index + 1} down`}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDownIcon />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove || disabled}
            aria-label={`Remove item ${index + 1}`}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Field grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        {fields.map((fieldConfig) => {
          const fieldPath = `${arrayName}.${index}.${fieldConfig.name}` as const;
          const error = getFieldError(fieldConfig.name);
          const id = `${arrayName}-${index}-${fieldConfig.name}`;
          const type = fieldConfig.type ?? "text";
          const colClass = fieldConfig.className ?? "sm:col-span-2";

          return (
            <div key={fieldConfig.name} className={colClass}>
              <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {fieldConfig.label}
              </label>

              {type === "select" ? (
                <select
                  id={id}
                  disabled={disabled}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={`
                    block w-full rounded-lg border px-3 py-2 text-sm text-slate-900
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                    ${
                      error
                        ? "border-red-400 focus:border-red-500 focus:ring-red-300"
                        : "border-slate-300 focus:border-slate-500 focus:ring-slate-300"
                    }
                  `}
                  {...register(fieldPath)}
                >
                  <option value="">
                    {fieldConfig.placeholder ?? "Select..."}
                  </option>
                  {fieldConfig.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  type={type}
                  disabled={disabled}
                  placeholder={fieldConfig.placeholder}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={`
                    block w-full rounded-lg border px-3 py-2 text-sm text-slate-900
                    placeholder:text-slate-400 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-1
                    ${
                      error
                        ? "border-red-400 focus:border-red-500 focus:ring-red-300"
                        : "border-slate-300 focus:border-slate-500 focus:ring-slate-300"
                    }
                  `}
                  {...register(fieldPath, {
                    valueAsNumber: type === "number",
                  })}
                />
              )}

              {error && (
                <p
                  id={`${id}-error`}
                  className="mt-1 text-xs text-red-600"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
