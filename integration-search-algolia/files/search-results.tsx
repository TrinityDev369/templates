"use client";

/* ------------------------------------------------------------------ */
/*  Algolia Search — Search Results Component                         */
/* ------------------------------------------------------------------ */

import { useCallback, type ReactNode } from "react";
import { useSearch } from "./search-provider";
import type { SearchHit } from "./types";

/* ---------------------------------------------------------------- */
/*  Props                                                            */
/* ---------------------------------------------------------------- */

export interface SearchResultsProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Render prop for each hit. This is the primary customization point.
   *
   * @example
   * ```tsx
   * <SearchResults
   *   renderHit={(hit) => (
   *     <div key={hit.objectID}>
   *       <h3 dangerouslySetInnerHTML={{ __html: getHighlight(hit, "name") }} />
   *     </div>
   *   )}
   * />
   * ```
   */
  renderHit: (hit: SearchHit<T>) => ReactNode;
  /** Message displayed when there are no results (default: "No results found."). */
  emptyMessage?: string;
  /** Additional CSS classes applied to the outer wrapper. */
  className?: string;
  /** Number of skeleton rows shown while loading (default: 3). */
  skeletonCount?: number;
  /** Whether to show the pagination controls (default: true). */
  showPagination?: boolean;
}

/* ---------------------------------------------------------------- */
/*  Inline Icons                                                     */
/* ---------------------------------------------------------------- */

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/*  Skeleton Loader                                                  */
/* ---------------------------------------------------------------- */

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */

/**
 * Extract the highlighted HTML string for a given attribute from a hit.
 *
 * Returns the raw attribute value as fallback if no highlight is available.
 *
 * **Usage (with `dangerouslySetInnerHTML`):**
 * ```tsx
 * <span dangerouslySetInnerHTML={{ __html: getHighlight(hit, "title") }} />
 * ```
 */
export function getHighlight<T extends Record<string, unknown>>(
  hit: SearchHit<T>,
  attribute: string,
): string {
  const hr = hit._highlightResult?.[attribute];
  if (hr && typeof hr === "object" && "value" in hr) {
    return hr.value;
  }
  const raw = hit[attribute as keyof T];
  return typeof raw === "string" ? raw : String(raw ?? "");
}

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */

/**
 * Renders Algolia search results using the render-prop pattern.
 *
 * Features:
 * - Loading skeletons during search
 * - Empty state messaging
 * - Prev/Next pagination
 * - Customizable hit rendering via `renderHit`
 * - Styled with Tailwind CSS with dark mode support
 */
export function SearchResults<T extends Record<string, unknown> = Record<string, unknown>>({
  renderHit,
  emptyMessage = "No results found.",
  className = "",
  skeletonCount = 3,
  showPagination = true,
}: SearchResultsProps<T>) {
  const { state, actions } = useSearch<T>();

  const handlePrev = useCallback(() => {
    if (state.page > 0) {
      actions.setPage(state.page - 1);
    }
  }, [state.page, actions]);

  const handleNext = useCallback(() => {
    if (state.page < state.totalPages - 1) {
      actions.setPage(state.page + 1);
    }
  }, [state.page, state.totalPages, actions]);

  /* --- No query entered yet --- */
  if (state.query.trim() === "" && !state.isSearching) {
    return null;
  }

  /* --- Loading skeleton --- */
  if (state.isSearching && state.hits.length === 0) {
    return (
      <div className={`space-y-3 ${className}`} role="status" aria-label="Loading search results">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  /* --- Error state --- */
  if (state.error) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 ${className}`}
        role="alert"
      >
        {state.error}
      </div>
    );
  }

  /* --- Empty results --- */
  if (!state.isSearching && state.hits.length === 0 && state.query.trim() !== "") {
    return (
      <div
        className={`rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400 ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  /* --- Results list + pagination --- */
  return (
    <div className={className}>
      {/* Hits */}
      <div className="space-y-2" role="list" aria-label="Search results">
        {state.hits.map((hit) => (
          <div key={hit.objectID} role="listitem">
            {renderHit(hit)}
          </div>
        ))}
      </div>

      {/* Inline loading indicator for subsequent pages */}
      {state.isSearching && state.hits.length > 0 && (
        <div className="mt-3 flex justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        </div>
      )}

      {/* Pagination */}
      {showPagination && state.totalPages > 1 && (
        <nav
          className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700"
          aria-label="Search results pagination"
        >
          <button
            type="button"
            onClick={handlePrev}
            disabled={state.page === 0}
            className={
              "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium " +
              "transition-colors " +
              "enabled:text-gray-700 enabled:hover:bg-gray-100 " +
              "disabled:cursor-not-allowed disabled:text-gray-300 " +
              "dark:enabled:text-gray-300 dark:enabled:hover:bg-gray-800 " +
              "dark:disabled:text-gray-600"
            }
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
            Previous
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {state.page + 1} of {state.totalPages}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={state.page >= state.totalPages - 1}
            className={
              "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium " +
              "transition-colors " +
              "enabled:text-gray-700 enabled:hover:bg-gray-100 " +
              "disabled:cursor-not-allowed disabled:text-gray-300 " +
              "dark:enabled:text-gray-300 dark:enabled:hover:bg-gray-800 " +
              "dark:disabled:text-gray-600"
            }
            aria-label="Next page"
          >
            Next
            <ChevronRightIcon />
          </button>
        </nav>
      )}
    </div>
  );
}
