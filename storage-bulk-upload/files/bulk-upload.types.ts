/**
 * Type definitions for the BulkUpload component.
 *
 * Covers the upload status lifecycle, individual queued file entries,
 * and the full set of props accepted by the top-level component.
 */

/* -- Upload status -------------------------------------------------------- */

/**
 * Lifecycle status of a single file in the upload queue.
 *
 * - `pending`    — file added to queue, waiting to start
 * - `uploading`  — upload in progress (has a numeric progress percentage)
 * - `completed`  — upload finished successfully
 * - `failed`     — upload encountered an error
 */
export type UploadStatus = "pending" | "uploading" | "completed" | "failed";

/* -- Queued file entry ---------------------------------------------------- */

/**
 * Represents a single file in the upload queue along with its runtime state.
 */
export interface QueuedFile {
  /** Unique identifier for this queue entry. */
  id: string;

  /** The raw File object from the browser. */
  file: File;

  /** Current lifecycle status. */
  status: UploadStatus;

  /** Upload progress as a percentage (0-100). Only meaningful when status is `uploading`. */
  progress: number;

  /** Optional error message populated when status is `failed`. */
  error?: string;
}

/* -- Component props ------------------------------------------------------ */

/**
 * Props accepted by the BulkUpload component.
 */
export interface BulkUploadProps {
  /**
   * Async callback invoked for each file when the upload begins.
   * The consumer is responsible for the actual upload logic (e.g. fetch, S3 SDK).
   * Throw an error to mark the file as failed.
   */
  onUpload: (file: File) => Promise<void>;

  /**
   * Comma-separated MIME types or file extensions for the HTML `accept` attribute.
   * Examples: `"image/*"`, `".pdf,.docx"`, `"image/png,image/jpeg"`.
   * @default undefined (all file types allowed)
   */
  accept?: string;

  /**
   * Maximum allowed size per file in bytes.
   * Files exceeding this limit are rejected at selection time.
   * @default 10485760 (10 MB)
   */
  maxFileSize?: number;

  /**
   * Maximum number of files allowed in the queue at once.
   * Additional files beyond this limit are silently ignored.
   * @default 20
   */
  maxFiles?: number;

  /**
   * Whether to simulate upload progress for demo/preview purposes.
   * When true, the component animates progress bars using timers
   * instead of relying solely on the onUpload callback.
   * @default true
   */
  simulateProgress?: boolean;

  /** Optional CSS class name applied to the outermost wrapper. */
  className?: string;
}
