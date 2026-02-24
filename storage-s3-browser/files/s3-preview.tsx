"use client";

import { useState, useEffect } from "react";
import { X, Download, ExternalLink, Copy, Check } from "lucide-react";
import type { S3PreviewProps, PresignedUrlResponse } from "./types";

/** Image extensions that can be previewed inline. */
const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico",
]);

/** Format bytes to a human-readable string. */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * S3Preview -- side panel that shows metadata and optional image preview
 * for a selected S3 object.
 */
export function S3Preview({ object, bucket, apiBase, onClose }: S3PreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  const ext = object?.name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = IMAGE_EXTENSIONS.has(ext);

  useEffect(() => {
    if (!object || object.isFolder) {
      setPreviewUrl(null);
      return;
    }

    let cancelled = false;
    setLoadingUrl(true);
    setPreviewUrl(null);

    (async () => {
      try {
        const res = await fetch(apiBase, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get-signed-url",
            bucket,
            key: object.key,
          }),
        });
        if (!res.ok) throw new Error(`Failed to get URL: ${res.status}`);
        const data: PresignedUrlResponse = await res.json();
        if (!cancelled) setPreviewUrl(data.url);
      } catch (err) {
        console.error("Failed to get presigned URL:", err);
      } finally {
        if (!cancelled) setLoadingUrl(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [object, bucket, apiBase]);

  if (!object) return null;

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(object.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may not be available */
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const a = document.createElement("a");
      a.href = previewUrl;
      a.download = object.name;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 truncate" title={object.name}>
          {object.name}
        </h4>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image preview */}
      {isImage && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          {loadingUrl ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading preview...
            </div>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt={object.name}
              className="w-full h-auto max-h-60 object-contain rounded-md bg-white border border-gray-200"
            />
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Preview unavailable
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex-1 overflow-auto p-4">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Key</dt>
            <dd className="mt-0.5 text-gray-700 break-all flex items-start gap-1">
              <span className="flex-1">{object.key}</span>
              <button
                onClick={handleCopyKey}
                className="p-0.5 rounded hover:bg-gray-100 text-gray-400 flex-shrink-0 mt-0.5"
                title="Copy key"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Size</dt>
            <dd className="mt-0.5 text-gray-700">{formatBytes(object.size)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Modified
            </dt>
            <dd className="mt-0.5 text-gray-700">
              {object.lastModified
                ? new Date(object.lastModified).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Storage Class
            </dt>
            <dd className="mt-0.5 text-gray-700">{object.storageClass || "STANDARD"}</dd>
          </div>
          {object.contentType && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content Type
              </dt>
              <dd className="mt-0.5 text-gray-700">{object.contentType}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bucket</dt>
            <dd className="mt-0.5 text-gray-700">{bucket}</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3 border-t border-gray-200">
        <button
          onClick={handleDownload}
          disabled={!previewUrl}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
