"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CommandItem, CommandGroup } from "./command-palette.types";

// Re-export types for convenience
export type { CommandItem, CommandGroup } from "./command-palette.types";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface CommandPaletteProps {
  /** All items available in the palette */
  items: CommandItem[];
  /** Optional group definitions for ordering and labeling */
  groups?: CommandGroup[];
  /** Called when the user selects an item */
  onSelect: (item: CommandItem) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Items shown in a "Recent" section before search results */
  recentItems?: CommandItem[];
  /** Controlled open state */
  open?: boolean;
  /** Controlled open-state callback */
  onOpenChange?: (open: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/*  Search helper                                                              */
/* -------------------------------------------------------------------------- */

function matchesQuery(item: CommandItem, query: string): boolean {
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.description?.toLowerCase().includes(q)) return true;
  if (item.keywords?.some((kw) => kw.toLowerCase().includes(q))) return true;
  return false;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CommandPalette({
  items,
  groups,
  onSelect,
  placeholder = "Type a command or search...",
  recentItems,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CommandPaletteProps) {
  /* ---- State ---- */
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      controlledOnOpenChange?.(next);
    },
    [isControlled, controlledOnOpenChange],
  );

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ---- Global Cmd+K / Ctrl+K listener ---- */
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  /* ---- Reset state on open/close ---- */
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Auto-focus the search input after the dialog animation
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  /* ---- Filtered & grouped items ---- */
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter((item) => matchesQuery(item, query));
  }, [items, query]);

  const groupMap = useMemo(() => {
    const map = new Map<string, CommandGroup>();
    groups?.forEach((g) => map.set(g.id, g));
    return map;
  }, [groups]);

  /** Build an ordered flat list of items, grouped if groups are defined. */
  const { sections, flatItems } = useMemo(() => {
    const showRecent = !query.trim() && recentItems && recentItems.length > 0;

    const secs: { label: string; items: CommandItem[] }[] = [];

    // Recent items section
    if (showRecent) {
      secs.push({ label: "Recent", items: recentItems! });
    }

    if (groups && groups.length > 0) {
      // Preserve group order from the groups prop
      for (const group of groups) {
        const groupItems = filteredItems.filter((i) => i.group === group.id);
        if (groupItems.length > 0) {
          secs.push({ label: group.label, items: groupItems });
        }
      }
      // Ungrouped items
      const ungrouped = filteredItems.filter(
        (i) => !i.group || !groupMap.has(i.group),
      );
      if (ungrouped.length > 0) {
        secs.push({ label: "Other", items: ungrouped });
      }
    } else {
      // No groups defined -- show all items as a flat list
      if (filteredItems.length > 0) {
        secs.push({ label: "", items: filteredItems });
      }
    }

    const flat = secs.flatMap((s) => s.items);
    return { sections: secs, flatItems: flat };
  }, [filteredItems, groups, groupMap, query, recentItems]);

  /* ---- Scroll active item into view ---- */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.querySelector("[data-active='true']");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  /* ---- Keyboard navigation inside the list ---- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const count = flatItems.length;
      if (count === 0) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % count);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + count) % count);
          break;
        }
        case "Enter": {
          e.preventDefault();
          const selected = flatItems[activeIndex];
          if (selected) {
            setOpen(false);
            onSelect(selected);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          setOpen(false);
          break;
        }
      }
    },
    [flatItems, activeIndex, onSelect, setOpen],
  );

  /* ---- Reset active index when query changes ---- */
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  /* ---- Select handler ---- */
  const handleSelect = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      onSelect(item);
    },
    [onSelect, setOpen],
  );

  /* ---- Render ---- */
  let flatIndex = -1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          "sm:max-w-lg max-w-[calc(100%-2rem)]",
          "gap-0 overflow-hidden p-0",
          "top-[20%] translate-y-0 sm:top-[20%]",
        )}
        onKeyDown={handleKeyDown}
        aria-label="Command palette"
      >
        {/* Accessible title (visually hidden) */}
        <DialogTitle className="sr-only">Command palette</DialogTitle>

        {/* ---- Search input ---- */}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "h-12 border-0 bg-transparent px-0",
              "placeholder:text-muted-foreground",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
            )}
            aria-autocomplete="list"
            aria-controls="command-palette-list"
            aria-activedescendant={
              flatItems[activeIndex]
                ? `command-item-${flatItems[activeIndex].id}`
                : undefined
            }
          />
        </div>

        {/* ---- Results list ---- */}
        <div
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(60vh,24rem)] overflow-y-auto overscroll-contain py-2"
        >
          {flatItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          )}

          {sections.map((section) => (
            <div key={section.label || "__ungrouped"} role="group">
              {/* Group header */}
              {section.label && (
                <div
                  className="px-4 py-1.5 text-xs font-medium text-muted-foreground"
                  role="presentation"
                >
                  {section.label}
                </div>
              )}

              {/* Items */}
              {section.items.map((item) => {
                flatIndex += 1;
                const isActive = flatIndex === activeIndex;
                const currentFlatIndex = flatIndex;

                return (
                  <div
                    key={item.id}
                    id={`command-item-${item.id}`}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    className={cn(
                      "mx-2 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm",
                      "transition-colors duration-75",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50",
                    )}
                    onMouseEnter={() => setActiveIndex(currentFlatIndex)}
                    onClick={() => handleSelect(item)}
                  >
                    {/* Icon */}
                    {item.icon && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
                        {item.icon}
                      </span>
                    )}

                    {/* Label + description */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{item.label}</span>
                      {item.description && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>

                    {/* Keyboard shortcut */}
                    {item.shortcut && item.shortcut.length > 0 && (
                      <span className="ml-auto flex shrink-0 items-center gap-1">
                        {item.shortcut.map((key) => (
                          <kbd
                            key={key}
                            className={cn(
                              "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border",
                              "border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground",
                            )}
                          >
                            {key}
                          </kbd>
                        ))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ---- Footer hint ---- */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium">
                &uarr;
              </kbd>
              <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium">
                &darr;
              </kbd>
              <span className="ml-0.5">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium">
                &crarr;
              </kbd>
              <span className="ml-0.5">select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium">
                esc
              </kbd>
              <span className="ml-0.5">close</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
