// ---------------------------------------------------------------------------
// BentoSaas — Type definitions
// ---------------------------------------------------------------------------

/**
 * A single feature card displayed in the bento grid.
 */
export interface BentoSaasFeature {
  /** Optional inline SVG icon rendered as a ReactNode. */
  icon?: React.ReactNode;
  /** Short feature title. */
  title: string;
  /** Brief feature description (1-2 sentences). */
  description: string;
}

/**
 * An integration logo/icon entry for the integrations card.
 */
export interface BentoSaasIntegration {
  /** Display name of the integration (used as alt text). */
  name: string;
  /** Inline SVG icon rendered as a ReactNode. */
  icon: React.ReactNode;
}

/**
 * A testimonial quote with attribution.
 */
export interface BentoSaasTestimonial {
  /** The quote text. */
  quote: string;
  /** Name of the person being quoted. */
  author: string;
  /** Role or title of the person. */
  role: string;
}

/**
 * A single metric displayed in the stats card.
 */
export interface BentoSaasStat {
  /** The metric value (e.g. "99.9%", "10k+", "$2M"). */
  value: string;
  /** Short label describing the metric. */
  label: string;
}

/**
 * Full content object for the BentoSaas component.
 *
 * Only `hero` and `features` are required. The remaining sections are
 * optional and the grid adapts its layout when they are omitted.
 */
export interface BentoSaasContent {
  /** Hero card content — spans 2 columns with a large heading and CTA. */
  hero: {
    /** Primary headline. */
    title: string;
    /** Supporting description text. */
    description: string;
    /** Label for the call-to-action button. */
    ctaLabel: string;
    /** URL the CTA button links to. */
    ctaHref: string;
  };
  /** Array of feature cards. Each gets its own bento cell. */
  features: BentoSaasFeature[];
  /** Optional integrations card showing a row of partner/tool logos. */
  integrations?: BentoSaasIntegration[];
  /** Optional testimonial quote card. */
  testimonial?: BentoSaasTestimonial;
  /** Optional stats card with 2-3 key metrics. */
  stats?: BentoSaasStat[];
}

/**
 * Props for the BentoSaas component.
 */
export interface BentoSaasProps {
  /** Structured content for all bento cards. */
  content: BentoSaasContent;
  /** Additional CSS classes applied to the outer BentoGrid wrapper. */
  className?: string;
}
