"use client";

import { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HighlightedTextProps {
  text: string;
  highlight: string;
}

function HighlightedText({ text, highlight }: HighlightedTextProps) {
  if (!highlight.trim()) {
    return <>{text}</>;
  }

  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 dark:bg-yellow-400/30 dark:text-yellow-200"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface FaqAccordionProps {
  items: FaqItem[];
  searchQuery: string;
  className?: string;
}

export function FaqAccordion({
  items,
  searchQuery,
  className,
}: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (items.length === 0) {
    return (
      <div className={cn("text-center py-16", className)}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <ChevronDown className="h-7 w-7 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          No results found
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Try adjusting your search or browse a different category.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-3xl mx-auto divide-y divide-neutral-200 dark:divide-neutral-700", className)}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} className="group">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "flex w-full items-start justify-between gap-4 py-5 text-left",
                "transition-colors duration-150",
                "hover:text-neutral-600 dark:hover:text-neutral-300"
              )}
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                <HighlightedText text={item.question} highlight={searchQuery} />
              </span>
              <ChevronDown
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-300 ease-in-out",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  <HighlightedText text={item.answer} highlight={searchQuery} />
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
