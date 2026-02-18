"use client";

import React from "react";
import type { QuestionEditorProps, QuestionType, Option } from "./types";
import {
  QUESTION_TYPE_LABELS,
  OPTION_QUESTION_TYPES,
  generateId,
} from "./types";

// ---------------------------------------------------------------------------
// Inline SVG icons (no external icon library)
// ---------------------------------------------------------------------------

function ChevronUpIcon() {
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
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronDownIcon() {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function GripIcon() {
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
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// QuestionEditor component
// ---------------------------------------------------------------------------

/**
 * Configuration panel for a single survey question.
 * Allows editing label, placeholder, type, required status, and options.
 */
export function QuestionEditor({
  question,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: QuestionEditorProps) {
  const needsOptions = OPTION_QUESTION_TYPES.includes(question.type);

  const handleTypeChange = (newType: QuestionType) => {
    const updated = { ...question, type: newType };

    // Add default options when switching to a type that needs them
    if (OPTION_QUESTION_TYPES.includes(newType) && (!updated.options || updated.options.length === 0)) {
      updated.options = [{ id: generateId(), label: "" }];
    }

    // Remove options when switching away from option-based types
    if (!OPTION_QUESTION_TYPES.includes(newType)) {
      updated.options = undefined;
    }

    onUpdate(updated);
  };

  const handleOptionUpdate = (optionIndex: number, label: string) => {
    const options = [...(question.options || [])];
    options[optionIndex] = { ...options[optionIndex], label };
    onUpdate({ ...question, options });
  };

  const handleOptionAdd = () => {
    const options = [...(question.options || []), { id: generateId(), label: "" }];
    onUpdate({ ...question, options });
  };

  const handleOptionRemove = (optionIndex: number) => {
    const options = (question.options || []).filter((_, i) => i !== optionIndex);
    onUpdate({ ...question, options });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 rounded-t-lg">
        <span className="text-gray-400">
          <GripIcon />
        </span>
        <span className="text-xs font-medium text-gray-500">
          Question {index + 1}
        </span>
        <span className="text-xs text-gray-400">
          {QUESTION_TYPE_LABELS[question.type]}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Move question up"
            title="Move up"
          >
            <ChevronUpIcon />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Move question down"
            title="Move down"
          >
            <ChevronDownIcon />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
            aria-label="Remove question"
            title="Remove"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 p-4">
        {/* Row: Label + Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Question Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={question.label}
              onChange={(e) => onUpdate({ ...question, label: e.target.value })}
              placeholder="Enter your question..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Question Type
            </label>
            <select
              value={question.type}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                <option key={type} value={type}>
                  {QUESTION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Placeholder */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Placeholder Text
          </label>
          <input
            type="text"
            value={question.placeholder || ""}
            onChange={(e) =>
              onUpdate({ ...question, placeholder: e.target.value || undefined })
            }
            placeholder="Optional placeholder text..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Required toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) =>
              onUpdate({ ...question, required: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Required</span>
        </label>

        {/* Options (for select, radio, checkbox) */}
        {needsOptions && (
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Options <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {(question.options || []).map((opt: Option, i: number) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 text-right shrink-0">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionUpdate(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleOptionRemove(i)}
                    disabled={(question.options || []).length <= 1}
                    className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Remove option ${i + 1}`}
                    title="Remove option"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleOptionAdd}
              className="mt-2 inline-flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600"
            >
              <PlusIcon />
              Add Option
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
