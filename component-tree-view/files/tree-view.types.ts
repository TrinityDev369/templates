import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Data node
// ---------------------------------------------------------------------------

export interface TreeNode {
  /** Unique identifier for the node. */
  id: string;
  /** Display label. */
  label: string;
  /** Nested child nodes. */
  children?: TreeNode[];
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** When `true` the node cannot be expanded (no chevron shown). */
  isLeaf?: boolean;
  /** Disables selection and interaction. */
  disabled?: boolean;
  /** Arbitrary payload attached to the node. */
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface TreeViewProps {
  /** The tree data to render. */
  data: TreeNode[];
  /** Node ids that should be expanded on mount. */
  defaultExpanded?: string[];
  /** Node ids that should be selected on mount. */
  defaultSelected?: string[];
  /** Selection behaviour. `"none"` disables selection entirely. */
  selectionMode?: "none" | "single" | "multi";
  /** Show checkboxes next to each node (only applies when selectionMode is not "none"). */
  showCheckboxes?: boolean;
  /** Fires when the set of selected ids changes. */
  onSelect?: (ids: string[]) => void;
  /** Fires when a node is expanded or collapsed. */
  onExpand?: (id: string, expanded: boolean) => void;
  /** Async loader for children. Called when a non-leaf node with no children is expanded. */
  onLoadChildren?: (id: string) => Promise<TreeNode[]>;
  /** Show vertical/horizontal guide lines connecting nodes. */
  showLines?: boolean;
  /** Indentation per depth level in pixels. @default 20 */
  indent?: number;
  /** Show a search input above the tree to filter nodes. */
  searchable?: boolean;
  /** Visual size variant. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Additional CSS class applied to the root container. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Internal node renderer props
// ---------------------------------------------------------------------------

export interface TreeNodeRendererProps {
  node: TreeNode;
  level: number;
  expanded: Set<string>;
  selected: Set<string>;
  focused: string | null;
  loading: Set<string>;
  selectionMode: "none" | "single" | "multi";
  showCheckboxes: boolean;
  showLines: boolean;
  indent: number;
  size: "sm" | "md" | "lg";
  searchQuery: string;
  isLastChild: boolean;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onFocus: (id: string) => void;
  getCheckState: (id: string) => "checked" | "unchecked" | "indeterminate";
  visibleIds: Set<string> | null;
}
