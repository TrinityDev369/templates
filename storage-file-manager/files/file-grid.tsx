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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileEntry, FileGridProps, FileType } from "./types";

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

/** Grid (card) view of files with icons or thumbnails. */
export function FileGrid({
  files,
  selectedIds,
  onSelect,
  onOpen,
  onContextMenu,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {files.map((file) => (
        <FileGridCard
          key={file.id}
          file={file}
          selected={selectedIds.has(file.id)}
          onSelect={onSelect}
          onOpen={onOpen}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}

function FileGridCard({
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
      role="button"
      tabIndex={0}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors cursor-pointer select-none",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
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
      {/* Checkbox for multi-select */}
      <div
        className={cn(
          "absolute left-2 top-2 h-4 w-4 rounded border transition-opacity",
          selected
            ? "border-primary bg-primary opacity-100"
            : "border-muted-foreground/40 opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(file.id, true);
        }}
      >
        {selected && (
          <svg
            className="h-4 w-4 text-primary-foreground"
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

      {/* Thumbnail or icon */}
      <div className="flex h-16 w-16 items-center justify-center">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className="h-16 w-16 rounded object-cover"
          />
        ) : (
          <Icon className={cn("h-10 w-10", colorClass)} />
        )}
      </div>

      {/* File name */}
      <p
        className="w-full truncate text-center text-xs font-medium text-foreground"
        title={file.name}
      >
        {file.name}
      </p>

      {/* Size */}
      <p className="text-[10px] text-muted-foreground">
        {formatFileSize(file.size)}
      </p>
    </div>
  );
}
