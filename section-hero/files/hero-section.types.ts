/** Action descriptor for hero CTA buttons. */
export interface HeroAction {
  /** Button label text. */
  label: string;
  /** Navigation target URL. */
  href: string;
  /** Optional click handler — fires alongside navigation. */
  onClick?: () => void;
}

/** Layout variant for the hero section. */
export type HeroVariant = "centered" | "split" | "with-video";

/** Props accepted by the HeroSection component. */
export interface HeroSectionProps {
  /** Layout variant — controls content arrangement. Default: "centered". */
  variant?: HeroVariant;
  /** Optional badge text displayed above the heading. */
  badge?: string;
  /** Main heading. */
  title: string;
  /** Supporting paragraph text. */
  description: string;
  /** Primary call-to-action button. */
  primaryAction: HeroAction;
  /** Optional secondary call-to-action button (outline style). */
  secondaryAction?: HeroAction;
  /** Image source URL for the "split" variant media area. */
  imageSrc?: string;
  /** Video source URL for the "with-video" variant embed area. */
  videoSrc?: string;
  /** Additional CSS classes merged onto the root <section> element. */
  className?: string;
}
