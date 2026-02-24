"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface LogoVariant {
  id: string;
  label: string;
  description: string;
  /** Preview background: "light" renders on white, "dark" on near-black. */
  preview: "light" | "dark";
  /** Placeholder image URL -- replace with actual asset URLs. */
  imageUrl: string;
  /** Download href for the asset bundle (e.g. .zip or .svg). */
  downloadUrl: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  /** Tailwind-style class for the swatch background, e.g. "bg-blue-600". */
  bgClass: string;
  /** Whether to use white text on top of this swatch. */
  lightText?: boolean;
}

export interface FontEntry {
  name: string;
  weight: string;
  sampleText: string;
  /** CSS class to apply the font, e.g. "font-sans" or a custom class. */
  fontClass: string;
}

/* ------------------------------------------------------------------ */
/* Brand Assets Grid                                                   */
/* ------------------------------------------------------------------ */

interface BrandAssetsProps {
  logos: LogoVariant[];
  colors: ColorSwatch[];
  fonts: FontEntry[];
  onDownloadAll?: () => void;
}

export function BrandAssets({
  logos,
  colors,
  fonts,
  onDownloadAll,
}: BrandAssetsProps) {
  return (
    <div className="space-y-16">
      {/* -------------------------------------------------------------- */}
      {/* Logo Variations                                                 */}
      {/* -------------------------------------------------------------- */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Logo Variations
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Download our logos in various formats. Please do not modify,
              rotate, or recolor the logo.
            </p>
          </div>
          {onDownloadAll && (
            <button
              type="button"
              onClick={onDownloadAll}
              className={cn(
                "hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
                "bg-gray-900 text-white hover:bg-gray-800 transition-colors",
                "dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              )}
            >
              <Download className="h-4 w-4" />
              Download All Assets
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
            >
              {/* Preview area */}
              <div
                className={cn(
                  "flex h-40 items-center justify-center p-6",
                  logo.preview === "dark"
                    ? "bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.imageUrl}
                  alt={logo.label}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Info + download */}
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {logo.label}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {logo.description}
                  </p>
                </div>
                <a
                  href={logo.downloadUrl}
                  download
                  className={cn(
                    "flex-shrink-0 inline-flex items-center justify-center rounded-lg p-2",
                    "text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors",
                    "dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  )}
                  aria-label={`Download ${logo.label}`}
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile download all */}
        {onDownloadAll && (
          <button
            type="button"
            onClick={onDownloadAll}
            className={cn(
              "mt-6 w-full sm:hidden inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
              "bg-gray-900 text-white hover:bg-gray-800 transition-colors",
              "dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            )}
          >
            <Download className="h-4 w-4" />
            Download All Assets
          </button>
        )}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Color Palette                                                   */}
      {/* -------------------------------------------------------------- */}
      <div id="colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Color Palette
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Our brand colors. Use these exact values across all media and digital
          touchpoints.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {colors.map((color) => (
            <div
              key={color.hex}
              className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div
                className={cn("h-24", color.bgClass)}
                aria-label={`${color.name} color swatch`}
              />
              <div className="bg-white p-3 dark:bg-gray-950">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {color.name}
                </p>
                <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {color.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Typography                                                      */}
      {/* -------------------------------------------------------------- */}
      <div id="typography">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Typography
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Our primary and secondary typefaces. Consistent typography is key to
          brand recognition.
        </p>

        <div className="mt-6 space-y-4">
          {fonts.map((font) => (
            <div
              key={`${font.name}-${font.weight}`}
              className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {font.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {font.weight}
                </p>
              </div>
              <p
                className={cn(
                  "mt-3 text-2xl text-gray-900 dark:text-gray-100",
                  font.fontClass
                )}
              >
                {font.sampleText}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
