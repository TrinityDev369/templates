"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Feature, FeaturesSectionProps } from "./features-section.types"

/**
 * Default placeholder icon rendered when a feature does not provide its own icon.
 * Uses an inline SVG so there are no external icon-library dependencies.
 */
function DefaultIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

/** Grid class mapping for each layout variant. */
const variantGridClasses: Record<
  NonNullable<FeaturesSectionProps["variant"]>,
  string
> = {
  "three-column": "sm:grid-cols-2 lg:grid-cols-3",
  "four-column": "sm:grid-cols-2 lg:grid-cols-4",
}

/**
 * Features section displaying a heading, optional description, and a responsive
 * grid of feature cards. Supports 3-column (default) and 4-column layout variants.
 *
 * Each card renders an icon (or a default placeholder), a title, and a description
 * using shadcn Card primitives for consistent styling and dark-mode support.
 */
export function FeaturesSection({
  title,
  description,
  features,
  variant = "three-column",
  className,
}: FeaturesSectionProps) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Feature grid */}
      <div
        className={cn(
          "mt-12 grid gap-6",
          variantGridClasses[variant],
        )}
      >
        {features.map((feature: Feature) => (
          <Card key={feature.title} className="border bg-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feature.icon ?? <DefaultIcon />}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
