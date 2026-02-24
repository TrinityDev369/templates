"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FaqSearch({ value, onChange, className }: FaqSearchProps) {
  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search className="h-5 w-5 text-neutral-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search questions..."
        className={cn(
          "w-full rounded-xl border border-neutral-200 bg-white py-3.5 pl-12 pr-4",
          "text-base text-neutral-900 placeholder:text-neutral-400",
          "shadow-sm transition-shadow duration-200",
          "focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200",
          "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
          "dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
        )}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className={cn(
            "absolute inset-y-0 right-0 flex items-center pr-4",
            "text-sm text-neutral-400 hover:text-neutral-600 transition-colors",
            "dark:hover:text-neutral-300"
          )}
        >
          Clear
        </button>
      )}
    </div>
  );
}
