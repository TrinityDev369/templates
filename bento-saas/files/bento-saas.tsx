"use client";

import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "@/components/bento-grid-base/bento-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type {
  BentoSaasProps,
  BentoSaasFeature,
  BentoSaasIntegration,
  BentoSaasStat,
  BentoSaasTestimonial,
} from "./bento-saas.types";

// ---------------------------------------------------------------------------
// Inline SVG icons — no external icon library required
// ---------------------------------------------------------------------------

/** Decorative quote icon for the testimonial card. */
function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
    </svg>
  );
}

/** Arrow-right icon for the CTA button. */
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Bar-chart icon for the stats card header. */
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

/** Puzzle-piece icon for the integrations card header. */
function IntegrationsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Card sub-components
// ---------------------------------------------------------------------------

/** Hero card — spans 2 columns with a large heading and CTA button. */
function HeroCard({
  title,
  description,
  ctaLabel,
  ctaHref,
}: BentoSaasProps["content"]["hero"]) {
  return (
    <BentoGridItem colSpan={2} className="flex flex-col justify-center p-8 lg:p-10">
      <Badge variant="secondary" className="mb-4 w-fit">
        New
      </Badge>
      <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-lg text-muted-foreground">
        {description}
      </p>
      <div className="mt-6">
        <Button asChild size="lg">
          <a href={ctaHref}>
            {ctaLabel}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </BentoGridItem>
  );
}

/** Feature card — icon, title, and short description. */
function FeatureCard({ icon, title, description }: BentoSaasFeature) {
  return (
    <BentoGridItem className="flex flex-col justify-between p-6">
      {icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </BentoGridItem>
  );
}

/** Integrations card — row of small logos/icons with labels. */
function IntegrationsCard({
  integrations,
}: {
  integrations: BentoSaasIntegration[];
}) {
  return (
    <BentoGridItem colSpan={2} className="p-6">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground">
        <IntegrationsIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Integrations</span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              {integration.icon}
            </div>
            <span className="text-xs text-muted-foreground">
              {integration.name}
            </span>
          </div>
        ))}
      </div>
    </BentoGridItem>
  );
}

/** Testimonial card — quote with author attribution. */
function TestimonialCard({
  testimonial,
}: {
  testimonial: BentoSaasTestimonial;
}) {
  return (
    <BentoGridItem className="flex flex-col justify-between p-6">
      <QuoteIcon className="mb-3 h-8 w-8 text-primary/30" />
      <blockquote className="text-sm leading-relaxed text-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">
          {testimonial.author}
        </p>
        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
      </div>
    </BentoGridItem>
  );
}

/** Stats card — 2-3 key metrics in a compact layout. */
function StatsCard({ stats }: { stats: BentoSaasStat[] }) {
  return (
    <BentoGridItem className="flex flex-col p-6">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground">
        <ChartIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Key Metrics</span>
      </div>
      <div className="flex flex-1 items-center">
        <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </BentoGridItem>
  );
}

// ---------------------------------------------------------------------------
// BentoSaas — main export
// ---------------------------------------------------------------------------

/**
 * SaaS Showcase Bento — a hero alternative for SaaS landing pages.
 *
 * Renders a pre-composed bento grid layout with typed card slots: hero,
 * features, integrations, testimonial, and stats. Pass a single `content`
 * prop to populate all cards.
 *
 * @example
 * ```tsx
 * import { BentoSaas } from "@/components/bento-saas/bento-saas";
 *
 * <BentoSaas
 *   content={{
 *     hero: {
 *       title: "Ship faster with AI",
 *       description: "Automate your workflow end to end.",
 *       ctaLabel: "Get started",
 *       ctaHref: "/signup",
 *     },
 *     features: [
 *       { title: "Fast builds", description: "Deploy in seconds." },
 *       { title: "Type safe", description: "Full TypeScript support." },
 *     ],
 *   }}
 * />
 * ```
 */
export function BentoSaas({ content, className }: BentoSaasProps) {
  const { hero, features, integrations, testimonial, stats } = content;

  return (
    <BentoGrid cols={3} gap="md" className={cn("w-full", className)}>
      {/* Row 1: Hero (2 cols) + first feature (1 col) */}
      <HeroCard {...hero} />
      {features[0] && <FeatureCard {...features[0]} />}

      {/* Row 2: remaining features */}
      {features.slice(1).map((feature, index) => (
        <FeatureCard key={feature.title + index} {...feature} />
      ))}

      {/* Row 3: integrations (2 cols) + testimonial (1 col) */}
      {integrations && integrations.length > 0 && (
        <IntegrationsCard integrations={integrations} />
      )}
      {testimonial && <TestimonialCard testimonial={testimonial} />}

      {/* Row 4: stats (full width or fits remaining space) */}
      {stats && stats.length > 0 && <StatsCard stats={stats} />}
    </BentoGrid>
  );
}

// Re-export types for consumer convenience
export type {
  BentoSaasProps,
  BentoSaasContent,
  BentoSaasFeature,
  BentoSaasIntegration,
  BentoSaasTestimonial,
  BentoSaasStat,
} from "./bento-saas.types";
