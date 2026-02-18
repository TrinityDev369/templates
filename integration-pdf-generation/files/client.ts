/**
 * PDF Generation Client
 *
 * Server-side PDF generation powered by Puppeteer and pdf-lib.
 * Provides HTML-to-PDF rendering, URL capture, typed templates,
 * pre-built invoice/report generators, PDF merging, and watermarking.
 *
 * All browser instances are properly closed via try/finally blocks
 * to prevent orphaned Chromium processes.
 */

import puppeteer from "puppeteer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { writeFile } from "node:fs/promises";
import type {
  PdfOptions,
  PdfResult,
  InvoiceData,
  ReportData,
} from "./types";
import { invoiceTemplate, reportTemplate } from "./templates";

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_OPTIONS: PdfOptions = {
  format: "A4",
  landscape: false,
  margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
  printBackground: true,
  scale: 1,
  displayHeaderFooter: false,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Merge user-provided options with defaults.
 * Nested `margin` fields are merged individually.
 */
function mergeOptions(options?: PdfOptions): PdfOptions {
  if (!options) return { ...DEFAULT_OPTIONS };

  return {
    ...DEFAULT_OPTIONS,
    ...options,
    margin: {
      ...DEFAULT_OPTIONS.margin,
      ...options.margin,
    },
  };
}

/**
 * Count pages in a PDF buffer using pdf-lib.
 */
async function countPages(buffer: Buffer): Promise<number> {
  const doc = await PDFDocument.load(buffer);
  return doc.getPageCount();
}

/**
 * Build a `PdfResult` from a raw PDF buffer.
 */
async function buildResult(buffer: Buffer): Promise<PdfResult> {
  const pageCount = await countPages(buffer);
  return {
    buffer,
    pageCount,
    size: buffer.length,
  };
}

// ---------------------------------------------------------------------------
// Core generation functions
// ---------------------------------------------------------------------------

/**
 * Generate a PDF from an HTML string.
 *
 * Launches a headless Chromium instance, sets the page content,
 * renders to PDF, and returns the result.
 *
 * @param html - Complete HTML document string.
 * @param options - PDF generation options (format, margins, etc.).
 * @returns A `PdfResult` with the buffer, page count, and file size.
 *
 * @example
 * ```ts
 * const result = await generatePdfFromHtml("<h1>Hello, PDF!</h1>");
 * console.log(`Generated ${result.pageCount} pages, ${result.size} bytes`);
 * ```
 */
export async function generatePdfFromHtml(
  html: string,
  options?: PdfOptions,
): Promise<PdfResult> {
  const opts = mergeOptions(options);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: opts.format,
      landscape: opts.landscape,
      margin: opts.margin,
      headerTemplate: opts.headerTemplate,
      footerTemplate: opts.footerTemplate,
      displayHeaderFooter: opts.displayHeaderFooter,
      printBackground: opts.printBackground,
      scale: opts.scale,
      pageRanges: opts.pageRanges,
      preferCSSPageSize: opts.preferCSSPageSize,
    });

    const buffer = Buffer.from(pdfBuffer);
    return buildResult(buffer);
  } finally {
    await browser.close();
  }
}

/**
 * Generate a PDF by navigating to a URL and capturing the page.
 *
 * Useful for rendering pages from a running web server (e.g. a Next.js
 * route, a Storybook story, or any publicly accessible URL).
 *
 * @param url - The URL to navigate to.
 * @param options - PDF generation options.
 * @returns A `PdfResult` with the buffer, page count, and file size.
 *
 * @example
 * ```ts
 * const result = await generatePdfFromUrl("https://example.com/report");
 * await savePdf(result.buffer, "./report.pdf");
 * ```
 */
export async function generatePdfFromUrl(
  url: string,
  options?: PdfOptions,
): Promise<PdfResult> {
  const opts = mergeOptions(options);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });

    const pdfBuffer = await page.pdf({
      format: opts.format,
      landscape: opts.landscape,
      margin: opts.margin,
      headerTemplate: opts.headerTemplate,
      footerTemplate: opts.footerTemplate,
      displayHeaderFooter: opts.displayHeaderFooter,
      printBackground: opts.printBackground,
      scale: opts.scale,
      pageRanges: opts.pageRanges,
      preferCSSPageSize: opts.preferCSSPageSize,
    });

    const buffer = Buffer.from(pdfBuffer);
    return buildResult(buffer);
  } finally {
    await browser.close();
  }
}

/**
 * Generate a PDF from a template function.
 *
 * Accepts any function that takes data and returns an HTML string,
 * then renders that HTML to PDF. This is the recommended pattern
 * for type-safe, reusable PDF templates.
 *
 * @param templateFn - A function that accepts data and returns an HTML string.
 * @param data - The data to pass to the template function.
 * @param options - PDF generation options.
 * @returns A `PdfResult` with the buffer, page count, and file size.
 *
 * @example
 * ```ts
 * const myTemplate = (data: { name: string }) =>
 *   `<html><body><h1>Hello, ${data.name}</h1></body></html>`;
 *
 * const result = await generatePdfFromTemplate(myTemplate, { name: "World" });
 * ```
 */
export async function generatePdfFromTemplate<T>(
  templateFn: (data: T) => string,
  data: T,
  options?: PdfOptions,
): Promise<PdfResult> {
  const html = templateFn(data);
  return generatePdfFromHtml(html, options);
}

// ---------------------------------------------------------------------------
// Pre-built document generators
// ---------------------------------------------------------------------------

/**
 * Generate a professional invoice PDF.
 *
 * Uses the built-in invoice template with automatic calculation of
 * subtotals, tax, discount, and grand total.
 *
 * @param invoiceData - Structured invoice data (company, client, items, etc.).
 * @param options - Optional PDF generation overrides.
 * @returns A `PdfResult` with the buffer, page count, and file size.
 *
 * @example
 * ```ts
 * const result = await generateInvoice({
 *   company: { name: "Acme Corp", address: "123 Main St" },
 *   client: { name: "Client Inc", address: "456 Oak Ave" },
 *   invoiceNumber: "INV-2026-001",
 *   date: "February 18, 2026",
 *   dueDate: "March 18, 2026",
 *   items: [
 *     { description: "Web Development", quantity: 40, unitPrice: 150 },
 *     { description: "UI Design", quantity: 20, unitPrice: 120 },
 *   ],
 *   tax: 19,
 *   currency: "EUR",
 * });
 * ```
 */
export async function generateInvoice(
  invoiceData: InvoiceData,
  options?: PdfOptions,
): Promise<PdfResult> {
  const html = invoiceTemplate(invoiceData);
  return generatePdfFromHtml(html, {
    format: "A4",
    margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    printBackground: true,
    ...options,
  });
}

/**
 * Generate a multi-section report PDF.
 *
 * Uses the built-in report template with a cover-like header,
 * numbered sections, optional data table, and page numbers.
 *
 * @param reportData - Structured report data (title, sections, table, etc.).
 * @param options - Optional PDF generation overrides.
 * @returns A `PdfResult` with the buffer, page count, and file size.
 *
 * @example
 * ```ts
 * const result = await generateReport({
 *   title: "Q1 Performance Report",
 *   subtitle: "Engineering Division",
 *   author: "Jane Doe",
 *   date: "February 2026",
 *   sections: [
 *     { title: "Summary", content: "<p>Overall performance improved by 23%.</p>" },
 *     { title: "Metrics", content: "<p>Detailed breakdown follows.</p>" },
 *   ],
 *   tableData: {
 *     headers: ["Metric", "Q4 2025", "Q1 2026", "Change"],
 *     rows: [
 *       ["Uptime", "99.2%", "99.8%", "+0.6%"],
 *       ["Response Time", "230ms", "180ms", "-22%"],
 *     ],
 *   },
 * });
 * ```
 */
export async function generateReport(
  reportData: ReportData,
  options?: PdfOptions,
): Promise<PdfResult> {
  const html = reportTemplate(reportData);
  return generatePdfFromHtml(html, {
    format: "A4",
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    printBackground: true,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// PDF manipulation (pdf-lib)
// ---------------------------------------------------------------------------

/**
 * Merge multiple PDF buffers into a single PDF document.
 *
 * Pages are appended in order. Each input PDF's pages are copied
 * sequentially into the output document.
 *
 * @param pdfBuffers - Array of PDF buffers to merge.
 * @returns A `PdfResult` with the merged PDF.
 * @throws If fewer than 2 buffers are provided.
 *
 * @example
 * ```ts
 * const cover = await generatePdfFromHtml("<h1>Cover Page</h1>");
 * const body = await generateReport(reportData);
 * const merged = await mergePdfs([cover.buffer, body.buffer]);
 * await savePdf(merged.buffer, "./full-report.pdf");
 * ```
 */
export async function mergePdfs(pdfBuffers: Buffer[]): Promise<PdfResult> {
  if (pdfBuffers.length < 2) {
    throw new Error("mergePdfs requires at least 2 PDF buffers");
  }

  const mergedDoc = await PDFDocument.create();

  for (const pdfBuffer of pdfBuffers) {
    const sourceDoc = await PDFDocument.load(pdfBuffer);
    const pageIndices = sourceDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(sourceDoc, pageIndices);

    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  const mergedBytes = await mergedDoc.save();
  const buffer = Buffer.from(mergedBytes);
  return buildResult(buffer);
}

/**
 * Add a diagonal watermark text to every page of a PDF.
 *
 * The watermark is rendered as semi-transparent grey text rotated
 * 45 degrees across the center of each page.
 *
 * @param pdfBuffer - The source PDF buffer.
 * @param text - The watermark text to overlay (e.g. "DRAFT", "CONFIDENTIAL").
 * @returns A `PdfResult` with the watermarked PDF.
 *
 * @example
 * ```ts
 * const invoice = await generateInvoice(data);
 * const watermarked = await addWatermark(invoice.buffer, "DRAFT");
 * await savePdf(watermarked.buffer, "./invoice-draft.pdf");
 * ```
 */
export async function addWatermark(
  pdfBuffer: Buffer,
  text: string,
): Promise<PdfResult> {
  const doc = await PDFDocument.load(pdfBuffer);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Scale font size to roughly 1/3 of the page diagonal
    const diagonal = Math.sqrt(width * width + height * height);
    const fontSize = Math.min(diagonal / (text.length * 0.7), 120);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;

    // Position at center of page, rotated 45 degrees
    const centerX = width / 2;
    const centerY = height / 2;

    page.drawText(text, {
      x: centerX - (textWidth * Math.cos(Math.PI / 4)) / 2,
      y: centerY - (textHeight * Math.cos(Math.PI / 4)) / 2,
      size: fontSize,
      font,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.3,
      rotate: { type: "degrees" as const, angle: 45 },
    });
  }

  const resultBytes = await doc.save();
  const buffer = Buffer.from(resultBytes);
  return buildResult(buffer);
}

// ---------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------

/**
 * Write a PDF buffer to disk.
 *
 * @param buffer - The PDF buffer to write.
 * @param filePath - Absolute or relative file path for the output.
 *
 * @example
 * ```ts
 * const result = await generateInvoice(data);
 * await savePdf(result.buffer, "./invoices/INV-2026-001.pdf");
 * ```
 */
export async function savePdf(buffer: Buffer, filePath: string): Promise<void> {
  await writeFile(filePath, buffer);
}
