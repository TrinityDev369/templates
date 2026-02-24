"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage, ImageGalleryProps } from "./image-gallery.types";

export type { GalleryImage } from "./image-gallery.types";

/**
 * ImageGallery -- responsive thumbnail grid with a full-screen lightbox.
 *
 * Features:
 * - Responsive grid: 2 columns on mobile, 3 on tablet, 4 on desktop
 * - Native lazy loading on every `<img>`
 * - Lightbox overlay with prev / next navigation
 * - Keyboard support: Escape closes, ArrowLeft / ArrowRight navigates
 * - Image counter ("3 / 12") displayed in the lightbox
 * - Smooth CSS transitions on overlay and image appearance
 */
export function ImageGallery({
  images,
  className,
  aspectRatio = "aspect-square",
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isOpen = lightboxIndex !== null;

  // ---------------------------------------------------------------------------
  // Navigation helpers
  // ---------------------------------------------------------------------------

  const close = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || images.length === 0) return null;
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || images.length === 0) return null;
      return (current + 1) % images.length;
    });
  }, [images.length]);

  // ---------------------------------------------------------------------------
  // Keyboard handling & body scroll lock
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    // Prevent background scrolling while lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, prev, next]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (images.length === 0) return null;

  const currentImage =
    lightboxIndex !== null ? images[lightboxIndex] : undefined;

  return (
    <>
      {/* ---- Thumbnail Grid ---- */}
      <div
        className={cn(
          "grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4",
          className,
        )}
      >
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className={cn(
              "group relative overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              aspectRatio,
            )}
            aria-label={`View ${image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* ---- Lightbox Overlay ---- */}
      {isOpen && currentImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 animate-in fade-in duration-200"
            onClick={close}
            aria-hidden="true"
          />

          {/* Content layer (above backdrop) */}
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-12">
            {/* Top bar: counter + close */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 text-white">
              <span className="text-sm font-medium tabular-nums">
                {lightboxIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Main image */}
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              width={currentImage.width}
              height={currentImage.height}
              className="max-h-[80vh] max-w-full rounded-lg object-contain animate-in fade-in zoom-in-95 duration-200"
            />

            {/* Previous button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
