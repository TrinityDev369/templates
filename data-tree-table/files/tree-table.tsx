"use client";

import { useMemo, useCallback, type ReactElement } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type Row,
  type ColumnDef,
  type ExpandedState,
} from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { TreeNode, TreeTableProps } from "./tree-table.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the initial expanded state for the table.
 *
 * TanStack Table's `ExpandedState` accepts either `true` (all expanded)
 * or a record mapping row IDs to booleans. When `defaultExpanded` is a
 * number we pre-walk the tree to build that record, expanding every node
 * whose depth is strictly less than the target level.
 */
function buildInitialExpanded<TData>(
  tree: TreeNode<TData>[],
  defaultExpanded: boolean | number | undefined
): ExpandedState {
  if (defaultExpanded === true) return true;
  if (!defaultExpanded) return {};

  const depth = defaultExpanded as number;
  const expanded: Record<string, boolean> = {};

  function walk(nodes: TreeNode<TData>[], parentId: string, level: number) {
    nodes.forEach((node, index) => {
      const rowId = parentId ? `${parentId}.${index}` : `${index}`;
      if (level < depth && node.children?.length) {
        expanded[rowId] = true;
        walk(node.children, rowId, level + 1);
      }
    });
  }

  walk(tree, "", 0);
  return expanded;
}

// ---------------------------------------------------------------------------
// TreeTable
// ---------------------------------------------------------------------------

/**
 * A fully self-contained, generic hierarchical tree table built on
 * `@tanstack/react-table` with raw HTML table elements and Tailwind CSS.
 *
 * Features:
 * - Hierarchical data rendered as indented rows with expand/collapse toggles.
 * - Chevron icon rotates 90 degrees when a branch node is expanded.
 * - Leaf nodes (no children) display no toggle control.
 * - Visual tree-line connectors via left-border on indented toggle cells.
 * - Configurable initial expansion via `defaultExpanded` (all, none, or by depth).
 * - Configurable indent size per depth level.
 * - No external UI library dependencies (no shadcn, no @trinity imports).
 *
 * @example
 * ```tsx
 * interface FileItem {
 *   name: string;
 *   size: string;
 *   modified: string;
 * }
 *
 * const tree: TreeNode<FileItem>[] = [
 *   {
 *     data: { name: "src", size: "--", modified: "2024-01-15" },
 *     children: [
 *       { data: { name: "index.ts", size: "2.4 KB", modified: "2024-01-15" } },
 *       {
 *         data: { name: "components", size: "--", modified: "2024-01-14" },
 *         children: [
 *           { data: { name: "Button.tsx", size: "1.1 KB", modified: "2024-01-14" } },
 *         ],
 *       },
 *     ],
 *   },
 * ];
 *
 * const columns: ColumnDef<TreeNode<FileItem>, unknown>[] = [
 *   { accessorFn: (row) => row.data.name, header: "Name", id: "name" },
 *   { accessorFn: (row) => row.data.size, header: "Size", id: "size" },
 *   { accessorFn: (row) => row.data.modified, header: "Modified", id: "modified" },
 * ];
 *
 * <TreeTable tree={tree} columns={columns} defaultExpanded={1} />
 * ```
 */
export function TreeTable<TData>({
  tree,
  columns,
  defaultExpanded,
  indentSize = 24,
  className,
  onRowClick,
  emptyMessage = "No data.",
}: TreeTableProps<TData>): ReactElement {
  // Compute initial expansion state once on mount.
  const initialExpanded = useMemo(
    () => buildInitialExpanded(tree, defaultExpanded),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Intentionally computed only once — mirrors TanStack's initialState contract.
  );

  // Build the augmented column list: prepend a toggle column for the
  // expand/collapse chevron with depth-based indentation.
  const augmentedColumns = useMemo<ColumnDef<TreeNode<TData>, unknown>[]>(
    () => [
      {
        id: "_tree_toggle",
        header: () => null,
        size: 40,
        cell: ({ row }) => {
          const depth = row.depth;
          const hasChildren = row.subRows.length > 0;
          const isExpanded = row.getIsExpanded();

          return (
            <div
              className="flex items-center"
              style={{ paddingLeft: depth * indentSize }}
            >
              {/* Tree-line connector: vertical border segment */}
              {depth > 0 && (
                <span
                  className="absolute left-0 top-0 h-full border-l border-gray-200
                             dark:border-gray-700"
                  style={{ marginLeft: (depth - 1) * indentSize + 18 }}
                  aria-hidden="true"
                />
              )}

              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleExpanded();
                  }}
                  aria-label={isExpanded ? "Collapse row" : "Expand row"}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md
                             text-gray-500 transition-colors hover:bg-gray-100
                             hover:text-gray-900 dark:text-gray-400
                             dark:hover:bg-gray-800 dark:hover:text-gray-100"
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>
              ) : (
                // Leaf node: render a spacer matching the toggle button width
                // so that content in the next column stays aligned.
                <span className="inline-block h-6 w-6 shrink-0" />
              )}
            </div>
          );
        },
      },
      ...columns,
    ],
    [columns, indentSize]
  );

  // Build the TanStack table instance with sub-row (tree) expansion support.
  const table = useReactTable({
    data: tree,
    columns: augmentedColumns,
    state: {},
    initialState: {
      expanded: initialExpanded,
    },
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Total visible column count (user columns + the toggle column).
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
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TreeRow
                  key={row.id}
                  row={row}
                  onRowClick={onRowClick}
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
// TreeRow (internal)
// ---------------------------------------------------------------------------

/**
 * Renders a single row in the tree table. The row's visual depth is
 * communicated by the indentation in the toggle column cell (first column).
 */
function TreeRow<TData>({
  row,
  onRowClick,
}: {
  row: Row<TreeNode<TData>>;
  onRowClick?: (node: TreeNode<TData>, depth: number) => void;
}): ReactElement {
  const isExpanded = row.getIsExpanded();
  const hasChildren = row.subRows.length > 0;
  const depth = row.depth;

  const handleClick = useCallback(() => {
    if (onRowClick) {
      onRowClick(row.original, depth);
    }
  }, [row, depth, onRowClick]);

  return (
    <tr
      className={`relative transition-colors ${
        onRowClick ? "cursor-pointer" : ""
      } ${
        isExpanded && hasChildren
          ? "bg-gray-50/70 dark:bg-gray-800/30"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/20"
      }`}
      onClick={handleClick}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="px-4 py-2.5 text-gray-700 dark:text-gray-300"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Re-exports for consumer convenience
// ---------------------------------------------------------------------------
export type { TreeNode, TreeTableProps } from "./tree-table.types";
export type { ColumnDef } from "@tanstack/react-table";
