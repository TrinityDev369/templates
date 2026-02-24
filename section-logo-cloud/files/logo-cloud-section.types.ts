import type { ReactNode } from "react";

/** A single logo entry rendered in the logo cloud. */
export interface LogoItem {
  /** Company or brand name — used for accessible alt text and key derivation. */
  name: string;
  /** The logo visual — accepts any ReactNode (inline SVG, <img>, or component). */
  logo: ReactNode;
}

/** Display variant for the logo cloud layout. */
export type LogoCloudVariant = "static" | "marquee";

/** Props accepted by the LogoCloudSection component. */
export interface LogoCloudSectionProps {
  /** Section heading displayed above the logo row. Defaults to "Trusted by industry leaders". */
  title?: string;
  /** Array of logos to display. Falls back to built-in placeholder logos when empty. */
  logos?: LogoItem[];
  /** Layout variant — "static" (flexbox wrap) or "marquee" (infinite horizontal scroll). Default: "static". */
  variant?: LogoCloudVariant;
  /** Additional CSS class names applied to the root <section> element. */
  className?: string;
}
