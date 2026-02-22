import type { ColumnDef } from "@tanstack/react-table";

/**
 * A node in the hierarchical tree structure.
 *
 * Each node wraps an arbitrary data object and may contain child nodes,
 * forming an n-ary tree of any depth.
 *
 * @template TData - The shape of the data payload at each node.
 */
export interface TreeNode<TData> {
  /** The data payload for this node (rendered across table columns). */
  data: TData;

  /** Optional child nodes. Absence or empty array indicates a leaf node. */
  children?: TreeNode<TData>[];
}

/**
 * Props for the TreeTable component.
 *
 * @template TData - The shape of each row's data object.
 */
export interface TreeTableProps<TData> {
  /**
   * The root-level nodes of the tree hierarchy.
   * Each node may contain nested children of arbitrary depth.
   */
  tree: TreeNode<TData>[];

  /**
   * TanStack column definitions describing how to render each data column.
   * The first column in this array will be augmented with the expand/collapse
   * toggle and depth-based indentation.
   */
  columns: ColumnDef<TreeNode<TData>, unknown>[];

  /**
   * Controls which nodes are expanded on initial render.
   * - `true` — all nodes expanded
   * - `false` | `undefined` — all nodes collapsed
   * - `number` — expand nodes up to this depth level (0 = root collapsed,
   *   1 = root children visible, etc.)
   */
  defaultExpanded?: boolean | number;

  /**
   * Pixels of indentation per depth level. Applied as paddingLeft
   * on the first column cell. Defaults to 24.
   */
  indentSize?: number;

  /** Optional CSS class name applied to the outermost wrapper element. */
  className?: string;

  /**
   * Callback invoked when a row is clicked.
   * Receives the tree node and its depth in the hierarchy (0-indexed).
   */
  onRowClick?: (node: TreeNode<TData>, depth: number) => void;

  /** Message displayed when the tree array is empty. Defaults to "No data." */
  emptyMessage?: string;
}
