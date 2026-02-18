"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { CategoryFilter } from "./category-filter";
import { ColorFilter } from "./color-filter";
import { PriceRangeFilter } from "./price-range-filter";
import {
  DEFAULT_FILTER_STATE,
  PLACEHOLDER_COLORS,
  type ColorOption,
  type FilterState,
  type SortOption,
} from "./types";

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Best Rated" },
];

// ---------------------------------------------------------------------------
// SearchFilters
// ---------------------------------------------------------------------------

interface SearchFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  resultCount?: number;
  /** Category list with slug, name, count. */
  categories?: { slug: string; name: string; count: number }[];
  colors?: ColorOption[];
  maxPrice?: number;
}

export function SearchFilters({
  onFilterChange,
  resultCount,
  categories = [],
  colors = PLACEHOLDER_COLORS,
  maxPrice = 500,
}: SearchFiltersProps) {
  const [filters, setFilters] = React.useState<FilterState>({
    ...DEFAULT_FILTER_STATE,
    priceRange: [0, maxPrice],
  });
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Notify parent on every filter change
  const update = React.useCallback(
    (patch: Partial<FilterState>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange],
  );

  // ---- Active filter badges ----
  const activeBadges: { label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    activeBadges.push({
      label: `"${filters.search}"`,
      onRemove: () => update({ search: "" }),
    });
  }
  if (
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== maxPrice
  ) {
    activeBadges.push({
      label: `$${filters.priceRange[0]}\u2013$${filters.priceRange[1]}`,
      onRemove: () => update({ priceRange: [0, maxPrice] }),
    });
  }
  for (const slug of filters.categories) {
    const cat = categories.find((c) => c.slug === slug);
    activeBadges.push({
      label: cat?.name ?? slug,
      onRemove: () =>
        update({ categories: filters.categories.filter((s) => s !== slug) }),
    });
  }
  for (const slug of filters.colors) {
    const color = colors.find((c) => c.slug === slug);
    activeBadges.push({
      label: color?.name ?? slug,
      onRemove: () =>
        update({ colors: filters.colors.filter((s) => s !== slug) }),
    });
  }

  // ---- Filter panel content (reused in sidebar + sheet) ----
  const filterPanel = (
    <div className="space-y-6">
      <PriceRangeFilter
        min={filters.priceRange[0]}
        max={filters.priceRange[1]}
        ceiling={maxPrice}
        onChange={(priceRange) => update({ priceRange })}
      />
      <Separator />
      {categories.length > 0 && (
        <>
          <CategoryFilter
            categories={categories}
            selected={filters.categories}
            onChange={(cats) => update({ categories: cats })}
          />
          <Separator />
        </>
      )}
      <ColorFilter
        colors={colors}
        selected={filters.colors}
        onChange={(cols) => update({ colors: cols })}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* ---- Top bar: search + sort + result count ---- */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Sort dropdown */}
        <Select
          value={filters.sort}
          onValueChange={(val) => update({ sort: val as SortOption })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mobile filter trigger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{filterPanel}</div>
          </SheetContent>
        </Sheet>

        {/* Result count */}
        {resultCount !== undefined && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ---- Active filter badges ---- */}
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeBadges.map((badge, idx) => (
            <Badge
              key={`${badge.label}-${idx}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {badge.label}
              <button
                type="button"
                onClick={badge.onRemove}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {badge.label}</span>
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs"
            onClick={() =>
              update({
                search: "",
                sort: "relevance",
                priceRange: [0, maxPrice],
                categories: [],
                colors: [],
              })
            }
          >
            Clear all
          </Button>
        </div>
      )}

      {/* ---- Desktop layout: sidebar + content slot ---- */}
      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          {filterPanel}
        </aside>
        {/* Content area — consumer renders product grid here */}
      </div>
    </div>
  );
}
