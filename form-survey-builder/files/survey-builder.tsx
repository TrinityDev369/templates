"use client";

import React, { useState, useCallback, useMemo } from "react";
import type { SurveyBuilderProps, SurveyConfig, Question, QuestionType } from "./types";
import {
  SurveyConfigSchema,
  generateId,
  createBlankQuestion,
  QUESTION_TYPE_LABELS,
} from "./types";
import { QuestionEditor } from "./question-editor";
import { SurveyPreview } from "./survey-preview";

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

function PlusIcon() {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function EyeIcon() {
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
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon() {
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
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </svg>
  );
}

function ClipboardIcon() {
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
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function AlertIcon() {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------

type BuilderTab = "build" | "preview" | "json";

// ---------------------------------------------------------------------------
// SurveyBuilder component
// ---------------------------------------------------------------------------

/**
 * Main survey builder component.
 *
 * Features:
 * - Add, remove, reorder questions with multiple types
 * - Configure labels, placeholders, required status, and options per question
 * - Live preview mode to test the survey
 * - Export survey configuration as validated JSON
 */
export function SurveyBuilder({
  initialConfig,
  onExport,
  className,
}: SurveyBuilderProps) {
  const [title, setTitle] = useState(initialConfig?.title ?? "Untitled Survey");
  const [description, setDescription] = useState(initialConfig?.description ?? "");
  const [questions, setQuestions] = useState<Question[]>(
    initialConfig?.questions ?? [],
  );
  const [activeTab, setActiveTab] = useState<BuilderTab>("build");
  const [exportErrors, setExportErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const surveyId = useMemo(
    () => initialConfig?.id ?? generateId(),
    [initialConfig?.id],
  );

  // Build the current config object
  const buildConfig = useCallback((): SurveyConfig => {
    const now = new Date().toISOString();
    return {
      id: surveyId,
      title,
      description: description || undefined,
      questions,
      createdAt: initialConfig?.createdAt ?? now,
      updatedAt: now,
    };
  }, [surveyId, title, description, questions, initialConfig?.createdAt]);

  // -----------------------------------------------------------------------
  // Question CRUD
  // -----------------------------------------------------------------------

  const addQuestion = useCallback((type: QuestionType = "text") => {
    setQuestions((prev) => [...prev, createBlankQuestion(type)]);
  }, []);

  const updateQuestion = useCallback((index: number, updated: Question) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)));
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveQuestion = useCallback((index: number, direction: -1 | 1) => {
    setQuestions((prev) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });
  }, []);

  // -----------------------------------------------------------------------
  // Export & validation
  // -----------------------------------------------------------------------

  const handleExport = useCallback(() => {
    const config = buildConfig();
    const result = SurveyConfigSchema.safeParse(config);

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      setExportErrors(messages);
      return;
    }

    setExportErrors([]);
    onExport?.(result.data);
  }, [buildConfig, onExport]);

  const handleCopyJson = useCallback(async () => {
    const config = buildConfig();
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the pre element text
    }
  }, [buildConfig]);

  // -----------------------------------------------------------------------
  // Current config for preview / JSON
  // -----------------------------------------------------------------------

  const currentConfig = useMemo(() => buildConfig(), [buildConfig]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const tabClasses = (tab: BuilderTab) =>
    `inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
      activeTab === tab
        ? "border-blue-600 text-blue-600 bg-white"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div className={`mx-auto max-w-4xl ${className ?? ""}`}>
      {/* Survey metadata */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Survey Title"
          className="w-full border-0 border-b-2 border-gray-200 bg-transparent pb-1 text-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="w-full border-0 border-b border-gray-100 bg-transparent pb-1 text-sm text-gray-600 placeholder:text-gray-300 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("build")}
          className={tabClasses("build")}
        >
          <PencilIcon />
          Build
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={tabClasses("preview")}
        >
          <EyeIcon />
          Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("json")}
          className={tabClasses("json")}
        >
          <ClipboardIcon />
          JSON
        </button>

        {/* Export button (always visible) */}
        <div className="ml-auto flex items-center gap-2 pb-1">
          <span className="text-xs text-gray-400">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <DownloadIcon />
            Export
          </button>
        </div>
      </div>

      {/* Export validation errors */}
      {exportErrors.length > 0 && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-red-500">
              <AlertIcon />
            </span>
            <div>
              <p className="text-sm font-medium text-red-800">
                Validation failed
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-red-700">
                {exportErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Build tab */}
      {activeTab === "build" && (
        <div className="space-y-4">
          {questions.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
              <p className="mb-1 text-sm font-medium text-gray-600">
                No questions yet
              </p>
              <p className="mb-4 text-xs text-gray-400">
                Add your first question to start building the survey.
              </p>
              <button
                type="button"
                onClick={() => addQuestion("text")}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <PlusIcon />
                Add Question
              </button>
            </div>
          )}

          {questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              total={questions.length}
              onUpdate={(updated) => updateQuestion(index, updated)}
              onRemove={() => removeQuestion(index)}
              onMoveUp={() => moveQuestion(index, -1)}
              onMoveDown={() => moveQuestion(index, 1)}
            />
          ))}

          {/* Add question toolbar */}
          {questions.length > 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Add Question
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addQuestion(type)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <PlusIcon />
                      {QUESTION_TYPE_LABELS[type]}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview tab */}
      {activeTab === "preview" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <SurveyPreview config={currentConfig} />
        </div>
      )}

      {/* JSON tab */}
      {activeTab === "json" && (
        <div className="relative rounded-lg border border-gray-200 bg-gray-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
            <span className="text-xs font-medium text-gray-400">
              survey-config.json
            </span>
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            >
              <ClipboardIcon />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-green-400">
            <code>{JSON.stringify(currentConfig, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
