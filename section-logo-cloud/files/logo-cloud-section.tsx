"use client";

import { cn } from "@/lib/utils";
import type { LogoItem, LogoCloudSectionProps } from "./logo-cloud-section.types";

/* ------------------------------------------------------------------ */
/*  Placeholder logos — 5 generic geometric shapes for zero-config     */
/*  preview. Consumers should replace these with their own SVGs/images */
/* ------------------------------------------------------------------ */

/** Hexagon shape placeholder. */
function PlaceholderHexagon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 40"
      fill="currentColor"
      className="h-8 w-auto"
      aria-hidden="true"
    >
      <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" />
      <rect x="42" y="14" width="50" height="5" rx="2" />
      <rect x="42" y="22" width="35" height="4" rx="2" opacity="0.5" />
    </svg>
  );
}

/** Diamond shape placeholder. */
function PlaceholderDiamond() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 40"
      fill="currentColor"
      className="h-8 w-auto"
      aria-hidden="true"
    >
      <path d="M20 4L36 20L20 36L4 20L20 4Z" />
      <rect x="44" y="14" width="46" height="5" rx="2" />
      <rect x="44" y="22" width="32" height="4" rx="2" opacity="0.5" />
    </svg>
  );
}

/** Circle-ring shape placeholder. */
function PlaceholderCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 40"
      fill="currentColor"
      className="h-8 w-auto"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="14" fillOpacity="0.3" />
      <circle cx="20" cy="20" r="9" />
      <rect x="42" y="14" width="52" height="5" rx="2" />
      <rect x="42" y="22" width="38" height="4" rx="2" opacity="0.5" />
    </svg>
  );
}

/** Triangle shape placeholder. */
function PlaceholderTriangle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 40"
      fill="currentColor"
      className="h-8 w-auto"
      aria-hidden="true"
    >
      <path d="M20 4L38 36H2L20 4Z" />
      <rect x="44" y="14" width="48" height="5" rx="2" />
      <rect x="44" y="22" width="34" height="4" rx="2" opacity="0.5" />
    </svg>
  );
}

/** Rounded-square shape placeholder. */
function PlaceholderSquare() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 40"
      fill="currentColor"
      className="h-8 w-auto"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="32" height="32" rx="6" />
      <rect x="44" y="14" width="44" height="5" rx="2" />
      <rect x="44" y="22" width="30" height="4" rx="2" opacity="0.5" />
    </svg>
  );
}

/** Built-in placeholder logos used when no logos prop is provided. */
const DEFAULT_LOGOS: LogoItem[] = [
  { name: "Acme Corp", logo: <PlaceholderHexagon /> },
  { name: "Vertex Labs", logo: <PlaceholderDiamond /> },
  { name: "Orbis Inc", logo: <PlaceholderCircle /> },
  { name: "Prism Co", logo: <PlaceholderTriangle /> },
  { name: "Bloc Systems", logo: <PlaceholderSquare /> },
];

/* ------------------------------------------------------------------ */
/*  Marquee CSS keyframes (injected once via <style>)                  */
/* ------------------------------------------------------------------ */

const MARQUEE_KEYFRAMES = `
@keyframes logo-cloud-marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

/* ------------------------------------------------------------------ */
/*  Single logo item renderer                                          */
/* ------------------------------------------------------------------ */

function LogoDisplay({ item }: { item: LogoItem }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center px-6 py-4",
        "text-muted-foreground/60 grayscale transition-all duration-300",
        "hover:text-foreground hover:grayscale-0",
      )}
      title={item.name}
    >
      {item.logo}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Static variant — flexbox wrap, centered                            */
/* ------------------------------------------------------------------ */

function StaticLayout({ logos }: { logos: LogoItem[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      {logos.map((item) => (
        <LogoDisplay key={item.name} item={item} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee variant — infinite horizontal scroll via CSS animation     */
/* ------------------------------------------------------------------ */

function MarqueeLayout({ logos }: { logos: LogoItem[] }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MARQUEE_KEYFRAMES }} />
      <div
        className="relative overflow-hidden"
        aria-label="Scrolling logo carousel"
      >
        {/* Fade masks on left and right edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

        {/* Scrolling track — logos are duplicated for seamless loop */}
        <div
          className="flex w-max"
          style={{
            animation: "logo-cloud-marquee 30s linear infinite",
          }}
        >
          {/* First set */}
          {logos.map((item) => (
            <LogoDisplay key={`a-${item.name}`} item={item} />
          ))}
          {/* Duplicate set for seamless loop */}
          {logos.map((item) => (
            <LogoDisplay key={`b-${item.name}`} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

/**
 * Logo cloud section displaying a row of partner/client logos.
 *
 * - **static** (default): Flexbox-wrapped grid of logos, centered with even spacing.
 * - **marquee**: Infinite horizontal scroll animation with edge fade masks.
 *
 * All logos render with a grayscale filter that lifts on hover. Pass your own
 * `LogoItem[]` array or use the built-in placeholder logos for quick previews.
 *
 * @example
 * ```tsx
 * <LogoCloudSection
 *   title="Trusted by industry leaders"
 *   variant="marquee"
 *   logos={[
 *     { name: "Acme", logo: <AcmeSvg /> },
 *     { name: "Globex", logo: <img src="/logos/globex.svg" alt="Globex" /> },
 *   ]}
 * />
 * ```
 */
function LogoCloudSection({
  title = "Trusted by industry leaders",
  logos,
  variant = "static",
  className,
}: LogoCloudSectionProps) {
  const resolvedLogos = logos && logos.length > 0 ? logos : DEFAULT_LOGOS;

  return (
    <section
      className={cn(
        "py-16 sm:py-20",
        "bg-background text-foreground",
        className,
      )}
    >
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h2>
        </div>

        {/* Logo display area */}
        <div className="mt-10">
          {variant === "static" && <StaticLayout logos={resolvedLogos} />}
          {variant === "marquee" && <MarqueeLayout logos={resolvedLogos} />}
        </div>
      </div>
    </section>
  );
}

export { LogoCloudSection };
export type { LogoCloudSectionProps, LogoItem };
