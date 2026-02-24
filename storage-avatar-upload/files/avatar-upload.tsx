"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Camera, Upload, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AvatarUploadProps,
  CropState,
  ValidationError,
} from "./avatar-upload.types";
import { ACCEPTED_IMAGE_TYPES } from "./avatar-upload.types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_SIZE = 128;
const DEFAULT_OUTPUT_SIZE = 256;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.05;
const ACCEPT_STRING = ACCEPTED_IMAGE_TYPES.join(",");

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/* ------------------------------------------------------------------ */
/*  CropCanvas                                                         */
/* ------------------------------------------------------------------ */

interface CropCanvasProps {
  cropState: CropState;
  canvasSize: number;
  onZoomChange: (zoom: number) => void;
  onPanChange: (panX: number, panY: number) => void;
}

/**
 * Renders the image on a canvas with a circular crop mask.
 * The user can drag to pan and the parent controls zoom.
 */
function CropCanvas({
  cropState,
  canvasSize,
  onZoomChange,
  onPanChange,
}: CropCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const { image, zoom, panX, panY } = cropState;

  /* ---------- Compute how the image maps into the canvas ----------- */

  const getDrawParams = useCallback(() => {
    const imgAspect = image.naturalWidth / image.naturalHeight;
    let baseW: number;
    let baseH: number;

    // "Cover" fit: the smaller dimension fills the canvas
    if (imgAspect >= 1) {
      // landscape or square
      baseH = canvasSize;
      baseW = canvasSize * imgAspect;
    } else {
      // portrait
      baseW = canvasSize;
      baseH = canvasSize / imgAspect;
    }

    const drawW = baseW * zoom;
    const drawH = baseH * zoom;

    // Center the image, then apply pan offset
    const drawX = (canvasSize - drawW) / 2 + panX;
    const drawY = (canvasSize - drawH) / 2 + panY;

    return { drawX, drawY, drawW, drawH };
  }, [image, canvasSize, zoom, panX, panY]);

  /* ---------- Compute max pan bounds ------------------------------- */

  const clampPan = useCallback(
    (px: number, py: number): { px: number; py: number } => {
      const imgAspect = image.naturalWidth / image.naturalHeight;
      let baseW: number;
      let baseH: number;
      if (imgAspect >= 1) {
        baseH = canvasSize;
        baseW = canvasSize * imgAspect;
      } else {
        baseW = canvasSize;
        baseH = canvasSize / imgAspect;
      }

      const drawW = baseW * zoom;
      const drawH = baseH * zoom;

      // The image must always cover the circular crop area (the full canvas).
      // Maximum pan is the overflow on each side.
      const maxPanX = Math.max(0, (drawW - canvasSize) / 2);
      const maxPanY = Math.max(0, (drawH - canvasSize) / 2);

      return {
        px: clamp(px, -maxPanX, maxPanX),
        py: clamp(py, -maxPanY, maxPanY),
      };
    },
    [image, canvasSize, zoom]
  );

  /* ---------- Draw ------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw image
    const { drawX, drawY, drawW, drawH } = getDrawParams();
    ctx.drawImage(image, drawX, drawY, drawW, drawH);

    // Circular mask overlay: darken everything outside the circle
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    const radius = canvasSize / 2;

    // Create a path that is the full canvas minus the circle
    ctx.beginPath();
    ctx.rect(0, 0, canvasSize, canvasSize);
    ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fill();

    // Draw circle border
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }, [canvasSize, image, zoom, panX, panY, getDrawParams]);

  /* ---------- Mouse / touch drag ----------------------------------- */

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const pos = "touches" in e ? e.touches[0] : e;
      lastPos.current = { x: pos.clientX, y: pos.clientY };
    },
    []
  );

  useEffect(() => {
    function handlePointerMove(e: MouseEvent | TouchEvent) {
      if (!isDragging.current) return;
      e.preventDefault();

      const pos =
        "touches" in e ? e.touches[0] : (e as MouseEvent);
      const dx = pos.clientX - lastPos.current.x;
      const dy = pos.clientY - lastPos.current.y;
      lastPos.current = { x: pos.clientX, y: pos.clientY };

      const clamped = clampPan(panX + dx, panY + dy);
      onPanChange(clamped.px, clamped.py);
    }

    function handlePointerUp() {
      isDragging.current = false;
    }

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [panX, panY, clampPan, onPanChange]);

  /* ---------- Mouse wheel zoom ------------------------------------ */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const nextZoom = clamp(zoom + delta, MIN_ZOOM, MAX_ZOOM);
      onZoomChange(nextZoom);
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [zoom, onZoomChange]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: canvasSize, height: canvasSize }}
      className="cursor-grab touch-none active:cursor-grabbing rounded-full"
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Crop export utility                                                */
/* ------------------------------------------------------------------ */

function exportCroppedAvatar(
  image: HTMLImageElement,
  canvasSize: number,
  zoom: number,
  panX: number,
  panY: number,
  outputSize: number,
  outputFormat: string,
  outputQuality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const imgAspect = image.naturalWidth / image.naturalHeight;
    let baseW: number;
    let baseH: number;
    if (imgAspect >= 1) {
      baseH = canvasSize;
      baseW = canvasSize * imgAspect;
    } else {
      baseW = canvasSize;
      baseH = canvasSize / imgAspect;
    }

    const drawW = baseW * zoom;
    const drawH = baseH * zoom;
    const drawX = (canvasSize - drawW) / 2 + panX;
    const drawY = (canvasSize - drawH) / 2 + panY;

    // Map canvas coords back to image-space coords
    const scaleX = image.naturalWidth / drawW;
    const scaleY = image.naturalHeight / drawH;

    // The visible crop circle covers the full canvas (0,0 -> canvasSize,canvasSize)
    const srcX = (0 - drawX) * scaleX;
    const srcY = (0 - drawY) * scaleY;
    const srcW = canvasSize * scaleX;
    const srcH = canvasSize * scaleY;

    const offscreen = document.createElement("canvas");
    offscreen.width = outputSize;
    offscreen.height = outputSize;
    const ctx = offscreen.getContext("2d")!;

    // Clip to a circle
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      image,
      srcX,
      srcY,
      srcW,
      srcH,
      0,
      0,
      outputSize,
      outputSize
    );

    offscreen.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to export cropped avatar"));
        }
      },
      outputFormat,
      outputQuality
    );
  });
}

/* ------------------------------------------------------------------ */
/*  AvatarUpload — public component                                    */
/* ------------------------------------------------------------------ */

export function AvatarUpload({
  currentAvatarUrl,
  onUpload,
  onError,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  size = DEFAULT_SIZE,
  outputSize = DEFAULT_OUTPUT_SIZE,
  outputFormat = "image/png",
  outputQuality = 0.92,
  loading = false,
  disabled = false,
  className,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Crop canvas size is 280px for comfortable interaction
  const cropCanvasSize = 280;

  /* ---------- Cleanup object URLs ---------------------------------- */

  useEffect(() => {
    return () => {
      if (cropState?.image.src) {
        URL.revokeObjectURL(cropState.image.src);
      }
    };
  }, [cropState]);

  /* ---------- Validation ------------------------------------------- */

  const validateFile = useCallback(
    (file: File): ValidationError | null => {
      if (
        !ACCEPTED_IMAGE_TYPES.includes(
          file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
        )
      ) {
        return "invalid-type";
      }
      if (file.size > maxFileSize) {
        return "file-too-large";
      }
      return null;
    },
    [maxFileSize]
  );

  const getErrorMessage = useCallback(
    (error: ValidationError): string => {
      switch (error) {
        case "invalid-type":
          return "Please select a valid image file (JPG, PNG, WebP, or GIF).";
        case "file-too-large":
          return `File size exceeds the ${formatBytes(maxFileSize)} limit.`;
      }
    },
    [maxFileSize]
  );

  /* ---------- Handle file selection -------------------------------- */

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        onError?.(error, getErrorMessage(error));
        return;
      }

      try {
        const img = await loadImage(file);
        setCropState({
          image: img,
          file,
          zoom: MIN_ZOOM,
          panX: 0,
          panY: 0,
        });
      } catch {
        onError?.("invalid-type", "Could not load the selected image.");
      }
    },
    [validateFile, getErrorMessage, onError]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  /* ---------- Drag and drop ---------------------------------------- */

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !loading) setDragOver(true);
    },
    [disabled, loading]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      if (disabled || loading) return;

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, loading, handleFile]
  );

  /* ---------- Crop controls ---------------------------------------- */

  const handleZoomChange = useCallback(
    (zoom: number) => {
      if (!cropState) return;
      setCropState((prev) => (prev ? { ...prev, zoom } : null));
    },
    [cropState]
  );

  const handlePanChange = useCallback(
    (panX: number, panY: number) => {
      setCropState((prev) => (prev ? { ...prev, panX, panY } : null));
    },
    []
  );

  const handleSliderChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleZoomChange(parseFloat(e.target.value));
    },
    [handleZoomChange]
  );

  const handleCancel = useCallback(() => {
    if (cropState?.image.src) {
      URL.revokeObjectURL(cropState.image.src);
    }
    setCropState(null);
  }, [cropState]);

  const handleConfirm = useCallback(async () => {
    if (!cropState) return;

    setProcessing(true);
    try {
      const blob = await exportCroppedAvatar(
        cropState.image,
        cropCanvasSize,
        cropState.zoom,
        cropState.panX,
        cropState.panY,
        outputSize,
        outputFormat,
        outputQuality
      );

      // Set a local preview
      const url = URL.createObjectURL(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);

      onUpload(cropState.file, blob);

      // Cleanup crop state
      URL.revokeObjectURL(cropState.image.src);
      setCropState(null);
    } catch {
      onError?.("invalid-type", "Failed to process the image.");
    } finally {
      setProcessing(false);
    }
  }, [
    cropState,
    cropCanvasSize,
    outputSize,
    outputFormat,
    outputQuality,
    onUpload,
    onError,
    previewUrl,
  ]);

  /* ---------- Determine what avatar to show ------------------------ */

  const displayUrl = previewUrl ?? currentAvatarUrl;
  const isInteractive = !disabled && !loading && !cropState;

  /* ---------- Render: Crop mode ------------------------------------ */

  if (cropState) {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        {/* Crop canvas */}
        <div className="relative">
          <CropCanvas
            cropState={cropState}
            canvasSize={cropCanvasSize}
            onZoomChange={handleZoomChange}
            onPanChange={handlePanChange}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 w-full max-w-[280px]">
          <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={cropState.zoom}
            onChange={handleSliderChange}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Zoom level"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={processing}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md",
              "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {processing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Apply
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Render: Upload / preview mode ------------------------ */

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Avatar preview circle */}
      <div
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-label="Upload avatar"
        onClick={isInteractive ? () => fileInputRef.current?.click() : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }
            : undefined
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ width: size, height: size }}
        className={cn(
          "relative rounded-full overflow-hidden",
          "border-2 border-dashed border-muted-foreground/30",
          "bg-muted flex items-center justify-center",
          "transition-all duration-200",
          isInteractive && "cursor-pointer hover:border-primary/50 hover:bg-muted/80",
          dragOver && "border-primary bg-primary/5 scale-105",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Current avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <Camera className="h-1/3 w-1/3 text-muted-foreground" />
        )}

        {/* Hover overlay */}
        {isInteractive && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center",
              "bg-black/50 opacity-0 hover:opacity-100 transition-opacity",
              "rounded-full"
            )}
          >
            <Upload className="h-5 w-5 text-white mb-1" />
            <span className="text-[10px] font-medium text-white">Upload</span>
          </div>
        )}

        {/* Loading spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      {/* Helper text */}
      {isInteractive && (
        <p className="text-xs text-muted-foreground text-center">
          Click or drag to upload
          <br />
          <span className="text-[10px]">
            JPG, PNG, WebP, GIF &middot; Max {formatBytes(maxFileSize)}
          </span>
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled || loading}
      />
    </div>
  );
}
