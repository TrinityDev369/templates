"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  File as FileIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BulkUploadProps,
  QueuedFile,
  UploadStatus,
} from "./bulk-upload.types";

// Re-export types for convenience
export type {
  BulkUploadProps,
  QueuedFile,
  UploadStatus,
} from "./bulk-upload.types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Generate a unique ID for each queued file entry. */
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Format bytes into a human-readable string. */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Derive a simple category from the MIME type for icon tinting. */
function mimeCategory(type: string): "image" | "video" | "audio" | "document" | "other" {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (
    type.startsWith("application/pdf") ||
    type.startsWith("application/msword") ||
    type.startsWith("text/")
  )
    return "document";
  return "other";
}

/** Return Tailwind text colour class for a MIME category. */
function mimeColor(type: string): string {
  const cat = mimeCategory(type);
  switch (cat) {
    case "image":
      return "text-blue-500";
    case "video":
      return "text-purple-500";
    case "audio":
      return "text-amber-500";
    case "document":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

/* -------------------------------------------------------------------------- */
/*  Status icon                                                                */
/* -------------------------------------------------------------------------- */

function StatusIcon({ status }: { status: UploadStatus }) {
  switch (status) {
    case "completed":
      return <Check className="h-4 w-4 text-emerald-500" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "uploading":
      return (
        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
      );
    default:
      return <Upload className="h-4 w-4 text-muted-foreground" />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Progress bar                                                               */
/* -------------------------------------------------------------------------- */

function ProgressBar({ progress, status }: { progress: number; status: UploadStatus }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          status === "completed" && "bg-emerald-500",
          status === "failed" && "bg-destructive",
          status === "uploading" && "bg-primary",
          status === "pending" && "bg-muted-foreground/30",
        )}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Queue item row                                                             */
/* -------------------------------------------------------------------------- */

interface QueueItemProps {
  item: QueuedFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

function QueueItem({ item, onRemove, onRetry }: QueueItemProps) {
  const isActive = item.status === "uploading";

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        item.status === "completed" && "border-emerald-500/20 bg-emerald-500/5",
        item.status === "failed" && "border-destructive/20 bg-destructive/5",
        item.status === "uploading" && "border-primary/20 bg-primary/5",
        item.status === "pending" && "border-border bg-background",
      )}
    >
      {/* File type icon */}
      <FileIcon className={cn("h-5 w-5 shrink-0", mimeColor(item.file.type))} />

      {/* File info + progress */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{item.file.name}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatBytes(item.file.size)}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar progress={item.progress} status={item.status} />
          </div>
          <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {item.status === "uploading" ? `${item.progress}%` : ""}
            {item.status === "completed" ? "Done" : ""}
            {item.status === "failed" ? "Err" : ""}
          </span>
        </div>

        {item.error && (
          <p className="mt-1 text-xs text-destructive">{item.error}</p>
        )}
      </div>

      {/* Status icon */}
      <StatusIcon status={item.status} />

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {item.status === "failed" && (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={`Retry upload for ${item.file.name}`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
        {!isActive && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${item.file.name} from queue`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  BulkUpload (main component)                                                */
/* -------------------------------------------------------------------------- */

/**
 * Multi-file bulk upload with drag-and-drop, queue management, progress
 * tracking, and retry capabilities.
 *
 * The consumer supplies an `onUpload` async function that handles the actual
 * file transfer. The component manages queue state, validates constraints,
 * and renders progress feedback.
 *
 * @example
 * ```tsx
 * <BulkUpload
 *   accept="image/*,.pdf"
 *   maxFileSize={5 * 1024 * 1024}
 *   maxFiles={10}
 *   onUpload={async (file) => {
 *     const form = new FormData();
 *     form.append("file", file);
 *     await fetch("/api/upload", { method: "POST", body: form });
 *   }}
 * />
 * ```
 */
export function BulkUpload({
  onUpload,
  accept,
  maxFileSize = 10 * 1024 * 1024,
  maxFiles = 20,
  simulateProgress = true,
  className,
}: BulkUploadProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  /* -- Computed counts ---------------------------------------------------- */

  const totalCount = queue.length;
  const completedCount = queue.filter((f) => f.status === "completed").length;
  const failedCount = queue.filter((f) => f.status === "failed").length;
  const pendingCount = queue.filter(
    (f) => f.status === "pending" || f.status === "uploading",
  ).length;

  /* -- Validation --------------------------------------------------------- */

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxFileSize) {
        return `File exceeds maximum size of ${formatBytes(maxFileSize)}`;
      }
      return null;
    },
    [maxFileSize],
  );

  /* -- Add files to queue ------------------------------------------------- */

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      setQueue((prev) => {
        const slotsAvailable = maxFiles - prev.length;
        if (slotsAvailable <= 0) return prev;

        const newEntries: QueuedFile[] = [];

        for (const file of fileArray) {
          if (newEntries.length >= slotsAvailable) break;

          const error = validateFile(file);
          newEntries.push({
            id: uid(),
            file,
            status: error ? "failed" : "pending",
            progress: 0,
            error: error ?? undefined,
          });
        }

        return [...prev, ...newEntries];
      });
    },
    [maxFiles, validateFile],
  );

  /* -- Drag-and-drop handlers --------------------------------------------- */

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  /* -- File input change handler ------------------------------------------ */

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset input so the same files can be re-selected
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [addFiles],
  );

  /* -- Update a single queue entry --------------------------------------- */

  const updateItem = useCallback(
    (id: string, patch: Partial<Pick<QueuedFile, "status" | "progress" | "error">>) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  /* -- Upload a single file ---------------------------------------------- */

  const uploadOne = useCallback(
    async (entry: QueuedFile) => {
      updateItem(entry.id, { status: "uploading", progress: 0, error: undefined });

      let progressTimer: ReturnType<typeof setInterval> | undefined;
      let currentProgress = 0;

      if (simulateProgress) {
        progressTimer = setInterval(() => {
          currentProgress = Math.min(currentProgress + Math.floor(Math.random() * 12 + 3), 90);
          updateItem(entry.id, { progress: currentProgress });
        }, 200);
      }

      try {
        await onUpload(entry.file);

        if (progressTimer) clearInterval(progressTimer);
        updateItem(entry.id, { status: "completed", progress: 100 });
      } catch (err) {
        if (progressTimer) clearInterval(progressTimer);
        const message =
          err instanceof Error ? err.message : "Upload failed";
        updateItem(entry.id, {
          status: "failed",
          progress: currentProgress,
          error: message,
        });
      }
    },
    [onUpload, simulateProgress, updateItem],
  );

  /* -- Upload all pending files ------------------------------------------ */

  const handleUploadAll = useCallback(async () => {
    setIsUploading(true);

    // Snapshot the current queue to find pending items
    const pending = queue.filter((f) => f.status === "pending");

    for (const entry of pending) {
      await uploadOne(entry);
    }

    setIsUploading(false);
  }, [queue, uploadOne]);

  /* -- Retry a single failed file ---------------------------------------- */

  const handleRetry = useCallback(
    async (id: string) => {
      const entry = queue.find((f) => f.id === id);
      if (!entry || entry.status !== "failed") return;

      // Re-validate in case it was a size validation error
      const validationError = validateFile(entry.file);
      if (validationError) {
        updateItem(id, { error: validationError });
        return;
      }

      await uploadOne(entry);
    },
    [queue, uploadOne, validateFile, updateItem],
  );

  /* -- Remove from queue ------------------------------------------------- */

  const handleRemove = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /* -- Clear entire queue ------------------------------------------------ */

  const handleClearAll = useCallback(() => {
    setQueue([]);
  }, []);

  /* -- Render ------------------------------------------------------------- */

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to browse"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
          isUploading && "pointer-events-none opacity-60",
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          <Upload className="h-6 w-6" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse
            {accept && (
              <span className="ml-1 text-muted-foreground/70">
                ({accept})
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            Max {formatBytes(maxFileSize)} per file &middot; Up to {maxFiles} files
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Queue list */}
      {totalCount > 0 && (
        <>
          {/* Summary bar */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>{totalCount} file{totalCount !== 1 ? "s" : ""}</span>
              {completedCount > 0 && (
                <span className="text-emerald-500">
                  {completedCount} completed
                </span>
              )}
              {failedCount > 0 && (
                <span className="text-destructive">
                  {failedCount} failed
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={isUploading}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                    isUploading && "cursor-not-allowed opacity-60",
                  )}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {isUploading ? "Uploading..." : "Upload All"}
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isUploading}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                  isUploading && "cursor-not-allowed opacity-60",
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            </div>
          </div>

          {/* File entries */}
          <div className="space-y-2">
            {queue.map((item) => (
              <QueueItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onRetry={handleRetry}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
