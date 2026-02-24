"use client";

import {
  X,
  FileAudio,
  FileText,
  FileVideo,
  ImageIcon,
  Calendar,
  HardDrive,
  Tag,
  Maximize2,
  Clock,
} from "lucide-react";
import type { MediaDetailPanelProps, MediaItem } from "./types";

/** Format bytes into a human-readable string */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** Format seconds into mm:ss */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PreviewArea({ item }: { item: MediaItem }) {
  const thumbSrc = item.thumbnailUrl ?? item.url;

  if (item.type === "image" || item.thumbnailUrl) {
    return (
      <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted">
        <img
          src={thumbSrc}
          alt={item.name}
          className="max-h-56 w-full object-contain"
        />
      </div>
    );
  }

  const icons: Record<MediaItem["type"], typeof FileText> = {
    video: FileVideo,
    audio: FileAudio,
    document: FileText,
    image: ImageIcon,
  };
  const Icon = icons[item.type];

  return (
    <div className="flex h-40 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-16 w-16 text-muted-foreground" />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}

export function MediaDetailPanel({ item, onClose }: MediaDetailPanelProps) {
  const uploadDate = new Date(item.uploadedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="truncate text-sm font-semibold" title={item.name}>
          {item.name}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-5">
          {/* Preview */}
          <PreviewArea item={item} />

          {/* Metadata */}
          <div className="space-y-3">
            <DetailRow
              icon={HardDrive}
              label="Type"
              value={item.mimeType}
            />
            <DetailRow
              icon={HardDrive}
              label="Size"
              value={formatSize(item.size)}
            />
            {item.width != null && item.height != null && (
              <DetailRow
                icon={Maximize2}
                label="Dimensions"
                value={`${item.width} x ${item.height} px`}
              />
            )}
            {item.duration != null && (
              <DetailRow
                icon={Clock}
                label="Duration"
                value={formatDuration(item.duration)}
              />
            )}
            <DetailRow
              icon={Calendar}
              label="Uploaded"
              value={uploadDate}
            />
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
