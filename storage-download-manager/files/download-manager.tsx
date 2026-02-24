"use client";

import { useCallback, useMemo } from "react";
import {
  Download,
  Pause,
  Play,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DownloadItem,
  DownloadManagerProps,
  DownloadStatus,
} from "./download-manager.types";

export type { DownloadItem, DownloadManagerProps };

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Format bytes into a human-readable string (KB, MB, GB). */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Format download speed (bytes/s) into a readable string. */
function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond <= 0) return "0 B/s";
  return `${formatBytes(bytesPerSecond)}/s`;
}

/** Return a progress percentage clamped between 0 and 100. */
function getProgress(item: DownloadItem): number {
  if (item.totalBytes <= 0) return 0;
  return Math.min(100, Math.round((item.downloadedBytes / item.totalBytes) * 100));
}

/** Map file extensions to a descriptive icon colour class. */
function getFileIconColor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const colorMap: Record<string, string> = {
    pdf: "text-red-500",
    doc: "text-blue-500",
    docx: "text-blue-500",
    xls: "text-green-600",
    xlsx: "text-green-600",
    csv: "text-green-600",
    png: "text-purple-500",
    jpg: "text-purple-500",
    jpeg: "text-purple-500",
    gif: "text-purple-500",
    svg: "text-purple-500",
    webp: "text-purple-500",
    mp4: "text-orange-500",
    mov: "text-orange-500",
    mp3: "text-pink-500",
    wav: "text-pink-500",
    zip: "text-yellow-600",
    rar: "text-yellow-600",
    "7z": "text-yellow-600",
    tar: "text-yellow-600",
    gz: "text-yellow-600",
    js: "text-amber-500",
    ts: "text-blue-600",
    json: "text-gray-500",
  };
  return colorMap[ext] ?? "text-gray-400";
}

/** Background colour for the progress bar track, keyed by status. */
const statusBarColor: Record<DownloadStatus, string> = {
  pending: "bg-gray-300 dark:bg-gray-600",
  downloading: "bg-blue-500",
  paused: "bg-amber-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

/** Human-readable label for each status, used in the row badge. */
const statusLabel: Record<DownloadStatus, string> = {
  pending: "Pending",
  downloading: "Downloading",
  paused: "Paused",
  completed: "Completed",
  failed: "Failed",
};

/** Tailwind classes for the status badge. */
const statusBadgeClass: Record<DownloadStatus, string> = {
  pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  downloading: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

/* -------------------------------------------------------------------------- */
/*  Status icon                                                                */
/* -------------------------------------------------------------------------- */

function StatusIcon({ status }: { status: DownloadStatus }) {
  switch (status) {
    case "pending":
      return <Download className="h-4 w-4 text-gray-400" />;
    case "downloading":
      return <FileDown className="h-4 w-4 text-blue-500 animate-pulse" />;
    case "paused":
      return <Pause className="h-4 w-4 text-amber-500" />;
    case "completed":
      return <Check className="h-4 w-4 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Download row                                                               */
/* -------------------------------------------------------------------------- */

interface DownloadRowProps {
  item: DownloadItem;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}

function DownloadRow({
  item,
  onPause,
  onResume,
  onCancel,
  onRetry,
}: DownloadRowProps) {
  const progress = getProgress(item);
  const iconColor = getFileIconColor(item.filename);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      {/* Top row: icon, filename, status badge, actions */}
      <div className="flex items-center gap-3">
        {/* File icon */}
        <FileDown className={cn("h-5 w-5 flex-shrink-0", iconColor)} />

        {/* Filename + size */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {item.filename}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatBytes(item.downloadedBytes)} / {formatBytes(item.totalBytes)}
            {item.status === "downloading" && item.speed > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                {formatSpeed(item.speed)}
              </span>
            )}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            statusBadgeClass[item.status],
          )}
        >
          <StatusIcon status={item.status} />
          {statusLabel[item.status]}
          {item.status === "downloading" && (
            <span className="ml-0.5">{progress}%</span>
          )}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Pause — only for active downloads */}
          {item.status === "downloading" && (
            <button
              type="button"
              onClick={() => onPause(item.id)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400"
              aria-label={`Pause ${item.filename}`}
            >
              <Pause className="h-4 w-4" />
            </button>
          )}

          {/* Resume — only for paused */}
          {item.status === "paused" && (
            <button
              type="button"
              onClick={() => onResume(item.id)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-green-400"
              aria-label={`Resume ${item.filename}`}
            >
              <Play className="h-4 w-4" />
            </button>
          )}

          {/* Retry — only for failed */}
          {item.status === "failed" && (
            <button
              type="button"
              onClick={() => onRetry(item.id)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
              aria-label={`Retry ${item.filename}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          {/* Cancel — available for pending, downloading, paused, failed */}
          {item.status !== "completed" && (
            <button
              type="button"
              onClick={() => onCancel(item.id)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
              aria-label={`Cancel ${item.filename}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              statusBarColor[item.status],
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Error message */}
      {item.status === "failed" && item.error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {item.error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export function DownloadManager({
  items,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onDownloadAll,
  onClearCompleted,
  className,
}: DownloadManagerProps) {
  /* ---- Derived stats ---- */
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === "completed").length;
    const failed = items.filter((i) => i.status === "failed").length;
    const active = items.filter((i) => i.status === "downloading").length;
    const pending = items.filter((i) => i.status === "pending").length;
    const paused = items.filter((i) => i.status === "paused").length;

    const totalBytes = items.reduce((sum, i) => sum + i.totalBytes, 0);
    const downloadedBytes = items.reduce((sum, i) => sum + i.downloadedBytes, 0);
    const overallProgress =
      totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
    const totalSpeed = items
      .filter((i) => i.status === "downloading")
      .reduce((sum, i) => sum + i.speed, 0);

    return {
      total,
      completed,
      failed,
      active,
      pending,
      paused,
      totalBytes,
      downloadedBytes,
      overallProgress,
      totalSpeed,
    };
  }, [items]);

  const hasCompletedItems = stats.completed > 0;
  const hasPendingItems = stats.pending > 0;

  const handleDownloadAll = useCallback(() => {
    onDownloadAll();
  }, [onDownloadAll]);

  const handleClearCompleted = useCallback(() => {
    onClearCompleted();
  }, [onClearCompleted]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ---- Summary header ---- */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Downloads
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.completed}/{stats.total} completed
            </span>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            {hasPendingItems && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download All
              </button>
            )}
            {hasCompletedItems && (
              <button
                type="button"
                onClick={handleClearCompleted}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Completed
              </button>
            )}
          </div>
        </div>

        {/* Overall progress */}
        {stats.total > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                {formatBytes(stats.downloadedBytes)} / {formatBytes(stats.totalBytes)}
              </span>
              <div className="flex items-center gap-3">
                {stats.totalSpeed > 0 && (
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatSpeed(stats.totalSpeed)}
                  </span>
                )}
                <span className="font-medium">{stats.overallProgress}%</span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>

            {/* Stat pills */}
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.active > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {stats.active} downloading
                </span>
              )}
              {stats.paused > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {stats.paused} paused
                </span>
              )}
              {stats.pending > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.pending} pending
                </span>
              )}
              {stats.failed > 0 && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  {stats.failed} failed
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---- Download list ---- */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 dark:border-gray-600">
          <Download className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No downloads in queue
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <DownloadRow
              key={item.id}
              item={item}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
              onRetry={onRetry}
            />
          ))}
        </div>
      )}
    </div>
  );
}
