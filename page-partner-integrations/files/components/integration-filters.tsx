"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Communication",
  "Analytics",
  "Storage",
  "Payments",
  "DevOps",
  "CRM",
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];

interface IntegrationFiltersProps {
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function IntegrationFilters({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: IntegrationFiltersProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === category
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary sm:w-64"
        />
      </div>
    </div>
  );
}
