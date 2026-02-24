"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderPlus,
  Upload,
  LayoutGrid,
  LayoutList,
  ChevronRight,
  Home,
  RefreshCw,
} from "lucide-react";
import { S3ObjectList } from "./s3-object-list";
import { S3UploadDialog } from "./s3-upload-dialog";
import { S3Preview } from "./s3-preview";
import type {
  S3BrowserProps,
  S3Object,
  ListObjectsResponse,
  ViewMode,
} from "./types";

/**
 * S3Browser -- main component for browsing S3-compatible buckets.
 *
 * Features:
 * - Navigate folder prefixes with breadcrumb trail
 * - Grid/list view toggle
 * - Upload, delete, preview, and create-folder actions
 */
export function S3Browser({
  defaultBucket,
  buckets,
  apiBase = "/api/s3",
  className,
}: S3BrowserProps) {
  const [bucket, setBucket] = useState(defaultBucket);
  const [prefix, setPrefix] = useState("");
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedObject, setSelectedObject] = useState<S3Object | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const fetchObjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", bucket, prefix }),
      });
      if (!res.ok) throw new Error(`List failed: ${res.status}`);
      const data: ListObjectsResponse = await res.json();
      setObjects(data.objects);
    } catch (err) {
      console.error("Failed to list objects:", err);
      setObjects([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, bucket, prefix]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const navigateTo = useCallback((newPrefix: string) => {
    setPrefix(newPrefix);
    setSelectedObject(null);
  }, []);

  const handleDelete = useCallback(
    async (obj: S3Object) => {
      try {
        const res = await fetch(apiBase, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", bucket, key: obj.key }),
        });
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        if (selectedObject?.key === obj.key) {
          setSelectedObject(null);
        }
        await fetchObjects();
      } catch (err) {
        console.error("Failed to delete object:", err);
      }
    },
    [apiBase, bucket, fetchObjects, selectedObject],
  );

  const handleCreateFolder = useCallback(async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const folderKey = prefix + name + "/";
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-folder", bucket, key: folderKey }),
      });
      if (!res.ok) throw new Error(`Create folder failed: ${res.status}`);
      setNewFolderName("");
      setFolderDialogOpen(false);
      await fetchObjects();
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  }, [apiBase, bucket, prefix, newFolderName, fetchObjects]);

  /* Breadcrumb segments */
  const breadcrumbs = prefix
    .split("/")
    .filter(Boolean)
    .map((segment, i, arr) => ({
      label: segment,
      prefix: arr.slice(0, i + 1).join("/") + "/",
    }));

  const availableBuckets = buckets ?? [defaultBucket];

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden ${className ?? ""}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
        {/* Bucket selector */}
        {availableBuckets.length > 1 ? (
          <select
            value={bucket}
            onChange={(e) => {
              setBucket(e.target.value);
              setPrefix("");
              setSelectedObject(null);
            }}
            className="text-sm font-medium border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableBuckets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium text-gray-700">{bucket}</span>
        )}

        <div className="w-px h-5 bg-gray-300" />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-600 min-w-0 overflow-x-auto flex-1">
          <button
            onClick={() => navigateTo("")}
            className="hover:text-blue-600 flex-shrink-0"
            title="Root"
          >
            <Home className="w-4 h-4" />
          </button>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.prefix} className="flex items-center gap-1 flex-shrink-0">
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <button
                onClick={() => navigateTo(crumb.prefix)}
                className="hover:text-blue-600 hover:underline"
              >
                {crumb.label}
              </button>
            </span>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => fetchObjects()}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
            title={viewMode === "list" ? "Grid view" : "List view"}
          >
            {viewMode === "list" ? (
              <LayoutGrid className="w-4 h-4" />
            ) : (
              <LayoutList className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setFolderDialogOpen(true)}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
            title="New folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 min-h-0">
        {/* Object list */}
        <div className={`flex-1 overflow-auto ${selectedObject ? "border-r border-gray-200" : ""}`}>
          {loading && objects.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Loading...
            </div>
          ) : objects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2 py-12">
              <p>This folder is empty.</p>
              <button
                onClick={() => setUploadOpen(true)}
                className="text-blue-600 hover:underline"
              >
                Upload files
              </button>
            </div>
          ) : (
            <S3ObjectList
              objects={objects}
              viewMode={viewMode}
              selectedKey={selectedObject?.key ?? null}
              onNavigate={navigateTo}
              onSelect={setSelectedObject}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Preview panel */}
        {selectedObject && (
          <div className="w-80 flex-shrink-0 overflow-auto">
            <S3Preview
              object={selectedObject}
              bucket={bucket}
              apiBase={apiBase}
              onClose={() => setSelectedObject(null)}
            />
          </div>
        )}
      </div>

      {/* Upload dialog */}
      <S3UploadDialog
        open={uploadOpen}
        bucket={bucket}
        prefix={prefix}
        apiBase={apiBase}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={() => {
          setUploadOpen(false);
          fetchObjects();
        }}
      />

      {/* Create folder dialog */}
      {folderDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Folder
            </h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setFolderDialogOpen(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
