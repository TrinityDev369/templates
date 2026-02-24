"use client";

import { useState, useMemo } from "react";
import { HelpCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaqSearch } from "./components/faq-search";
import { FaqCategories, type FaqCategory } from "./components/faq-categories";
import { FaqAccordion, type FaqItem } from "./components/faq-accordion";

const FAQ_DATA: FaqItem[] = [
  {
    id: "gs-1",
    question: "How do I create an account?",
    answer:
      "Click the Sign Up button in the top right corner. Fill in your email address, choose a password, and complete the verification step. You will receive a confirmation email within a few minutes.",
    category: "Getting Started",
  },
  {
    id: "gs-2",
    question: "What are the first steps after signing up?",
    answer:
      "After signing up, complete your profile by adding your name and company details. Then explore the dashboard to familiarize yourself with the available features. We recommend starting with the guided tour accessible from the help menu.",
    category: "Getting Started",
  },
  {
    id: "gs-3",
    question: "Is there a free trial available?",
    answer:
      "Yes, all new accounts include a 14-day free trial with full access to every feature. No credit card is required to start. You can upgrade or cancel at any time during the trial period.",
    category: "Getting Started",
  },
  {
    id: "b-1",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through our PCI-compliant payment provider.",
    category: "Billing",
  },
  {
    id: "b-2",
    question: "How do I cancel my subscription?",
    answer:
      "Navigate to Settings, then Billing, and click Cancel Subscription. Your access continues until the end of the current billing period. You can reactivate at any time without losing your data.",
    category: "Billing",
  },
  {
    id: "b-3",
    question: "Can I get a refund?",
    answer:
      "We offer a 30-day money-back guarantee for annual plans. For monthly plans, you can cancel at any time and will not be charged for the next cycle. Contact our billing team for refund requests.",
    category: "Billing",
  },
  {
    id: "t-1",
    question: "What browsers are supported?",
    answer:
      "We support the latest two versions of Chrome, Firefox, Safari, and Edge. For the best experience we recommend using Chrome or Firefox. Mobile browsers on iOS and Android are also fully supported.",
    category: "Technical",
  },
  {
    id: "t-2",
    question: "Is there an API available?",
    answer:
      "Yes, we provide a comprehensive REST API with full documentation. API access is included in the Pro and Enterprise plans. You can generate API keys from your account settings and find the docs at docs.example.com/api.",
    category: "Technical",
  },
  {
    id: "t-3",
    question: "How do I integrate with third-party tools?",
    answer:
      "Visit the Integrations page in your dashboard to browse available connectors. We support Slack, GitHub, Jira, Zapier, and many more. Each integration includes a setup guide with step-by-step instructions.",
    category: "Technical",
  },
  {
    id: "a-1",
    question: "How do I reset my password?",
    answer:
      "Click Forgot Password on the login page and enter your email address. You will receive a reset link within a few minutes. The link expires after 24 hours for security reasons. If you do not receive the email, check your spam folder.",
    category: "Account",
  },
  {
    id: "a-2",
    question: "Can I change my email address?",
    answer:
      "Yes, go to Settings then Profile and update your email address. You will need to verify the new email before the change takes effect. Your old email will receive a notification about the change for security purposes.",
    category: "Account",
  },
  {
    id: "s-1",
    question: "How do I contact support?",
    answer:
      "You can reach our support team via the chat widget in the bottom right corner, by emailing support@example.com, or by submitting a ticket from the Help section. Our team typically responds within 2 business hours.",
    category: "Support",
  },
  {
    id: "s-2",
    question: "What are your support hours?",
    answer:
      "Our support team is available Monday through Friday, 9 AM to 6 PM CET. Enterprise customers have access to 24/7 priority support. Community forums and documentation are available around the clock.",
    category: "Support",
  },
  {
    id: "s-3",
    question: "Do you offer onboarding assistance?",
    answer:
      "Yes, all Pro and Enterprise plans include a dedicated onboarding session with one of our specialists. We also offer self-service onboarding guides, video tutorials, and a comprehensive knowledge base to help you get started.",
    category: "Support",
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("All");

  const filteredItems = useMemo(() => {
    let items = FAQ_DATA;

    if (activeCategory !== "All") {
      items = items.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return items;
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="px-4 pt-24 pb-12 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <HelpCircle className="h-7 w-7 text-neutral-600 dark:text-neutral-300" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500 dark:text-neutral-400">
          Find answers to common questions. Can&apos;t find what you&apos;re
          looking for? Reach out to our team.
        </p>
        <FaqSearch
          value={searchQuery}
          onChange={setSearchQuery}
          className="mt-8"
        />
      </section>

      {/* Categories */}
      <FaqCategories
        active={activeCategory}
        onChange={setActiveCategory}
        className="px-4 pb-8"
      />

      {/* Results count */}
      {searchQuery.trim() && (
        <p className="text-center text-sm text-neutral-500 pb-4 dark:text-neutral-400">
          {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "result" : "results"} found
        </p>
      )}

      {/* Accordion */}
      <section className="px-4 pb-16">
        <FaqAccordion
          items={filteredItems}
          searchQuery={searchQuery}
        />
      </section>

      {/* Contact CTA */}
      <section
        className={cn(
          "mx-auto max-w-3xl px-4 pb-24"
        )}
      >
        <div
          className={cn(
            "rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center",
            "dark:border-neutral-700 dark:bg-neutral-900"
          )}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
            <MessageCircle className="h-6 w-6 text-neutral-600 dark:text-neutral-300" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Still have questions?
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Our team is here to help. Get in touch and we&apos;ll get back to
            you as soon as possible.
          </p>
          <a
            href="/contact"
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3",
              "bg-neutral-900 text-sm font-medium text-white",
              "transition-colors hover:bg-neutral-800",
              "dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
