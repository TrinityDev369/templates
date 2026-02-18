/**
 * PDF Generation — Type Definitions
 *
 * Strongly-typed interfaces for PDF options, invoice data,
 * report data, and generation results.
 */

// ---------------------------------------------------------------------------
// PDF Options
// ---------------------------------------------------------------------------

/** Page margin specification in CSS units (e.g. "20mm", "1in", "0.5cm"). */
export interface PdfMargin {
  /** Top margin. */
  top?: string;
  /** Right margin. */
  right?: string;
  /** Bottom margin. */
  bottom?: string;
  /** Left margin. */
  left?: string;
}

/** Options controlling PDF generation via Puppeteer. */
export interface PdfOptions {
  /** Paper format — defaults to `"A4"`. */
  format?: "A4" | "Letter" | "Legal" | "Tabloid" | "A3" | "A5";
  /** Landscape orientation — defaults to `false`. */
  landscape?: boolean;
  /** Page margins in CSS units. */
  margin?: PdfMargin;
  /**
   * HTML template for the page header.
   * Supports Chromium template variables: `date`, `title`, `url`, `pageNumber`, `totalPages`.
   * Example: `<span style="font-size:10px;">Page <span class="pageNumber"></span></span>`
   */
  headerTemplate?: string;
  /**
   * HTML template for the page footer.
   * Supports the same Chromium template variables as `headerTemplate`.
   */
  footerTemplate?: string;
  /** Whether to display header and footer — defaults to `false`. */
  displayHeaderFooter?: boolean;
  /** Print background graphics (colours, images) — defaults to `true`. */
  printBackground?: boolean;
  /** Scale of the webpage rendering — defaults to `1`. Range: 0.1 to 2. */
  scale?: number;
  /**
   * Page ranges to print, e.g. `"1-5"`, `"2"`, `"1-3, 5"`.
   * Empty string means all pages.
   */
  pageRanges?: string;
  /** Prefer CSS `@page` size over `format` — defaults to `false`. */
  preferCSSPageSize?: boolean;
}

// ---------------------------------------------------------------------------
// Invoice Data
// ---------------------------------------------------------------------------

/** Company or individual entity appearing on an invoice. */
export interface InvoiceEntity {
  /** Full name of the company or individual. */
  name: string;
  /** Street address, multi-line allowed. */
  address: string;
  /** Optional email address. */
  email?: string;
  /** Optional phone number. */
  phone?: string;
  /** Optional URL to a company logo image (absolute path or data URI). */
  logo?: string;
}

/** A single line item on an invoice. */
export interface InvoiceLineItem {
  /** Description of the goods or service. */
  description: string;
  /** Quantity (units, hours, etc.). */
  quantity: number;
  /** Price per unit in the invoice currency. */
  unitPrice: number;
}

/** Complete data required to generate an invoice PDF. */
export interface InvoiceData {
  /** Issuing company information. */
  company: InvoiceEntity;
  /** Receiving client information. */
  client: InvoiceEntity;
  /** Unique invoice identifier, e.g. `"INV-2026-0042"`. */
  invoiceNumber: string;
  /** Invoice issue date as a display string, e.g. `"February 18, 2026"`. */
  date: string;
  /** Payment due date as a display string, e.g. `"March 18, 2026"`. */
  dueDate: string;
  /** Line items to be invoiced. */
  items: InvoiceLineItem[];
  /** Tax rate as a decimal percentage, e.g. `19` for 19%. Optional. */
  tax?: number;
  /** Fixed discount amount in the invoice currency. Optional. */
  discount?: number;
  /** Additional notes to display below the totals. Optional. */
  notes?: string;
  /** ISO 4217 currency code — defaults to `"EUR"`. */
  currency?: string;
  /** Payment terms, e.g. `"Net 30"`. Optional. */
  paymentTerms?: string;
}

// ---------------------------------------------------------------------------
// Report Data
// ---------------------------------------------------------------------------

/** A section within a report document. */
export interface ReportSection {
  /** Section heading. */
  title: string;
  /** Section body — may contain HTML markup. */
  content: string;
}

/** Tabular data to embed in a report. */
export interface ReportTableData {
  /** Column headers. */
  headers: string[];
  /** Row data — each inner array must match the headers length. */
  rows: string[][];
}

/** Complete data required to generate a report PDF. */
export interface ReportData {
  /** Report title. */
  title: string;
  /** Report subtitle — appears below the title. Optional. */
  subtitle?: string;
  /** Author name or team. */
  author: string;
  /** Report date as a display string. */
  date: string;
  /** Ordered sections that make up the report body. */
  sections: ReportSection[];
  /** Optional data table to render after the sections. */
  tableData?: ReportTableData;
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

/** Result returned by PDF generation functions. */
export interface PdfResult {
  /** Raw PDF content as a Node.js Buffer. */
  buffer: Buffer;
  /** Total number of pages in the generated PDF. */
  pageCount: number;
  /** File size in bytes. */
  size: number;
}
