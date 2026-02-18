"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import type {
  TreeNode,
  TreeNodeRendererProps,
  TreeViewProps,
} from "./tree-view.types";

// ---------------------------------------------------------------------------
// Inline SVG icons (no lucide-react dependency)
// ---------------------------------------------------------------------------

function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "shrink-0 transition-transform duration-200",
        open && "rotate-90",
        className,
      )}
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function FolderIcon({ open, className }: { open: boolean; className?: string }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-amber-500", className)}
      aria-hidden="true"
    >
      <path d="M2 4v8a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3.5A1 1 0 005.8 3H3a1 1 0 00-1 1z" />
      <path d="M2 7h12" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-amber-500", className)}
      aria-hidden="true"
    >
      <path d="M2 4v8a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3.5A1 1 0 005.8 3H3a1 1 0 00-1 1z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-muted-foreground", className)}
      aria-hidden="true"
    >
      <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" />
      <path d="M9 2v4h4" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn("shrink-0 animate-spin text-muted-foreground", className)}
      aria-hidden="true"
    >
      <path d="M8 2a6 6 0 105.3 3.2" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-muted-foreground", className)}
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4" />
      <path d="M13 13l-3-3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Size config
// ---------------------------------------------------------------------------

const SIZE_CLASSES = {
  sm: { text: "text-xs", icon: "h-3.5 w-3.5", gap: "gap-1", py: "py-0.5", input: "h-7 text-xs" },
  md: { text: "text-sm", icon: "h-4 w-4", gap: "gap-1.5", py: "py-1", input: "h-8 text-sm" },
  lg: { text: "text-base", icon: "h-5 w-5", gap: "gap-2", py: "py-1.5", input: "h-9 text-base" },
} as const;

// ---------------------------------------------------------------------------
// Helpers: flatten tree, gather descendants, gather ancestors
// ---------------------------------------------------------------------------

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  function walk(list: TreeNode[]) {
    for (const node of list) {
      result.push(node);
      if (node.children) walk(node.children);
    }
  }
  walk(nodes);
  return result;
}

function getDescendantIds(node: TreeNode): string[] {
  const ids: string[] = [];
  function walk(n: TreeNode) {
    if (n.children) {
      for (const child of n.children) {
        ids.push(child.id);
        walk(child);
      }
    }
  }
  walk(node);
  return ids;
}

function buildParentMap(nodes: TreeNode[]): Map<string, string> {
  const map = new Map<string, string>();
  function walk(list: TreeNode[], parentId: string | null) {
    for (const node of list) {
      if (parentId) map.set(node.id, parentId);
      if (node.children) walk(node.children, node.id);
    }
  }
  walk(nodes, null);
  return map;
}

function buildNodeMap(nodes: TreeNode[]): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>();
  function walk(list: TreeNode[]) {
    for (const node of list) {
      map.set(node.id, node);
      if (node.children) walk(node.children);
    }
  }
  walk(nodes);
  return map;
}

/** Get the ordered list of visible (not hidden by collapsed parents) node ids. */
function getVisibleNodeIds(
  nodes: TreeNode[],
  expanded: Set<string>,
  filterIds: Set<string> | null,
): string[] {
  const result: string[] = [];
  function walk(list: TreeNode[]) {
    for (const node of list) {
      if (filterIds && !filterIds.has(node.id)) continue;
      result.push(node.id);
      if (node.children && expanded.has(node.id)) {
        walk(node.children);
      }
    }
  }
  walk(nodes);
  return result;
}

/** Returns set of node ids that match query or have a descendant that matches. */
function filterTree(nodes: TreeNode[], query: string): Set<string> | null {
  if (!query.trim()) return null;
  const lowerQ = query.toLowerCase();
  const matching = new Set<string>();

  function walk(list: TreeNode[]): boolean {
    let anyMatch = false;
    for (const node of list) {
      const selfMatch = node.label.toLowerCase().includes(lowerQ);
      const childMatch = node.children ? walk(node.children) : false;
      if (selfMatch || childMatch) {
        matching.add(node.id);
        anyMatch = true;
      }
    }
    return anyMatch;
  }

  walk(nodes);
  return matching;
}

// ---------------------------------------------------------------------------
// Highlight matched text
// ---------------------------------------------------------------------------

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const lowerText = text.toLowerCase();
  const lowerQ = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQ);
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tree node renderer (recursive)
// ---------------------------------------------------------------------------

function TreeNodeRenderer({
  node,
  level,
  expanded,
  selected,
  focused,
  loading,
  selectionMode,
  showCheckboxes,
  showLines,
  indent,
  size,
  searchQuery,
  isLastChild,
  onToggleExpand,
  onToggleSelect,
  onFocus,
  getCheckState,
  visibleIds,
}: TreeNodeRendererProps) {
  const sc = SIZE_CLASSES[size];
  const isExpanded = expanded.has(node.id);
  const isFocused = focused === node.id;
  const isLoading = loading.has(node.id);
  const isLeaf = node.isLeaf === true || (!node.children?.length && node.isLeaf !== false);
  const hasChildren = !isLeaf;
  const checkState = getCheckState(node.id);
  const showCheck = showCheckboxes && selectionMode !== "none";

  // Is this node visible given the current filter?
  if (visibleIds && !visibleIds.has(node.id)) return null;

  const children = node.children ?? [];
  const visibleChildren = visibleIds
    ? children.filter((c) => visibleIds.has(c.id))
    : children;

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={selectionMode !== "none" ? selected.has(node.id) : undefined}
      aria-level={level}
      aria-disabled={node.disabled || undefined}
      data-tree-id={node.id}
      className="list-none"
    >
      {/* Node row */}
      <div
        className={cn(
          "group flex items-center cursor-pointer select-none rounded-sm",
          sc.gap,
          sc.py,
          sc.text,
          "hover:bg-accent/50 transition-colors",
          isFocused && "ring-2 ring-ring ring-offset-1",
          node.disabled && "opacity-50 pointer-events-none",
        )}
        style={{ paddingLeft: `${level * indent}px` }}
        onClick={() => {
          if (node.disabled) return;
          if (hasChildren) {
            onToggleExpand(node.id);
          }
          if (selectionMode !== "none") {
            onToggleSelect(node.id);
          }
        }}
        onFocus={() => onFocus(node.id)}
        tabIndex={-1}
      >
        {/* Guide lines */}
        {showLines && level > 0 && (
          <span
            className="relative shrink-0"
            style={{ width: 0, height: "100%" }}
            aria-hidden="true"
          >
            {/* Vertical line from parent */}
            <span
              className={cn(
                "absolute border-l border-border",
                isLastChild ? "h-1/2 top-0" : "h-full top-0",
              )}
              style={{ left: `${-indent / 2}px` }}
            />
            {/* Horizontal connector */}
            <span
              className="absolute border-t border-border top-1/2"
              style={{
                left: `${-indent / 2}px`,
                width: `${indent / 2 - 2}px`,
              }}
            />
          </span>
        )}

        {/* Chevron or spacer */}
        {hasChildren ? (
          <button
            type="button"
            className="shrink-0 flex items-center justify-center rounded-sm hover:bg-accent p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              if (!node.disabled) onToggleExpand(node.id);
            }}
            tabIndex={-1}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isLoading ? (
              <SpinnerIcon className={sc.icon} />
            ) : (
              <ChevronIcon open={isExpanded} className={sc.icon} />
            )}
          </button>
        ) : (
          <span className={cn("shrink-0", sc.icon)} />
        )}

        {/* Checkbox */}
        {showCheck && (
          <Checkbox
            checked={checkState === "checked" ? true : checkState === "indeterminate" ? "indeterminate" : false}
            onCheckedChange={() => {
              if (!node.disabled) onToggleSelect(node.id);
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={node.disabled}
            className="shrink-0"
            aria-label={`Select ${node.label}`}
          />
        )}

        {/* Icon */}
        {node.icon ? (
          <span className={cn("shrink-0 flex items-center", sc.icon)}>{node.icon}</span>
        ) : hasChildren ? (
          <FolderIcon open={isExpanded} className={sc.icon} />
        ) : (
          <FileIcon className={sc.icon} />
        )}

        {/* Label */}
        <span className="truncate">
          <HighlightText text={node.label} query={searchQuery} />
        </span>
      </div>

      {/* Children (animated expand/collapse) */}
      {hasChildren && (
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out",
            isExpanded ? "max-h-[100000px] opacity-100" : "max-h-0 opacity-0",
          )}
          role="group"
        >
          <ul role="group" className="relative">
            {/* Vertical guide line spanning children */}
            {showLines && visibleChildren.length > 0 && (
              <span
                className="absolute border-l border-border"
                style={{
                  left: `${(level + 1) * indent + indent / 2}px`,
                  top: 0,
                  bottom: 0,
                }}
                aria-hidden="true"
              />
            )}
            {visibleChildren.map((child, idx) => (
              <TreeNodeRenderer
                key={child.id}
                node={child}
                level={level + 1}
                expanded={expanded}
                selected={selected}
                focused={focused}
                loading={loading}
                selectionMode={selectionMode}
                showCheckboxes={showCheckboxes}
                showLines={showLines}
                indent={indent}
                size={size}
                searchQuery={searchQuery}
                isLastChild={idx === visibleChildren.length - 1}
                onToggleExpand={onToggleExpand}
                onToggleSelect={onToggleSelect}
                onFocus={onFocus}
                getCheckState={getCheckState}
                visibleIds={visibleIds}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// TreeView (main export)
// ---------------------------------------------------------------------------

export function TreeView({
  data,
  defaultExpanded = [],
  defaultSelected = [],
  selectionMode = "none",
  showCheckboxes = false,
  onSelect,
  onExpand,
  onLoadChildren,
  showLines = false,
  indent = 20,
  searchable = false,
  size = "md",
  className,
}: TreeViewProps) {
  // ---- State ----
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(defaultSelected));
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicChildren, setDynamicChildren] = useState<Map<string, TreeNode[]>>(new Map());

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ---- Merged data (original + dynamically loaded children) ----
  const mergedData = useMemo(() => {
    if (dynamicChildren.size === 0) return data;

    function mergeNodes(nodes: TreeNode[]): TreeNode[] {
      return nodes.map((node) => {
        const dc = dynamicChildren.get(node.id);
        const children = dc ?? node.children;
        return {
          ...node,
          children: children ? mergeNodes(children) : undefined,
        };
      });
    }

    return mergeNodes(data);
  }, [data, dynamicChildren]);

  // ---- Maps ----
  const parentMap = useMemo(() => buildParentMap(mergedData), [mergedData]);
  const nodeMap = useMemo(() => buildNodeMap(mergedData), [mergedData]);

  // ---- Filtering ----
  const visibleIds = useMemo(() => filterTree(mergedData, searchQuery), [mergedData, searchQuery]);

  // ---- Visible ordered node ids (for keyboard nav) ----
  const orderedVisibleIds = useMemo(
    () => getVisibleNodeIds(mergedData, expanded, visibleIds),
    [mergedData, expanded, visibleIds],
  );

  // ---- Expand / collapse ----
  const handleToggleExpand = useCallback(
    async (id: string) => {
      const node = nodeMap.get(id);
      if (!node) return;

      const isLeaf = node.isLeaf === true || (!node.children?.length && node.isLeaf !== false && !dynamicChildren.has(id));
      if (isLeaf && !onLoadChildren) return;

      const willExpand = !expanded.has(id);

      // Lazy load children if needed
      if (
        willExpand &&
        onLoadChildren &&
        !node.children?.length &&
        !dynamicChildren.has(id) &&
        node.isLeaf !== true
      ) {
        setLoading((prev) => new Set(prev).add(id));
        try {
          const children = await onLoadChildren(id);
          setDynamicChildren((prev) => {
            const next = new Map(prev);
            next.set(id, children);
            return next;
          });
        } finally {
          setLoading((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }

      setExpanded((prev) => {
        const next = new Set(prev);
        if (willExpand) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });

      onExpand?.(id, willExpand);
    },
    [expanded, nodeMap, onExpand, onLoadChildren, dynamicChildren],
  );

  // ---- Selection with cascade ----
  const handleToggleSelect = useCallback(
    (id: string) => {
      if (selectionMode === "none") return;

      setSelected((prev) => {
        const next = new Set(prev);

        if (selectionMode === "single") {
          if (next.has(id)) {
            next.clear();
          } else {
            next.clear();
            next.add(id);
          }
        } else {
          // Multi-select with cascade
          const node = nodeMap.get(id);
          if (!node) return prev;

          const wasSelected = next.has(id);
          const descendants = getDescendantIds(node);

          if (wasSelected) {
            // Deselect self + all descendants
            next.delete(id);
            for (const dId of descendants) {
              next.delete(dId);
            }
          } else {
            // Select self + all descendants (non-disabled)
            next.add(id);
            for (const dId of descendants) {
              const dNode = nodeMap.get(dId);
              if (dNode && !dNode.disabled) {
                next.add(dId);
              }
            }
          }

          // Bubble up: for each ancestor, check if all children are selected
          let currentId: string | undefined = parentMap.get(id);
          while (currentId) {
            const parentNode = nodeMap.get(currentId);
            if (!parentNode || !parentNode.children) break;
            const allChildrenSelected = parentNode.children.every(
              (c) => c.disabled || next.has(c.id),
            );
            if (allChildrenSelected) {
              next.add(currentId);
            } else {
              next.delete(currentId);
            }
            currentId = parentMap.get(currentId);
          }
        }

        const ids = Array.from(next);
        onSelect?.(ids);
        return next;
      });
    },
    [selectionMode, nodeMap, parentMap, onSelect],
  );

  // ---- Check state (for indeterminate) ----
  const getCheckState = useCallback(
    (id: string): "checked" | "unchecked" | "indeterminate" => {
      if (selected.has(id)) return "checked";

      const node = nodeMap.get(id);
      if (!node?.children?.length) return "unchecked";

      const allFlat = flattenTree(node.children);
      const selectedCount = allFlat.filter((n) => selected.has(n.id)).length;
      if (selectedCount === 0) return "unchecked";
      if (selectedCount === allFlat.length) return "checked";
      return "indeterminate";
    },
    [selected, nodeMap],
  );

  // ---- Keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIdx = focused ? orderedVisibleIds.indexOf(focused) : -1;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextIdx = Math.min(currentIdx + 1, orderedVisibleIds.length - 1);
          const nextId = orderedVisibleIds[nextIdx];
          if (nextId) setFocused(nextId);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prevIdx = Math.max(currentIdx - 1, 0);
          const prevId = orderedVisibleIds[prevIdx];
          if (prevId) setFocused(prevId);
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          if (focused) {
            const node = nodeMap.get(focused);
            if (node && !node.isLeaf && (node.children?.length || node.isLeaf === false)) {
              if (!expanded.has(focused)) {
                handleToggleExpand(focused);
              } else if (node.children?.length) {
                // Move focus to first child
                const firstVisibleChild = visibleIds
                  ? node.children.find((c) => visibleIds.has(c.id))
                  : node.children[0];
                if (firstVisibleChild) setFocused(firstVisibleChild.id);
              }
            }
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          if (focused) {
            if (expanded.has(focused)) {
              handleToggleExpand(focused);
            } else {
              // Move to parent
              const parentId = parentMap.get(focused);
              if (parentId) setFocused(parentId);
            }
          }
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          if (focused) {
            const node = nodeMap.get(focused);
            if (node && !node.disabled) {
              if (e.key === "Enter" && !node.isLeaf) {
                handleToggleExpand(focused);
              }
              if (selectionMode !== "none") {
                handleToggleSelect(focused);
              }
            }
          }
          break;
        }
        case "Home": {
          e.preventDefault();
          const first = orderedVisibleIds[0];
          if (first) setFocused(first);
          break;
        }
        case "End": {
          e.preventDefault();
          const last = orderedVisibleIds[orderedVisibleIds.length - 1];
          if (last) setFocused(last);
          break;
        }
        default:
          break;
      }
    },
    [
      focused,
      orderedVisibleIds,
      expanded,
      nodeMap,
      parentMap,
      visibleIds,
      selectionMode,
      handleToggleExpand,
      handleToggleSelect,
    ],
  );

  // Scroll focused node into view
  useEffect(() => {
    if (!focused || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-tree-id="${CSS.escape(focused)}"]`);
    if (el) {
      (el as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [focused]);

  // ---- Render ----
  const sc = SIZE_CLASSES[size];

  return (
    <div className={cn("flex flex-col", className)} ref={containerRef}>
      {/* Search bar */}
      {searchable && (
        <div className="relative mb-2">
          <SearchIcon
            className={cn("absolute left-2.5 top-1/2 -translate-y-1/2", sc.icon)}
          />
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("pl-8", sc.input)}
            aria-label="Filter tree nodes"
          />
        </div>
      )}

      {/* Tree */}
      <ul
        role="tree"
        aria-label="Tree view"
        aria-multiselectable={selectionMode === "multi" || undefined}
        className="focus:outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!focused && orderedVisibleIds.length > 0) {
            setFocused(orderedVisibleIds[0]);
          }
        }}
      >
        {mergedData.map((node, idx) => {
          if (visibleIds && !visibleIds.has(node.id)) return null;

          const visibleRoots = visibleIds
            ? mergedData.filter((n) => visibleIds.has(n.id))
            : mergedData;
          const isLast = idx === mergedData.length - 1 || node.id === visibleRoots[visibleRoots.length - 1]?.id;

          return (
            <TreeNodeRenderer
              key={node.id}
              node={node}
              level={0}
              expanded={expanded}
              selected={selected}
              focused={focused}
              loading={loading}
              selectionMode={selectionMode}
              showCheckboxes={showCheckboxes}
              showLines={showLines}
              indent={indent}
              size={size}
              searchQuery={searchQuery}
              isLastChild={isLast}
              onToggleExpand={handleToggleExpand}
              onToggleSelect={handleToggleSelect}
              onFocus={setFocused}
              getCheckState={getCheckState}
              visibleIds={visibleIds}
            />
          );
        })}

        {/* Empty state when search yields no results */}
        {visibleIds && visibleIds.size === 0 && (
          <li className={cn("text-muted-foreground italic px-2", sc.py, sc.text)}>
            No matching nodes
          </li>
        )}
      </ul>
    </div>
  );
}
