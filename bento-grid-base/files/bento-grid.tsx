"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import type {
  BentoGap,
  BentoGridProps,
  BentoGridItemProps,
} from "./bento-grid.types";

// ---------------------------------------------------------------------------
// Gap mapping — Tailwind class presets
// ---------------------------------------------------------------------------

const gapClasses: Record<BentoGap, string> = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

// ---------------------------------------------------------------------------
// BentoGrid — CSS Grid container
// ---------------------------------------------------------------------------

/**
 * A configurable bento-style CSS grid container.
 *
 * Renders a single column on mobile and the specified number of columns at
 * the `lg` breakpoint (1024px). Gap size and explicit row count are
 * configurable via props.
 *
 * Uses a scoped `<style>` tag with `useId` to apply responsive column counts
 * without requiring Tailwind JIT to compile dynamic values.
 *
 * @example
 * ```tsx
 * <BentoGrid cols={4} gap="lg">
 *   <BentoGridItem colSpan={2} rowSpan={2}>Hero</BentoGridItem>
 *   <BentoGridItem>Card A</BentoGridItem>
 *   <BentoGridItem>Card B</BentoGridItem>
 *   <BentoGridItem colSpan={2}>Wide card</BentoGridItem>
 * </BentoGrid>
 * ```
 */
export function BentoGrid({
  cols = 3,
  rows,
  gap = "md",
  className,
  children,
}: BentoGridProps) {
  // Generate a stable, SSR-safe unique identifier for scoped CSS.
  const scopeId = useId().replace(/:/g, "");

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: [
            // Mobile: single column (handled by grid-cols-1 class)
            // lg+: expand to the configured number of columns
            `@media (min-width: 1024px) {`,
            `  [data-bento="${scopeId}"] {`,
            `    grid-template-columns: repeat(${cols}, minmax(0, 1fr));`,
            `  }`,
            `}`,
            // Explicit rows when specified
            ...(rows
              ? [
                  `[data-bento="${scopeId}"] {`,
                  `  grid-template-rows: repeat(${rows}, minmax(0, 1fr));`,
                  `}`,
                ]
              : []),
          ].join("\n"),
        }}
      />
      <div
        data-bento={scopeId}
        className={cn(
          "grid auto-rows-min grid-cols-1",
          gapClasses[gap],
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// BentoGridItem — individual grid cell wrapped in a shadcn Card
// ---------------------------------------------------------------------------

/**
 * A bento grid item that wraps its content in a shadcn `Card`.
 *
 * Use `colSpan` and `rowSpan` to make items span multiple columns or rows
 * within the parent `BentoGrid`.
 *
 * @example
 * ```tsx
 * <BentoGridItem colSpan={2} rowSpan={1} className="bg-muted">
 *   <h3>Feature highlight</h3>
 *   <p>Description text here.</p>
 * </BentoGridItem>
 * ```
 */
export function BentoGridItem({
  colSpan = 1,
  rowSpan = 1,
  className,
  children,
}: BentoGridItemProps) {
  return (
    <Card
      className={cn("overflow-hidden", className)}
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        gridRow: `span ${rowSpan} / span ${rowSpan}`,
      }}
    >
      <CardContent className="h-full">{children}</CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Re-export types for consumer convenience
// ---------------------------------------------------------------------------

export type {
  BentoGap,
  BentoGridProps,
  BentoGridItemProps,
} from "./bento-grid.types";
