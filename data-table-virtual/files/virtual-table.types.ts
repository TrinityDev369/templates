import type { ColumnDef } from "@tanstack/react-table";

/**
 * Props for the VirtualTable component.
 *
 * @template TData - The shape of each row's data object.
 */
export interface VirtualTableProps<TData> {
  /** The array of data objects to render as rows. */
  data: TData[];

  /** TanStack column definitions describing how to render each column. */
  columns: ColumnDef<TData, unknown>[];

  /**
   * Estimated height of each row in pixels. The virtualizer uses this to
   * calculate the total scrollable area before rows are measured. A closer
   * estimate reduces layout shift during fast scrolling.
   * @default 48
   */
  estimateRowHeight?: number;

  /**
   * Number of rows to render outside the visible viewport in each direction.
   * Higher values reduce blank flashes during fast scrolls at the cost of
   * rendering more DOM nodes.
   * @default 10
   */
  overscan?: number;

  /**
   * Fixed height of the scrollable container in pixels.
   * @default 600
   */
  height?: number;

  /** Optional CSS class name applied to the outermost wrapper element. */
  className?: string;

  /**
   * Callback invoked when a data row is clicked.
   * Receives the original data object for the clicked row.
   */
  onRowClick?: (row: TData) => void;
}
