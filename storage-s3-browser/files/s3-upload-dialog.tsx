"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle, FileUp, File as FileIcon } from "lucide-react";
import type { S3UploadDialogProps } from "./types";

interface FileUploadState {
  file: File;
  progress: "pending" | "uploading" | "done" | "error";
  error?: string;
}

/**
 * S3UploadDialog -- modal dialog for uploading files to the current S3 prefix.
 * Supports drag-and-drop and click-to-browse.
 */
export function S3UploadDialog({
  open,
  bucket,
  prefix,
  apiBase,
  onClose,
  onUploadComplete,
}: S3UploadDialogProps) {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const additions: FileUploadState[] = Array.from(newFiles).map((file) => ({
      file,
      progress: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...additions]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleUploadAll = useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);

    const updated = [...files];
    let allDone = true;

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].progress !== "pending") continue;
      updated[i] = { ...updated[i], progress: "uploading" };
      setFiles([...updated]);

      try {
        const formData = new FormData();
        formData.append("file", updated[i].file);
        formData.append("action", "put");
        formData.append("bucket", bucket);
        formData.append("key", prefix + updated[i].file.name);

        const res = await fetch(apiBase, {
          method: "PUT",
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Upload failed: ${res.status}`);
        }

        updated[i] = { ...updated[i], progress: "done" };
      } catch (err) {
        updated[i] = {
          ...updated[i],
          progress: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        };
        allDone = false;
      }
      setFiles([...updated]);
    }

    setUploading(false);
    if (allDone) {
      setTimeout(() => {
        setFiles([]);
        onUploadComplete();
      }, 600);
    }
  }, [files, bucket, prefix, apiBase, onUploadComplete]);

  const handleClose = useCallback(() => {
    if (!uploading) {
      setFiles([]);
      onClose();
    }
  }, [uploading, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div className="px-6 py-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <FileUp className={`w-10 h-10 ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Uploading to: {bucket}/{prefix || "(root)"}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex-1 overflow-auto px-6">
            <div className="space-y-2 pb-2">
              {files.map((entry, i) => (
                <div
                  key={`${entry.file.name}-${i}`}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md"
                >
                  {entry.progress === "done" ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : entry.progress === "error" ? (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  ) : entry.progress === "uploading" ? (
                    <Upload className="w-4 h-4 text-blue-500 animate-pulse flex-shrink-0" />
                  ) : (
                    <FileIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{entry.file.name}</p>
                    {entry.error && (
                      <p className="text-xs text-red-500 truncate">{entry.error}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatFileSize(entry.file.size)}
                  </span>
                  {entry.progress === "pending" && !uploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <span className="text-xs text-gray-400">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadAll}
              disabled={uploading || files.length === 0 || files.every((f) => f.progress === "done")}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload All"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}