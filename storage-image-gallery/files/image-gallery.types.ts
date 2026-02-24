/**
 * Type definitions for the ImageGallery component.
 */

/** Represents a single image in the gallery. */
export interface GalleryImage {
  /** The image source URL. */
  src: string;
  /** Accessible alt text for the image. */
  alt: string;
  /** Optional intrinsic width for layout hints. */
  width?: number;
  /** Optional intrinsic height for layout hints. */
  height?: number;
}

/** Props accepted by the ImageGallery component. */
export interface ImageGalleryProps {
  /** Array of images to display in the gallery grid. */
  images: GalleryImage[];
  /** Optional CSS class name applied to the outermost wrapper. */
  className?: string;
  /** Optional fixed aspect ratio class for thumbnails (default: "aspect-square"). */
  aspectRatio?: string;
}
