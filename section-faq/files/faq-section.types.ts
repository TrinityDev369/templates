/**
 * Type definitions for the FaqSection component.
 *
 * FaqItem represents a single question/answer entry.
 * FaqSectionProps defines the full section configuration including
 * optional category-based tab filtering.
 */

/** A single FAQ entry with a question, answer, and optional category for filtering. */
export interface FaqItem {
  /** The question text displayed as the accordion trigger. */
  question: string;
  /** The answer text revealed when the accordion item is expanded. */
  answer: string;
  /** Optional category used for tab-based filtering. Must match a value in the categories array. */
  category?: string;
}

/** Props for the FaqSection component. */
export interface FaqSectionProps {
  /** Optional section heading displayed above the accordion. */
  title?: string;
  /** Optional description paragraph rendered below the heading. */
  description?: string;
  /** Array of FAQ items to display as accordion entries. */
  items: FaqItem[];
  /** Optional array of category labels for tab filtering. When provided, a tab bar is rendered above the accordion with an "All" tab prepended. */
  categories?: string[];
  /** Additional CSS classes applied to the root section element. */
  className?: string;
}
