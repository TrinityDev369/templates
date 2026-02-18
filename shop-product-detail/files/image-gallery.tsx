"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

const PLACEHOLDER_COLORS = [
  "from-blue-100 to-blue-200",
  "from-emerald-100 to-emerald-200",
  "from-amber-100 to-amber-200",
  "from-violet-100 to-violet-200",
  "from-rose-100 to-rose-200",
];

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const initial = productName.charAt(0).toUpperCase();

  // Use at least 4 placeholder slots if no real images
  const slots = images.length > 0 ? images : Array.from({ length: 4 }, () => "");

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted/60 to-muted">
        {images[activeIndex] ? (
          <img
            src={images[activeIndex]}
            alt={`${productName} - image ${activeIndex + 1}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br",
              PLACEHOLDER_COLORS[activeIndex % PLACEHOLDER_COLORS.length]
            )}
          >
            <span className="text-6xl font-bold text-foreground/20">{initial}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {slots.slice(0, 5).map((src, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "aspect-square w-16 overflow-hidden rounded-md border-2 transition-all",
              activeIndex === i
                ? "border-primary ring-2 ring-primary/30"
                : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            {src ? (
              <img
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center bg-gradient-to-br",
                  PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]
                )}
              >
                <span className="text-sm font-bold text-foreground/20">{initial}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
