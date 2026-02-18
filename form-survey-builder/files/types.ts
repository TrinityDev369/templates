import { z } from "zod";

// ---------------------------------------------------------------------------
// Question type enum
// ---------------------------------------------------------------------------

export const QuestionTypeSchema = z.enum([
  "text",
  "textarea",
  "select",
  "radio",
  "checkbox",
  "number",
  "email",
]);

export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// ---------------------------------------------------------------------------
// Option — used by select, radio, checkbox
// ---------------------------------------------------------------------------

export const OptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Option label is required"),
});

export type Option = z.infer<typeof OptionSchema>;

// ---------------------------------------------------------------------------
// Question configuration
// ---------------------------------------------------------------------------

export const QuestionSchema = z
  .object({
    id: z.string().min(1),
    type: QuestionTypeSchema,
    label: z.string().min(1, "Question label is required"),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(OptionSchema).optional(),
  })
  .refine(
    (q) => {
      const needsOptions: QuestionType[] = ["select", "radio", "checkbox"];
      if (needsOptions.includes(q.type)) {
        return q.options !== undefined && q.options.length > 0;
      }
      return true;
    },
    {
      message: "Select, radio, and checkbox questions require at least one option",
      path: ["options"],
    },
  );

export type Question = z.infer<typeof QuestionSchema>;

// ---------------------------------------------------------------------------
// Survey configuration (the full exportable config)
// ---------------------------------------------------------------------------

export const SurveyConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Survey title is required"),
  description: z.string().optional(),
  questions: z.array(QuestionSchema).min(1, "At least one question is required"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SurveyConfig = z.infer<typeof SurveyConfigSchema>;

// ---------------------------------------------------------------------------
// Builder props
// ---------------------------------------------------------------------------

export interface SurveyBuilderProps {
  /** Initial survey configuration to load into the builder */
  initialConfig?: SurveyConfig;
  /** Callback fired when the user exports the survey configuration */
  onExport?: (config: SurveyConfig) => void;
  /** Optional CSS class name applied to the root container */
  className?: string;
}

// ---------------------------------------------------------------------------
// Survey preview / renderer props
// ---------------------------------------------------------------------------

export interface SurveyPreviewProps {
  /** The survey configuration to render */
  config: SurveyConfig;
  /** Optional CSS class name applied to the root container */
  className?: string;
}

export interface QuestionRendererProps {
  /** The question to render */
  question: Question;
  /** Current value for this question */
  value: string | string[];
  /** Change handler */
  onChange: (value: string | string[]) => void;
  /** Validation error message, if any */
  error?: string;
}

// ---------------------------------------------------------------------------
// Question editor props
// ---------------------------------------------------------------------------

export interface QuestionEditorProps {
  /** The question being edited */
  question: Question;
  /** Index position in the survey (for display) */
  index: number;
  /** Total number of questions (for move button state) */
  total: number;
  /** Called when the question is updated */
  onUpdate: (updated: Question) => void;
  /** Called when the question should be removed */
  onRemove: () => void;
  /** Called when the question should move up */
  onMoveUp: () => void;
  /** Called when the question should move down */
  onMoveDown: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Human-readable label for a question type */
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Short Text",
  textarea: "Long Text",
  select: "Dropdown",
  radio: "Radio Buttons",
  checkbox: "Checkboxes",
  number: "Number",
  email: "Email",
};

/** Question types that require options */
export const OPTION_QUESTION_TYPES: QuestionType[] = ["select", "radio", "checkbox"];

/** Create a blank question with sensible defaults */
export function createBlankQuestion(type: QuestionType = "text"): Question {
  const base: Question = {
    id: generateId(),
    type,
    label: "",
    placeholder: "",
    required: false,
  };

  if (OPTION_QUESTION_TYPES.includes(type)) {
    base.options = [{ id: generateId(), label: "" }];
  }

  return base;
}
