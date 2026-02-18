/**
 * Tesseract OCR Integration
 *
 * Text extraction from images using tesseract.js — no external binary needed.
 * Supports single image, buffer, URL, batch, structured output, bounding boxes,
 * language detection, and reusable worker pools.
 *
 * @example
 * ```ts
 * import { extractText, batchExtract, createWorkerPool } from "@/integrations/ocr-tesseract";
 * ```
 */

export {
  extractText,
  extractTextFromBuffer,
  extractTextFromUrl,
  extractWithBoundingBoxes,
  extractStructured,
  detectLanguage,
  batchExtract,
  createWorkerPool,
} from "./client";

export type {
  OcrOptions,
  OcrResult,
  BoundingBox,
  OcrWord,
  OcrLine,
  OcrParagraph,
  StructuredOcrResult,
  WorkerPool,
  BatchResult,
} from "./types";
