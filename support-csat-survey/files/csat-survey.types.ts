/** Rating value from 1 (very unsatisfied) to 5 (very satisfied). */
export type CsatRating = 1 | 2 | 3 | 4 | 5;

/** Payload delivered to the onSubmit callback. */
export interface CsatSubmitData {
  rating: CsatRating;
  feedback?: string;
}

/** Display variant controlling how the survey is rendered. */
export type CsatVariant = "inline" | "modal" | "toast";

/** Props accepted by the CsatSurvey component. */
export interface CsatSurveyProps {
  /**
   * The topic inserted into "How satisfied are you with [topic]?"
   * @default "our service"
   */
  topic?: string;

  /**
   * Override the entire question text. When provided, `topic` is ignored.
   */
  question?: string;

  /**
   * Display variant.
   * - `inline`  -- renders in normal document flow (default)
   * - `modal`   -- centered overlay with backdrop
   * - `toast`   -- fixed bottom-right floating card
   * @default "inline"
   */
  variant?: CsatVariant;

  /**
   * Whether the survey can be dismissed without submitting.
   * Applies to all variants.
   * @default true
   */
  dismissible?: boolean;

  /**
   * Called when the user submits a rating (and optional feedback).
   */
  onSubmit?: (data: CsatSubmitData) => void | Promise<void>;

  /**
   * Called when the user dismisses the survey without submitting.
   */
  onDismiss?: () => void;

  /** Additional class names merged onto the outermost element. */
  className?: string;
}

/** Metadata for a single rating option (used internally). */
export interface RatingOption {
  value: CsatRating;
  label: string;
  color: string;
  hoverColor: string;
}
