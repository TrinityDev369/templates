"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// CategoryFilter — checkbox list with show more / select all / clear all
// ---------------------------------------------------------------------------

interface CategoryItem {
  slug: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const VISIBLE_LIMIT = 5;

export function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  const [expanded, setExpanded] = React.useState(false);

  const visible = expanded ? categories : categories.slice(0, VISIBLE_LIMIT);
  const hasMore = categories.length > VISIBLE_LIMIT;

  function toggle(slug: string) {
    onChange(
      selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug],
    );
  }

  function selectAll() {
    onChange(categories.map((c) => c.slug));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Categories</h4>
        <div className="flex gap-2">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={selectAll}
          >
            Select all
          </Button>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={clearAll}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((cat) => (
          <div key={cat.slug} className="flex items-center gap-2">
            <Checkbox
              id={`cat-${cat.slug}`}
              checked={selected.includes(cat.slug)}
              onCheckedChange={() => toggle(cat.slug)}
            />
            <Label
              htmlFor={`cat-${cat.slug}`}
              className="flex flex-1 cursor-pointer items-center justify-between text-sm font-normal"
            >
              <span>{cat.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {cat.count}
              </span>
            </Label>
          </div>
        ))}
      </div>

      {hasMore && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : `Show more (${categories.length - VISIBLE_LIMIT})`}
        </Button>
      )}
    </div>
  );
}
