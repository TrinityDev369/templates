/** File type categories for icon mapping and filtering */
export type FileType =
  | "folder"
  | "image"
  | "document"
  | "code"
  | "video"
  | "audio"
  | "archive"
  | "generic";

/** Sort field options */
export type SortField = "name" | "size" | "modified" | "type";

/** Sort direction */
export type SortDirection = "asc" | "desc";

/** View mode toggle */
export type ViewMode = "grid" | "list";

/** Context menu action identifiers */
export type ContextAction =
  | "open"
  | "download"
  | "rename"
  | "copy"
  | "move"
  | "delete";

/** Represents a single file or folder entry */
export interface FileEntry {
  /** Unique identifier */
  id: string;
  /** Display name including extension */
  name: string;
  /** File type category */
  type: FileType;
  /** File size in bytes. Null for folders. */
  size: number | null;
  /** Last modified date as ISO string */
  modified: string;
  /** MIME type string (e.g. "image/png"). Null for folders. */
  mimeType: string | null;
  /** Optional thumbnail URL for images/videos */
  thumbnailUrl?: string;
  /** Full path from root (e.g. "/documents/reports/q4.pdf") */
  path: string;
  /** Parent folder path (e.g. "/documents/reports") */
  parentPath: string;
}

/** Breadcrumb segment representing one level in the folder hierarchy */
export interface BreadcrumbSegment {
  /** Display label */
  label: string;
  /** Full path to this folder level */
  path: string;
}

/** Sort state combining field and direction */
export interface SortState {
  field: SortField;
  direction: SortDirection;
}

/** Position for the context menu popup */
export interface ContextMenuPosition {
  x: number;
  y: number;
}

/** Props for the top-level FileManager component */
export interface FileManagerProps {
  /** Array of file/folder entries to display */
  files: FileEntry[];
  /** Current folder path */
  currentPath: string;
  /** Called when user navigates to a folder */
  onNavigate: (path: string) => void;
  /** Called when user opens a file (double-click or Open action) */
  onOpen: (file: FileEntry) => void;
  /** Called when user requests a download */
  onDownload?: (file: FileEntry) => void;
  /** Called when user renames a file */
  onRename?: (file: FileEntry, newName: string) => void;
  /** Called when user copies a file */
  onCopy?: (files: FileEntry[]) => void;
  /** Called when user moves a file */
  onMove?: (files: FileEntry[]) => void;
  /** Called when user deletes files */
  onDelete?: (files: FileEntry[]) => void;
  /** Optional initial view mode. Defaults to "grid". */
  defaultViewMode?: ViewMode;
  /** Optional initial sort state */
  defaultSort?: SortState;
  /** Optional className for the root container */
  className?: string;
}

/** Props for the FileGrid component */
export interface FileGridProps {
  files: FileEntry[];
  selectedIds: Set<string>;
  onSelect: (id: string, multi: boolean) => void;
  onOpen: (file: FileEntry) => void;
  onContextMenu: (e: React.MouseEvent, file: FileEntry) => void;
}

/** Props for the FileList component */
export interface FileListProps {
  files: FileEntry[];
  selectedIds: Set<string>;
  sort: SortState;
  onSort: (field: SortField) => void;
  onSelect: (id: string, multi: boolean) => void;
  onOpen: (file: FileEntry) => void;
  onContextMenu: (e: React.MouseEvent, file: FileEntry) => void;
}

/** Props for the FileContextMenu component */
export interface FileContextMenuProps {
  /** The file entry the menu was invoked on */
  file: FileEntry;
  /** Screen position for the menu popup */
  position: ContextMenuPosition;
  /** Called when user selects an action */
  onAction: (action: ContextAction, file: FileEntry) => void;
  /** Called when the menu should close */
  onClose: () => void;
}

/** Props for the FileBreadcrumb component */
export interface FileBreadcrumbProps {
  /** Current folder path to derive breadcrumb segments */
  currentPath: string;
  /** Called when user clicks a breadcrumb segment */
  onNavigate: (path: string) => void;
  /** Optional className */
  className?: string;
}
