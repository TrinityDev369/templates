import type { ReactNode } from "react"

/** A single feature entry displayed as a card in the grid. */
export interface Feature {
  /** Optional icon rendered above the title. Accepts any ReactNode (SVG, emoji, component). */
  icon?: ReactNode
  /** Feature title displayed as a heading. */
  title: string
  /** Short description displayed below the title. */
  description: string
}

/** Layout variant controlling the number of columns at the `lg` breakpoint. */
export type FeaturesSectionVariant = "three-column" | "four-column"

/** Props for the FeaturesSection component. */
export interface FeaturesSectionProps {
  /** Section heading displayed above the feature grid. */
  title: string
  /** Optional description paragraph below the heading. */
  description?: string
  /** Array of features to render as cards. */
  features: Feature[]
  /** Grid layout variant. Defaults to "three-column". */
  variant?: FeaturesSectionVariant
  /** Additional CSS class names applied to the root section element. */
  className?: string
}
