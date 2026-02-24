"use client";

import { useState } from "react";
import {
  Folder,
  File,
  FileImage,
  FileText,
  FileArchive,
  FileVideo,
  FileAudio,
  Trash2,
} from "lucide-react";
import type { S3Object, S3ObjectListProps } from "./types";

/** Format bytes to a human-readable string. */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "--";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/** Format an ISO date string to a locale-friendly display. */
function formatDate(iso: string): string {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Get the appropriate icon for an object based on its name. */
function getObjectIcon(obj: S3Object) {
  if (obj.isFolder) return <Folder className="w-5 h-5 text-yellow-500" />;
  const ext = obj.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) {
    return <FileImage className="w-5 h-5 text-purple-500" />;
  }
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) {
    return <FileVideo className="w-5 h-5 text-red-500" />;
  }
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) {
    return <FileAudio className="w-5 h-5 text-green-500" />;
  }
  if (["zip", "tar", "gz", "rar", "7z", "bz2"].includes(ext)) {
    return <FileArchive className="w-5 h-5 text-orange-500" />;
  }
  if (["pdf", "doc", "docx", "txt", "md", "csv", "xls", "xlsx"].includes(ext)) {
    return <FileText className="w-5 h-5 text-blue-500" />;
  }
  return <File className="w-5 h-5 text-gray-400" />;
}

/**
 * S3ObjectList -- renders the list of S3 objects in either list or grid view.
 * Folders appear first, sorted alphabetically. Files follow, also sorted.
 */
export function S3ObjectList({
  objects,
  viewMode,
  selectedKey,
  onNavigate,
  onSelect,
  onDelete,
}: S3ObjectListProps) {
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  const sorted = [...objects].sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const handleDeleteClick = (obj: S3Object, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteKey === obj.key) {
      onDelete(obj);
      setConfirmDeleteKey(null);
    } else {
      setConfirmDeleteKey(obj.key);
    }
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-3">
        {sorted.map((obj) => (
          <button
            key={obj.key}
            onClick={() => (obj.isFolder ? onNavigate(obj.key) : onSelect(obj))}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-colors ${
              selectedKey === obj.key
                ? "border-blue-500 bg-blue-50"
                : "border-transparent hover:bg-gray-50"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              {getObjectIcon(obj)}
            </div>
            <span className="text-xs text-gray-700 truncate w-full" title={obj.name}>
              {obj.name}
            </span>
            {!obj.isFolder && (
              <span className="text-[10px] text-gray-400">
                {formatBytes(obj.size)}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
          <th className="px-4 py-2 font-medium">Name</th>
          <th className="px-4 py-2 font-medium w-24">Size</th>
          <th className="px-4 py-2 font-medium w-44">Last Modified</th>
          <th className="px-4 py-2 font-medium w-28">Class</th>
          <th className="px-4 py-2 font-medium w-10" />
        </tr>
      </thead>
      <tbody>
        {sorted.map((obj) => (
          <tr
            key={obj.key}
            onClick={() => (obj.isFolder ? onNavigate(obj.key) : onSelect(obj))}
            className={`cursor-pointer border-b border-gray-50 transition-colors ${
              selectedKey === obj.key
                ? "bg-blue-50"
                : "hover:bg-gray-50"
            }`}
          >
            <td className="px-4 py-2">
              <div className="flex items-center gap-2">
                {getObjectIcon(obj)}
                <span className="truncate" title={obj.name}>
                  {obj.name}
                </span>
              </div>
            </td>
            <td className="px-4 py-2 text-gray-500 tabular-nums">
              {obj.isFolder ? "--" : formatBytes(obj.size)}
            </td>
            <td className="px-4 py-2 text-gray-500">
              {formatDate(obj.lastModified)}
            </td>
            <td className="px-4 py-2 text-gray-500 text-xs">
              {obj.isFolder ? "--" : obj.storageClass}
            </td>
            <td className="px-4 py-2">
              {!obj.isFolder && (
                <button
                  onClick={(e) => handleDeleteClick(obj, e)}
                  className={`p-1 rounded transition-colors ${
                    confirmDeleteKey === obj.key
                      ? "text-red-600 bg-red-50 hover:bg-red-100"
                      : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                  }`}
                  title={confirmDeleteKey === obj.key ? "Click again to confirm" : "Delete"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
