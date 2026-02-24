"use client";

import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BreadcrumbSegment, FileBreadcrumbProps } from "./types";

/**
 * Parses a path string into an array of breadcrumb segments.
 * Example: "/documents/reports" -> [{label:"Home",path:"/"},{label:"documents",path:"/documents"},{label:"reports",path:"/documents/reports"}]
 */
function buildSegments(currentPath: string): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [{ label: "Home", path: "/" }];
  if (!currentPath || currentPath === "/") return segments;

  const parts = currentPath.replace(/^\//, "").replace(/\/$/, "").split("/");
  let accumulated = "";
  for (const part of parts) {
    accumulated += `/${part}`;
    segments.push({ label: part, path: accumulated });
  }
  return segments;
}

/** Breadcrumb navigation bar showing the current folder hierarchy. */
export function FileBreadcrumb({
  currentPath,
  onNavigate,
  className,
}: FileBreadcrumbProps) {
  const segments = buildSegments(currentPath);

  return (
    <nav
      aria-label="File breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <div key={segment.path} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground flex items-center gap-1.5">
                {index === 0 && <Home className="h-3.5 w-3.5" />}
                {segment.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(segment.path)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {index === 0 && <Home className="h-3.5 w-3.5" />}
                {segment.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
