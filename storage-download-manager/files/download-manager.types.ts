/** Status of an individual download item. */
export type DownloadStatus =
  | "pending"
  | "downloading"
  | "paused"
  | "completed"
  | "failed";

/** A single file in the download queue. */
export interface DownloadItem {
  /** Unique identifier for this download. */
  id: string;
  /** Display name of the file (e.g. "report.pdf"). */
  filename: string;
  /** Total file size in bytes. */
  totalBytes: number;
  /** Bytes downloaded so far. */
  downloadedBytes: number;
  /** Current download status. */
  status: DownloadStatus;
  /** Current download speed in bytes per second. Only relevant while downloading. */
  speed: number;
  /** Optional error message when status is "failed". */
  error?: string;
}

/** Props accepted by the DownloadManager component. */
export interface DownloadManagerProps {
  /** The list of download items to display. */
  items: DownloadItem[];
  /** Called when the user clicks pause on an active download. */
  onPause: (id: string) => void;
  /** Called when the user clicks resume on a paused download. */
  onResume: (id: string) => void;
  /** Called when the user clicks cancel on any non-completed download. */
  onCancel: (id: string) => void;
  /** Called when the user clicks retry on a failed download. */
  onRetry: (id: string) => void;
  /** Called when the user clicks "Download All" to start all pending items. */
  onDownloadAll: () => void;
  /** Called when the user clicks "Clear Completed" to remove finished items. */
  onClearCompleted: () => void;
  /** Optional additional CSS class names for the root container. */
  className?: string;
}
