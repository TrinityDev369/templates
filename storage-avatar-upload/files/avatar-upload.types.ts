/**
 * Type definitions for the AvatarUpload component.
 */

/** Accepted image MIME types. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Union type of accepted MIME strings. */
export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

/** File validation error reasons. */
export type ValidationError = "invalid-type" | "file-too-large";

/** Props accepted by the AvatarUpload component. */
export interface AvatarUploadProps {
  /** Current avatar URL to display as preview. */
  currentAvatarUrl?: string;
  /**
   * Called when the user confirms a cropped avatar.
   * Receives the original File and the cropped circular Blob.
   */
  onUpload: (file: File, croppedBlob: Blob) => void;
  /** Called when a file validation error occurs. */
  onError?: (error: ValidationError, detail: string) => void;
  /** Maximum allowed file size in bytes. Defaults to 5MB. */
  maxFileSize?: number;
  /** Diameter in pixels for the avatar preview circle. Defaults to 128. */
  size?: number;
  /** Output image dimensions (square) in pixels. Defaults to 256. */
  outputSize?: number;
  /** Output format for the cropped blob. Defaults to "image/png". */
  outputFormat?: "image/png" | "image/jpeg" | "image/webp";
  /** Output quality for jpeg/webp (0-1). Defaults to 0.92. */
  outputQuality?: number;
  /** Whether the component is in a loading state. */
  loading?: boolean;
  /** Whether the component is disabled. */
  disabled?: boolean;
  /** Optional CSS class name applied to the outermost wrapper. */
  className?: string;
}

/** Internal crop state tracked during the cropping phase. */
export interface CropState {
  /** The image loaded into the crop canvas. */
  image: HTMLImageElement;
  /** The original File object. */
  file: File;
  /** Current zoom level (1 = fit, higher = zoomed in). */
  zoom: number;
  /** Pan offset X in image-space pixels. */
  panX: number;
  /** Pan offset Y in image-space pixels. */
  panY: number;
}
