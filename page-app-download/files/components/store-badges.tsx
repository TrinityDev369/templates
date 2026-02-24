"use client";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Store badge links                                                    */
/* ------------------------------------------------------------------ */
interface StoreBadgesProps {
  appStoreUrl?: string;
  playStoreUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { width: 120, height: 40 },
  md: { width: 150, height: 50 },
  lg: { width: 180, height: 60 },
} as const;

/* ------------------------------------------------------------------ */
/* Apple App Store SVG badge                                            */
/* ------------------------------------------------------------------ */
function AppStoreBadge({ width, height }: { width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 150 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Download on the App Store"
    >
      <rect width="150" height="50" rx="8" fill="#000000" />
      <rect
        x="0.5"
        y="0.5"
        width="149"
        height="49"
        rx="7.5"
        stroke="#A6A6A6"
        strokeWidth="1"
      />
      {/* Apple icon simplified */}
      <path
        d="M30.5 17.5c-.8-1-2-1.5-3-1.5-.5 0-1 .1-1.5.3-.4.2-.8.3-1 .3-.3 0-.6-.1-1-.3-.5-.2-1-.3-1.5-.3-1.5 0-3 1-3.8 2.5-1.2 2-.3 5.5 1 7.5.6.9 1.4 2 2.4 2 .5 0 .8-.2 1.3-.3.4-.2.9-.3 1.4-.3.5 0 .9.1 1.3.3.5.2.8.3 1.2.3 1 0 1.8-1 2.4-2 .4-.6.7-1.2.9-1.8-1.5-.6-2.4-2-2.4-3.7 0-1.3.7-2.5 1.7-3.2zm-2-2.5c.5-.7.8-1.5.7-2.5-.8.1-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9 0 1.7-.4 2.4-1.1z"
        fill="white"
      />
      <text x="40" y="18" fill="white" fontSize="7" fontFamily="Arial, sans-serif">
        Download on the
      </text>
      <text
        x="40"
        y="34"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        App Store
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Google Play Store SVG badge                                          */
/* ------------------------------------------------------------------ */
function PlayStoreBadge({ width, height }: { width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 150 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Get it on Google Play"
    >
      <rect width="150" height="50" rx="8" fill="#000000" />
      <rect
        x="0.5"
        y="0.5"
        width="149"
        height="49"
        rx="7.5"
        stroke="#A6A6A6"
        strokeWidth="1"
      />
      {/* Play icon simplified */}
      <path
        d="M20 14l10 11-10 11V14z"
        fill="url(#playGrad)"
      />
      <defs>
        <linearGradient id="playGrad" x1="20" y1="14" x2="30" y2="25">
          <stop stopColor="#00C3FF" />
          <stop offset="0.5" stopColor="#00E67A" />
          <stop offset="1" stopColor="#FFDE00" />
        </linearGradient>
      </defs>
      <text x="40" y="18" fill="white" fontSize="7" fontFamily="Arial, sans-serif">
        GET IT ON
      </text>
      <text
        x="40"
        y="34"
        fill="white"
        fontSize="13"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        Google Play
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Exported component                                                   */
/* ------------------------------------------------------------------ */
export function StoreBadges({
  appStoreUrl = "#",
  playStoreUrl = "#",
  className,
  size = "md",
}: StoreBadgesProps) {
  const { width, height } = sizeMap[size];

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <a
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-block rounded-lg transition-transform hover:scale-105",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        )}
      >
        <AppStoreBadge width={width} height={height} />
      </a>
      <a
        href={playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-block rounded-lg transition-transform hover:scale-105",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        )}
      >
        <PlayStoreBadge width={width} height={height} />
      </a>
    </div>
  );
}
