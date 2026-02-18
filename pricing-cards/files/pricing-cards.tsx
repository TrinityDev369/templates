"use client";

import { Check, Star } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface PricingPlan {
  /** Unique identifier for the plan. */
  id: string;
  /** Display name (e.g. "Free", "Pro", "Enterprise"). */
  name: string;
  /** Short description shown below the plan name. */
  description: string;
  /** Price in dollars when billed monthly. Use 0 for free tiers. */
  monthlyPrice: number;
  /** Price in dollars when billed annually. */
  annualPrice: number;
  /** List of features included in this plan. */
  features: string[];
  /** When true the card is visually elevated as the recommended option. */
  highlighted?: boolean;
  /** Optional badge text (e.g. "Most Popular", "Best Value"). */
  badge?: string;
  /** CTA button label. Defaults to "Get Started". */
  cta?: string;
}

export interface PricingCardsProps {
  /** Array of 2-4 plan definitions to render. */
  plans: PricingPlan[];
  /** Callback fired when a user clicks a plan's CTA button. */
  onSelectPlan?: (planId: string) => void;
  /** Controls whether monthly or annual pricing is displayed. */
  billingInterval?: "monthly" | "annual";
}

/* -------------------------------------------------------------------------- */
/*  PricingCards component                                                    */
/* -------------------------------------------------------------------------- */

export function PricingCards({
  plans,
  onSelectPlan,
  billingInterval = "monthly",
}: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
      {plans.map((plan) => {
        const price =
          billingInterval === "monthly" ? plan.monthlyPrice : plan.annualPrice;
        const isFree = price === 0;
        const isHighlighted = plan.highlighted === true;

        return (
          <div
            key={plan.id}
            className={[
              "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 dark:bg-gray-950",
              isHighlighted
                ? "scale-[1.02] border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg dark:border-indigo-400 dark:ring-indigo-400/20"
                : "border-gray-200 dark:border-gray-800 hover:shadow-md",
            ].join(" ")}
          >
            {/* ---- Badge ---- */}
            {isHighlighted && plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white dark:bg-indigo-500">
                <Star className="size-3" aria-hidden="true" />
                {plan.badge}
              </span>
            )}

            {/* ---- Plan name ---- */}
            <h3
              className={[
                "text-lg font-semibold",
                isHighlighted
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-900 dark:text-gray-100",
              ].join(" ")}
            >
              {plan.name}
            </h3>

            {/* ---- Description ---- */}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {plan.description}
            </p>

            {/* ---- Price ---- */}
            <div className="mt-4 flex items-baseline gap-1">
              {isFree ? (
                <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Free
                </span>
              ) : (
                <>
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    ${price}
                  </span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {billingInterval === "monthly" ? "/mo" : "/yr"}
                  </span>
                </>
              )}
            </div>

            {/* ---- Features ---- */}
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check
                    className={[
                      "mt-0.5 size-4 shrink-0",
                      isHighlighted
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-emerald-500 dark:text-emerald-400",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* ---- CTA button ---- */}
            <button
              type="button"
              onClick={() => onSelectPlan?.(plan.id)}
              className={[
                "mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isHighlighted
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  : "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-500 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
              ].join(" ")}
            >
              {plan.cta ?? "Get Started"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
