"use client";

import { Building2, Check, ArrowRight } from "lucide-react";

const DEFAULT_FEATURES = [
  "Dedicated support",
  "Custom SLA",
  "SSO & SAML",
  "Unlimited seats",
  "Priority API access",
];

export interface EnterpriseCtaProps {
  onContactSales?: () => void;
  features?: string[];
  title?: string;
  description?: string;
}

export function EnterpriseCta({
  onContactSales,
  features = DEFAULT_FEATURES,
  title = "Need more?",
  description = "Get a tailored plan for your organization with dedicated support, advanced security, and custom integrations.",
}: EnterpriseCtaProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-10 sm:py-16">
      {/* Background decorative elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left column: heading + CTA */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-400/30">
            <Building2 className="h-6 w-6 text-indigo-400" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>

          <p className="mt-3 max-w-md text-base leading-relaxed text-slate-300">
            {description}
          </p>

          <button
            type="button"
            onClick={onContactSales}
            className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-200 hover:bg-indigo-50 hover:shadow-xl active:scale-95"
          >
            Contact Sales
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right column: feature list */}
        <div className="flex-1">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-1">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-400/30">
                  <Check className="h-3.5 w-3.5 text-indigo-400" />
                </span>
                <span className="text-sm font-medium text-slate-200">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
