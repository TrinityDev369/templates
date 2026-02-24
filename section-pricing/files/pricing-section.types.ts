/**
 * Type definitions for the PricingSection component.
 *
 * PricingFeature represents a single feature line item in a tier.
 * PricingTier describes one pricing plan (e.g. Free, Pro, Enterprise).
 * PricingSectionProps defines the full section configuration.
 */

/** A single feature entry within a pricing tier. */
export interface PricingFeature {
  /** Description text for this feature. */
  text: string;
  /** Whether this feature is included in the tier. */
  included: boolean;
}

/** A single pricing tier / plan definition. */
export interface PricingTier {
  /** Display name (e.g. "Free", "Pro", "Enterprise"). */
  name: string;
  /** Short description shown below the tier name. */
  description: string;
  /** Price in dollars when billed monthly. Use 0 for free tiers. */
  monthlyPrice: number;
  /** Price in dollars when billed annually (per month equivalent). */
  annualPrice: number;
  /** List of features with included/excluded status. */
  features: PricingFeature[];
  /** CTA button label (e.g. "Get Started", "Contact Sales"). */
  ctaLabel: string;
  /** When true, the tier is visually highlighted as the recommended option. */
  popular?: boolean;
  /** Optional URL for the CTA link. When provided the button renders as an anchor. */
  href?: string;
}

/** Props for the PricingSection component. */
export interface PricingSectionProps {
  /** Optional section heading displayed above the pricing tiers. */
  title?: string;
  /** Optional description paragraph below the heading. */
  description?: string;
  /** Array of pricing tiers to render as cards. */
  tiers: PricingTier[];
  /** Additional CSS classes applied to the root section element. */
  className?: string;
}
