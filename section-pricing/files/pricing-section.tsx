"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import type {
  PricingFeature,
  PricingTier,
  PricingSectionProps,
} from "./pricing-section.types";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (self-contained, no external icon library)        */
/* ------------------------------------------------------------------ */

/** Checkmark icon for included features. */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** X/cross icon for excluded features. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Billing Toggle                                                     */
/* ------------------------------------------------------------------ */

function BillingToggle({
  isAnnual,
  onToggle,
}: {
  isAnnual: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          !isAnnual ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Monthly
      </span>
      <Switch
        checked={isAnnual}
        onCheckedChange={onToggle}
        aria-label="Toggle annual billing"
      />
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          isAnnual ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Annual
      </span>
      {isAnnual && (
        <Badge variant="secondary" className="text-xs">
          Save 20%
        </Badge>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature List Item                                                  */
/* ------------------------------------------------------------------ */

function FeatureItem({
  feature,
  isPopular,
}: {
  feature: PricingFeature;
  isPopular: boolean;
}) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {feature.included ? (
        <CheckIcon
          className={cn(
            "mt-0.5",
            isPopular
              ? "text-primary"
              : "text-emerald-500 dark:text-emerald-400",
          )}
        />
      ) : (
        <XIcon className="mt-0.5 text-muted-foreground/40" />
      )}
      <span
        className={cn(
          feature.included
            ? "text-foreground"
            : "text-muted-foreground line-through",
        )}
      >
        {feature.text}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Tier Card                                                          */
/* ------------------------------------------------------------------ */

function TierCard({
  tier,
  isAnnual,
}: {
  tier: PricingTier;
  isAnnual: boolean;
}) {
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const isFree = price === 0;
  const isPopular = tier.popular === true;

  const buttonContent = (
    <Button
      className="w-full"
      variant={isPopular ? "default" : "outline"}
      size="lg"
    >
      {tier.ctaLabel}
    </Button>
  );

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        isPopular &&
          "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02] lg:scale-105",
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="px-3 py-1 text-xs font-semibold shadow-sm">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className={cn("pb-4", isPopular && "pt-8")}>
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <CardDescription className="text-sm">
          {tier.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Price display */}
        <div className="flex items-baseline gap-1">
          {isFree ? (
            <span className="text-4xl font-bold tracking-tight text-foreground">
              Free
            </span>
          ) : (
            <>
              <span className="text-4xl font-bold tracking-tight text-foreground">
                ${price}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                /mo
              </span>
            </>
          )}
        </div>

        {/* Annual savings note */}
        {isAnnual && !isFree && tier.monthlyPrice > tier.annualPrice && (
          <p className="text-xs text-muted-foreground">
            Billed as ${tier.annualPrice * 12}/year
          </p>
        )}

        {/* Feature list */}
        <ul className="space-y-3">
          {tier.features.map((feature) => (
            <FeatureItem
              key={feature.text}
              feature={feature}
              isPopular={isPopular}
            />
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        {tier.href ? (
          <a href={tier.href} className="w-full">
            {buttonContent}
          </a>
        ) : (
          buttonContent
        )}
      </CardFooter>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

/**
 * Pricing section with tier cards, monthly/annual billing toggle,
 * feature lists with check/x marks, and a highlighted popular plan.
 *
 * Renders 1-4 tiers in a responsive grid that stacks on mobile
 * and displays side-by-side on desktop. The popular tier is visually
 * elevated with a border ring and badge.
 *
 * @example
 * ```tsx
 * <PricingSection
 *   title="Simple, transparent pricing"
 *   description="Choose the plan that fits your needs."
 *   tiers={[
 *     {
 *       name: "Free",
 *       description: "For individuals getting started.",
 *       monthlyPrice: 0,
 *       annualPrice: 0,
 *       features: [
 *         { text: "1 project", included: true },
 *         { text: "Basic analytics", included: true },
 *         { text: "Priority support", included: false },
 *       ],
 *       ctaLabel: "Get Started",
 *     },
 *     {
 *       name: "Pro",
 *       description: "For growing teams.",
 *       monthlyPrice: 29,
 *       annualPrice: 24,
 *       popular: true,
 *       features: [
 *         { text: "Unlimited projects", included: true },
 *         { text: "Advanced analytics", included: true },
 *         { text: "Priority support", included: true },
 *       ],
 *       ctaLabel: "Start Free Trial",
 *     },
 *   ]}
 * />
 * ```
 */
function PricingSection({
  title,
  description,
  tiers,
  className,
}: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = React.useState(false);

  return (
    <section
      className={cn(
        "w-full py-16 px-4 sm:px-6 lg:px-8 md:py-24",
        className,
      )}
    >
      {/* Section header */}
      {(title || description) && (
        <div className="mx-auto max-w-2xl text-center mb-8">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Billing toggle */}
      <div className="mb-12 flex justify-center">
        <BillingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
      </div>

      {/* Pricing tier grid */}
      <div
        className={cn(
          "mx-auto max-w-7xl grid items-start gap-6",
          "grid-cols-1 md:grid-cols-2",
          tiers.length === 3 && "lg:grid-cols-3",
          tiers.length >= 4 && "lg:grid-cols-4",
          tiers.length <= 2 && "lg:grid-cols-2 max-w-4xl",
        )}
      >
        {tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} isAnnual={isAnnual} />
        ))}
      </div>
    </section>
  );
}

export { PricingSection };
export type { PricingSectionProps, PricingTier, PricingFeature };
