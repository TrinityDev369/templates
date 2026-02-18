"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import type {
  InlineEditProps,
  InlineEditNumberProps,
  InlineEditTextareaProps,
  InlineEditSelectProps,
  ValidationResult,
} from "./inline-edit.types";

/* ---------------------------------------------------------------------------
 * Inline SVG Icons (no external deps)
 * --------------------------------------------------------------------------- */

function PencilIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

function SpinnerIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} animate-spin`}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 019.95 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * InlineEditField — the actual editable field component
 * --------------------------------------------------------------------------- */

export function InlineEditField(props: InlineEditProps) {
  const {
    value,
    onSave,
    validate,
    formatDisplay,
    placeholder = "Click to edit",
    disabled = false,
    label,
    className = "",
    fieldType = "text",
  } = props;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  // Sync external value changes into display
  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for text/number inputs
      if ("select" in inputRef.current && fieldType !== "select") {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [editing, fieldType]);

  // Click-outside handler — save on click outside
  useEffect(() => {
    if (!editing) return;

    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        handleSave();
      }
    }

    // Delay to avoid catching the click that opened editing
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, draft]);

  const enterEditMode = useCallback(() => {
    if (disabled || saving) return;
    setDraft(value);
    setError(null);
    setEditing(true);
  }, [disabled, saving, value]);

  const cancelEdit = useCallback(() => {
    setDraft(value);
    setError(null);
    setEditing(false);
  }, [value]);

  const handleSave = useCallback(async () => {
    // No change — just close
    if (draft === value) {
      setEditing(false);
      setError(null);
      return;
    }

    // Validate
    if (validate) {
      const result: ValidationResult = validate(draft);
      if (result !== true && result !== undefined) {
        setError(result);
        return;
      }
    }

    setError(null);
    setSaving(true);

    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      // Keep editing open so user can retry
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, value, validate, onSave]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
      // Enter saves for text/number/select; Ctrl+Enter for textarea
      if (e.key === "Enter") {
        if (fieldType === "textarea" && !e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        handleSave();
      }
    },
    [cancelEdit, handleSave, fieldType],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setDraft(e.target.value);
      // Clear error on change
      if (error) setError(null);
    },
    [error],
  );

  /* ---- Display (read) mode ---- */

  const displayValue = formatDisplay ? formatDisplay(value) : value;

  if (!editing) {
    return (
      <div className={`group inline-flex flex-col gap-1 ${className}`}>
        {label && (
          <span className="text-xs font-medium text-neutral-500">{label}</span>
        )}
        <button
          type="button"
          onClick={enterEditMode}
          disabled={disabled}
          className={`
            inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm
            transition-colors duration-150
            ${
              disabled
                ? "cursor-not-allowed text-neutral-400"
                : "cursor-pointer text-neutral-900 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            }
          `}
          aria-label={label ? `Edit ${label}` : "Edit value"}
        >
          <span className={!value ? "italic text-neutral-400" : ""}>
            {displayValue || placeholder}
          </span>
          {!disabled && (
            <PencilIcon className="w-3 h-3 shrink-0 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </div>
    );
  }

  /* ---- Edit mode ---- */

  const inputBaseClasses = `
    w-full rounded-md border bg-white px-2 py-1 text-sm text-neutral-900
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:cursor-not-allowed disabled:opacity-50
    ${error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : "border-neutral-300"}
  `;

  function renderInput() {
    if (fieldType === "textarea") {
      const taProps = props as InlineEditTextareaProps;
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={taProps.rows ?? 3}
          disabled={saving}
          placeholder={placeholder}
          className={`${inputBaseClasses} resize-y`}
          aria-label={label || "Edit value"}
          aria-invalid={!!error}
        />
      );
    }

    if (fieldType === "select") {
      const selProps = props as InlineEditSelectProps;
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className={inputBaseClasses}
          aria-label={label || "Edit value"}
          aria-invalid={!!error}
        >
          {selProps.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    // text or number
    const numProps = fieldType === "number" ? (props as InlineEditNumberProps) : undefined;
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={fieldType}
        value={draft}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={saving}
        placeholder={placeholder}
        min={numProps?.min}
        max={numProps?.max}
        step={numProps?.step}
        className={inputBaseClasses}
        aria-label={label || "Edit value"}
        aria-invalid={!!error}
      />
    );
  }

  return (
    <div ref={wrapperRef} className={`inline-flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-xs font-medium text-neutral-500">{label}</span>
      )}
      <div className="flex items-start gap-1">
        <div className="flex-1 min-w-0">{renderInput()}</div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 pt-0.5">
          {saving ? (
            <span className="inline-flex items-center justify-center w-7 h-7 text-blue-500">
              <SpinnerIcon />
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center w-7 h-7 rounded text-green-600 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                aria-label="Save"
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center justify-center w-7 h-7 rounded text-red-500 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
                aria-label="Cancel"
              >
                <XIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline error message */}
      {error && (
        <p className="text-xs text-red-600 px-2" role="alert">
          {error}
        </p>
      )}

      {/* Keyboard hint */}
      {fieldType === "textarea" && (
        <p className="text-[10px] text-neutral-400 px-2">
          Ctrl+Enter to save, Escape to cancel
        </p>
      )}
    </div>
  );
}
