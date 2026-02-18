"use client";

import * as React from "react";
import {
  Search,
  Clock,
  X,
  FileText,
  BarChart3,
  Settings,
  Users,
  Plus,
  Download,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "./types";

const RECENT_SEARCHES_KEY = "recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function removeRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((s) => s !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
}

export const PLACEHOLDER_SEARCH_DATA: {
  pages: SearchResult[];
  users: SearchResult[];
  actions: SearchResult[];
} = {
  pages: [
    { id: "p1", title: "Dashboard", description: "/dashboard", icon: BarChart3, category: "page", url: "/dashboard" },
    { id: "p2", title: "Analytics", description: "/analytics", icon: BarChart3, category: "page", url: "/analytics" },
    { id: "p3", title: "Settings", description: "/settings", icon: Settings, category: "page", url: "/settings" },
    { id: "p4", title: "Documentation", description: "/docs", icon: FileText, category: "page", url: "/docs" },
    { id: "p5", title: "Team Members", description: "/team", icon: Users, category: "page", url: "/team" },
  ],
  users: [
    { id: "u1", title: "Alice Chen", description: "alice@example.com", category: "user", avatar: "" },
    { id: "u2", title: "Bob Martinez", description: "bob@example.com", category: "user", avatar: "" },
    { id: "u3", title: "Carol Nguyen", description: "carol@example.com", category: "user", avatar: "" },
  ],
  actions: [
    { id: "a1", title: "Create new project", icon: Plus, category: "action", shortcut: "Ctrl+N" },
    { id: "a2", title: "Export data", icon: Download, category: "action", shortcut: "Ctrl+E" },
    { id: "a3", title: "Open settings", icon: Settings, category: "action", shortcut: "Ctrl+," },
  ],
};

interface GlobalSearchProps {
  pages?: SearchResult[];
  users?: SearchResult[];
  actions?: SearchResult[];
  onSelect?: (result: SearchResult) => void;
}

function filterResults(items: SearchResult[], query: string): SearchResult[] {
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
  );
}

export function GlobalSearch({
  pages = [],
  users = [],
  actions = [],
  onSelect,
}: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  // Cmd+K / Ctrl+K shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Load recent searches on open
  React.useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setQuery("");
    }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    addRecentSearch(result.title);
    onSelect?.(result);
    setOpen(false);
  };

  const handleRemoveRecent = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentSearch(search);
    setRecentSearches(getRecentSearches());
  };

  const hasQuery = query.trim().length > 0;
  const filteredPages = hasQuery ? filterResults(pages, query) : [];
  const filteredUsers = hasQuery ? filterResults(users, query) : [];
  const filteredActions = hasQuery ? filterResults(actions, query) : [];
  const hasResults = filteredPages.length + filteredUsers.length + filteredActions.length > 0;

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        className="relative h-9 w-full max-w-sm justify-start gap-2 text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type to search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {/* Empty query: show recent searches */}
          {!hasQuery && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search) => (
                <CommandItem
                  key={search}
                  onSelect={() => setQuery(search)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{search}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemoveRecent(search, e)}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Empty results */}
          {hasQuery && !hasResults && (
            <CommandEmpty>
              No results found for &ldquo;{query}&rdquo;. Try a different search term.
            </CommandEmpty>
          )}

          {/* Pages */}
          {filteredPages.length > 0 && (
            <CommandGroup heading="Pages">
              {filteredPages.map((page) => {
                const Icon = page.icon ?? FileText;
                return (
                  <CommandItem key={page.id} onSelect={() => handleSelect(page)}>
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{page.title}</span>
                    {page.description && (
                      <span className="ml-2 text-xs text-muted-foreground">{page.description}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {filteredPages.length > 0 && (filteredUsers.length > 0 || filteredActions.length > 0) && (
            <CommandSeparator />
          )}

          {/* Users */}
          {filteredUsers.length > 0 && (
            <CommandGroup heading="Users">
              {filteredUsers.map((user) => (
                <CommandItem key={user.id} onSelect={() => handleSelect(user)}>
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage src={user.avatar} alt={user.title} />
                    <AvatarFallback className="text-[10px]">
                      {user.title
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.title}</span>
                  {user.description && (
                    <span className="ml-2 text-xs text-muted-foreground">{user.description}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredUsers.length > 0 && filteredActions.length > 0 && <CommandSeparator />}

          {/* Actions */}
          {filteredActions.length > 0 && (
            <CommandGroup heading="Actions">
              {filteredActions.map((action) => {
                const Icon = action.icon ?? Settings;
                return (
                  <CommandItem key={action.id} onSelect={() => handleSelect(action)}>
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{action.title}</span>
                    {action.shortcut && (
                      <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">
                        {action.shortcut}
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>

        {/* Footer keyboard hints */}
        <div className="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            <ArrowDown className="h-3 w-3" />
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border px-1 text-[10px]">Esc</kbd>
            Close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
