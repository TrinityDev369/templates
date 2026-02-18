"use client";

/**
 * Field renderer component with animated show/hide transitions.
 *
 * Renders form fields by type (text, number, select, radio, checkbox, textarea)
 * using native HTML elements styled with Tailwind CSS.
 */

import { useRef, useEffect, useState, type ChangeEvent } from "react";
import type { FieldRendererProps } from "./conditional-form.types";

/** Shared input styling for consistency across field types. */
const inputBaseClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const errorClass = "mt-1 text-sm text-red-600";
const helperClass = "mt-1 text-sm text-gray-500";

/**
 * Renders a single form field with animated visibility transitions.
 *
 * When `visible` becomes false the field smoothly collapses to zero height
 * with an opacity fade, and the DOM element remains mounted for CSS transitions.
 */
export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  visible,
}: FieldRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(visible);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Allow a frame for the DOM to mount before animating in
      requestAnimationFrame(() => {
        setAnimating(true);
      });
    } else {
      setAnimating(false);
      // Wait for the CSS transition to finish before unmounting
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!mounted) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    if (field.type === "checkbox" && target instanceof HTMLInputElement) {
      onChange(field.name, target.checked);
    } else if (field.type === "number") {
      onChange(field.name, target.value === "" ? "" : Number(target.value));
    } else {
      onChange(field.name, target.value);
    }
  };

  const fieldId = `field-${field.name}`;
  const errorId = `${fieldId}-error`;

  return (
    <div
      ref={containerRef}
      className="overflow-hidden transition-all duration-200 ease-in-out"
      style={{
        maxHeight: animating ? "500px" : "0px",
        opacity: animating ? 1 : 0,
      }}
      aria-hidden={!visible}
    >
      <div className="pb-4">
        {field.type === "checkbox" ? (
          <CheckboxField
            field={field}
            value={value}
            onChange={handleChange}
            fieldId={fieldId}
            errorId={errorId}
            error={error}
          />
        ) : (
          <>
            <label htmlFor={fieldId} className={labelClass}>
              {field.label}
              {field.required && (
                <span className="ml-0.5 text-red-500" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            {renderInput(field, value, handleChange, fieldId, errorId)}
            {error && (
              <p id={errorId} className={errorClass} role="alert">
                {error}
              </p>
            )}
            {!error && field.helperText && (
              <p className={helperClass}>{field.helperText}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Render the appropriate input element based on field type.
 */
function renderInput(
  field: FieldRendererProps["field"],
  value: string | number | boolean,
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void,
  fieldId: string,
  errorId: string
) {
  const ariaProps = {
    "aria-invalid": undefined as boolean | undefined,
    "aria-describedby": undefined as string | undefined,
  };

  switch (field.type) {
    case "text":
      return (
        <input
          id={fieldId}
          type="text"
          name={field.name}
          value={String(value ?? "")}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          minLength={field.min}
          maxLength={field.max}
          className={inputBaseClass}
          aria-describedby={errorId}
          {...ariaProps}
        />
      );

    case "number":
      return (
        <input
          id={fieldId}
          type="number"
          name={field.name}
          value={value === "" ? "" : Number(value)}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          min={field.min}
          max={field.max}
          className={inputBaseClass}
          aria-describedby={errorId}
          {...ariaProps}
        />
      );

    case "select":
      return (
        <select
          id={fieldId}
          name={field.name}
          value={String(value ?? "")}
          onChange={handleChange}
          required={field.required}
          className={inputBaseClass}
          aria-describedby={errorId}
          {...ariaProps}
        >
          <option value="">
            {field.placeholder ?? "Select an option..."}
          </option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "radio":
      return (
        <div
          role="radiogroup"
          aria-labelledby={`${fieldId}-legend`}
          className="mt-1 space-y-2"
        >
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={String(value) === opt.value}
                onChange={handleChange}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      );

    case "textarea":
      return (
        <textarea
          id={fieldId}
          name={field.name}
          value={String(value ?? "")}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          rows={field.rows ?? 3}
          minLength={field.min}
          maxLength={field.max}
          className={inputBaseClass + " resize-y"}
          aria-describedby={errorId}
          {...ariaProps}
        />
      );

    default:
      return null;
  }
}

/**
 * Checkbox field with label positioned inline to the right.
 */
function CheckboxField({
  field,
  value,
  onChange,
  fieldId,
  errorId,
  error,
}: {
  field: FieldRendererProps["field"];
  value: string | number | boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fieldId: string;
  errorId: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
      >
        <input
          id={fieldId}
          type="checkbox"
          name={field.name}
          checked={Boolean(value)}
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-describedby={error ? errorId : undefined}
        />
        <span>
          {field.label}
          {field.required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>
      {error && (
        <p id={errorId} className={errorClass + " ml-6"} role="alert">
          {error}
        </p>
      )}
      {!error && field.helperText && (
        <p className={helperClass + " ml-6"}>{field.helperText}</p>
      )}
    </div>
  );
}
