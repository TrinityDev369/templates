"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { FaqItem, FaqSectionProps } from "./faq-section.types"

/**
 * FAQ section with a shadcn Accordion for expand/collapse behaviour and
 * optional category tab filtering.
 *
 * When `categories` are provided and FAQ items include a `category` field,
 * a horizontal tab bar is rendered above the accordion. An "All" tab is
 * always prepended so users can view every item at once.
 *
 * The accordion is configured as `type="single"` with `collapsible` enabled,
 * meaning only one item can be open at a time and it can be closed again.
 *
 * @example
 * ```tsx
 * <FaqSection
 *   title="Frequently Asked Questions"
 *   description="Find answers to the most common questions."
 *   items={[
 *     { question: "How does billing work?", answer: "We bill monthly.", category: "Billing" },
 *     { question: "Can I cancel anytime?", answer: "Yes, no lock-in.", category: "Billing" },
 *     { question: "Is there a free trial?", answer: "14 days free.", category: "General" },
 *   ]}
 *   categories={["General", "Billing"]}
 * />
 * ```
 */
export function FaqSection({
  title,
  description,
  items,
  categories,
  className,
}: FaqSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All")

  const showTabs = categories && categories.length > 0
  const tabs = showTabs ? ["All", ...categories] : []

  const filteredItems: FaqItem[] =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory)

  return (
    <section className={cn("py-16 md:py-24", className)}>
      {/* Section header */}
      {(title || description) && (
        <div className="mx-auto max-w-2xl text-center">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Category tabs */}
      {showTabs && (
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveCategory(tab)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Accordion */}
      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {filteredItems.map((item, index) => (
            <AccordionItem
              key={`${item.question}-${index}`}
              value={`faq-${index}`}
            >
              <AccordionTrigger className="text-left text-base font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Empty state when filtering yields no results */}
        {filteredItems.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No questions found for this category.
          </p>
        )}
      </div>
    </section>
  )
}
