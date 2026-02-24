/** Types for the S3 browser module. */

/** An S3 object (file or folder prefix). */
export interface S3Object {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  storageClass: string;
  isFolder: boolean;
  contentType?: string;
}

/** Response from the list objects API. */
export interface ListObjectsResponse {
  objects: S3Object[];
  prefix: string;
  bucket: string;
  continuationToken?: string;
  isTruncated: boolean;
}

/** Response from the upload API. */
export interface UploadResponse {
  key: string;
  bucket: string;
  size: number;
}

/** Response from the delete API. */
export interface DeleteResponse {
  key: string;
  deleted: boolean;
}

/** Response from the presigned URL API. */
export interface PresignedUrlResponse {
  url: string;
  expiresIn: number;
}

/** API action discriminator for the S3 route. */
export type S3Action = "list" | "put" | "delete" | "get-signed-url" | "create-folder";

/** Request body for S3 API operations. */
export interface S3ApiRequest {
  action: S3Action;
  bucket: string;
  prefix?: string;
  key?: string;
  continuationToken?: string;
}

/** Props for the main S3Browser component. */
export interface S3BrowserProps {
  /** The default bucket to browse. */
  defaultBucket: string;
  /** Optional list of available buckets for switching. */
  buckets?: string[];
  /** Base URL for the S3 API route. Defaults to "/api/s3". */
  apiBase?: string;
  /** Optional CSS class for the root container. */
  className?: string;
}

/** View mode for the object list. */
export type ViewMode = "list" | "grid";

/** Props for S3ObjectList. */
export interface S3ObjectListProps {
  objects: S3Object[];
  viewMode: ViewMode;
  selectedKey: string | null;
  onNavigate: (prefix: string) => void;
  onSelect: (obj: S3Object) => void;
  onDelete: (obj: S3Object) => void;
}

/** Props for S3UploadDialog. */
export interface S3UploadDialogProps {
  open: boolean;
  bucket: string;
  prefix: string;
  apiBase: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

/** Props for S3Preview. */
export interface S3PreviewProps {
  object: S3Object | null;
  bucket: string;
  apiBase: string;
  onClose: () => void;
}
