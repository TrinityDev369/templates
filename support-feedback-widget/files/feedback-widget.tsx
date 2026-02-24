"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FeedbackCategory,
  FeedbackMood,
  FeedbackWidgetProps,
} from "./feedback-widget.types";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  MOOD_LABELS,
  MOODS,
} from "./feedback-widget.types";

/* ---------------------------------------------------------------------------
 * Mood Face SVGs
 *
 * Each mood is drawn as a 32x32 SVG circle with simple facial expressions
 * rendered via SVG paths/elements. No unicode emojis.
 * --------------------------------------------------------------------------- */

const MOOD_COLORS: Record<FeedbackMood, string> = {
  angry: "#EF4444",
  sad: "#3B82F6",
  neutral: "#A3A3A3",
  happy: "#F59E0B",
  thrilled: "#22C55E",
};

function MoodFace({ mood }: { mood: FeedbackMood }) {
  const color = MOOD_COLORS[mood];

  const renderExpression = () => {
    switch (mood) {
      case "angry":
        return (
          <>
            {/* Angry eyebrows */}
            <line
              x1="8"
              y1="11"
              x2="12"
              y2="13"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="24"
              y1="11"
              x2="20"
              y2="13"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Eyes */}
            <circle cx="11" cy="15" r="1.5" fill="#fff" />
            <circle cx="21" cy="15" r="1.5" fill="#fff" />
            {/* Frown */}
            <path
              d="M10 23 Q16 19 22 23"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        );
      case "sad":
        return (
          <>
            {/* Eyes */}
            <circle cx="11" cy="14" r="1.5" fill="#fff" />
            <circle cx="21" cy="14" r="1.5" fill="#fff" />
            {/* Slight frown */}
            <path
              d="M11 22 Q16 19 21 22"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        );
      case "neutral":
        return (
          <>
            {/* Eyes */}
            <circle cx="11" cy="14" r="1.5" fill="#fff" />
            <circle cx="21" cy="14" r="1.5" fill="#fff" />
            {/* Straight mouth */}
            <line
              x1="11"
              y1="21"
              x2="21"
              y2="21"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        );
      case "happy":
        return (
          <>
            {/* Eyes */}
            <circle cx="11" cy="14" r="1.5" fill="#fff" />
            <circle cx="21" cy="14" r="1.5" fill="#fff" />
            {/* Smile */}
            <path
              d="M11 20 Q16 25 21 20"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        );
      case "thrilled":
        return (
          <>
            {/* Happy squinting eyes (arcs) */}
            <path
              d="M8 13 Q11 10 14 13"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M18 13 Q21 10 24 13"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Big open smile */}
            <path
              d="M9 19 Q16 27 23 19"
              fill="#fff"
              stroke="#fff"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </>
        );
    }
  };

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" fill={color} />
      {renderExpression()}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Submission states
 * --------------------------------------------------------------------------- */

type WidgetView = "closed" | "form" | "success";

/* ---------------------------------------------------------------------------
 * FeedbackWidget
 * --------------------------------------------------------------------------- */

export function FeedbackWidget({
  onSubmit,
  className,
  captureScreenshot,
}: FeedbackWidgetProps) {
  const [view, setView] = useState<WidgetView>("closed");
  const [mood, setMood] = useState<FeedbackMood | null>(null);
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<Blob | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---- Close panel on outside click ---- */
  useEffect(() => {
    if (view !== "form") return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setView("closed");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [view]);

  /* ---- Close dropdown on outside click ---- */
  useEffect(() => {
    if (!dropdownOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  /* ---- Revoke screenshot object URL on cleanup ---- */
  useEffect(() => {
    return () => {
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    };
  }, [screenshotUrl]);

  /* ---- Reset form state ---- */
  const resetForm = useCallback(() => {
    setMood(null);
    setCategory("bug");
    setMessage("");
    setScreenshot(null);
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl);
      setScreenshotUrl(null);
    }
    setIsSubmitting(false);
    setIsCapturing(false);
    setDropdownOpen(false);
  }, [screenshotUrl]);

  /* ---- Open / close ---- */
  const handleToggle = () => {
    if (view === "closed") {
      setView("form");
    } else {
      setView("closed");
      resetForm();
    }
  };

  /* ---- Screenshot capture ---- */
  const handleCapture = async () => {
    if (!captureScreenshot) return;
    setIsCapturing(true);
    try {
      // Temporarily hide the widget so it doesn't appear in the screenshot
      const widgetRoot = panelRef.current?.parentElement;
      if (widgetRoot) widgetRoot.style.visibility = "hidden";

      const canvas = await captureScreenshot(document.body, {
        useCORS: true,
        logging: false,
      });

      if (widgetRoot) widgetRoot.style.visibility = "visible";

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );

      if (blob) {
        // Revoke previous URL if any
        if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
        setScreenshot(blob);
        setScreenshotUrl(URL.createObjectURL(blob));
      }
    } catch {
      // Restore visibility on error
      const widgetRoot = panelRef.current?.parentElement;
      if (widgetRoot) widgetRoot.style.visibility = "visible";
    } finally {
      setIsCapturing(false);
    }
  };

  /* ---- Remove screenshot ---- */
  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl);
      setScreenshotUrl(null);
    }
  };

  /* ---- Submit ---- */
  const handleSubmit = async () => {
    if (!mood || !message.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        mood,
        category,
        message: message.trim(),
        screenshot,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      resetForm();
      setView("success");
      // Auto-close after 2.5 seconds
      setTimeout(() => setView("closed"), 2500);
    } catch {
      setIsSubmitting(false);
    }
  };

  const canSubmit = mood !== null && message.trim().length > 0 && !isSubmitting;

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* ---- Feedback Panel ---- */}
      {view === "form" && (
        <div
          ref={panelRef}
          className={cn(
            "mb-3 w-80 rounded-xl border border-neutral-200 bg-white shadow-2xl",
            "dark:border-neutral-700 dark:bg-neutral-900",
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b border-neutral-200 px-4 py-3",
              "dark:border-neutral-700",
            )}
          >
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Send Feedback
            </h3>
            <button
              type="button"
              onClick={handleToggle}
              className={cn(
                "rounded-md p-1 text-neutral-400 transition-colors",
                "hover:bg-neutral-100 hover:text-neutral-600",
                "dark:hover:bg-neutral-800 dark:hover:text-neutral-300",
              )}
              aria-label="Close feedback"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 p-4">
            {/* Mood Selector */}
            <div>
              <label className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                How are you feeling?
              </label>
              <div className="flex items-center justify-between gap-1">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={cn(
                      "group flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all",
                      mood === m
                        ? "bg-neutral-100 ring-2 ring-neutral-900 dark:bg-neutral-800 dark:ring-neutral-100"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                    )}
                    aria-label={MOOD_LABELS[m]}
                    aria-pressed={mood === m}
                  >
                    <MoodFace mood={m} />
                    <span
                      className={cn(
                        "text-[10px] leading-none",
                        mood === m
                          ? "font-medium text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300",
                      )}
                    >
                      {MOOD_LABELS[m]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Dropdown */}
            <div ref={dropdownRef} className="relative">
              <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Category
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm transition-colors",
                  "hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900",
                  "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600 dark:focus:ring-neutral-100",
                )}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                <span>{CATEGORY_LABELS[category]}</span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-neutral-400 transition-transform",
                    dropdownOpen && "rotate-180",
                  )}
                />
              </button>
              {dropdownOpen && (
                <ul
                  role="listbox"
                  className={cn(
                    "absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg",
                    "dark:border-neutral-700 dark:bg-neutral-800",
                  )}
                >
                  {CATEGORIES.map((cat) => (
                    <li
                      key={cat}
                      role="option"
                      aria-selected={category === cat}
                      className={cn(
                        "cursor-pointer px-3 py-2 text-sm transition-colors",
                        category === cat
                          ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
                          : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700/50",
                      )}
                      onClick={() => {
                        setCategory(cat);
                        setDropdownOpen(false);
                      }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                rows={3}
                className={cn(
                  "w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm placeholder:text-neutral-400",
                  "focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900",
                  "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:ring-neutral-100",
                )}
              />
            </div>

            {/* Screenshot */}
            <div className="flex items-center gap-2">
              {captureScreenshot && (
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors",
                    "hover:border-neutral-300 hover:text-neutral-800",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200",
                  )}
                  aria-label="Capture screenshot"
                >
                  <Camera size={14} />
                  {isCapturing ? "Capturing..." : "Screenshot"}
                </button>
              )}

              {/* Screenshot Preview */}
              {screenshotUrl && (
                <div className="group relative">
                  <img
                    src={screenshotUrl}
                    alt="Screenshot preview"
                    className="h-10 w-16 rounded border border-neutral-200 object-cover dark:border-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className={cn(
                      "absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity",
                      "group-hover:opacity-100",
                    )}
                    aria-label="Remove screenshot"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
                canSubmit
                  ? "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                  : "cursor-not-allowed bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-500",
              )}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---- Success Confirmation ---- */}
      {view === "success" && (
        <div
          className={cn(
            "mb-3 flex w-80 flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl",
            "dark:border-neutral-700 dark:bg-neutral-900",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Thank you for your feedback!
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            We appreciate you taking the time.
          </p>
        </div>
      )}

      {/* ---- Floating Trigger Button ---- */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "ml-auto flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all",
          view === "closed"
            ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600",
        )}
        aria-label={view === "closed" ? "Open feedback" : "Close feedback"}
      >
        {view === "closed" ? (
          <MessageSquare size={20} />
        ) : (
          <X size={20} />
        )}
      </button>
    </div>
  );
}
