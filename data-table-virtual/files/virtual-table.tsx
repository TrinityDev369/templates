"use client";

import { useRef, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type Row,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { VirtualTableProps } from "./virtual-table.types";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * VirtualTable renders a data table that only materialises visible rows
 * in the DOM, enabling smooth 60 fps scrolling over tens of thousands of
 * records.
 *
 * Built on `@tanstack/react-table` for the column model and
 * `@tanstack/react-virtual` for row virtualisation.
 *
 * @template TData - The shape of each row's data object.
 */
export function VirtualTable<TData>({
  data,
  columns,
  estimateRowHeight = 48,
  overscan = 10,
  height = 600,
  className,
  onRowClick,
}: VirtualTableProps<TData>) {
  /* ---- table instance ---------------------------------------------- */

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  /* ---- virtualiser ------------------------------------------------- */

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  /* ---- handlers ---------------------------------------------------- */

  const handleRowClick = useCallback(
    (row: Row<TData>) => {
      onRowClick?.(row.original);
    },
    [onRowClick],
  );

  /* ---- render ------------------------------------------------------ */

  const outerClasses = [
    "w-full overflow-hidden rounded-lg border border-gray-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={outerClasses}>
      {/* Scrollable viewport */}
      <div
        ref={scrollContainerRef}
        className="overflow-auto"
        style={{ height, maxHeight: height }}
      >
        <table className="w-full border-collapse text-sm">
          {/* ---- Sticky header ------------------------------------ */}
          <thead className="sticky top-0 z-10 bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
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
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* ---- Virtualised body --------------------------------- */}
          <tbody>
            {/* Spacer row: pushes visible rows to correct scroll position */}
            {virtualRows.length > 0 && (
              <tr>
                <td
                  style={{ height: virtualRows[0].start, padding: 0 }}
                  colSpan={columns.length}
                />
              </tr>
            )}

            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              const isEven = virtualRow.index % 2 === 0;

              return (
                <tr
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={(node) => virtualizer.measureElement(node)}
                  className={[
                    isEven ? "bg-white" : "bg-gray-50/60",
                    "transition-colors duration-100",
                    onRowClick
                      ? "cursor-pointer hover:bg-blue-50"
                      : "hover:bg-gray-100/80",
                  ].join(" ")}
                  onClick={
                    onRowClick ? () => handleRowClick(row) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b border-gray-100 px-4 py-3 text-gray-800"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Bottom spacer: fills remaining scroll height */}
            {virtualRows.length > 0 && (
              <tr>
                <td
                  style={{
                    height:
                      totalHeight -
                      (virtualRows[virtualRows.length - 1].end || 0),
                    padding: 0,
                  }}
                  colSpan={columns.length}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Row count footer ------------------------------------- */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        Showing {rows.length.toLocaleString()} of{" "}
        {data.length.toLocaleString()} rows
      </div>
    </div>
  );
}

export type { VirtualTableProps } from "./virtual-table.types";
