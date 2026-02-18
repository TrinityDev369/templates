/**
 * Tesseract OCR Client
 *
 * Provides text extraction from images using tesseract.js (no external
 * binary required). Every public function manages its own worker lifecycle
 * and guarantees cleanup — callers never need to worry about dangling workers.
 *
 * @example
 * ```ts
 * import { extractText, batchExtract } from "@/integrations/ocr-tesseract";
 *
 * const result = await extractText("./receipt.png");
 * console.log(result.text, result.confidence);
 *
 * const batch = await batchExtract(["a.png", "b.png", "c.png"]);
 * batch.results.forEach((r) => console.log("error" in r ? r.error : r.text));
 * ```
 */

import Tesseract from "tesseract.js";

import type {
  BatchResult,
  BoundingBox,
  OcrLine,
  OcrOptions,
  OcrParagraph,
  OcrResult,
  OcrWord,
  StructuredOcrResult,
  WorkerPool,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build the Tesseract worker parameters object from our public options type.
 */
function buildWorkerParams(options?: OcrOptions): Partial<Tesseract.WorkerParams> {
  const params: Partial<Tesseract.WorkerParams> = {};
  if (options?.psm !== undefined) {
    params.tessedit_pageseg_mode = String(options.psm) as Tesseract.PSM;
  }
  if (options?.whitelist) {
    params.tessedit_char_whitelist = options.whitelist;
  }
  return params;
}

/**
 * Create a ready-to-use Tesseract worker for the given language.
 */
async function initWorker(language: string): Promise<Tesseract.Worker> {
  const worker = await Tesseract.createWorker(language);
  return worker;
}

/**
 * Safely terminate a worker, swallowing errors so cleanup never throws.
 */
async function safeTerminate(worker: Tesseract.Worker): Promise<void> {
  try {
    await worker.terminate();
  } catch {
    // Worker may already be terminated — ignore.
  }
}

/**
 * Convert a Tesseract Bbox ({ x0, y0, x1, y1 }) into our BoundingBox.
 */
function toBoundingBox(bbox: Tesseract.Bbox): BoundingBox {
  return {
    x: bbox.x0,
    y: bbox.y0,
    width: bbox.x1 - bbox.x0,
    height: bbox.y1 - bbox.y0,
  };
}

/**
 * Map a Tesseract Word to our OcrWord type.
 */
function toOcrWord(w: Tesseract.Word): OcrWord {
  return {
    text: w.text,
    confidence: w.confidence,
    bbox: toBoundingBox(w.bbox),
  };
}

/**
 * Resolve the language string, falling back to 'eng'.
 */
function resolveLanguage(options?: OcrOptions): string {
  return options?.language ?? "eng";
}

/**
 * Collect all words from the Page's block > paragraph > line > word hierarchy.
 */
function collectAllWords(page: Tesseract.Page): Tesseract.Word[] {
  const words: Tesseract.Word[] = [];
  for (const block of page.blocks ?? []) {
    for (const paragraph of block.paragraphs) {
      for (const line of paragraph.lines) {
        words.push(...line.words);
      }
    }
  }
  return words;
}

/**
 * Count words in a Page, falling back to whitespace-split on text.
 */
function countWords(page: Tesseract.Page): number {
  const allWords = collectAllWords(page);
  if (allWords.length > 0) return allWords.length;
  return page.text.split(/\s+/).filter(Boolean).length;
}

/**
 * Build an OcrResult from a recognized Page.
 */
function toOcrResult(
  page: Tesseract.Page,
  lang: string,
  processingTime: number,
): OcrResult {
  return {
    text: page.text.trim(),
    confidence: page.confidence,
    language: lang,
    words: countWords(page),
    processingTime,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract all text from an image file on disk.
 *
 * @param imagePath - Absolute or relative path to the image file.
 * @param options   - OCR options (language, psm, oem, whitelist).
 * @returns Extracted text, confidence score, and metadata.
 */
export async function extractText(
  imagePath: string,
  options?: OcrOptions,
): Promise<OcrResult> {
  const lang = resolveLanguage(options);
  const worker = await initWorker(lang);
  try {
    const params = buildWorkerParams(options);
    if (Object.keys(params).length > 0) {
      await worker.setParameters(params);
    }

    const start = performance.now();
    const { data } = await worker.recognize(imagePath);
    const processingTime = Math.round(performance.now() - start);

    return toOcrResult(data, lang, processingTime);
  } finally {
    await safeTerminate(worker);
  }
}

/**
 * Extract text from an in-memory Buffer (e.g. from a file upload).
 *
 * @param buffer  - Image data as a Node.js Buffer.
 * @param options - OCR options.
 * @returns Extracted text, confidence score, and metadata.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  options?: OcrOptions,
): Promise<OcrResult> {
  const lang = resolveLanguage(options);
  const worker = await initWorker(lang);
  try {
    const params = buildWorkerParams(options);
    if (Object.keys(params).length > 0) {
      await worker.setParameters(params);
    }

    const start = performance.now();
    const { data } = await worker.recognize(buffer);
    const processingTime = Math.round(performance.now() - start);

    return toOcrResult(data, lang, processingTime);
  } finally {
    await safeTerminate(worker);
  }
}

/**
 * Extract text from an image at a remote URL.
 *
 * @param url     - HTTP(S) URL of the image.
 * @param options - OCR options.
 * @returns Extracted text, confidence score, and metadata.
 */
export async function extractTextFromUrl(
  url: string,
  options?: OcrOptions,
): Promise<OcrResult> {
  const lang = resolveLanguage(options);
  const worker = await initWorker(lang);
  try {
    const params = buildWorkerParams(options);
    if (Object.keys(params).length > 0) {
      await worker.setParameters(params);
    }

    const start = performance.now();
    const { data } = await worker.recognize(url);
    const processingTime = Math.round(performance.now() - start);

    return toOcrResult(data, lang, processingTime);
  } finally {
    await safeTerminate(worker);
  }
}

/**
 * Extract text with word-level bounding boxes from an image file.
 *
 * Useful for overlaying recognised text on the original image or for
 * building searchable PDFs.
 *
 * @param imagePath - Path to the image file.
 * @param options   - OCR options.
 * @returns Array of words, each with text, confidence, and bounding box.
 */
export async function extractWithBoundingBoxes(
  imagePath: string,
  options?: OcrOptions,
): Promise<OcrWord[]> {
  const lang = resolveLanguage(options);
  const worker = await initWorker(lang);
  try {
    const params = buildWorkerParams(options);
    if (Object.keys(params).length > 0) {
      await worker.setParameters(params);
    }

    const { data } = await worker.recognize(imagePath);
    return collectAllWords(data).map(toOcrWord);
  } finally {
    await safeTerminate(worker);
  }
}

/**
 * Extract structured text preserving the paragraph > line > word hierarchy.
 *
 * The result mirrors Tesseract's internal block > paragraph > line > word
 * layout, but paragraphs are flattened across blocks for convenience.
 *
 * @param imagePath - Path to the image file.
 * @returns Structured result with paragraphs, lines, words, and overall stats.
 */
export async function extractStructured(
  imagePath: string,
): Promise<StructuredOcrResult> {
  const worker = await initWorker("eng");
  try {
    const { data } = await worker.recognize(imagePath);

    // Flatten blocks into a single paragraph list.
    const rawParagraphs: Tesseract.Paragraph[] = [];
    for (const block of data.blocks ?? []) {
      rawParagraphs.push(...block.paragraphs);
    }

    const paragraphs: OcrParagraph[] = rawParagraphs.map((p) => {
      const lines: OcrLine[] = p.lines.map((l) => {
        const words: OcrWord[] = l.words.map(toOcrWord);
        const lineConfidence =
          words.length > 0
            ? words.reduce((sum, w) => sum + w.confidence, 0) / words.length
            : 0;
        return {
          text: l.text,
          words,
          confidence: Math.round(lineConfidence * 100) / 100,
          bbox: toBoundingBox(l.bbox),
        };
      });

      const paraConfidence =
        lines.length > 0
          ? lines.reduce((sum, ln) => sum + ln.confidence, 0) / lines.length
          : 0;

      return {
        text: p.text,
        lines,
        confidence: Math.round(paraConfidence * 100) / 100,
      };
    });

    return {
      paragraphs,
      fullText: data.text.trim(),
      avgConfidence: Math.round(data.confidence * 100) / 100,
    };
  } finally {
    await safeTerminate(worker);
  }
}

/**
 * Auto-detect the dominant language of text in an image.
 *
 * Uses Tesseract's OSD (Orientation and Script Detection) mode to identify
 * the script, then maps it to the most likely ISO 639-3 language code.
 *
 * @param imagePath - Path to the image file.
 * @returns ISO 639-3 language code (e.g. 'eng', 'deu', 'fra').
 */
export async function detectLanguage(imagePath: string): Promise<string> {
  // Use 'osd' language pack for orientation/script detection.
  const worker = await initWorker("osd");
  try {
    const { data } = await worker.detect(imagePath);

    // Map common script names to ISO 639-3 codes.
    const scriptToLang: Record<string, string> = {
      Latin: "eng",
      Cyrillic: "rus",
      Arabic: "ara",
      Han: "chi_sim",
      Hangul: "kor",
      Japanese: "jpn",
      Devanagari: "hin",
      Greek: "ell",
      Hebrew: "heb",
      Thai: "tha",
      Georgian: "kat",
      Armenian: "hye",
      Bengali: "ben",
      Tamil: "tam",
      Telugu: "tel",
      Kannada: "kan",
      Gujarati: "guj",
    };

    return scriptToLang[data.script ?? ""] ?? "eng";
  } finally {
    await safeTerminate(worker);
  }
}

/**
 * Process multiple images in a single batch, sharing a worker for performance.
 *
 * Failed images produce an `{ error }` entry rather than rejecting the
 * entire batch, so callers always get a result for every input path.
 *
 * @param imagePaths - Array of image file paths.
 * @param options    - OCR options applied to all images.
 * @returns Per-image results and total processing time.
 */
export async function batchExtract(
  imagePaths: string[],
  options?: OcrOptions,
): Promise<BatchResult> {
  if (imagePaths.length === 0) {
    return { results: [], totalTime: 0 };
  }

  const lang = resolveLanguage(options);
  const worker = await initWorker(lang);

  try {
    const params = buildWorkerParams(options);
    if (Object.keys(params).length > 0) {
      await worker.setParameters(params);
    }

    const batchStart = performance.now();
    const results: Array<OcrResult | { error: string }> = [];

    for (const imagePath of imagePaths) {
      try {
        const start = performance.now();
        const { data } = await worker.recognize(imagePath);
        const processingTime = Math.round(performance.now() - start);

        results.push(toOcrResult(data, lang, processingTime));
      } catch (err) {
        results.push({
          error:
            err instanceof Error
              ? err.message
              : `Failed to process ${imagePath}`,
        });
      }
    }

    const totalTime = Math.round(performance.now() - batchStart);
    return { results, totalTime };
  } finally {
    await safeTerminate(worker);
  }
}

/**
 * Create a reusable worker pool for high-throughput OCR processing.
 *
 * Workers are pre-initialised and requests are distributed round-robin.
 * **You must call `pool.terminate()` when done** to release all workers.
 *
 * @param numWorkers - Number of parallel workers (default: 4).
 * @param options    - OCR options applied to every extraction.
 * @returns A `WorkerPool` with `extract` and `terminate` methods.
 *
 * @example
 * ```ts
 * const pool = await createWorkerPool(4);
 * try {
 *   const results = await Promise.all(
 *     images.map((img) => pool.extract(img))
 *   );
 * } finally {
 *   await pool.terminate();
 * }
 * ```
 */
export async function createWorkerPool(
  numWorkers: number = 4,
  options?: OcrOptions,
): Promise<WorkerPool> {
  const lang = resolveLanguage(options);
  const params = buildWorkerParams(options);

  // Spin up all workers in parallel.
  const workers = await Promise.all(
    Array.from({ length: numWorkers }, async () => {
      const w = await initWorker(lang);
      if (Object.keys(params).length > 0) {
        await w.setParameters(params);
      }
      return w;
    }),
  );

  let nextIndex = 0;
  let terminated = false;

  return {
    async extract(image: string | Buffer): Promise<OcrResult> {
      if (terminated) {
        throw new Error("Worker pool has been terminated");
      }

      // Round-robin worker selection.
      const worker = workers[nextIndex % workers.length];
      nextIndex++;

      const start = performance.now();
      const { data } = await worker.recognize(image);
      const processingTime = Math.round(performance.now() - start);

      return toOcrResult(data, lang, processingTime);
    },

    async terminate(): Promise<void> {
      if (terminated) return;
      terminated = true;
      await Promise.all(workers.map(safeTerminate));
    },
  };
}
