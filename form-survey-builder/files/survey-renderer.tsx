"use client";

import React from "react";
import type { QuestionRendererProps } from "./types";

/**
 * Renders an individual survey question based on its type.
 * Handles text, textarea, select, radio, checkbox, number, and email inputs.
 */
export function SurveyRenderer({
  question,
  value,
  onChange,
  error,
}: QuestionRendererProps) {
  const inputId = `q-${question.id}`;
  const errorId = `err-${question.id}`;

  const baseInputClasses =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
    "placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  const errorInputClasses =
    "w-full rounded-md border border-red-400 bg-white px-3 py-2 text-sm text-gray-900 " +
    "placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20";

  const inputClasses = error ? errorInputClasses : baseInputClasses;

  const renderLabel = () => (
    <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
      {question.label}
      {question.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  const renderError = () =>
    error ? (
      <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
        {error}
      </p>
    ) : null;

  const stringValue = typeof value === "string" ? value : "";
  const arrayValue = Array.isArray(value) ? value : [];

  switch (question.type) {
    case "text":
      return (
        <div>
          {renderLabel()}
          <input
            id={inputId}
            type="text"
            className={inputClasses}
            placeholder={question.placeholder}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          {renderError()}
        </div>
      );

    case "textarea":
      return (
        <div>
          {renderLabel()}
          <textarea
            id={inputId}
            className={inputClasses + " min-h-[80px] resize-y"}
            placeholder={question.placeholder}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            rows={4}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          {renderError()}
        </div>
      );

    case "number":
      return (
        <div>
          {renderLabel()}
          <input
            id={inputId}
            type="number"
            className={inputClasses}
            placeholder={question.placeholder}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          {renderError()}
        </div>
      );

    case "email":
      return (
        <div>
          {renderLabel()}
          <input
            id={inputId}
            type="email"
            className={inputClasses}
            placeholder={question.placeholder || "name@example.com"}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
          {renderError()}
        </div>
      );

    case "select":
      return (
        <div>
          {renderLabel()}
          <select
            id={inputId}
            className={inputClasses + " appearance-none"}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          >
            <option value="">{question.placeholder || "Select an option..."}</option>
            {question.options?.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {renderError()}
        </div>
      );

    case "radio":
      return (
        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-gray-700">
            {question.label}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </legend>
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name={inputId}
                  value={opt.id}
                  checked={stringValue === opt.id}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {renderError()}
        </fieldset>
      );

    case "checkbox":
      return (
        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-gray-700">
            {question.label}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </legend>
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  value={opt.id}
                  checked={arrayValue.includes(opt.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...arrayValue, opt.id]);
                    } else {
                      onChange(arrayValue.filter((v) => v !== opt.id));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {renderError()}
        </fieldset>
      );

    default: {
      const _exhaustive: never = question.type;
      return (
        <div className="text-sm text-gray-500">
          Unknown question type: {_exhaustive}
        </div>
      );
    }
  }
}
