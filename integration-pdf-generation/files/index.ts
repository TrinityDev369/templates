/**
 * PDF Generation Integration
 *
 * Server-side PDF generation with Puppeteer — HTML-to-PDF, URL-to-PDF,
 * invoice and report templates, merge, and watermark.
 *
 * @example
 * ```ts
 * import {
 *   generatePdfFromHtml,
 *   generateInvoice,
 *   generateReport,
 *   mergePdfs,
 *   addWatermark,
 *   savePdf,
 * } from "@/integrations/pdf-generation";
 * ```
 */

// Client functions
export {
  generatePdfFromHtml,
  generatePdfFromUrl,
  generatePdfFromTemplate,
  generateInvoice,
  generateReport,
  mergePdfs,
  addWatermark,
  savePdf,
} from "./client";

// Templates
export { invoiceTemplate, reportTemplate } from "./templates";

// Types
export type {
  PdfOptions,
  PdfMargin,
  PdfResult,
  InvoiceData,
  InvoiceEntity,
  InvoiceLineItem,
  ReportData,
  ReportSection,
  ReportTableData,
} from "./types";
