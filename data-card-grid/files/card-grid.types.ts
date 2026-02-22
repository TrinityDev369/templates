import type { ReactNode } from "react";

/**
 * Column configuration per breakpoint.
 * Each value represents the number of columns at that Tailwind breakpoint.
 */
export interface CardGridColumns {
  /** Columns at the `sm` breakpoint (>=640px). Default: 1 */
  sm?: number;
  /** Columns at the `md` breakpoint (>=768px). Default: 2 */
  md?: number;
  /** Columns at the `lg` breakpoint (>=1024px). Default: 3 */
  lg?: number;
  /** Columns at the `xl` breakpoint (>=1280px). Default: 4 */
  xl?: number;
}

/**
 * Props for the CardGrid component.
 *
 * @typeParam TItem - The type of each item in the grid.
 */
export interface CardGridProps<TItem> {
  /** Array of items to render in the grid. */
  items: TItem[];

  /** Render callback invoked for each item. Must return a React element. */
  renderCard: (item: TItem, index: number) => ReactNode;

  /**
   * Responsive column counts per breakpoint.
   * @default { sm: 1, md: 2, lg: 3, xl: 4 }
   */
  columns?: CardGridColumns;

  /**
   * Gap between cards in Tailwind spacing units.
   * Maps to `gap-{value}` (e.g. 4 = 1rem, 6 = 1.5rem).
   * @default 4
   */
  gap?: number;

  /**
   * When true, renders a CSS-columns masonry layout instead of CSS grid.
   * Cards will flow top-to-bottom, left-to-right with variable row heights.
   * @default false
   */
  masonry?: boolean;

  /** Additional CSS classes applied to the outer container. */
  className?: string;

  /**
   * Content displayed when `items` is empty.
   * @default "No items to display"
   */
  emptyMessage?: ReactNode;
}
