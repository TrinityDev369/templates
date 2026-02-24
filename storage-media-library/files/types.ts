/** Media item type categories */
export type MediaType = "image" | "video" | "document" | "audio";

/** Sort field options */
export type SortField = "name" | "date" | "size" | "type";

/** Sort direction */
export type SortDirection = "asc" | "desc";

/** View mode for the media grid */
export type ViewMode = "grid" | "list";

/** Filter tab category */
export type FilterCategory = "all" | MediaType;

/** Selection mode */
export type SelectionMode = "single" | "multi";

/** A single media asset in the library */
export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  /** MIME type, e.g. "image/png" */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** URL to the full asset */
  url: string;
  /** URL to a thumbnail preview (optional for non-image types) */
  thumbnailUrl?: string;
  /** Width in pixels (images/videos only) */
  width?: number;
  /** Height in pixels (images/videos only) */
  height?: number;
  /** Duration in seconds (audio/video only) */
  duration?: number;
  /** Upload timestamp as ISO string */
  uploadedAt: string;
  /** User-defined tags */
  tags: string[];
}

/** Sort configuration */
export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

/** Props for the top-level MediaLibrary component */
export interface MediaLibraryProps {
  /** Array of media items to display */
  items: MediaItem[];
  /** Called when the user triggers an upload via the file input */
  onUpload?: (files: FileList) => void;
  /** Called when items are deleted (receives array of item ids) */
  onDelete?: (ids: string[]) => void;
  /** Called when a single item is clicked/opened */
  onItemOpen?: (item: MediaItem) => void;
  /** Optional className for the root container */
  className?: string;
}

/** Props for the media grid / list view */
export interface MediaGridProps {
  items: MediaItem[];
  viewMode: ViewMode;
  selectedIds: Set<string>;
  selectionMode: SelectionMode;
  onSelect: (id: string) => void;
  onOpen: (item: MediaItem) => void;
}

/** Props for the filter bar */
export interface MediaFiltersProps {
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sort: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onUploadClick: () => void;
}

/** Props for the detail side panel */
export interface MediaDetailPanelProps {
  item: MediaItem;
  onClose: () => void;
}
