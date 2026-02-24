"use client";

import { cn } from "@/lib/utils";
import {
  FileAudio,
  FileText,
  FileVideo,
  ImageIcon,
  Check,
} from "lucide-react";
import type { MediaGridProps, MediaItem } from "./types";

/** Format bytes into a human-readable string */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** Get a fallback icon for non-image media types */
function MediaTypeIcon({ type }: { type: MediaItem["type"] }) {
  switch (type) {
    case "video":
      return <FileVideo className="h-10 w-10 text-muted-foreground" />;
    case "audio":
      return <FileAudio className="h-10 w-10 text-muted-foreground" />;
    case "document":
      return <FileText className="h-10 w-10 text-muted-foreground" />;
    case "image":
    default:
      return <ImageIcon className="h-10 w-10 text-muted-foreground" />;
  }
}

function GridCard({
  item,
  isSelected,
  onSelect,
  onOpen,
}: {
  item: MediaItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: MediaItem) => void;
}) {
  const hasThumbnail = item.thumbnailUrl || item.type === "image";
  const thumbSrc = item.thumbnailUrl ?? item.url;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
    >
      {/* Selection checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
        className={cn(
          "absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border transition-colors",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 bg-background/80 opacity-0 group-hover:opacity-100"
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </button>

      {/* Thumbnail area */}
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex h-36 items-center justify-center overflow-hidden bg-muted"
      >
        {hasThumbnail ? (
          <img
            src={thumbSrc}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <MediaTypeIcon type={item.type} />
        )}
      </button>

      {/* Info */}
      <div className="flex flex-col gap-0.5 p-2">
        <span className="truncate text-sm font-medium" title={item.name}>
          {item.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatSize(item.size)}
        </span>
      </div>
    </div>
  );
}

function ListRow({
  item,
  isSelected,
  onSelect,
  onOpen,
}: {
  item: MediaItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: MediaItem) => void;
}) {
  const dateStr = new Date(item.uploadedAt).toLocaleDateString();

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-md border bg-card px-3 py-2 transition-shadow hover:shadow-sm",
        isSelected && "ring-2 ring-primary"
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 bg-background"
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </button>

      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-muted"
      >
        {item.thumbnailUrl || item.type === "image" ? (
          <img
            src={item.thumbnailUrl ?? item.url}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <MediaTypeIcon type={item.type} />
        )}
      </button>

      {/* Name */}
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="min-w-0 flex-1 text-left"
      >
        <span className="truncate text-sm font-medium">{item.name}</span>
      </button>

      {/* Meta columns */}
      <span className="hidden w-20 shrink-0 text-xs text-muted-foreground sm:block">
        {item.type}
      </span>
      <span className="hidden w-20 shrink-0 text-right text-xs text-muted-foreground sm:block">
        {formatSize(item.size)}
      </span>
      <span className="hidden w-24 shrink-0 text-right text-xs text-muted-foreground md:block">
        {dateStr}
      </span>
    </div>
  );
}

export function MediaGrid({
  items,
  viewMode,
  selectedIds,
  onSelect,
  onOpen,
}: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <ImageIcon className="mb-3 h-12 w-12" />
        <p className="text-sm">No media items found</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <ListRow
            key={item.id}
            item={item}
            isSelected={selectedIds.has(item.id)}
            onSelect={onSelect}
            onOpen={onOpen}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <GridCard
          key={item.id}
          item={item}
          isSelected={selectedIds.has(item.id)}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
