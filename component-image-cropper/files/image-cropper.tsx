"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RotateCw, ZoomIn, ZoomOut, Crop, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type HandlePosition =
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "e"
  | "w";

interface DragState {
  type: "move" | "resize";
  handle?: HandlePosition;
  startX: number;
  startY: number;
  startCrop: CropRect;
}

interface AspectRatioPreset {
  label: string;
  value: number | "free";
}

interface ImageCropperProps {
  src: string;
  aspectRatio?: number | "free";
  aspectRatioPresets?: AspectRatioPreset[];
  onCrop: (blob: Blob) => void;
  onCancel?: () => void;
  maxWidth?: number;
  maxHeight?: number;
  outputType?: "image/png" | "image/jpeg" | "image/webp";
  outputQuality?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_PRESETS: AspectRatioPreset[] = [
  { label: "Free", value: "free" },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:2", value: 3 / 2 },
];

const MIN_CROP_SIZE = 20;
const HANDLE_SIZE = 10;
const HANDLE_HIT_SIZE = 16;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getClientPos(
  e: ReactMouseEvent | ReactTouchEvent | globalThis.MouseEvent | globalThis.TouchEvent
): { clientX: number; clientY: number } {
  if ("touches" in e) {
    const touch = e.touches[0] ?? (e as globalThis.TouchEvent).changedTouches[0];
    return { clientX: touch.clientX, clientY: touch.clientY };
  }
  return { clientX: (e as globalThis.MouseEvent).clientX, clientY: (e as globalThis.MouseEvent).clientY };
}

/** Compute the cursor style for a given handle position. */
function handleCursor(handle: HandlePosition): string {
  const map: Record<HandlePosition, string> = {
    nw: "nwse-resize",
    se: "nwse-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
  };
  return map[handle];
}

/* ------------------------------------------------------------------ */
/*  CropperCanvas — core canvas + overlay                              */
/* ------------------------------------------------------------------ */

interface CropperCanvasProps {
  src: string;
  aspectRatio: number | "free";
  zoom: number;
  rotation: number;
  onCropComplete: (crop: CropRect, imageSize: { width: number; height: number }) => void;
  className?: string;
}

function CropperCanvas({
  src,
  aspectRatio,
  zoom,
  rotation,
  onCropComplete,
  className,
}: CropperCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const dragRef = useRef<DragState | null>(null);
  const scaleRef = useRef(1);

  /* ---------- Load the image ---------------------------------------- */

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
    };
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  /* ---------- Fit canvas to container & compute scale --------------- */

  useEffect(() => {
    if (!containerRef.current || !imageLoaded) return;

    const observe = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observe.observe(containerRef.current);
    return () => observe.disconnect();
  }, [imageLoaded]);

  /* ---------- Compute displayed image dimensions -------------------- */

  const displayed = useMemo(() => {
    if (!imageLoaded || canvasSize.width === 0 || canvasSize.height === 0) {
      return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
    }

    const isRotated = rotation === 90 || rotation === 270;
    const srcW = isRotated ? imageSize.height : imageSize.width;
    const srcH = isRotated ? imageSize.width : imageSize.height;

    const scale = Math.min(canvasSize.width / srcW, canvasSize.height / srcH) * zoom;
    scaleRef.current = scale;

    const dw = srcW * scale;
    const dh = srcH * scale;
    const ox = (canvasSize.width - dw) / 2;
    const oy = (canvasSize.height - dh) / 2;

    return { width: dw, height: dh, offsetX: ox, offsetY: oy };
  }, [imageLoaded, canvasSize, imageSize, zoom, rotation]);

  /* ---------- Initialize crop rect ---------------------------------- */

  useEffect(() => {
    if (displayed.width <= 0 || displayed.height <= 0) return;

    const dw = displayed.width;
    const dh = displayed.height;

    let cw: number;
    let ch: number;

    if (aspectRatio === "free") {
      cw = dw * 0.8;
      ch = dh * 0.8;
    } else {
      if (dw / dh > aspectRatio) {
        ch = dh * 0.8;
        cw = ch * aspectRatio;
      } else {
        cw = dw * 0.8;
        ch = cw / aspectRatio;
      }
    }

    cw = Math.min(cw, dw);
    ch = Math.min(ch, dh);

    const cx = displayed.offsetX + (dw - cw) / 2;
    const cy = displayed.offsetY + (dh - ch) / 2;

    setCrop({ x: cx, y: cy, width: cw, height: ch });
  }, [displayed.width, displayed.height, displayed.offsetX, displayed.offsetY, aspectRatio]);

  /* ---------- Draw canvas ------------------------------------------- */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    ctx.save();
    ctx.translate(canvasSize.width / 2, canvasSize.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scaleRef.current, scaleRef.current);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // Dark overlay outside crop
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    // Top
    ctx.fillRect(0, 0, canvasSize.width, crop.y);
    // Bottom
    ctx.fillRect(0, crop.y + crop.height, canvasSize.width, canvasSize.height - crop.y - crop.height);
    // Left
    ctx.fillRect(0, crop.y, crop.x, crop.height);
    // Right
    ctx.fillRect(crop.x + crop.width, crop.y, canvasSize.width - crop.x - crop.width, crop.height);

    // Crop border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    // Rule of thirds grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      const gx = crop.x + (crop.width / 3) * i;
      const gy = crop.y + (crop.height / 3) * i;
      ctx.beginPath();
      ctx.moveTo(gx, crop.y);
      ctx.lineTo(gx, crop.y + crop.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crop.x, gy);
      ctx.lineTo(crop.x + crop.width, gy);
      ctx.stroke();
    }

    // Resize handles
    ctx.fillStyle = "#ffffff";
    const handles = getHandlePositions(crop);
    for (const pos of Object.values(handles)) {
      ctx.fillRect(
        pos.x - HANDLE_SIZE / 2,
        pos.y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE
      );
    }
  }, [canvasSize, imageLoaded, crop, rotation]);

  useEffect(() => {
    const raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  /* ---------- Notify parent of crop in image coords ----------------- */

  useEffect(() => {
    if (!imageLoaded || displayed.width <= 0) return;

    const isRotated = rotation === 90 || rotation === 270;
    const imgW = isRotated ? imageSize.height : imageSize.width;
    const imgH = isRotated ? imageSize.width : imageSize.height;

    const relX = (crop.x - displayed.offsetX) / displayed.width;
    const relY = (crop.y - displayed.offsetY) / displayed.height;
    const relW = crop.width / displayed.width;
    const relH = crop.height / displayed.height;

    const imgCrop: CropRect = {
      x: Math.max(0, Math.round(relX * imgW)),
      y: Math.max(0, Math.round(relY * imgH)),
      width: Math.round(clamp(relW * imgW, 1, imgW)),
      height: Math.round(clamp(relH * imgH, 1, imgH)),
    };

    onCropComplete(imgCrop, { width: imgW, height: imgH });
  }, [crop, displayed, imageLoaded, imageSize, rotation, onCropComplete]);

  /* ---------- Interaction helpers ------------------------------------ */

  function getHandlePositions(c: CropRect): Record<HandlePosition, { x: number; y: number }> {
    return {
      nw: { x: c.x, y: c.y },
      ne: { x: c.x + c.width, y: c.y },
      sw: { x: c.x, y: c.y + c.height },
      se: { x: c.x + c.width, y: c.y + c.height },
      n: { x: c.x + c.width / 2, y: c.y },
      s: { x: c.x + c.width / 2, y: c.y + c.height },
      e: { x: c.x + c.width, y: c.y + c.height / 2 },
      w: { x: c.x, y: c.y + c.height / 2 },
    };
  }

  function hitTestHandle(px: number, py: number): HandlePosition | null {
    const handles = getHandlePositions(crop);
    for (const [key, pos] of Object.entries(handles) as [HandlePosition, { x: number; y: number }][]) {
      if (
        Math.abs(px - pos.x) <= HANDLE_HIT_SIZE &&
        Math.abs(py - pos.y) <= HANDLE_HIT_SIZE
      ) {
        return key;
      }
    }
    return null;
  }

  function hitTestCrop(px: number, py: number): boolean {
    return (
      px >= crop.x &&
      px <= crop.x + crop.width &&
      py >= crop.y &&
      py <= crop.y + crop.height
    );
  }

  function getCanvasPoint(clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /* ---------- Pointer event handlers -------------------------------- */

  const handlePointerDown = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { clientX, clientY } = getClientPos(e);
      const pt = getCanvasPoint(clientX, clientY);

      const handle = hitTestHandle(pt.x, pt.y);
      if (handle) {
        dragRef.current = {
          type: "resize",
          handle,
          startX: clientX,
          startY: clientY,
          startCrop: { ...crop },
        };
        return;
      }

      if (hitTestCrop(pt.x, pt.y)) {
        dragRef.current = {
          type: "move",
          startX: clientX,
          startY: clientY,
          startCrop: { ...crop },
        };
      }
    },
    [crop]
  );

  useEffect(() => {
    function constrainCrop(next: CropRect): CropRect {
      const minX = displayed.offsetX;
      const minY = displayed.offsetY;
      const maxX = displayed.offsetX + displayed.width;
      const maxY = displayed.offsetY + displayed.height;

      next.width = clamp(next.width, MIN_CROP_SIZE, maxX - minX);
      next.height = clamp(next.height, MIN_CROP_SIZE, maxY - minY);
      next.x = clamp(next.x, minX, maxX - next.width);
      next.y = clamp(next.y, minY, maxY - next.height);

      return next;
    }

    function enforceAspect(
      next: CropRect,
      handle: HandlePosition | undefined,
      ar: number | "free"
    ): CropRect {
      if (ar === "free") return next;

      // When resizing with a fixed aspect ratio, adjust height to match width
      if (handle === "e" || handle === "w" || handle === "n" || handle === "s") {
        if (handle === "e" || handle === "w") {
          next.height = next.width / ar;
        } else {
          next.width = next.height * ar;
        }
      } else {
        // Corner handles: keep width, derive height
        next.height = next.width / ar;
      }

      return next;
    }

    function handlePointerMove(e: globalThis.MouseEvent | globalThis.TouchEvent) {
      const drag = dragRef.current;
      if (!drag) return;

      e.preventDefault();
      const { clientX, clientY } = getClientPos(e);
      const dx = clientX - drag.startX;
      const dy = clientY - drag.startY;
      const sc = drag.startCrop;

      if (drag.type === "move") {
        setCrop(
          constrainCrop({
            x: sc.x + dx,
            y: sc.y + dy,
            width: sc.width,
            height: sc.height,
          })
        );
        return;
      }

      // Resize
      const handle = drag.handle!;
      let next: CropRect = { ...sc };

      switch (handle) {
        case "se":
          next.width = sc.width + dx;
          next.height = sc.height + dy;
          break;
        case "nw":
          next.x = sc.x + dx;
          next.y = sc.y + dy;
          next.width = sc.width - dx;
          next.height = sc.height - dy;
          break;
        case "ne":
          next.y = sc.y + dy;
          next.width = sc.width + dx;
          next.height = sc.height - dy;
          break;
        case "sw":
          next.x = sc.x + dx;
          next.width = sc.width - dx;
          next.height = sc.height + dy;
          break;
        case "e":
          next.width = sc.width + dx;
          break;
        case "w":
          next.x = sc.x + dx;
          next.width = sc.width - dx;
          break;
        case "s":
          next.height = sc.height + dy;
          break;
        case "n":
          next.y = sc.y + dy;
          next.height = sc.height - dy;
          break;
      }

      next = enforceAspect(next, handle, aspectRatio);
      next = constrainCrop(next);
      setCrop(next);
    }

    function handlePointerUp() {
      dragRef.current = null;
    }

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [displayed, aspectRatio]);

  /* ---------- Cursor based on hover --------------------------------- */

  const handleCanvasMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || dragRef.current) return;

      const pt = getCanvasPoint(e.clientX, e.clientY);
      const handle = hitTestHandle(pt.x, pt.y);

      if (handle) {
        canvas.style.cursor = handleCursor(handle);
      } else if (hitTestCrop(pt.x, pt.y)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "default";
      }
    },
    [crop]
  );

  return (
    <div ref={containerRef} className={cn("relative w-full h-full min-h-[200px]", className)}>
      {canvasSize.width > 0 && (
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute inset-0 touch-none"
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onMouseMove={handleCanvasMouseMove}
        />
      )}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Loading image...
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ImageCropperCore — canvas + toolbar                                */
/* ------------------------------------------------------------------ */

interface CropperCoreProps {
  src: string;
  aspectRatio: number | "free";
  presets: AspectRatioPreset[];
  onConfirm: (blob: Blob) => void;
  onCancel?: () => void;
  maxWidth?: number;
  maxHeight?: number;
  outputType: "image/png" | "image/jpeg" | "image/webp";
  outputQuality: number;
  className?: string;
}

function ImageCropperCore({
  src,
  aspectRatio: initialAspectRatio,
  presets,
  onConfirm,
  onCancel,
  maxWidth,
  maxHeight,
  outputType,
  outputQuality,
  className,
}: CropperCoreProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentAspect, setCurrentAspect] = useState<number | "free">(initialAspectRatio);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cropDataRef = useRef<{ crop: CropRect; imageSize: { width: number; height: number } } | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Load source image once for export
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      sourceImageRef.current = img;
    };
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCropUpdate = useCallback(
    (crop: CropRect, imageSize: { width: number; height: number }) => {
      cropDataRef.current = { crop, imageSize };
    },
    []
  );

  /** Export the cropped region to an offscreen canvas and return a blob. */
  const exportCrop = useCallback(async (): Promise<Blob | null> => {
    const img = sourceImageRef.current;
    const data = cropDataRef.current;
    if (!img || !data) return null;

    const { crop, imageSize } = data;
    const isRotated = rotation === 90 || rotation === 270;

    // Create a temporary canvas to hold the rotated full image
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = imageSize.width;
    tmpCanvas.height = imageSize.height;
    const tmpCtx = tmpCanvas.getContext("2d")!;

    // Draw rotated image onto temporary canvas
    tmpCtx.save();
    tmpCtx.translate(imageSize.width / 2, imageSize.height / 2);
    tmpCtx.rotate((rotation * Math.PI) / 180);
    if (isRotated) {
      tmpCtx.drawImage(img, -imageSize.height / 2, -imageSize.width / 2);
    } else {
      tmpCtx.drawImage(img, -imageSize.width / 2, -imageSize.height / 2);
    }
    tmpCtx.restore();

    // Determine output size
    let outW = crop.width;
    let outH = crop.height;

    if (maxWidth && outW > maxWidth) {
      const ratio = maxWidth / outW;
      outW = maxWidth;
      outH = Math.round(outH * ratio);
    }
    if (maxHeight && outH > maxHeight) {
      const ratio = maxHeight / outH;
      outH = maxHeight;
      outW = Math.round(outW * ratio);
    }

    // Draw the cropped region to the output canvas
    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext("2d")!;

    outCtx.drawImage(
      tmpCanvas,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      outW,
      outH
    );

    return new Promise<Blob | null>((resolve) => {
      outCanvas.toBlob(
        (blob) => resolve(blob),
        outputType,
        outputQuality
      );
    });
  }, [rotation, maxWidth, maxHeight, outputType, outputQuality]);

  const handleConfirm = useCallback(async () => {
    const blob = await exportCrop();
    if (blob) {
      onConfirm(blob);
    }
  }, [exportCrop, onConfirm]);

  const handlePreview = useCallback(async () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const blob = await exportCrop();
    if (blob) {
      setPreviewUrl(URL.createObjectURL(blob));
    }
  }, [exportCrop, previewUrl]);

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  const handleAspectChange = useCallback((value: string) => {
    setCurrentAspect(value === "free" ? "free" : parseFloat(value));
  }, []);

  const aspectSelectValue = currentAspect === "free" ? "free" : String(currentAspect);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Canvas area */}
      <div className="relative w-full aspect-[4/3] bg-neutral-950 rounded-lg overflow-hidden">
        <CropperCanvas
          src={src}
          aspectRatio={currentAspect}
          zoom={zoom}
          rotation={rotation}
          onCropComplete={handleCropUpdate}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: aspect ratio selector */}
        <div className="flex items-center gap-2">
          <Crop className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={aspectSelectValue} onValueChange={handleAspectChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Aspect" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={String(p.value)} value={String(p.value)}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Center: zoom slider */}
        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
          <Slider
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
            min={0.5}
            max={3}
            step={0.05}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>

        {/* Right: rotation + actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            title="Rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
          >
            {previewUrl ? "Hide" : "Preview"}
          </Button>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleConfirm}>
            <Check className="h-4 w-4 mr-1" />
            Crop
          </Button>
        </div>
      </div>

      {/* Preview panel */}
      {previewUrl && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground mb-2">Crop Preview</p>
          <img
            src={previewUrl}
            alt="Crop preview"
            className="max-w-full max-h-[200px] rounded border object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ImageCropper — public component with optional dialog mode          */
/* ------------------------------------------------------------------ */

export function ImageCropper({
  src,
  aspectRatio = "free",
  aspectRatioPresets,
  onCrop,
  onCancel,
  maxWidth,
  maxHeight,
  outputType = "image/png",
  outputQuality = 0.92,
  className,
}: ImageCropperProps) {
  const presets = aspectRatioPresets ?? DEFAULT_PRESETS;

  return (
    <ImageCropperCore
      src={src}
      aspectRatio={aspectRatio}
      presets={presets}
      onConfirm={onCrop}
      onCancel={onCancel}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      outputType={outputType}
      outputQuality={outputQuality}
      className={className}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  ImageCropperDialog — opens cropper in a shadcn Dialog              */
/* ------------------------------------------------------------------ */

interface ImageCropperDialogProps extends Omit<ImageCropperProps, "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function ImageCropperDialog({
  open,
  onOpenChange,
  title = "Crop Image",
  src,
  onCrop,
  ...rest
}: ImageCropperDialogProps) {
  const handleCrop = useCallback(
    (blob: Blob) => {
      onCrop(blob);
      onOpenChange(false);
    },
    [onCrop, onOpenChange]
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ImageCropper
          src={src}
          onCrop={handleCrop}
          onCancel={handleCancel}
          {...rest}
        />
      </DialogContent>
    </Dialog>
  );
}
