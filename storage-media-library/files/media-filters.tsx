"use client";

import { cn } from "@/lib/utils";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Grid3X3,
  List,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import type { FilterCategory, MediaFiltersProps, SortField } from "./types";

const CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "document", label: "Documents" },
  { value: "audio", label: "Audio" },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "date", label: "Date" },
  { value: "size", label: "Size" },
  { value: "type", label: "Type" },
];

export function MediaFilters({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sort,
  onSortChange,
  selectedCount,
  onDeleteSelected,
  onUploadClick,
}: MediaFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Top row: search, upload, delete */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>

        <button
          type="button"
          onClick={onUploadClick}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onDeleteSelected}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-destructive px-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
            Delete ({selectedCount})
          </button>
        )}
      </div>

      {/* Bottom row: category tabs, sort, view mode */}
      <div className="flex items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                activeCategory === cat.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sort.field}
            onChange={(e) =>
              onSortChange({ ...sort, field: e.target.value as SortField })
            }
            className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              onSortChange({
                ...sort,
                direction: sort.direction === "asc" ? "desc" : "asc",
              })
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:text-foreground"
            title={sort.direction === "asc" ? "Ascending" : "Descending"}
          >
            {sort.direction === "asc" ? (
              <ArrowDownAZ className="h-4 w-4" />
            ) : (
              <ArrowUpAZ className="h-4 w-4" />
            )}
          </button>

          {/* View mode toggle */}
          <div className="flex items-center rounded-md border border-input">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-l-md transition-colors",
                viewMode === "grid"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-r-md border-l border-input transition-colors",
                viewMode === "list"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
