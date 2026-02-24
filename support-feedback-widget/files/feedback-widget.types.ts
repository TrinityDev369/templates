/**
 * Type definitions for the FeedbackWidget component.
 *
 * @module feedback-widget.types
 */

/** Mood values representing user sentiment, ordered from most negative to most positive. */
export type FeedbackMood = "angry" | "sad" | "neutral" | "happy" | "thrilled";

/** Predefined feedback categories. */
export type FeedbackCategory = "bug" | "feature" | "question" | "other";

/** Label mapping for mood display. */
export const MOOD_LABELS: Record<FeedbackMood, string> = {
  angry: "Angry",
  sad: "Sad",
  neutral: "Neutral",
  happy: "Happy",
  thrilled: "Thrilled",
};

/** Label mapping for category display in the dropdown. */
export const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "Bug",
  feature: "Feature Request",
  question: "Question",
  other: "Other",
};

/** All available mood values in display order. */
export const MOODS: FeedbackMood[] = [
  "angry",
  "sad",
  "neutral",
  "happy",
  "thrilled",
];

/** All available category values in display order. */
export const CATEGORIES: FeedbackCategory[] = [
  "bug",
  "feature",
  "question",
  "other",
];

/**
 * Payload delivered to the onSubmit callback.
 * Contains user-provided feedback data plus auto-captured metadata.
 */
export interface FeedbackData {
  /** Selected mood. */
  mood: FeedbackMood;
  /** Selected category. */
  category: FeedbackCategory;
  /** Free-text feedback message. */
  message: string;
  /** Screenshot blob captured via html2canvas, or null if not taken. */
  screenshot: Blob | null;
  /** Auto-captured: the page URL where feedback was submitted. */
  url: string;
  /** Auto-captured: the browser user agent string. */
  userAgent: string;
  /** Auto-captured: ISO-8601 timestamp of submission. */
  timestamp: string;
}

/** Props for the FeedbackWidget component. */
export interface FeedbackWidgetProps {
  /**
   * Callback fired when the user submits feedback.
   * The consumer is responsible for persisting / sending the data.
   */
  onSubmit: (feedback: FeedbackData) => void | Promise<void>;

  /**
   * Optional additional CSS class names applied to the root container.
   * Merged via `cn()`.
   */
  className?: string;

  /**
   * Optional: a reference to html2canvas (or compatible function).
   * If provided, the screenshot capture button will be enabled.
   *
   * @example
   * ```tsx
   * import html2canvas from "html2canvas";
   * <FeedbackWidget onSubmit={handler} captureScreenshot={html2canvas} />
   * ```
   */
  captureScreenshot?: (
    element: HTMLElement,
    options?: Record<string, unknown>,
  ) => Promise<HTMLCanvasElement>;
}
