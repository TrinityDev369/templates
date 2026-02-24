/** NPS score categories derived from Net Promoter Score methodology. */
export type NpsCategory = "detractor" | "passive" | "promoter";

/** Display variant for the NPS survey component. */
export type NpsSurveyVariant = "inline" | "modal" | "banner";

/** Internal step tracking for the multi-step survey flow. */
export type NpsSurveyStep = "score" | "feedback" | "thanks";

/** Data payload returned when the user completes the survey. */
export interface NpsSurveyResult {
  score: number;
  feedback: string;
}

/** Props for the NpsSurvey component. */
export interface NpsSurveyProps {
  /**
   * How the survey is rendered.
   * - `inline` (default): renders in normal document flow
   * - `modal`: centered overlay with backdrop
   * - `banner`: fixed bar at the bottom of the viewport
   */
  variant?: NpsSurveyVariant;

  /**
   * Called when the user submits a completed survey (score + optional feedback).
   */
  onSubmit: (data: NpsSurveyResult) => void;

  /**
   * Called when the user dismisses the survey without completing it,
   * or closes it after the thank-you screen.
   */
  onDismiss: () => void;

  /** Additional CSS class names applied to the outermost wrapper. */
  className?: string;
}

/**
 * Determine the NPS category for a given score.
 * - 0-6: Detractor
 * - 7-8: Passive
 * - 9-10: Promoter
 */
export function getNpsCategory(score: number): NpsCategory {
  if (score <= 6) return "detractor";
  if (score <= 8) return "passive";
  return "promoter";
}

/** Follow-up prompts displayed based on the respondent's NPS category. */
export const FEEDBACK_PROMPTS: Record<NpsCategory, string> = {
  detractor: "What could we improve?",
  passive: "What would make you rate us higher?",
  promoter: "What do you love most about us?",
};
