"use client";

import { useCallback, useState } from "react";
import { Check, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CsatRating,
  CsatSurveyProps,
  RatingOption,
} from "./csat-survey.types";

/* ---------------------------------------------------------------------------
 * Rating option metadata
 * --------------------------------------------------------------------------- */

const RATING_OPTIONS: RatingOption[] = [
  { value: 1, label: "Very Unsatisfied", color: "#ef4444", hoverColor: "#dc2626" },
  { value: 2, label: "Unsatisfied", color: "#f97316", hoverColor: "#ea580c" },
  { value: 3, label: "Neutral", color: "#eab308", hoverColor: "#ca8a04" },
  { value: 4, label: "Satisfied", color: "#22c55e", hoverColor: "#16a34a" },
  { value: 5, label: "Very Satisfied", color: "#10b981", hoverColor: "#059669" },
];

/* ---------------------------------------------------------------------------
 * SVG emoji faces (inline, no unicode)
 * Each face is a 40x40 circle with drawn eyes + mouth expression.
 * --------------------------------------------------------------------------- */

function FaceSvg({
  rating,
  color,
  size = 40,
}: {
  rating: CsatRating;
  color: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  // Eye positions relative to center
  const eyeLeftX = cx - r * 0.3;
  const eyeRightX = cx + r * 0.3;
  const eyeY = cy - r * 0.15;
  const eyeR = r * 0.08;

  // Mouth geometry
  const mouthY = cy + r * 0.25;
  const mouthWidth = r * 0.5;

  function renderMouth() {
    switch (rating) {
      case 1:
        // Deep frown
        return (
          <path
            d={`M ${cx - mouthWidth} ${mouthY + 4} Q ${cx} ${mouthY - 8}, ${cx + mouthWidth} ${mouthY + 4}`}
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      case 2:
        // Slight frown
        return (
          <path
            d={`M ${cx - mouthWidth} ${mouthY + 2} Q ${cx} ${mouthY - 4}, ${cx + mouthWidth} ${mouthY + 2}`}
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      case 3:
        // Flat line
        return (
          <line
            x1={cx - mouthWidth}
            y1={mouthY}
            x2={cx + mouthWidth}
            y2={mouthY}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      case 4:
        // Slight smile
        return (
          <path
            d={`M ${cx - mouthWidth} ${mouthY - 2} Q ${cx} ${mouthY + 5}, ${cx + mouthWidth} ${mouthY - 2}`}
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      case 5:
        // Big grin
        return (
          <path
            d={`M ${cx - mouthWidth} ${mouthY - 3} Q ${cx} ${mouthY + 10}, ${cx + mouthWidth} ${mouthY - 3}`}
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        );
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Face circle */}
      <circle cx={cx} cy={cy} r={r} fill={color} />
      {/* Left eye */}
      <circle cx={eyeLeftX} cy={eyeY} r={eyeR} fill="white" />
      {/* Right eye */}
      <circle cx={eyeRightX} cy={eyeY} r={eyeR} fill="white" />
      {/* Mouth */}
      {renderMouth()}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Main component
 * --------------------------------------------------------------------------- */

export function CsatSurvey({
  topic = "our service",
  question,
  variant = "inline",
  dismissible = true,
  onSubmit,
  onDismiss,
  className,
}: CsatSurveyProps) {
  const [selectedRating, setSelectedRating] = useState<CsatRating | null>(null);
  const [hoveredRating, setHoveredRating] = useState<CsatRating | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const questionText = question ?? `How satisfied are you with ${topic}?`;

  const handleSubmit = useCallback(async () => {
    if (!selectedRating || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.({
        rating: selectedRating,
        feedback: feedback.trim() || undefined,
      });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRating, feedback, isSubmitting, onSubmit]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  // ---- Hidden when dismissed ----
  if (isDismissed) return null;

  // ---- Thank-you state ----
  const thankYouContent = (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-gray-900">Thank you for your feedback!</p>
      <p className="text-xs text-gray-500">Your response helps us improve.</p>
    </div>
  );

  // ---- Survey form ----
  const surveyContent = (
    <div className="flex flex-col gap-4">
      {/* Question */}
      <p className="text-sm font-medium text-gray-900">{questionText}</p>

      {/* Rating faces */}
      <div className="flex items-center justify-between gap-2">
        {RATING_OPTIONS.map((opt) => {
          const isSelected = selectedRating === opt.value;
          const isHovered = hoveredRating === opt.value;
          const displayColor = isSelected || isHovered ? opt.hoverColor : opt.color;

          return (
            <button
              key={opt.value}
              type="button"
              aria-label={opt.label}
              onClick={() => setSelectedRating(opt.value)}
              onMouseEnter={() => setHoveredRating(opt.value)}
              onMouseLeave={() => setHoveredRating(null)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-2 transition-all",
                "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
                isSelected && "bg-gray-100 ring-2 ring-gray-300"
              )}
            >
              <FaceSvg rating={opt.value} color={displayColor} />
              <span className="text-[10px] leading-tight text-gray-500">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Follow-up textarea (shown after selecting a rating) */}
      {selectedRating !== null && (
        <div className="flex flex-col gap-2">
          <label htmlFor="csat-feedback" className="text-xs text-gray-500">
            Anything else you&apos;d like to share? (optional)
          </label>
          <textarea
            id="csat-feedback"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more..."
            className={cn(
              "w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
              "placeholder:text-gray-400",
              "focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            )}
          />
        </div>
      )}

      {/* Submit button */}
      {selectedRating !== null && (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors",
            "bg-gray-900 hover:bg-gray-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit
            </>
          )}
        </button>
      )}
    </div>
  );

  const body = isSubmitted ? thankYouContent : surveyContent;

  // ---- Dismiss button ----
  const dismissButton = dismissible && (
    <button
      type="button"
      onClick={handleDismiss}
      aria-label="Dismiss survey"
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-gray-400 transition-colors",
        "hover:bg-gray-100 hover:text-gray-600",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
      )}
    >
      <X className="h-4 w-4" />
    </button>
  );

  // ---- Card wrapper (shared across variants) ----
  const card = (
    <div
      className={cn(
        "relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        variant === "toast" && "w-80",
        variant === "modal" && "w-full max-w-md",
        variant === "inline" && "w-full",
        className
      )}
    >
      {dismissButton}
      {body}
    </div>
  );

  // ---- Variant wrappers ----
  if (variant === "modal") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Customer satisfaction survey"
      >
        {card}
      </div>
    );
  }

  if (variant === "toast") {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
        role="complementary"
        aria-label="Customer satisfaction survey"
      >
        {card}
      </div>
    );
  }

  // variant === "inline"
  return card;
}
