"use client";

import { cn } from "@/lib/utils";
import {
  BentoGrid,
  BentoGridItem,
} from "@/components/bento-grid-base/bento-grid";
import { Badge } from "@/components/ui/badge";

import type { BentoFeature, BentoFeaturesProps } from "./bento-features.types";

// ---------------------------------------------------------------------------
// Default placeholder icons (inline SVG) — used when a feature has no icon
// ---------------------------------------------------------------------------

const placeholderIcons: React.ReactNode[] = [
  // Zap / lightning bolt
  <svg
    key="icon-zap"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>,

  // Shield / security
  <svg
    key="icon-shield"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .7-.96L12 3l7.3 2.04A1 1 0 0 1 20 6v7z" />
  </svg>,

  // Layers / stack
  <svg
    key="icon-layers"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84z" />
    <path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12" />
    <path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L21 17" />
  </svg>,

  // Globe / world
  <svg
    key="icon-globe"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>,

  // Sparkles / magic
  <svg
    key="icon-sparkles"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
  </svg>,

  // Gauge / performance
  <svg
    key="icon-gauge"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>,
];

/**
 * Returns a deterministic placeholder icon based on array index.
 */
function getPlaceholderIcon(index: number): React.ReactNode {
  return placeholderIcons[index % placeholderIcons.length];
}

// ---------------------------------------------------------------------------
// BentoFeatures — visual feature showcase component
// ---------------------------------------------------------------------------

/**
 * A visual feature showcase that renders an array of features inside a bento
 * grid layout. Each feature is displayed as a card with an icon, title,
 * description, and optional badge.
 *
 * The first feature in the array automatically spans 2 columns to act as
 * a hero feature card, unless an explicit `colSpan` is provided.
 *
 * @example
 * ```tsx
 * <BentoFeatures
 *   title="Why choose us"
 *   description="Everything you need to build modern applications."
 *   features={[
 *     { title: "Lightning Fast", description: "Sub-millisecond response times.", badge: "New" },
 *     { title: "Secure by Default", description: "Enterprise-grade security built in." },
 *     { title: "Scalable", description: "Grows with your business." },
 *   ]}
 * />
 * ```
 */
export function BentoFeatures({
  title,
  description,
  features,
  className,
}: BentoFeaturesProps) {
  return (
    <section className={cn("w-full", className)}>
      {/* Section header */}
      {(title || description) && (
        <div className="mb-8 text-center">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Bento grid */}
      <BentoGrid cols={3} gap="md">
        {features.map((feature, index) => {
          // First card defaults to colSpan 2 (hero) unless explicitly set
          const resolvedColSpan =
            feature.colSpan ?? (index === 0 ? 2 : 1);
          const resolvedRowSpan = feature.rowSpan ?? 1;
          const icon = feature.icon ?? getPlaceholderIcon(index);

          return (
            <BentoGridItem
              key={`${feature.title}-${index}`}
              colSpan={resolvedColSpan}
              rowSpan={resolvedRowSpan}
            >
              <div className="flex h-full flex-col gap-3 p-2">
                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {icon}
                </div>

                {/* Title + optional badge */}
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold leading-tight">
                    {feature.title}
                  </h3>
                  {feature.badge && (
                    <Badge variant="secondary" className="shrink-0">
                      {feature.badge}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </BentoGridItem>
          );
        })}
      </BentoGrid>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Re-export types for consumer convenience
// ---------------------------------------------------------------------------

export type { BentoFeature, BentoFeaturesProps } from "./bento-features.types";
