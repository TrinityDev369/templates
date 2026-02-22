"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type CellContext,
  type ColumnDef,
} from "@tanstack/react-table";
import { Check, X, Loader2 } from "lucide-react";

import type {
  EditableTableProps,
  EditableTableMeta,
} from "./editable-table.types";

// Re-export types so consumers can import everything from one path.
export type {
  EditableTableProps,
  EditableCellProps,
  EditableTableMeta,
  ColumnDef,
} from "./editable-table.types";

// ---------------------------------------------------------------------------
// Utility: merge class names without external deps
// ---------------------------------------------------------------------------

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// EditableCell — renders either a static value or an inline input
// ---------------------------------------------------------------------------

interface EditableCellInternalProps<TData> {
  cellContext: CellContext<TData, unknown>;
  isEditable: boolean;
}

function EditableCell<TData>({
  cellContext,
  isEditable,
}: EditableCellInternalProps<TData>) {
  const { getValue, row, column, table } = cellContext;
  const initialValue = getValue();

  const meta = table.options.meta as EditableTableMeta | undefined;

  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(String(initialValue ?? ""));
  const [isPending, setIsPending] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const errorKey = `${row.index}:${column.id}`;
  const error = meta?.validationErrors[errorKey] ?? null;

  // Sync displayed value when external data changes (e.g. after save)
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(String(initialValue ?? ""));
    }
  }, [initialValue, isEditing]);

  // Auto-focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // ---- handlers ----

  const enterEditMode = React.useCallback(() => {
    if (!isEditable || isPending) return;
    setEditValue(String(initialValue ?? ""));
    setIsEditing(true);
  }, [isEditable, isPending, initialValue]);

  const cancelEdit = React.useCallback(() => {
    setEditValue(String(initialValue ?? ""));
    setIsEditing(false);
  }, [initialValue]);

  const commitEdit = React.useCallback(async () => {
    if (!meta) return;

    const maybePromise = meta.updateData(row.index, column.id, editValue);

    // If updateData returns a promise (save is async), show pending state
    if (maybePromise instanceof Promise) {
      setIsPending(true);
      try {
        await maybePromise;
      } finally {
        setIsPending(false);
      }
    }

    setIsEditing(false);
  }, [meta, row.index, column.id, editValue]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    },
    [commitEdit, cancelEdit]
  );

  const handleBlur = React.useCallback(() => {
    // Only commit on blur if not cancelled (Escape sets isEditing false first)
    if (isEditing) {
      commitEdit();
    }
  }, [isEditing, commitEdit]);

  // ---- render: non-editable cell ----

  if (!isEditable) {
    return (
      <span className="block px-3 py-2 text-sm">
        {String(initialValue ?? "")}
      </span>
    );
  }

  // ---- render: pending state ----

  if (isPending) {
    return (
      <span className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {editValue}
      </span>
    );
  }

  // ---- render: editing state ----

  if (isEditing) {
    return (
      <div className="relative">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={cn(
              "w-full rounded-md border bg-white px-2.5 py-1.5 text-sm shadow-sm",
              "outline-none transition-colors",
              "focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500",
              error
                ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                : "border-gray-300"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${errorKey}-error` : undefined}
          />
          <button
            type="button"
            onMouseDown={(e) => {
              // Prevent blur from firing before click
              e.preventDefault();
              commitEdit();
            }}
            className={cn(
              "flex-shrink-0 rounded p-1 text-green-600",
              "hover:bg-green-50 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-green-500/40"
            )}
            aria-label="Save edit"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              cancelEdit();
            }}
            className={cn(
              "flex-shrink-0 rounded p-1 text-red-600",
              "hover:bg-red-50 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-red-500/40"
            )}
            aria-label="Cancel edit"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {error && (
          <p
            id={`${errorKey}-error`}
            className="mt-1 text-xs text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  // ---- render: static editable cell (click to edit) ----

  return (
    <button
      type="button"
      onClick={enterEditMode}
      className={cn(
        "block w-full cursor-pointer rounded px-3 py-2 text-left text-sm",
        "transition-colors hover:bg-gray-50",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        error && "ring-2 ring-red-500/40"
      )}
      title="Click to edit"
    >
      {String(initialValue ?? "") || (
        <span className="text-gray-400 italic">Empty</span>
      )}
      {error && (
        <p className="mt-0.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// EditableTable — main exported component
// ---------------------------------------------------------------------------

/**
 * A self-contained, inline-editable data table built on TanStack Table.
 *
 * Mark individual columns as editable via `meta: { editable: true }` in the
 * column definition.  Non-editable columns render as plain text.
 *
 * ```tsx
 * <EditableTable
 *   data={rows}
 *   columns={[
 *     { accessorKey: "name", header: "Name", meta: { editable: true } },
 *     { accessorKey: "email", header: "Email", meta: { editable: true } },
 *     { accessorKey: "role", header: "Role" }, // read-only
 *   ]}
 *   onSave={(rowIdx, colId, value) => updateRow(rowIdx, colId, value)}
 *   validate={(colId, value) =>
 *     colId === "email" && !String(value).includes("@") ? "Invalid email" : null
 *   }
 * />
 * ```
 */
export function EditableTable<TData>({
  data,
  columns,
  onSave,
  validate,
  className,
}: EditableTableProps<TData>) {
  // Local copy of data so we can show optimistic updates immediately.
  const [tableData, setTableData] = React.useState<TData[]>(() => data);
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string | null>
  >({});

  // Sync when parent data changes (e.g. after server refetch).
  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  // ---- build meta for cells ----

  const tableMeta: EditableTableMeta = React.useMemo(
    () => ({
      validationErrors,
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        const errorKey = `${rowIndex}:${columnId}`;

        // Run validation if provided
        if (validate) {
          const error = validate(columnId, value);
          setValidationErrors((prev) => ({ ...prev, [errorKey]: error }));
          if (error) return; // Block save on validation failure
        } else {
          // Clear any stale error
          setValidationErrors((prev) => ({ ...prev, [errorKey]: null }));
        }

        // Optimistic local update
        setTableData((prev) =>
          prev.map((row, idx) => {
            if (idx !== rowIndex) return row;
            return { ...row, [columnId]: value };
          })
        );

        // Notify consumer
        return onSave(rowIndex, columnId, value);
      },
    }),
    [onSave, validate, validationErrors]
  );

  // ---- wrap columns to inject editable cell renderer ----

  const wrappedColumns: ColumnDef<TData, unknown>[] = React.useMemo(
    () =>
      columns.map((colDef) => {
        const isEditable = !!(colDef.meta as Record<string, unknown> | undefined)?.editable;

        // If the column already has a custom cell renderer, respect it
        if (colDef.cell && !isEditable) return colDef;

        return {
          ...colDef,
          cell: (cellContext: CellContext<TData, unknown>) => (
            <EditableCell cellContext={cellContext} isEditable={isEditable} />
          ),
        } as ColumnDef<TData, unknown>;
      }),
    [columns]
  );

  // ---- table instance ----

  const table = useReactTable({
    data: tableData,
    columns: wrappedColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: tableMeta,
  });

  // ---- render ----

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse text-sm">
        {/* ----- Header ----- */}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-gray-200 bg-gray-50/80"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600",
                    "border-b border-gray-200"
                  )}
                  style={{
                    width:
                      header.getSize() !== 150 ? header.getSize() : undefined,
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

        {/* ----- Body ----- */}
        <tbody className="divide-y divide-gray-100">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-gray-50/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b border-gray-100">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-12 text-center text-sm text-gray-400"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
