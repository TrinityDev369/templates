"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  NpsCategory,
  NpsSurveyProps,
  NpsSurveyStep,
} from "./nps-survey.types";
import { FEEDBACK_PROMPTS, getNpsCategory } from "./nps-survey.types";

/* -------------------------------------------------------------------------- */
/*  Score button colors by NPS category                                       */
/* -------------------------------------------------------------------------- */

function scoreColorClasses(
  value: number,
  isSelected: boolean,
): string {
  const category = getNpsCategory(value);
  if (!isSelected) {
    const hoverMap: Record<NpsCategory, string> = {
      detractor: "hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400",
      passive: "hover:bg-yellow-100 hover:text-yellow-700 dark:hover:bg-yellow-950 dark:hover:text-yellow-400",
      promoter: "hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-400",
    };
    return cn(
      "bg-muted text-muted-foreground",
      hoverMap[category],
    );
  }

  const selectedMap: Record<NpsCategory, string> = {
    detractor: "bg-red-600 text-white ring-2 ring-red-600/30",
    passive: "bg-yellow-500 text-white ring-2 ring-yellow-500/30",
    promoter: "bg-green-600 text-white ring-2 ring-green-600/30",
  };
  return selectedMap[category];
}

/* -------------------------------------------------------------------------- */
/*  NpsSurvey component                                                       */
/* -------------------------------------------------------------------------- */

export function NpsSurvey({
  variant = "inline",
  onSubmit,
  onDismiss,
  className,
}: NpsSurveyProps) {
  const [step, setStep] = useState<NpsSurveyStep>("score");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-focus the textarea when we enter the feedback step */
  useEffect(() => {
    if (step === "feedback") {
      textareaRef.current?.focus();
    }
  }, [step]);

  /* Auto-dismiss the thank-you screen after 3 seconds */
  useEffect(() => {
    if (step !== "thanks") return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [step, onDismiss]);

  const handleScoreClick = useCallback((value: number) => {
    setScore(value);
    setStep("feedback");
  }, []);

  const handleSubmit = useCallback(() => {
    if (score === null) return;
    onSubmit({ score, feedback: feedback.trim() });
    setStep("thanks");
  }, [score, feedback, onSubmit]);

  const category = score !== null ? getNpsCategory(score) : null;

  /* ---- Render sub-steps ------------------------------------------------- */

  const scoreStep = (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-foreground text-center">
        How likely are you to recommend us?
      </p>

      {/* Number buttons 0-10 */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleScoreClick(i)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold",
              "transition-all duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              scoreColorClasses(i, score === i),
            )}
            aria-label={`Score ${i}`}
          >
            {i}
          </button>
        ))}
      </div>

      {/* Scale labels */}
      <div className="flex w-full justify-between px-1">
        <span className="text-xs text-muted-foreground">Not at all likely</span>
        <span className="text-xs text-muted-foreground">Extremely likely</span>
      </div>
    </div>
  );

  const feedbackStep = category !== null && (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-foreground text-center">
        {FEEDBACK_PROMPTS[category]}
      </p>

      <textarea
        ref={textareaRef}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        placeholder="Your feedback (optional)..."
        className={cn(
          "w-full resize-none rounded-md border border-input bg-background px-3 py-2",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      />

      <button
        type="button"
        onClick={handleSubmit}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-4 py-2",
          "bg-primary text-primary-foreground text-sm font-medium",
          "transition-colors hover:bg-primary/90 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <Send className="h-4 w-4" />
        Submit
      </button>
    </div>
  );

  const thanksStep = (
    <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <p className="text-sm font-medium text-foreground">
        Thank you for your feedback!
      </p>
    </div>
  );

  /* ---- Content panel ---------------------------------------------------- */

  const content = (
    <div className="relative flex flex-col gap-2 p-4">
      {/* Dismiss button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss survey"
        className={cn(
          "absolute right-2 top-2 rounded-sm p-1 opacity-70",
          "transition-opacity hover:opacity-100 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <X className="h-4 w-4" />
      </button>

      {step === "score" && scoreStep}
      {step === "feedback" && feedbackStep}
      {step === "thanks" && thanksStep}
    </div>
  );

  /* ---- Variant wrappers ------------------------------------------------- */

  if (variant === "modal") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onDismiss();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="NPS Survey"
      >
        <div
          className={cn(
            "w-full max-w-md rounded-lg border bg-card shadow-lg animate-in fade-in zoom-in-95 duration-200",
            className,
          )}
        >
          {content}
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t bg-card shadow-lg",
          "animate-in slide-in-from-bottom duration-300",
          className,
        )}
        role="region"
        aria-label="NPS Survey"
      >
        {content}
      </div>
    );
  }

  /* inline (default) */
  return (
    <div
      className={cn(
        "w-full rounded-lg border bg-card shadow-sm",
        className,
      )}
      role="region"
      aria-label="NPS Survey"
    >
      {content}
    </div>
  );
}
