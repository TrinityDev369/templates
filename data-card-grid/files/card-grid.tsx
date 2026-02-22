"use client";

import { useMemo } from "react";
import type { CardGridProps, CardGridColumns } from "./card-grid.types";

export type { CardGridProps, CardGridColumns };

/* -------------------------------------------------------------------------- */
/*  Column mapping helpers                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Tailwind grid-cols classes are statically analyzable — we map column counts
 * (1-6) to their class strings so Tailwind's JIT can detect them at build time.
 *
 * Supported range: 1 through 6 columns per breakpoint.
 */
const GRID_COL_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const SM_COL_MAP: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

const MD_COL_MAP: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

const LG_COL_MAP: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

const XL_COL_MAP: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
};

/**
 * CSS-columns class maps for masonry mode.
 * Maps column count to Tailwind `columns-{n}` utility.
 */
const COLUMNS_MAP: Record<number, string> = {
  1: "columns-1",
  2: "columns-2",
  3: "columns-3",
  4: "columns-4",
  5: "columns-5",
  6: "columns-6",
};

const SM_COLUMNS_MAP: Record<number, string> = {
  1: "sm:columns-1",
  2: "sm:columns-2",
  3: "sm:columns-3",
  4: "sm:columns-4",
  5: "sm:columns-5",
  6: "sm:columns-6",
};

const MD_COLUMNS_MAP: Record<number, string> = {
  1: "md:columns-1",
  2: "md:columns-2",
  3: "md:columns-3",
  4: "md:columns-4",
  5: "md:columns-5",
  6: "md:columns-6",
};

const LG_COLUMNS_MAP: Record<number, string> = {
  1: "lg:columns-1",
  2: "lg:columns-2",
  3: "lg:columns-3",
  4: "lg:columns-4",
  5: "lg:columns-5",
  6: "lg:columns-6",
};

const XL_COLUMNS_MAP: Record<number, string> = {
  1: "xl:columns-1",
  2: "xl:columns-2",
  3: "xl:columns-3",
  4: "xl:columns-4",
  5: "xl:columns-5",
  6: "xl:columns-6",
};

/**
 * Tailwind gap classes — statically mapped for JIT detection.
 */
const GAP_MAP: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

const DEFAULT_COLUMNS: Required<CardGridColumns> = {
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
};

const DEFAULT_GAP = 4;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildGridClasses(cols: Required<CardGridColumns>): string {
  const sm = clamp(cols.sm, 1, 6);
  const md = clamp(cols.md, 1, 6);
  const lg = clamp(cols.lg, 1, 6);
  const xl = clamp(cols.xl, 1, 6);

  return [
    GRID_COL_MAP[sm],
    SM_COL_MAP[sm],
    MD_COL_MAP[md],
    LG_COL_MAP[lg],
    XL_COL_MAP[xl],
  ]
    .filter(Boolean)
    .join(" ");
}

function buildMasonryClasses(cols: Required<CardGridColumns>): string {
  const sm = clamp(cols.sm, 1, 6);
  const md = clamp(cols.md, 1, 6);
  const lg = clamp(cols.lg, 1, 6);
  const xl = clamp(cols.xl, 1, 6);

  return [
    COLUMNS_MAP[sm],
    SM_COLUMNS_MAP[sm],
    MD_COLUMNS_MAP[md],
    LG_COLUMNS_MAP[lg],
    XL_COLUMNS_MAP[xl],
  ]
    .filter(Boolean)
    .join(" ");
}

function buildGapClass(gap: number): string {
  // Use mapped class if available, otherwise fall back to arbitrary value
  if (gap in GAP_MAP) return GAP_MAP[gap];
  return `gap-[${gap * 0.25}rem]`;
}

/**
 * For masonry mode, CSS columns don't support `gap` natively the same way
 * CSS grid does. We use column-gap + margin-bottom on each item instead.
 */
function buildMasonryGapClass(gap: number): string {
  const COLUMN_GAP_MAP: Record<number, string> = {
    0: "[column-gap:0]",
    1: "[column-gap:0.25rem]",
    2: "[column-gap:0.5rem]",
    3: "[column-gap:0.75rem]",
    4: "[column-gap:1rem]",
    5: "[column-gap:1.25rem]",
    6: "[column-gap:1.5rem]",
    8: "[column-gap:2rem]",
    10: "[column-gap:2.5rem]",
    12: "[column-gap:3rem]",
  };

  if (gap in COLUMN_GAP_MAP) return COLUMN_GAP_MAP[gap];
  return `[column-gap:${gap * 0.25}rem]`;
}

function buildMasonryItemGapClass(gap: number): string {
  const MB_MAP: Record<number, string> = {
    0: "mb-0",
    1: "mb-1",
    2: "mb-2",
    3: "mb-3",
    4: "mb-4",
    5: "mb-5",
    6: "mb-6",
    8: "mb-8",
    10: "mb-10",
    12: "mb-12",
  };

  if (gap in MB_MAP) return MB_MAP[gap];
  return `mb-[${gap * 0.25}rem]`;
}

/* -------------------------------------------------------------------------- */
/*  CardGrid Component                                                         */
/* -------------------------------------------------------------------------- */

/**
 * A responsive card grid supporting both standard CSS Grid and CSS-columns
 * masonry layouts. Fully self-contained — no external dependencies beyond
 * React and Tailwind CSS.
 *
 * @example
 * ```tsx
 * <CardGrid
 *   items={products}
 *   renderCard={(product, i) => <ProductCard key={product.id} product={product} />}
 *   columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
 *   gap={6}
 * />
 * ```
 *
 * @example Masonry layout
 * ```tsx
 * <CardGrid
 *   items={photos}
 *   renderCard={(photo) => <PhotoCard photo={photo} />}
 *   masonry
 *   columns={{ sm: 1, md: 2, lg: 3 }}
 * />
 * ```
 */
export function CardGrid<TItem>({
  items,
  renderCard,
  columns,
  gap = DEFAULT_GAP,
  masonry = false,
  className = "",
  emptyMessage = "No items to display",
}: CardGridProps<TItem>) {
  const resolvedColumns: Required<CardGridColumns> = useMemo(
    () => ({
      ...DEFAULT_COLUMNS,
      ...columns,
    }),
    [columns],
  );

  /* ------ Empty state ------ */
  if (!items || items.length === 0) {
    return (
      <div
        className={[
          "flex items-center justify-center py-16 text-neutral-500",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-label="Empty grid"
      >
        {typeof emptyMessage === "string" ? (
          <p className="text-sm">{emptyMessage}</p>
        ) : (
          emptyMessage
        )}
      </div>
    );
  }

  /* ------ Masonry layout ------ */
  if (masonry) {
    const masonryColClasses = buildMasonryClasses(resolvedColumns);
    const masonryGapClass = buildMasonryGapClass(gap);
    const itemGapClass = buildMasonryItemGapClass(gap);

    return (
      <div
        className={[masonryColClasses, masonryGapClass, className]
          .filter(Boolean)
          .join(" ")}
        role="list"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={["break-inside-avoid", itemGapClass]
              .filter(Boolean)
              .join(" ")}
            role="listitem"
          >
            {renderCard(item, index)}
          </div>
        ))}
      </div>
    );
  }

  /* ------ Standard grid layout ------ */
  const gridColClasses = buildGridClasses(resolvedColumns);
  const gapClass = buildGapClass(gap);

  return (
    <div
      className={["grid", gridColClasses, gapClass, className]
        .filter(Boolean)
        .join(" ")}
      role="list"
    >
      {items.map((item, index) => (
        <div key={index} role="listitem">
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
}
