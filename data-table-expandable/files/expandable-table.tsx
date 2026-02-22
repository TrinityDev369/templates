"use client";

import { useRef, useEffect, useCallback, type ReactElement } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type Row,
} from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { ExpandableTableProps } from "./expandable-table.types";

// ---------------------------------------------------------------------------
// Animated expanded-row wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps the expanded content in a container that smoothly animates
 * its height from 0 to auto when mounting and collapses on unmount.
 * Uses a ref-measured approach: on mount the element's scrollHeight
 * is read and applied as an explicit max-height so that the CSS
 * transition can interpolate between 0 and the measured value.
 */
function AnimatedExpandContent({
  children,
  isExpanded,
}: {
  children: React.ReactNode;
  isExpanded: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isExpanded) {
      // Measure the natural height then animate to it.
      const height = el.scrollHeight;
      el.style.maxHeight = `${height}px`;
      el.style.opacity = "1";
    } else {
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
    }
  }, [isExpanded]);

  return (
    <div
      ref={ref}
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: 0, opacity: 0 }}
    >
      <div className="p-4">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExpandableTable
// ---------------------------------------------------------------------------

/**
 * A fully self-contained, generic expandable data table built on
 * `@tanstack/react-table` with raw HTML table elements and Tailwind CSS.
 *
 * Features:
 * - Click the chevron (or the toggle area) to expand a row and reveal
 *   arbitrary content rendered by `renderExpandedRow`.
 * - Smooth height animation on expand / collapse.
 * - Chevron icon rotates 90 degrees when expanded.
 * - Optional `getRowCanExpand` predicate to conditionally allow expansion.
 * - No external UI library dependencies (no shadcn, no @trinity imports).
 *
 * @example
 * ```tsx
 * <ExpandableTable
 *   data={users}
 *   columns={columns}
 *   renderExpandedRow={(user) => (
 *     <div>
 *       <p>Email: {user.email}</p>
 *       <p>Bio: {user.bio}</p>
 *     </div>
 *   )}
 * />
 * ```
 */
export function ExpandableTable<TData>({
  data,
  columns,
  renderExpandedRow,
  getRowCanExpand,
  className,
  emptyMessage = "No results.",
}: ExpandableTableProps<TData>): ReactElement {
  // Build the TanStack table instance with expansion support.
  const table = useReactTable({
    data,
    columns: [
      // Prepend a toggle column that houses the expand/collapse chevron.
      {
        id: "_expand",
        header: () => null,
        size: 40,
        cell: ({ row }) => {
          if (!row.getCanExpand()) {
            return null;
          }
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                row.getToggleExpandedHandler()(e);
              }}
              aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
              className="flex h-6 w-6 items-center justify-center rounded-md
                         text-gray-500 transition-colors hover:bg-gray-100
                         hover:text-gray-900 dark:text-gray-400
                         dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-200 ${
                  row.getIsExpanded() ? "rotate-90" : ""
                }`}
              />
            </button>
          );
        },
      },
      ...columns,
    ],
    getRowCanExpand: getRowCanExpand
      ? (row: Row<TData>) => getRowCanExpand(row.original)
      : () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Total visible column count (user columns + the expand toggle column).
  const totalColumns = table.getAllColumns().length;

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse text-sm">
          {/* ---- Header ---- */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-200 bg-gray-50
                           dark:border-gray-700 dark:bg-gray-800/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase
                               tracking-wider text-gray-500 dark:text-gray-400"
                    style={{
                      width:
                        header.getSize() !== 150
                          ? header.getSize()
                          : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* ---- Body ---- */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <ExpandableRow
                  key={row.id}
                  row={row}
                  totalColumns={totalColumns}
                  renderExpandedRow={renderExpandedRow}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExpandableRow (internal)
// ---------------------------------------------------------------------------

/**
 * Renders a single data row plus, when expanded, a full-width detail row
 * below it containing the caller-provided expanded content.
 */
function ExpandableRow<TData>({
  row,
  totalColumns,
  renderExpandedRow,
}: {
  row: Row<TData>;
  totalColumns: number;
  renderExpandedRow: (data: TData) => React.ReactNode;
}): ReactElement {
  const isExpanded = row.getIsExpanded();

  const handleRowClick = useCallback(() => {
    if (row.getCanExpand()) {
      row.toggleExpanded();
    }
  }, [row]);

  return (
    <>
      {/* Primary data row */}
      <tr
        className={`cursor-pointer transition-colors
          ${
            isExpanded
              ? "bg-gray-50 dark:bg-gray-800/40"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
          }`}
        onClick={handleRowClick}
      >
        {row.getVisibleCells().map((cell) => (
          <td
            key={cell.id}
            className="px-4 py-3 text-gray-700 dark:text-gray-300"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>

      {/* Expanded detail row */}
      <tr>
        <td
          colSpan={totalColumns}
          className={`p-0 ${
            !isExpanded
              ? "border-none"
              : "border-b border-gray-200 dark:border-gray-700"
          }`}
        >
          <AnimatedExpandContent isExpanded={isExpanded}>
            <div className="bg-gray-50/50 dark:bg-gray-800/20">
              {renderExpandedRow(row.original)}
            </div>
          </AnimatedExpandContent>
        </td>
      </tr>
    </>
  );
}

// ---------------------------------------------------------------------------
// Re-exports for consumer convenience
// ---------------------------------------------------------------------------
export type { ExpandableTableProps } from "./expandable-table.types";
export type { ColumnDef } from "@tanstack/react-table";
