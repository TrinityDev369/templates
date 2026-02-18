"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColorOption } from "./types";

// ---------------------------------------------------------------------------
// ColorFilter — grid of circular color swatches with selection ring
// ---------------------------------------------------------------------------

interface ColorFilterProps {
  colors: ColorOption[];
  selected: string[];
  onChange: (colors: string[]) => void;
}

export function ColorFilter({ colors, selected, onChange }: ColorFilterProps) {
  function toggle(slug: string) {
    onChange(
      selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug],
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Color</h4>

      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selected.includes(color.slug);
          const isLight =
            color.slug === "white" || color.slug === "yellow";

          return (
            <button
              key={color.slug}
              type="button"
              title={color.name}
              onClick={() => toggle(color.slug)}
              className={cn(
                "relative h-8 w-8 rounded-full border transition-all",
                isSelected
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:ring-2 hover:ring-muted-foreground hover:ring-offset-1",
                isLight && "border-gray-300",
              )}
              style={{ backgroundColor: color.value }}
            >
              {isSelected && (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-4 w-4",
                    isLight ? "text-gray-800" : "text-white",
                  )}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
