/**
 * PDF Generation — HTML Templates
 *
 * Pure functions that accept typed data and return self-contained HTML strings
 * with inline CSS. Designed for Puppeteer's `page.setContent()` → `page.pdf()` pipeline.
 */

import type { InvoiceData, ReportData } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a number as a currency string.
 * Uses `Intl.NumberFormat` for locale-aware formatting.
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Escape HTML entities to prevent XSS in user-provided strings.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------------------------------------------------------
// Invoice Template
// ---------------------------------------------------------------------------

/**
 * Generate a clean, professional invoice as a self-contained HTML string.
 *
 * Layout:
 * - Company header with optional logo
 * - Invoice metadata (number, dates)
 * - Client details
 * - Line items table
 * - Subtotal, discount, tax, and grand total
 * - Notes and payment terms footer
 */
export function invoiceTemplate(data: InvoiceData): string {
  const currency = data.currency ?? "EUR";

  // Calculate totals
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const discountAmount = data.discount ?? 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = data.tax ? taxableAmount * (data.tax / 100) : 0;
  const total = taxableAmount + taxAmount;

  // Build line items rows
  const lineItemsHtml = data.items
    .map(
      (item, index) => `
      <tr${index % 2 === 1 ? ' class="alt-row"' : ""}>
        <td class="desc-cell">${escapeHtml(item.description)}</td>
        <td class="num-cell">${item.quantity}</td>
        <td class="num-cell">${formatCurrency(item.unitPrice, currency)}</td>
        <td class="num-cell">${formatCurrency(item.quantity * item.unitPrice, currency)}</td>
      </tr>`,
    )
    .join("\n");

  // Build optional logo
  const logoHtml = data.company.logo
    ? `<img src="${escapeHtml(data.company.logo)}" alt="${escapeHtml(data.company.name)}" class="logo" />`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${escapeHtml(data.invoiceNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1a1a2e;
      font-size: 13px;
      line-height: 1.5;
      background: #ffffff;
    }

    .invoice {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    /* ---- Header ---- */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }

    .company-info h1 {
      font-size: 24px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 4px;
    }

    .company-info p {
      color: #64748b;
      font-size: 12px;
      white-space: pre-line;
    }

    .logo {
      max-height: 60px;
      max-width: 180px;
      object-fit: contain;
    }

    /* ---- Invoice Meta ---- */
    .meta-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .invoice-details h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .invoice-details table td {
      padding: 2px 12px 2px 0;
      font-size: 13px;
    }

    .invoice-details table td:first-child {
      color: #64748b;
      font-weight: 500;
    }

    .client-info h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      margin-bottom: 6px;
    }

    .client-info p {
      font-size: 13px;
      white-space: pre-line;
    }

    .client-info .client-name {
      font-weight: 600;
      font-size: 15px;
      color: #1a1a2e;
    }

    /* ---- Table ---- */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }

    .items-table thead th {
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #ffffff;
      background: #2563eb;
      font-weight: 600;
    }

    .items-table thead th:last-child,
    .items-table thead th:nth-child(2),
    .items-table thead th:nth-child(3) {
      text-align: right;
    }

    .items-table tbody td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .items-table .alt-row {
      background: #f8fafc;
    }

    .desc-cell { text-align: left; }
    .num-cell { text-align: right; font-variant-numeric: tabular-nums; }

    /* ---- Totals ---- */
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }

    .totals table {
      min-width: 280px;
    }

    .totals table td {
      padding: 6px 0;
      font-size: 13px;
    }

    .totals table td:first-child {
      color: #64748b;
      padding-right: 24px;
    }

    .totals table td:last-child {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .totals .total-row td {
      font-size: 16px;
      font-weight: 700;
      color: #2563eb;
      padding-top: 10px;
      border-top: 2px solid #2563eb;
    }

    /* ---- Footer ---- */
    .notes {
      background: #f8fafc;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }

    .notes h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      margin-bottom: 6px;
    }

    .notes p {
      color: #475569;
      font-size: 12px;
      white-space: pre-line;
    }

    .payment-terms {
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="invoice">

    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>${escapeHtml(data.company.name)}</h1>
        <p>${escapeHtml(data.company.address)}</p>
        ${data.company.email ? `<p>${escapeHtml(data.company.email)}</p>` : ""}
        ${data.company.phone ? `<p>${escapeHtml(data.company.phone)}</p>` : ""}
      </div>
      ${logoHtml}
    </div>

    <!-- Invoice Meta + Client -->
    <div class="meta-section">
      <div class="invoice-details">
        <h2>INVOICE</h2>
        <table>
          <tr><td>Invoice No.</td><td>${escapeHtml(data.invoiceNumber)}</td></tr>
          <tr><td>Date</td><td>${escapeHtml(data.date)}</td></tr>
          <tr><td>Due Date</td><td>${escapeHtml(data.dueDate)}</td></tr>
        </table>
      </div>
      <div class="client-info">
        <h3>Bill To</h3>
        <p class="client-name">${escapeHtml(data.client.name)}</p>
        <p>${escapeHtml(data.client.address)}</p>
        ${data.client.email ? `<p>${escapeHtml(data.client.email)}</p>` : ""}
        ${data.client.phone ? `<p>${escapeHtml(data.client.phone)}</p>` : ""}
      </div>
    </div>

    <!-- Line Items -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <table>
        <tr>
          <td>Subtotal</td>
          <td>${formatCurrency(subtotal, currency)}</td>
        </tr>
        ${
          discountAmount > 0
            ? `<tr>
          <td>Discount</td>
          <td>-${formatCurrency(discountAmount, currency)}</td>
        </tr>`
            : ""
        }
        ${
          data.tax
            ? `<tr>
          <td>Tax (${data.tax}%)</td>
          <td>${formatCurrency(taxAmount, currency)}</td>
        </tr>`
            : ""
        }
        <tr class="total-row">
          <td>Total Due</td>
          <td>${formatCurrency(total, currency)}</td>
        </tr>
      </table>
    </div>

    <!-- Notes -->
    ${
      data.notes
        ? `<div class="notes">
      <h4>Notes</h4>
      <p>${escapeHtml(data.notes)}</p>
    </div>`
        : ""
    }

    <!-- Payment Terms -->
    ${
      data.paymentTerms
        ? `<div class="payment-terms">
      <p>Payment Terms: ${escapeHtml(data.paymentTerms)}</p>
    </div>`
        : ""
    }

  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Report Template
// ---------------------------------------------------------------------------

/**
 * Generate a multi-section report as a self-contained HTML string.
 *
 * Layout:
 * - Cover-like header with title, subtitle, author, and date
 * - Ordered sections with headings and HTML content
 * - Optional data table
 * - Page number footer (via CSS `@page` counter)
 */
export function reportTemplate(data: ReportData): string {
  // Build sections
  const sectionsHtml = data.sections
    .map(
      (section, index) => `
    <div class="section">
      <h2><span class="section-num">${String(index + 1).padStart(2, "0")}</span> ${escapeHtml(section.title)}</h2>
      <div class="section-content">${section.content}</div>
    </div>`,
    )
    .join("\n");

  // Build optional table
  let tableHtml = "";
  if (data.tableData && data.tableData.headers.length > 0) {
    const headersRow = data.tableData.headers
      .map((h) => `<th>${escapeHtml(h)}</th>`)
      .join("");

    const bodyRows = data.tableData.rows
      .map(
        (row, index) =>
          `<tr${index % 2 === 1 ? ' class="alt-row"' : ""}>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
      )
      .join("\n");

    tableHtml = `
    <div class="table-section">
      <h2>Data Table</h2>
      <table class="data-table">
        <thead><tr>${headersRow}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(data.title)}</title>
  <style>
    @page {
      margin: 25mm 20mm 30mm 20mm;

      @bottom-center {
        content: counter(page) " / " counter(pages);
        font-size: 10px;
        color: #94a3b8;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1a1a2e;
      font-size: 13px;
      line-height: 1.65;
      background: #ffffff;
    }

    .report {
      max-width: 800px;
      margin: 0 auto;
    }

    /* ---- Cover Header ---- */
    .cover {
      text-align: center;
      padding: 60px 40px 40px;
      margin-bottom: 40px;
      border-bottom: 3px solid #2563eb;
      page-break-after: avoid;
    }

    .cover h1 {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .cover .subtitle {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 24px;
      font-weight: 400;
    }

    .cover .meta {
      display: inline-flex;
      gap: 32px;
      font-size: 12px;
      color: #94a3b8;
    }

    .cover .meta span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .cover .meta .value {
      color: #475569;
      font-weight: 500;
    }

    /* ---- Sections ---- */
    .section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }

    .section h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-num {
      color: #2563eb;
      font-size: 14px;
      font-weight: 600;
      margin-right: 6px;
    }

    .section-content {
      color: #334155;
      font-size: 13px;
    }

    .section-content p {
      margin-bottom: 10px;
    }

    .section-content ul, .section-content ol {
      padding-left: 24px;
      margin-bottom: 10px;
    }

    .section-content li {
      margin-bottom: 4px;
    }

    .section-content code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
    }

    .section-content pre {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      font-size: 12px;
      margin-bottom: 12px;
    }

    .section-content blockquote {
      border-left: 3px solid #2563eb;
      padding-left: 16px;
      color: #64748b;
      font-style: italic;
      margin-bottom: 12px;
    }

    /* ---- Data Table ---- */
    .table-section {
      margin-top: 32px;
      page-break-inside: avoid;
    }

    .table-section h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead th {
      text-align: left;
      padding: 8px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #ffffff;
      background: #2563eb;
      font-weight: 600;
    }

    .data-table tbody td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }

    .data-table .alt-row {
      background: #f8fafc;
    }
  </style>
</head>
<body>
  <div class="report">

    <!-- Cover Header -->
    <div class="cover">
      <h1>${escapeHtml(data.title)}</h1>
      ${data.subtitle ? `<p class="subtitle">${escapeHtml(data.subtitle)}</p>` : ""}
      <div class="meta">
        <span>Author: <span class="value">${escapeHtml(data.author)}</span></span>
        <span>Date: <span class="value">${escapeHtml(data.date)}</span></span>
      </div>
    </div>

    <!-- Sections -->
    ${sectionsHtml}

    <!-- Optional Table -->
    ${tableHtml}

  </div>
</body>
</html>`;
}
