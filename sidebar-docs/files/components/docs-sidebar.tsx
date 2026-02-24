"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocsSearch } from "@/components/docs-search";
import { DocsTree, type TreeNode } from "@/components/docs-tree";
import { BookOpen } from "lucide-react";

/**
 * Documentation tree structure.
 * Edit this array to define your sidebar navigation.
 */
const docsTree: TreeNode[] = [
  {
    label: "Getting Started",
    children: [
      { label: "Introduction", href: "/docs/introduction" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Quick Start", href: "/docs/quick-start" },
    ],
  },
  {
    label: "Guides",
    children: [
      { label: "Authentication", href: "/docs/guides/authentication" },
      { label: "Data Fetching", href: "/docs/guides/data-fetching" },
      { label: "Deployment", href: "/docs/guides/deployment" },
    ],
  },
  {
    label: "API Reference",
    children: [
      { label: "Configuration", href: "/docs/api/configuration" },
      { label: "Components", href: "/docs/api/components" },
      { label: "Hooks", href: "/docs/api/hooks" },
      { label: "Utilities", href: "/docs/api/utilities" },
    ],
  },
  {
    label: "Advanced",
    children: [
      { label: "Architecture", href: "/docs/advanced/architecture" },
      { label: "Performance", href: "/docs/advanced/performance" },
      { label: "Plugins", href: "/docs/advanced/plugins" },
    ],
  },
];

export function DocsSidebar() {
  const [query, setQuery] = useState("");

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-background">
      {/* Sticky header */}
      <div className="flex items-center gap-2 px-4 py-4">
        <BookOpen className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-semibold tracking-tight">
          Documentation
        </span>
      </div>

      <div className="px-3 pb-3">
        <DocsSearch value={query} onChange={setQuery} />
      </div>

      <Separator />

      {/* Scrollable tree area */}
      <ScrollArea className="flex-1">
        <nav className="px-3 py-3">
          <DocsTree nodes={docsTree} filterQuery={query} />
        </nav>
      </ScrollArea>
    </aside>
  );
}
