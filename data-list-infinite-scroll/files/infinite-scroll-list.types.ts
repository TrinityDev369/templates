import type React from "react";

/**
 * Props for the InfiniteScrollList component.
 *
 * @template TItem - The type of each item in the list.
 */
export interface InfiniteScrollListProps<TItem> {
  /** The array of items currently loaded. */
  items: TItem[];

  /** Render function called for each item. Receives the item and its index. */
  renderItem: (item: TItem, index: number) => React.ReactNode;

  /**
   * Callback invoked when the sentinel element enters the viewport.
   * Can return a Promise for async data fetching.
   */
  loadMore: () => void | Promise<void>;

  /** Whether there are more items available to load. */
  hasMore: boolean;

  /** Whether a load operation is currently in progress. */
  isLoading?: boolean;

  /**
   * How many pixels before the bottom of the list to trigger loadMore.
   * Applied as rootMargin to the IntersectionObserver.
   * @default 200
   */
  threshold?: number;

  /** Additional CSS class names for the outer container. */
  className?: string;

  /** Custom loading indicator rendered at the bottom while loading. */
  loadingIndicator?: React.ReactNode;

  /** Custom empty state content shown when items array is empty and not loading. */
  emptyMessage?: React.ReactNode;

  /**
   * Estimated height of each item in pixels. Used to set a minimum height
   * on the sentinel element for more reliable intersection detection.
   * @default 0
   */
  estimateItemHeight?: number;
}
