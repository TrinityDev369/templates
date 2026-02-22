"use client";

import React, { useCallback, useEffect, useRef } from "react";
import type { InfiniteScrollListProps } from "./infinite-scroll-list.types";

// --------------------------------------------------------------------------
// Default loading spinner (pure CSS, no icon library)
// --------------------------------------------------------------------------

function DefaultSpinner() {
  return (
    <div className="flex items-center justify-center py-6" role="status">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800 dark:border-neutral-600 dark:border-t-neutral-200"
        aria-hidden="true"
      />
      <span className="sr-only">Loading more items...</span>
    </div>
  );
}

// --------------------------------------------------------------------------
// Default empty state
// --------------------------------------------------------------------------

function DefaultEmpty() {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-neutral-500 dark:text-neutral-400">
      No items to display.
    </div>
  );
}

// --------------------------------------------------------------------------
// InfiniteScrollList
// --------------------------------------------------------------------------

/**
 * A generic infinite scroll list that uses IntersectionObserver to detect
 * when the user has scrolled near the bottom and triggers `loadMore`.
 *
 * Features:
 * - Zero external dependencies (native IntersectionObserver)
 * - Generic `<TItem>` — works with any data shape
 * - Debounced loadMore to prevent rapid-fire calls
 * - Configurable threshold (rootMargin) for early triggering
 * - Pure-CSS loading spinner (no icon library)
 * - Customisable empty state and loading indicator
 *
 * @example
 * ```tsx
 * <InfiniteScrollList
 *   items={users}
 *   renderItem={(user) => <UserCard key={user.id} user={user} />}
 *   loadMore={fetchNextPage}
 *   hasMore={hasNextPage}
 *   isLoading={isFetchingNextPage}
 * />
 * ```
 */
export function InfiniteScrollList<TItem>({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading = false,
  threshold = 200,
  className,
  loadingIndicator,
  emptyMessage,
  estimateItemHeight = 0,
}: InfiniteScrollListProps<TItem>) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce guard: track whether a loadMore call is in-flight so we never
  // fire multiple concurrent requests even if the observer fires repeatedly.
  const loadingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback refs stable to avoid re-subscribing the observer on every render.
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  // --------------------------------------------------
  // Debounced loadMore handler
  // --------------------------------------------------
  const handleLoadMore = useCallback(() => {
    // Guard: nothing to load or already loading
    if (!hasMoreRef.current || isLoadingRef.current || loadingRef.current) {
      return;
    }

    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce: wait 100ms before actually calling loadMore so that
    // rapid-fire intersection callbacks coalesce into a single call.
    debounceTimerRef.current = setTimeout(() => {
      if (!hasMoreRef.current || isLoadingRef.current || loadingRef.current) {
        return;
      }

      loadingRef.current = true;

      const result = loadMoreRef.current();

      // Handle both sync and async loadMore
      if (result instanceof Promise) {
        result.finally(() => {
          loadingRef.current = false;
        });
      } else {
        // For sync loadMore, release the guard on the next tick so that
        // the consumer's state update (setting isLoading, etc.) can settle.
        requestAnimationFrame(() => {
          loadingRef.current = false;
        });
      }
    }, 100);
  }, []);

  // --------------------------------------------------
  // IntersectionObserver setup
  // --------------------------------------------------
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        // rootMargin extends the effective viewport so we trigger *before*
        // the sentinel is actually visible — giving the network a head start.
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      // Clean up pending debounce timer on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [threshold, handleLoadMore]);

  // --------------------------------------------------
  // Empty state
  // --------------------------------------------------
  if (items.length === 0 && !isLoading) {
    return (
      <div className={className}>
        {emptyMessage ?? <DefaultEmpty />}
      </div>
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className={className}>
      {/* Item list */}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800" role="list">
        {items.map((item, index) => (
          <div key={index} role="listitem">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (loadingIndicator ?? <DefaultSpinner />)}

      {/* Sentinel element — observed by IntersectionObserver */}
      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          style={{
            // A small minimum height ensures the sentinel can intersect even
            // when the list content is very short. estimateItemHeight can be
            // used to make this more generous.
            minHeight: estimateItemHeight > 0 ? `${estimateItemHeight}px` : "1px",
          }}
        />
      )}
    </div>
  );
}

export type { InfiniteScrollListProps } from "./infinite-scroll-list.types";
