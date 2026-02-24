"use client";

import {
  Folder,
  Image,
  FileText,
  FileCode,
  Video,
  Music,
  Archive,
  File,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileEntry, FileListProps, FileType, SortField } from "./types";

/** Maps file types to lucide icon components */
const FILE_TYPE_ICONS: Record<FileType, React.ElementType> = {
  folder: Folder,
  image: Image,
  document: FileText,
  code: FileCode,
  video: Video,
  audio: Music,
  archive: Archive,
  generic: File,
};

/** Color classes per file type for visual distinction */
const FILE_TYPE_COLORS: Record<FileType, string> = {
  folder: "text-blue-500",
  image: "text-emerald-500",
  document: "text-orange-500",
  code: "text-violet-500",
  video: "text-rose-500",
  audio: "text-pink-500",
  archive: "text-amber-600",
  generic: "text-muted-foreground",
};

/** Formats bytes into a human-readable string */
function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "--";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/** Formats an ISO date string to a localized short format */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Capitalizes first letter */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface ColumnDef {
  field: SortField;
  label: string;
  className: string;
}

const COLUMNS: ColumnDef[] = [
  { field: "name", label: "Name", className: "flex-1 min-w-0" },
  { field: "size", label: "Size", className: "w-24 text-right" },
  { field: "modified", label: "Modified", className: "w-32" },
  { field: "type", label: "Type", className: "w-24" },
];

/** List (table) view of files with sortable column headers. */
export function FileList({
  files,
  selectedIds,
  sort,
  onSort,
  onSelect,
  onOpen,
  onContextMenu,
}: FileListProps) {
  return (
    <div className="w-full overflow-x-auto">
      {/* Header row */}
      <div className="flex items-center gap-3 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
        {/* Checkbox column */}
        <div className="w-6 shrink-0" />
        {/* Icon column */}
        <div className="w-6 shrink-0" />
        {COLUMNS.map((col) => (
          <button
            key={col.field}
            type="button"
            className={cn(
              "flex items-center gap-1 hover:text-foreground transition-colors select-none",
              col.className
            )}
            onClick={() => onSort(col.field)}
          >
            {col.label}
            {sort.field === col.field &&
              (sort.direction === "asc" ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              ))}
          </button>
        ))}
      </div>

      {/* File rows */}
      <div className="divide-y divide-border">
        {files.map((file) => (
          <FileListRow
            key={file.id}
            file={file}
            selected={selectedIds.has(file.id)}
            onSelect={onSelect}
            onOpen={onOpen}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    </div>
  );
}

function FileListRow({
  file,
  selected,
  onSelect,
  onOpen,
  onContextMenu,
}: {
  file: FileEntry;
  selected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onOpen: (file: FileEntry) => void;
  onContextMenu: (e: React.MouseEvent, file: FileEntry) => void;
}) {
  const Icon = FILE_TYPE_ICONS[file.type];
  const colorClass = FILE_TYPE_COLORS[file.type];

  return (
    <div
      role="row"
      tabIndex={0}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm transition-colors cursor-pointer select-none",
        selected ? "bg-primary/5" : "hover:bg-accent/50"
      )}
      onClick={(e) => onSelect(file.id, e.ctrlKey || e.metaKey)}
      onDoubleClick={() => onOpen(file)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, file);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(file);
      }}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          selected
            ? "border-primary bg-primary"
            : "border-muted-foreground/40"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(file.id, true);
        }}
      >
        {selected && (
          <svg
            className="h-3 w-3 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Icon */}
      <Icon className={cn("h-4 w-4 shrink-0", colorClass)} />

      {/* Name */}
      <div className="flex-1 min-w-0 truncate font-medium text-foreground">
        {file.name}
      </div>

      {/* Size */}
      <div className="w-24 text-right text-muted-foreground">
        {formatFileSize(file.size)}
      </div>

      {/* Modified */}
      <div className="w-32 text-muted-foreground">
        {formatDate(file.modified)}
      </div>

      {/* Type */}
      <div className="w-24 text-muted-foreground">
        {capitalize(file.type)}
      </div>
    </div>
  );
}
