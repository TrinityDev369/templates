"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MediaDetailPanel } from "./media-detail-panel";
import { MediaFilters } from "./media-filters";
import { MediaGrid } from "./media-grid";
import type {
  FilterCategory,
  MediaItem,
  MediaLibraryProps,
  SelectionMode,
  SortConfig,
  ViewMode,
} from "./types";

export function MediaLibrary({
  items,
  onUpload,
  onDelete,
  onItemOpen,
  className,
}: MediaLibraryProps) {
  // ----- State -----
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode] = useState<SelectionMode>("multi");
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----- Derived data -----
  const filteredItems = useMemo(() => {
    let result = items;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((item) => item.type === activeCategory);
    }

    // Search filter (case-insensitive name match)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }

    // Sort
    const dir = sort.direction === "asc" ? 1 : -1;
    result = [...result].sort((a, b) => {
      switch (sort.field) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "date":
          return (
            dir *
            (new Date(a.uploadedAt).getTime() -
              new Date(b.uploadedAt).getTime())
          );
        case "size":
          return dir * (a.size - b.size);
        case "type":
          return dir * a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return result;
  }, [items, activeCategory, searchQuery, sort]);

  // ----- Handlers -----
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (selectionMode === "single") {
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.clear();
            next.add(id);
          }
        } else {
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }
        return next;
      });
    },
    [selectionMode]
  );

  const handleOpen = useCallback(
    (item: MediaItem) => {
      setDetailItem(item);
      onItemOpen?.(item);
    },
    [onItemOpen]
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    onDelete?.(Array.from(selectedIds));
    setSelectedIds(new Set());
    setDetailItem(null);
  }, [selectedIds, onDelete]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onUpload?.(files);
      }
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [onUpload]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailItem(null);
  }, []);

  // ----- Render -----
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Filters */}
          <div className="shrink-0 border-b px-4 py-3">
            <MediaFilters
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sort={sort}
              onSortChange={setSort}
              selectedCount={selectedIds.size}
              onDeleteSelected={handleDeleteSelected}
              onUploadClick={handleUploadClick}
            />
          </div>

          {/* Grid / List */}
          <div className="flex-1 overflow-y-auto p-4">
            <MediaGrid
              items={filteredItems}
              viewMode={viewMode}
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onSelect={handleSelect}
              onOpen={handleOpen}
            />
          </div>
        </div>

        {/* Detail panel */}
        {detailItem && (
          <MediaDetailPanel item={detailItem} onClose={handleCloseDetail} />
        )}
      </div>
    </div>
  );
}
