/**
 * Professional Invoice PDF Template
 *
 * A self-contained @react-pdf/renderer component for generating polished
 * invoice PDFs. Supports company branding, client details, itemized line
 * items with alternating row backgrounds, tax calculations, payment
 * instructions, and customizable footer notes.
 *
 * Color scheme:
 *   - Dark header:    #1a1a2e
 *   - Accent:         #e94560
 *   - Light gray rows: #f8f9fa / #ffffff alternating
 *   - Text:           #333333 / #666666
 *
 * @example
 * ```tsx
 * import { Invoice } from './invoice';
 * import { renderToBuffer } from '@react-pdf/renderer';
 *
 * const buffer = await renderToBuffer(<Invoice {...invoiceProps} />);
 * ```
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single line item on the invoice. */
export interface InvoiceLineItem {
  /** Description of the product or service */
  description: string;
  /** Quantity */
  quantity: number;
  /** Price per unit */
  unitPrice: number;
  /** Total amount for this line (quantity * unitPrice) */
  amount: number;
}

/** Company or sender information. */
export interface CompanyInfo {
  name: string;
  address: string[];
  email?: string;
  phone?: string;
  /** Base64 data URI or absolute file path for the logo image */
  logo?: string;
  /** Tax ID / VAT number displayed below company details */
  taxId?: string;
  website?: string;
}

/** Client / recipient information. */
export interface ClientInfo {
  name: string;
  address: string[];
  email?: string;
  phone?: string;
}

/** Bank or payment details shown in the payment section. */
export interface PaymentDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  iban?: string;
  bic?: string;
  /** Free-form instructions (e.g., PayPal, crypto, Wise) */
  instructions?: string;
}

/** Full props for the Invoice component. */
export interface InvoiceProps {
  // --- Parties ---
  company: CompanyInfo;
  client: ClientInfo;

  // --- Invoice metadata ---
  invoiceNumber: string;
  date: string;
  dueDate: string;

  // --- Line items ---
  items: InvoiceLineItem[];

  // --- Totals ---
  subtotal: number;
  /** Tax rate as a percentage (e.g., 19 for 19%) */
  taxRate: number;
  /** Computed tax amount */
  taxAmount: number;
  /** Grand total (subtotal + taxAmount) */
  total: number;

  // --- Payment ---
  paymentTerms?: string;
  paymentDetails?: PaymentDetails;

  // --- Footer ---
  notes?: string;
  termsAndConditions?: string;

  // --- Formatting ---
  /** Currency symbol prepended to monetary values. Default: "$" */
  currencySymbol?: string;
  /** Title displayed in the header. Default: "INVOICE" */
  title?: string;
}

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

const colors = {
  darkHeader: '#1a1a2e',
  accent: '#e94560',
  accentLight: '#fce4ec',
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  white: '#ffffff',
  rowEven: '#f8f9fa',
  rowOdd: '#ffffff',
  border: '#e0e0e0',
  borderLight: '#eeeeee',
  tableHeader: '#1a1a2e',
  totalBg: '#1a1a2e',
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // --- Page ---
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.text,
    backgroundColor: colors.white,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '55%',
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: 12,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 8,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
    letterSpacing: 2,
    marginBottom: 4,
  },
  invoiceNumberLabel: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  invoiceNumberValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    marginTop: 1,
  },

  // --- Meta row (invoice #, date, due date) ---
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.rowEven,
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
  },
  metaBlock: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
  },

  // --- Bill To ---
  billToSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  clientName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
    marginBottom: 3,
  },
  clientDetail: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },

  // --- Table ---
  table: {
    marginBottom: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.tableHeader,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableRowEven: {
    backgroundColor: colors.rowEven,
  },
  tableRowOdd: {
    backgroundColor: colors.rowOdd,
  },
  // Column widths
  colNumber: { width: '6%' },
  colDescription: { width: '46%' },
  colQuantity: { width: '12%', textAlign: 'center' },
  colUnitPrice: { width: '18%', textAlign: 'right' },
  colAmount: { width: '18%', textAlign: 'right' },

  tableCellText: {
    fontSize: 9,
    color: colors.text,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },

  // --- Totals ---
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 24,
  },
  totalsBox: {
    width: '42%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  totalsLabel: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  totalsFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.totalBg,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: 2,
  },
  totalsFinalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  totalsFinalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },

  // --- Payment Details ---
  paymentSection: {
    marginBottom: 24,
    padding: 14,
    backgroundColor: colors.rowEven,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  paymentTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  paymentLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    width: 100,
  },
  paymentValue: {
    fontSize: 8,
    color: colors.text,
    flex: 1,
  },

  // --- Notes / Terms ---
  notesSection: {
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: colors.textSecondary,
    lineHeight: 1.6,
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerThankYou: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
  },
  footerPageNumber: {
    fontSize: 7,
    color: colors.textLight,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a number as a currency string with the given symbol.
 * Uses fixed 2-decimal formatting with thousands separators.
 */
function formatCurrency(value: number, symbol: string): string {
  const formatted = value
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol}${formatted}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Header: company info on left, invoice title on right. */
function InvoiceHeader({
  company,
  invoiceNumber,
  title,
}: {
  company: CompanyInfo;
  invoiceNumber: string;
  title: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {company.logo && (
          <Image src={company.logo} style={styles.logo} />
        )}
        <View>
          <Text style={styles.companyName}>{company.name}</Text>
          {company.address.map((line, i) => (
            <Text key={i} style={styles.companyDetail}>
              {line}
            </Text>
          ))}
          {company.email && (
            <Text style={styles.companyDetail}>{company.email}</Text>
          )}
          {company.phone && (
            <Text style={styles.companyDetail}>{company.phone}</Text>
          )}
          {company.taxId && (
            <Text style={styles.companyDetail}>Tax ID: {company.taxId}</Text>
          )}
          {company.website && (
            <Text style={styles.companyDetail}>{company.website}</Text>
          )}
        </View>
      </View>

      <View style={styles.headerRight}>
        <Text style={styles.invoiceTitle}>{title}</Text>
        <Text style={styles.invoiceNumberLabel}>Invoice Number</Text>
        <Text style={styles.invoiceNumberValue}>{invoiceNumber}</Text>
      </View>
    </View>
  );
}

/** Meta row showing invoice number, issue date, and due date. */
function InvoiceMetaRow({
  invoiceNumber,
  date,
  dueDate,
}: {
  invoiceNumber: string;
  date: string;
  dueDate: string;
}) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaBlock}>
        <Text style={styles.metaLabel}>Invoice No.</Text>
        <Text style={styles.metaValue}>{invoiceNumber}</Text>
      </View>
      <View style={styles.metaBlock}>
        <Text style={styles.metaLabel}>Issue Date</Text>
        <Text style={styles.metaValue}>{date}</Text>
      </View>
      <View style={styles.metaBlock}>
        <Text style={styles.metaLabel}>Due Date</Text>
        <Text style={styles.metaValue}>{dueDate}</Text>
      </View>
    </View>
  );
}

/** Bill-to section displaying client details. */
function BillTo({ client }: { client: ClientInfo }) {
  return (
    <View style={styles.billToSection}>
      <Text style={styles.sectionLabel}>Bill To</Text>
      <Text style={styles.clientName}>{client.name}</Text>
      {client.address.map((line, i) => (
        <Text key={i} style={styles.clientDetail}>
          {line}
        </Text>
      ))}
      {client.email && (
        <Text style={styles.clientDetail}>{client.email}</Text>
      )}
      {client.phone && (
        <Text style={styles.clientDetail}>{client.phone}</Text>
      )}
    </View>
  );
}

/** Line items table with alternating row backgrounds. */
function LineItemsTable({
  items,
  currencySymbol,
}: {
  items: InvoiceLineItem[];
  currencySymbol: string;
}) {
  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, styles.colNumber]}>#</Text>
        <Text style={[styles.tableHeaderCell, styles.colDescription]}>
          Description
        </Text>
        <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Qty</Text>
        <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>
          Unit Price
        </Text>
        <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
      </View>

      {/* Data rows */}
      {items.map((item, index) => {
        const isEven = index % 2 === 0;
        return (
          <View
            key={index}
            style={[
              styles.tableRow,
              isEven ? styles.tableRowEven : styles.tableRowOdd,
            ]}
          >
            <Text style={[styles.tableCellText, styles.colNumber]}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text style={[styles.tableCellBold, styles.colDescription]}>
              {item.description}
            </Text>
            <Text style={[styles.tableCellText, styles.colQuantity]}>
              {item.quantity}
            </Text>
            <Text style={[styles.tableCellText, styles.colUnitPrice]}>
              {formatCurrency(item.unitPrice, currencySymbol)}
            </Text>
            <Text style={[styles.tableCellBold, styles.colAmount]}>
              {formatCurrency(item.amount, currencySymbol)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Totals section: subtotal, tax, and grand total. */
function TotalsSection({
  subtotal,
  taxRate,
  taxAmount,
  total,
  currencySymbol,
}: {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currencySymbol: string;
}) {
  return (
    <View style={styles.totalsContainer}>
      <View style={styles.totalsBox}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>
            {formatCurrency(subtotal, currencySymbol)}
          </Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Tax ({taxRate}%)</Text>
          <Text style={styles.totalsValue}>
            {formatCurrency(taxAmount, currencySymbol)}
          </Text>
        </View>
        <View style={styles.totalsFinalRow}>
          <Text style={styles.totalsFinalLabel}>Total Due</Text>
          <Text style={styles.totalsFinalValue}>
            {formatCurrency(total, currencySymbol)}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Payment details block. */
function PaymentSection({ details }: { details: PaymentDetails }) {
  const rows: { label: string; value: string }[] = [];

  if (details.bankName) rows.push({ label: 'Bank', value: details.bankName });
  if (details.accountName)
    rows.push({ label: 'Account Name', value: details.accountName });
  if (details.accountNumber)
    rows.push({ label: 'Account No.', value: details.accountNumber });
  if (details.routingNumber)
    rows.push({ label: 'Routing No.', value: details.routingNumber });
  if (details.iban) rows.push({ label: 'IBAN', value: details.iban });
  if (details.bic) rows.push({ label: 'BIC / SWIFT', value: details.bic });

  return (
    <View style={styles.paymentSection}>
      <Text style={styles.paymentTitle}>Payment Details</Text>
      {rows.map((row, i) => (
        <View key={i} style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>{row.label}</Text>
          <Text style={styles.paymentValue}>{row.value}</Text>
        </View>
      ))}
      {details.instructions && (
        <View style={[styles.paymentRow, { marginTop: 4 }]}>
          <Text style={styles.paymentLabel}>Instructions</Text>
          <Text style={styles.paymentValue}>{details.instructions}</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * Professional Invoice PDF component.
 *
 * Renders a complete, print-ready invoice document with:
 * - Branded header with optional company logo
 * - Invoice metadata (number, dates)
 * - Client billing details
 * - Itemized line items table with alternating row colors
 * - Subtotal, tax, and total calculation display
 * - Payment instructions
 * - Notes and terms & conditions
 * - Professional footer
 */
export function Invoice(props: InvoiceProps) {
  const {
    company,
    client,
    invoiceNumber,
    date,
    dueDate,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    paymentTerms,
    paymentDetails,
    notes,
    termsAndConditions,
    currencySymbol = '$',
    title = 'INVOICE',
  } = props;

  return (
    <Document
      title={`${title} ${invoiceNumber}`}
      author={company.name}
      subject={`Invoice ${invoiceNumber} for ${client.name}`}
      creator="@react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        {/* Header: company info + invoice title */}
        <InvoiceHeader
          company={company}
          invoiceNumber={invoiceNumber}
          title={title}
        />

        {/* Meta row: invoice #, date, due date */}
        <InvoiceMetaRow
          invoiceNumber={invoiceNumber}
          date={date}
          dueDate={dueDate}
        />

        {/* Bill To */}
        <BillTo client={client} />

        {/* Line items table */}
        <LineItemsTable items={items} currencySymbol={currencySymbol} />

        {/* Totals */}
        <TotalsSection
          subtotal={subtotal}
          taxRate={taxRate}
          taxAmount={taxAmount}
          total={total}
          currencySymbol={currencySymbol}
        />

        {/* Payment terms */}
        {paymentTerms && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Payment Terms</Text>
            <Text style={styles.notesText}>{paymentTerms}</Text>
          </View>
        )}

        {/* Payment details */}
        {paymentDetails && <PaymentSection details={paymentDetails} />}

        {/* Notes */}
        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Terms & Conditions */}
        {termsAndConditions && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{termsAndConditions}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerThankYou}>Thank you for your business!</Text>
          <Text
            style={styles.footerPageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export default Invoice;
