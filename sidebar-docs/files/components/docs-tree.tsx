"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/** A node in the documentation tree. Leaf nodes have `href`, sections have `children`. */
export interface TreeNode {
  label: string;
  href?: string;
  children?: TreeNode[];
}

interface DocsTreeProps {
  nodes: TreeNode[];
  filterQuery: string;
}

/**
 * Recursively filters the tree, keeping any node whose label matches
 * or any section that contains a matching descendant.
 */
function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query) return nodes;

  const lower = query.toLowerCase();

  return nodes.reduce<TreeNode[]>((acc, node) => {
    const labelMatches = node.label.toLowerCase().includes(lower);

    if (node.children) {
      const filteredChildren = filterTree(node.children, query);
      if (labelMatches || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: labelMatches ? node.children : filteredChildren,
        });
      }
    } else if (labelMatches) {
      acc.push(node);
    }

    return acc;
  }, []);
}

/**
 * Checks whether a section (or any of its descendants) contains the active path.
 */
function sectionContainsPath(node: TreeNode, pathname: string): boolean {
  if (node.href && pathname === node.href) return true;
  if (node.children) {
    return node.children.some((child) => sectionContainsPath(child, pathname));
  }
  return false;
}

export function DocsTree({ nodes, filterQuery }: DocsTreeProps) {
  const filteredNodes = useMemo(
    () => filterTree(nodes, filterQuery),
    [nodes, filterQuery],
  );

  if (filteredNodes.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-xs text-muted-foreground">
        No results found.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {filteredNodes.map((node) => (
        <TreeItem
          key={node.label}
          node={node}
          depth={0}
          forceOpen={filterQuery.length > 0}
        />
      ))}
    </ul>
  );
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  forceOpen: boolean;
}

function TreeItem({ node, depth, forceOpen }: TreeItemProps) {
  const pathname = usePathname();
  const isSection = Boolean(node.children && node.children.length > 0);
  const containsActive = isSection && sectionContainsPath(node, pathname);

  const [manualOpen, setManualOpen] = useState(containsActive);
  const isOpen = forceOpen || manualOpen;

  const toggle = useCallback(() => {
    setManualOpen((prev) => !prev);
  }, []);

  // Leaf node: render a link
  if (!isSection) {
    const isActive = pathname === node.href;
    return (
      <li>
        <Link
          href={node.href ?? "#"}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <FileText className="h-4 w-4 shrink-0" />
          {node.label}
        </Link>
      </li>
    );
  }

  // Section node: render collapsible group
  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          containsActive ? "text-foreground" : "text-muted-foreground",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        aria-expanded={isOpen}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        {node.label}
      </button>

      {isOpen && node.children && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeItem
              key={child.label}
              node={child}
              depth={depth + 1}
              forceOpen={forceOpen}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
