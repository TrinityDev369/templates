import Link from "next/link";
import { Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { MembershipPlan } from "@/types";

interface PricingCardProps {
  plan: MembershipPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const isPopular = plan.popular;

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:p-8",
        isPopular
          ? "border-brand-500 bg-gray-900 shadow-lg shadow-brand-500/10"
          : "border-gray-800 bg-gray-900 hover:border-gray-700 hover:shadow-brand-500/5"
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-brand-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <h3
        className={cn(
          "mb-2 text-lg font-bold",
          isPopular ? "text-brand-500" : "text-white"
        )}
      >
        {plan.name}
      </h3>

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-extrabold text-white">
          {formatPrice(plan.price)}
        </span>
        <span className="text-sm text-gray-400">/{plan.interval}</span>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                isPopular ? "text-brand-500" : "text-gray-500"
              )}
            />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/membership"
        className={cn(
          "block rounded-lg py-3 text-center text-sm font-semibold transition-colors",
          isPopular
            ? "bg-brand-500 text-white hover:bg-brand-600"
            : "border border-gray-700 text-gray-300 hover:border-brand-500 hover:text-brand-500"
        )}
      >
        {plan.cta}
      </Link>
    </article>
  );
}
