/**
 * Tesseract OCR — Type Definitions
 *
 * Shared types for the OCR integration. All coordinates and dimensions
 * are in pixels relative to the source image.
 */

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for configuring OCR recognition. */
export interface OcrOptions {
  /**
   * Language(s) for recognition. Use ISO 639-3 codes.
   * Multiple languages can be combined with '+' (e.g. 'eng+deu').
   * @default 'eng'
   */
  language?: string;

  /**
   * Page Segmentation Mode (PSM). Controls how Tesseract splits the image
   * into text regions.
   *
   *  0 — Orientation and script detection only
   *  1 — Automatic with OSD
   *  3 — Fully automatic (default)
   *  6 — Assume a single uniform block of text
   *  7 — Treat image as a single line
   *  8 — Treat image as a single word
   * 10 — Treat image as a single character
   * 11 — Sparse text — find as much text as possible
   * 13 — Raw line
   *
   * Full range: 0-13
   */
  psm?: number;

  /**
   * OCR Engine Mode (OEM).
   *  0 — Legacy engine only
   *  1 — Neural nets LSTM only
   *  2 — Legacy + LSTM
   *  3 — Default (based on availability)
   */
  oem?: number;

  /**
   * Character whitelist. Only these characters will be recognized.
   * Example: '0123456789' to extract digits only.
   */
  whitelist?: string;
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/** Axis-aligned bounding box in pixel coordinates. */
export interface BoundingBox {
  /** Horizontal offset from the left edge of the image. */
  x: number;
  /** Vertical offset from the top edge of the image. */
  y: number;
  /** Width of the bounding box. */
  width: number;
  /** Height of the bounding box. */
  height: number;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/** Result of a single image OCR extraction. */
export interface OcrResult {
  /** Extracted plain text. */
  text: string;
  /** Mean recognition confidence (0-100). */
  confidence: number;
  /** Language used for recognition. */
  language: string;
  /** Number of words recognised. */
  words: number;
  /** Wall-clock processing time in milliseconds. */
  processingTime: number;
}

/** A single recognised word with spatial information. */
export interface OcrWord {
  /** The word text. */
  text: string;
  /** Recognition confidence for this word (0-100). */
  confidence: number;
  /** Bounding box of the word in the source image. */
  bbox: BoundingBox;
}

/** A recognised line of text composed of words. */
export interface OcrLine {
  /** Full line text. */
  text: string;
  /** Individual words that make up the line. */
  words: OcrWord[];
  /** Mean confidence for the line (0-100). */
  confidence: number;
  /** Bounding box spanning the entire line. */
  bbox: BoundingBox;
}

/** A recognised paragraph composed of lines. */
export interface OcrParagraph {
  /** Full paragraph text. */
  text: string;
  /** Lines within the paragraph. */
  lines: OcrLine[];
  /** Mean confidence for the paragraph (0-100). */
  confidence: number;
}

/** Structured OCR result preserving the paragraph > line > word hierarchy. */
export interface StructuredOcrResult {
  /** Paragraphs detected in the image. */
  paragraphs: OcrParagraph[];
  /** Concatenated full text of all paragraphs. */
  fullText: string;
  /** Average confidence across all words (0-100). */
  avgConfidence: number;
}

// ---------------------------------------------------------------------------
// Worker pool
// ---------------------------------------------------------------------------

/** Reusable pool of Tesseract workers for high-throughput processing. */
export interface WorkerPool {
  /**
   * Extract text from an image using the next available worker.
   * @param image - File path, URL, or Buffer.
   */
  extract(image: string | Buffer): Promise<OcrResult>;
  /** Terminate all workers in the pool and release resources. */
  terminate(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Batch
// ---------------------------------------------------------------------------

/** Result of a batch extraction across multiple images. */
export interface BatchResult {
  /** Per-image results. Failed images contain an error message instead. */
  results: Array<OcrResult | { error: string }>;
  /** Total wall-clock time for the entire batch in milliseconds. */
  totalTime: number;
}
