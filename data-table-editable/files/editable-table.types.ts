import type { Table, ColumnDef } from "@tanstack/react-table";

// ---------------------------------------------------------------------------
// Editable Cell
// ---------------------------------------------------------------------------

/**
 * Props forwarded to the custom editable cell renderer.
 *
 * TanStack Table injects these via the `cell` column definition callback.
 * The component uses `table.options.meta` to read/write the transient edit
 * state that lives outside of React‑Table's own data model.
 */
export interface EditableCellProps<TData> {
  /** Returns the *current* cell value (may be the original or an in‑flight edit). */
  getValue: () => unknown;
  /** Row metadata — `index` is the position in the *current* row model. */
  row: { index: number };
  /** Column metadata — `id` matches the `accessorKey` / column `id`. */
  column: { id: string };
  /** The full table instance, including `options.meta`. */
  table: Table<TData>;
}

// ---------------------------------------------------------------------------
// Table‑level meta stored on `table.options.meta`
// ---------------------------------------------------------------------------

/**
 * Shape of the custom `meta` object attached to the TanStack Table instance.
 *
 * This is the bridge between the table model and the editable‑cell UI:
 * cells call `meta.updateData` to propagate edits, and `meta.validationErrors`
 * surfaces per‑cell error strings so the renderer can display them.
 */
export interface EditableTableMeta {
  /** Notify the table that a cell value was committed by the user. */
  updateData: (rowIndex: number, columnId: string, value: unknown) => void | Promise<void>;
  /** Map of `"rowIndex:columnId"` => error message (or `null` if valid). */
  validationErrors: Record<string, string | null>;
}

// ---------------------------------------------------------------------------
// Public component props
// ---------------------------------------------------------------------------

/**
 * Props accepted by the `<EditableTable>` component.
 *
 * @typeParam TData - Row data shape (e.g. `{ id: string; name: string; price: number }`).
 */
export interface EditableTableProps<TData> {
  /** The array of row objects rendered by the table. Treat as immutable. */
  data: TData[];

  /**
   * TanStack column definitions.  Mark a column as editable by including
   * `meta: { editable: true }` in the column def:
   *
   * ```ts
   * { accessorKey: "name", header: "Name", meta: { editable: true } }
   * ```
   */
  columns: ColumnDef<TData, unknown>[];

  /**
   * Called when the user commits an edit (Enter / blur).
   * The callback receives the row index, column id, and new value.
   * Return a `Promise` to enable the pending‑save indicator.
   */
  onSave: (rowIndex: number, columnId: string, value: unknown) => void | Promise<void>;

  /**
   * Optional synchronous validator.  Return an error message string when the
   * value is invalid, or `null` / `undefined` to accept.
   */
  validate?: (columnId: string, value: unknown) => string | null;

  /** Additional class names applied to the outermost wrapper `<div>`. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Re‑exports for consumer convenience
// ---------------------------------------------------------------------------

export type { ColumnDef } from "@tanstack/react-table";
