"use client";

import { cn } from "@/lib/utils";

export const FAQ_CATEGORIES = [
  "All",
  "Getting Started",
  "Billing",
  "Technical",
  "Account",
  "Support",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

interface FaqCategoriesProps {
  active: FaqCategory;
  onChange: (category: FaqCategory) => void;
  className?: string;
}

export function FaqCategories({
  active,
  onChange,
  className,
}: FaqCategoriesProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className
      )}
    >
      {FAQ_CATEGORIES.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
