// ---------------------------------------------------------------------------
// CTA Section - Type Definitions
// ---------------------------------------------------------------------------

/**
 * Background variant for the CTA section.
 *
 * - `"dark"`  -- Dark background (bg-primary) with light text. Default.
 * - `"brand"` -- Gradient background for brand emphasis.
 * - `"light"` -- Muted/light background with dark text.
 */
export type CtaSectionVariant = "dark" | "brand" | "light";

/**
 * A single call-to-action button descriptor.
 */
export interface CtaAction {
  /** Visible button label. */
  label: string;
  /** Navigation target (passed to an anchor or Next.js Link). */
  href: string;
  /** Optional click handler fired alongside navigation. */
  onClick?: () => void;
}

/**
 * Props accepted by the `<CtaSection>` component.
 */
export interface CtaSectionProps {
  /** Background / colour variant. @default "dark" */
  variant?: CtaSectionVariant;
  /** Primary heading displayed in the section. */
  title: string;
  /** Optional supporting text rendered below the heading. */
  description?: string;
  /** The main call-to-action button (always visible). */
  primaryAction: CtaAction;
  /** An optional secondary action rendered beside the primary CTA. */
  secondaryAction?: CtaAction;
  /** Additional class names merged onto the root `<section>` element. */
  className?: string;
}
