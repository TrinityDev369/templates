import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

/**
 * Props for the ExpandableTable component.
 *
 * @template TData - The shape of each row's data object.
 */
export interface ExpandableTableProps<TData> {
  /** The array of data objects to render as rows. */
  data: TData[];

  /** TanStack column definitions describing how to render each column. */
  columns: ColumnDef<TData, unknown>[];

  /**
   * Render function invoked when a row is expanded.
   * Receives the original data object for the row and should return
   * the content to display in the expanded area.
   */
  renderExpandedRow: (row: TData) => ReactNode;

  /**
   * Optional predicate to control which rows can be expanded.
   * When omitted, all rows are expandable.
   */
  getRowCanExpand?: (row: TData) => boolean;

  /** Optional CSS class name applied to the outermost wrapper element. */
  className?: string;

  /** Message displayed when the data array is empty. Defaults to "No results." */
  emptyMessage?: string;
}
