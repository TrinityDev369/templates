"use client";

import React, { useState, useCallback } from "react";
import type { SurveyPreviewProps, Question } from "./types";
import { SurveyRenderer } from "./survey-renderer";

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

function CheckCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SurveyPreview component
// ---------------------------------------------------------------------------

/**
 * Renders a live preview of the survey, allowing users to fill it in
 * and validate their responses. Useful for testing the survey before export.
 */
export function SurveyPreview({ config, className }: SurveyPreviewProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback(
    (questionId: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      // Clear error on change
      setErrors((prev) => {
        if (prev[questionId]) {
          const next = { ...prev };
          delete next[questionId];
          return next;
        }
        return prev;
      });
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    for (const question of config.questions) {
      const answer = answers[question.id];

      if (question.required) {
        const isEmpty =
          answer === undefined ||
          answer === "" ||
          (Array.isArray(answer) && answer.length === 0);

        if (isEmpty) {
          newErrors[question.id] = "This field is required";
          continue;
        }
      }

      // Type-specific validation
      if (answer && typeof answer === "string" && answer.length > 0) {
        if (question.type === "email") {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(answer)) {
            newErrors[question.id] = "Please enter a valid email address";
          }
        }

        if (question.type === "number" && isNaN(Number(answer))) {
          newErrors[question.id] = "Please enter a valid number";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [answers, config.questions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setErrors({});
    setSubmitted(false);
  };

  if (config.questions.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No questions yet. Add questions in the builder to see a preview.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircleIcon />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-green-800">
            Survey Submitted
          </h3>
          <p className="mb-4 text-sm text-green-700">
            Preview responses captured successfully.
          </p>

          {/* Show captured answers */}
          <div className="mx-auto max-w-md text-left">
            <div className="rounded-md border border-green-200 bg-white p-4">
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Responses
              </h4>
              <dl className="space-y-2 text-sm">
                {config.questions.map((q: Question) => {
                  const answer = answers[q.id];
                  const displayValue = Array.isArray(answer)
                    ? answer
                        .map((id) => q.options?.find((o) => o.id === id)?.label || id)
                        .join(", ")
                    : q.type === "radio" || q.type === "select"
                      ? q.options?.find((o) => o.id === answer)?.label || answer || "-"
                      : answer || "-";

                  return (
                    <div key={q.id}>
                      <dt className="font-medium text-gray-700">{q.label}</dt>
                      <dd className="text-gray-500">{displayValue}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <ResetIcon />
            Reset Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} noValidate>
        {/* Survey header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
          {config.description && (
            <p className="mt-1 text-sm text-gray-600">{config.description}</p>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {config.questions.map((question: Question) => (
            <SurveyRenderer
              key={question.id}
              question={question}
              value={answers[question.id] ?? (question.type === "checkbox" ? [] : "")}
              onChange={(val) => handleChange(question.id, val)}
              error={errors[question.id]}
            />
          ))}
        </div>

        {/* Submit / Reset */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Submit Preview
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300/50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
