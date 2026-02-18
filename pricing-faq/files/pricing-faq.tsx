"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface PricingFaqProps {
  items?: FaqItem[];
  title?: string;
}

const defaultItems: FaqItem[] = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference for the remainder of your billing cycle. When downgrading, the new rate takes effect at the start of your next billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards including Visa, Mastercard, and American Express. We also support payments via PayPal and wire transfer for annual enterprise plans.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes, all paid plans come with a 14-day free trial. No credit card is required to start your trial, and you can cancel at any point before it ends without being charged.",
  },
  {
    question: "What happens when I exceed my limits?",
    answer:
      "We'll notify you when you're approaching your plan limits via email and in-app alerts. If you exceed your limits, your service will continue uninterrupted and we'll reach out to discuss upgrading to a plan that better fits your usage.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you won't be charged again after that.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee on all plans. If you're not satisfied within the first 30 days, contact our support team for a full refund — no questions asked.",
  },
];

export function PricingFaq({
  items = defaultItems,
  title = "Frequently Asked Questions",
}: PricingFaqProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-balance mb-12">
        {title}
      </h2>

      <div className="divide-y divide-border">
        {items.map((item, index) => {
          const isOpen = openItems.has(index);

          return (
            <div key={index} className="first:border-t border-border">
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-base font-medium leading-relaxed">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0">
                  <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export type { FaqItem, PricingFaqProps };
