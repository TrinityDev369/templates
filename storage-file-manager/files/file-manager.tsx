"use client";

import { useState, useMemo, useCallback } from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileGrid } from "./file-grid";
import { FileList } from "./file-list";
import { FileContextMenu } from "./file-context-menu";
import { FileBreadcrumb } from "./file-breadcrumb";
import type {
  FileEntry,
  FileManagerProps,
  ViewMode,
  SortState,
  SortField,
  ContextAction,
  ContextMenuPosition,
} from "./types";

/**
 * Sorts file entries with folders always first, then by the specified field/direction.
 */
function sortFiles(
  files: FileEntry[],
  sort: SortState
): FileEntry[] {
  const sorted = [...files];
  sorted.sort((a, b) => {
    // Folders always come first
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;

    let cmp = 0;
    switch (sort.field) {
      case "name":
        cmp = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
        break;
      case "size":
        cmp = (a.size ?? 0) - (b.size ?? 0);
        break;
      case "modified":
        cmp =
          new Date(a.modified).getTime() - new Date(b.modified).getTime();
        break;
      case "type":
        cmp = a.type.localeCompare(b.type);
        if (cmp === 0) {
          cmp = a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        }
        break;
    }

    return sort.direction === "asc" ? cmp : -cmp;
  });
  return sorted;
}

/**
 * Full-featured file manager with grid/list toggle, sorting,
 * multi-select, breadcrumb navigation, and context menus.
 */
export function FileManager({
  files,
  currentPath,
  onNavigate,
  onOpen,
  onDownload,
  onRename,
  onCopy,
  onMove,
  onDelete,
  defaultViewMode = "grid",
  defaultSort,
  className,
}: FileManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [sort, setSort] = useState<SortState>(
    defaultSort ?? { field: "name", direction: "asc" }
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    file: FileEntry;
    position: ContextMenuPosition;
  } | null>(null);

  // Sort and memoize files
  const sortedFiles = useMemo(() => sortFiles(files, sort), [files, sort]);

  // Toggle sort direction or change sort field
  const handleSort = useCallback(
    (field: SortField) => {
      setSort((prev) => {
        if (prev.field === field) {
          return {
            field,
            direction: prev.direction === "asc" ? "desc" : "asc",
          };
        }
        return { field, direction: "asc" };
      });
    },
    []
  );

  // Handle single or multi-select
  const handleSelect = useCallback((id: string, multi: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(multi ? prev : []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Handle opening a file or navigating into a folder
  const handleOpen = useCallback(
    (file: FileEntry) => {
      if (file.type === "folder") {
        onNavigate(file.path);
        setSelectedIds(new Set());
      } else {
        onOpen(file);
      }
    },
    [onNavigate, onOpen]
  );

  // Show context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, file: FileEntry) => {
      e.preventDefault();
      // Auto-select the right-clicked file if not already selected
      if (!selectedIds.has(file.id)) {
        setSelectedIds(new Set([file.id]));
      }
      setContextMenu({ file, position: { x: e.clientX, y: e.clientY } });
    },
    [selectedIds]
  );

  // Handle context menu actions
  const handleContextAction = useCallback(
    (action: ContextAction, file: FileEntry) => {
      const selected = sortedFiles.filter((f) => selectedIds.has(f.id));
      // If the action target is not in selection, use just the target file
      const targets = selected.length > 0 && selectedIds.has(file.id)
        ? selected
        : [file];

      switch (action) {
        case "open":
          handleOpen(file);
          break;
        case "download":
          onDownload?.(file);
          break;
        case "rename":
          // In a real implementation, this would trigger an inline rename UI.
          // For now, prompt for a new name.
          onRename?.(file, file.name);
          break;
        case "copy":
          onCopy?.(targets);
          break;
        case "move":
          onMove?.(targets);
          break;
        case "delete":
          onDelete?.(targets);
          break;
      }
    },
    [
      sortedFiles,
      selectedIds,
      handleOpen,
      onDownload,
      onRename,
      onCopy,
      onMove,
      onDelete,
    ]
  );

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Click on the background to deselect
  const handleBackgroundClick = useCallback(() => {
    setSelectedIds(new Set());
    setContextMenu(null);
  }, []);

  const selectedCount = selectedIds.size;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-background p-4",
        className
      )}
      onClick={handleBackgroundClick}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <FileBreadcrumb currentPath={currentPath} onNavigate={onNavigate} />

        <div className="flex items-center gap-2">
          {/* Selection count */}
          {selectedCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedCount} selected
            </span>
          )}

          {/* View mode toggle */}
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              aria-label="Grid view"
              className={cn(
                "flex items-center justify-center rounded-l-md p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              className={cn(
                "flex items-center justify-center rounded-r-md p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* File listing */}
      <div onClick={(e) => e.stopPropagation()}>
        {sortedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <p className="text-sm">This folder is empty</p>
          </div>
        ) : viewMode === "grid" ? (
          <FileGrid
            files={sortedFiles}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onOpen={handleOpen}
            onContextMenu={handleContextMenu}
          />
        ) : (
          <FileList
            files={sortedFiles}
            selectedIds={selectedIds}
            sort={sort}
            onSort={handleSort}
            onSelect={handleSelect}
            onOpen={handleOpen}
            onContextMenu={handleContextMenu}
          />
        )}
      </div>

      {/* Context menu portal */}
      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          position={contextMenu.position}
          onAction={handleContextAction}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
