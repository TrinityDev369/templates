"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// PriceRangeFilter — min/max inputs with apply button
// ---------------------------------------------------------------------------

interface PriceRangeFilterProps {
  min: number;
  max: number;
  /** Upper bound for the price range (used as placeholder ceiling). */
  ceiling?: number;
  onChange: (range: [number, number]) => void;
}

export function PriceRangeFilter({
  min,
  max,
  ceiling = 500,
  onChange,
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = React.useState(String(min));
  const [localMax, setLocalMax] = React.useState(String(max));

  // Keep local state in sync when parent resets filters
  React.useEffect(() => {
    setLocalMin(String(min));
    setLocalMax(String(max));
  }, [min, max]);

  function handleApply() {
    const parsedMin = Math.max(0, Number(localMin) || 0);
    const parsedMax = Math.min(ceiling, Number(localMax) || ceiling);
    onChange([
      Math.min(parsedMin, parsedMax),
      Math.max(parsedMin, parsedMax),
    ]);
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Price Range</h4>

      <p className="text-xs text-muted-foreground">
        ${min} &ndash; ${max}
      </p>

      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="price-min" className="text-xs">
            Min
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              $
            </span>
            <Input
              id="price-min"
              type="number"
              min={0}
              max={ceiling}
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="pl-5"
            />
          </div>
        </div>

        <span className="pb-2 text-muted-foreground">&ndash;</span>

        <div className="flex-1 space-y-1">
          <Label htmlFor="price-max" className="text-xs">
            Max
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              $
            </span>
            <Input
              id="price-max"
              type="number"
              min={0}
              max={ceiling}
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="pl-5"
            />
          </div>
        </div>
      </div>

      <Button size="sm" variant="secondary" className="w-full" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}
