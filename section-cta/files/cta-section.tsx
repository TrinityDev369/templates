"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import type { CtaSectionProps, CtaSectionVariant } from "./cta-section.types";

// ---------------------------------------------------------------------------
// Variant style maps
// ---------------------------------------------------------------------------

const sectionVariants: Record<CtaSectionVariant, string> = {
  dark: "bg-primary text-primary-foreground",
  brand:
    "bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground",
  light: "bg-muted text-foreground",
};

const descriptionVariants: Record<CtaSectionVariant, string> = {
  dark: "text-primary-foreground/70",
  brand: "text-primary-foreground/80",
  light: "text-muted-foreground",
};

const primaryButtonVariants: Record<
  CtaSectionVariant,
  { variant: "default" | "secondary" | "outline"; className?: string }
> = {
  dark: {
    variant: "secondary",
    className: "min-w-[160px]",
  },
  brand: {
    variant: "secondary",
    className: "min-w-[160px]",
  },
  light: {
    variant: "default",
    className: "min-w-[160px]",
  },
};

const secondaryButtonVariants: Record<
  CtaSectionVariant,
  { variant: "outline" | "secondary" | "default"; className?: string }
> = {
  dark: {
    variant: "outline",
    className:
      "min-w-[160px] border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10",
  },
  brand: {
    variant: "outline",
    className:
      "min-w-[160px] border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10",
  },
  light: {
    variant: "outline",
    className: "min-w-[160px]",
  },
};

// ---------------------------------------------------------------------------
// Decorative glow (subtle background element)
// ---------------------------------------------------------------------------

function DecorativeGlow({ variant }: { variant: CtaSectionVariant }) {
  if (variant === "light") return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Top-right soft glow */}
      <div
        className={cn(
          "absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl",
          variant === "dark" && "bg-primary-foreground/30",
          variant === "brand" && "bg-white/25"
        )}
      />
      {/* Bottom-left soft glow */}
      <div
        className={cn(
          "absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-15 blur-3xl",
          variant === "dark" && "bg-primary-foreground/20",
          variant === "brand" && "bg-white/20"
        )}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CtaSection
// ---------------------------------------------------------------------------

/**
 * A full-width call-to-action section with three background variants.
 *
 * ```tsx
 * <CtaSection
 *   variant="brand"
 *   title="Ready to get started?"
 *   description="Join thousands of teams already shipping faster."
 *   primaryAction={{ label: "Start free trial", href: "/signup" }}
 *   secondaryAction={{ label: "Talk to sales", href: "/contact" }}
 * />
 * ```
 */
export function CtaSection({
  variant = "dark",
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: CtaSectionProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        sectionVariants[variant],
        className
      )}
    >
      <DecorativeGlow variant={variant} />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center sm:py-24 lg:py-28">
        {/* Heading */}
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed sm:mt-5 sm:text-lg",
              descriptionVariants[variant]
            )}
          >
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            variant={primaryButtonVariants[variant].variant}
            className={primaryButtonVariants[variant].className}
            asChild
          >
            <a
              href={primaryAction.href}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
              {/* Inline arrow icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1.5 h-4 w-4"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </Button>

          {secondaryAction && (
            <Button
              size="lg"
              variant={secondaryButtonVariants[variant].variant}
              className={secondaryButtonVariants[variant].className}
              asChild
            >
              <a
                href={secondaryAction.href}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
