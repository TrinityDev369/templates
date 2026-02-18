/**
 * Payment Receipt PDF Template
 *
 * A self-contained @react-pdf/renderer component for generating compact,
 * single-page payment receipts. Supports company branding, itemized line
 * items, tax breakdown, payment method display, and a "PAID" watermark
 * stamp when the balance due is zero.
 *
 * Color scheme:
 *   - Dark header:   #1a1a2e
 *   - Green accent:  #22c55e (PAID stamp, highlights)
 *   - Borders:       #d1d5db
 *   - Text:          #1f2937 / #6b7280
 *
 * @example
 * ```tsx
 * import { Receipt } from './receipt';
 * import { renderToBuffer } from '@react-pdf/renderer';
 *
 * const buffer = await renderToBuffer(<Receipt {...receiptProps} />);
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

/** A single line item on the receipt. */
export interface ReceiptLineItem {
  /** Description of the product, service, or charge */
  description: string;
  /** Quantity purchased */
  quantity: number;
  /** Price per unit */
  unitPrice: number;
  /** Total amount for this line (quantity * unitPrice) */
  amount: number;
}

/** Company / merchant information displayed on the receipt. */
export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  /** Base64 data URI or absolute file path for the logo image */
  logo?: string;
  website?: string;
}

/** Full props for the Receipt component. */
export interface ReceiptProps {
  // --- Company ---
  company: CompanyInfo;

  // --- Receipt metadata ---
  receiptNumber: string;
  date: string;
  paymentMethod: string;
  transactionId: string;

  // --- Line items ---
  items: ReceiptLineItem[];

  // --- Totals ---
  subtotal: number;
  tax: number;
  /** Tax rate as a percentage (e.g., 8.5 for 8.5%) */
  taxRate: number;
  total: number;
  amountPaid: number;
  balanceDue: number;

  // --- Customer ---
  customerName: string;
  customerEmail: string;

  // --- Formatting ---
  /** ISO 4217 currency code or symbol. Default: "$" */
  currency?: string;
  /** Optional notes printed below totals */
  notes?: string;
}

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

const colors = {
  darkHeader: '#1a1a2e',
  green: '#22c55e',
  greenLight: '#dcfce7',
  greenDark: '#15803d',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  white: '#ffffff',
  border: '#d1d5db',
  borderLight: '#e5e7eb',
  bgLight: '#f9fafb',
  paidStamp: '#22c55e',
  paidStampBorder: '#16a34a',
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
    paddingTop: 36,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.darkHeader,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '60%',
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 10,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
    marginBottom: 2,
  },
  companyDetail: {
    fontSize: 7.5,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  receiptBadge: {
    backgroundColor: colors.darkHeader,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 3,
    marginBottom: 6,
  },
  receiptBadgeText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    letterSpacing: 3,
  },
  receiptNumberLabel: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptNumberValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
    marginTop: 1,
  },

  // --- Receipt details row ---
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.bgLight,
    borderRadius: 3,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailBlock: {},
  detailLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },

  // --- Customer info ---
  customerSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
    marginBottom: 1,
  },
  customerEmail: {
    fontSize: 8,
    color: colors.textSecondary,
  },

  // --- Items table ---
  table: {
    marginBottom: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.darkHeader,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  // Column widths
  colDescription: { width: '48%' },
  colQuantity: { width: '12%', textAlign: 'center' },
  colUnitPrice: { width: '20%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },

  tableCellText: {
    fontSize: 8.5,
    color: colors.text,
  },
  tableCellBold: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },

  // --- Totals ---
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 14,
  },
  totalsBox: {
    width: '44%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  totalsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  totalsLabel: {
    fontSize: 8.5,
    color: colors.textSecondary,
  },
  totalsValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  totalsFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: colors.darkHeader,
    borderRadius: 3,
    marginTop: 3,
  },
  totalsFinalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  totalsFinalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  amountPaidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: 2,
  },
  amountPaidLabel: {
    fontSize: 8.5,
    color: colors.greenDark,
  },
  amountPaidValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.greenDark,
  },
  balanceDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: colors.bgLight,
    borderRadius: 2,
    marginTop: 2,
  },
  balanceDueLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  balanceDueValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },

  // --- Payment method badge ---
  paymentMethodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  paymentMethodLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  paymentMethodBadge: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  paymentMethodText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkHeader,
  },

  // --- PAID stamp ---
  paidStampContainer: {
    position: 'absolute',
    top: 180,
    right: 50,
    transform: 'rotate(-18deg)',
  },
  paidStamp: {
    borderWidth: 4,
    borderColor: colors.paidStampBorder,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 20,
    opacity: 0.18,
  },
  paidStampText: {
    fontSize: 48,
    fontFamily: 'Helvetica-Bold',
    color: colors.paidStamp,
    letterSpacing: 6,
  },

  // --- Notes ---
  notesSection: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: colors.bgLight,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  notesTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    color: colors.textSecondary,
    lineHeight: 1.6,
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerThankYou: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.green,
    marginBottom: 3,
  },
  footerContact: {
    fontSize: 7,
    color: colors.textMuted,
    textAlign: 'center',
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

/** Header: company info on left, RECEIPT badge on right. */
function ReceiptHeader({
  company,
  receiptNumber,
}: {
  company: CompanyInfo;
  receiptNumber: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {company.logo && (
          <Image src={company.logo} style={styles.logo} />
        )}
        <View>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companyDetail}>{company.address}</Text>
          <Text style={styles.companyDetail}>{company.email}</Text>
          <Text style={styles.companyDetail}>{company.phone}</Text>
          {company.website && (
            <Text style={styles.companyDetail}>{company.website}</Text>
          )}
        </View>
      </View>

      <View style={styles.headerRight}>
        <View style={styles.receiptBadge}>
          <Text style={styles.receiptBadgeText}>RECEIPT</Text>
        </View>
        <Text style={styles.receiptNumberLabel}>Receipt No.</Text>
        <Text style={styles.receiptNumberValue}>{receiptNumber}</Text>
      </View>
    </View>
  );
}

/** Receipt details: date, transaction ID. */
function ReceiptDetails({
  receiptNumber,
  date,
  transactionId,
}: {
  receiptNumber: string;
  date: string;
  transactionId: string;
}) {
  return (
    <View style={styles.detailsRow}>
      <View style={styles.detailBlock}>
        <Text style={styles.detailLabel}>Receipt No.</Text>
        <Text style={styles.detailValue}>{receiptNumber}</Text>
      </View>
      <View style={styles.detailBlock}>
        <Text style={styles.detailLabel}>Date</Text>
        <Text style={styles.detailValue}>{date}</Text>
      </View>
      <View style={styles.detailBlock}>
        <Text style={styles.detailLabel}>Transaction ID</Text>
        <Text style={styles.detailValue}>{transactionId}</Text>
      </View>
    </View>
  );
}

/** Customer information block. */
function CustomerInfo({
  customerName,
  customerEmail,
}: {
  customerName: string;
  customerEmail: string;
}) {
  return (
    <View style={styles.customerSection}>
      <Text style={styles.sectionLabel}>Customer</Text>
      <Text style={styles.customerName}>{customerName}</Text>
      <Text style={styles.customerEmail}>{customerEmail}</Text>
    </View>
  );
}

/** Line items table with border-only rows (no alternating colors). */
function ItemsTable({
  items,
  currencySymbol,
}: {
  items: ReceiptLineItem[];
  currencySymbol: string;
}) {
  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.tableHeaderRow}>
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
      {items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
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
      ))}
    </View>
  );
}

/** Totals section: subtotal, tax, total, amount paid, balance due. */
function TotalsSection({
  subtotal,
  tax,
  taxRate,
  total,
  amountPaid,
  balanceDue,
  currencySymbol,
}: {
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  currencySymbol: string;
}) {
  return (
    <View style={styles.totalsContainer}>
      <View style={styles.totalsBox}>
        {/* Subtotal */}
        <View style={[styles.totalsRow, styles.totalsRowBorder]}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>
            {formatCurrency(subtotal, currencySymbol)}
          </Text>
        </View>

        {/* Tax */}
        <View style={[styles.totalsRow, styles.totalsRowBorder]}>
          <Text style={styles.totalsLabel}>Tax ({taxRate}%)</Text>
          <Text style={styles.totalsValue}>
            {formatCurrency(tax, currencySymbol)}
          </Text>
        </View>

        {/* Grand total */}
        <View style={styles.totalsFinalRow}>
          <Text style={styles.totalsFinalLabel}>Total</Text>
          <Text style={styles.totalsFinalValue}>
            {formatCurrency(total, currencySymbol)}
          </Text>
        </View>

        {/* Amount paid */}
        <View style={styles.amountPaidRow}>
          <Text style={styles.amountPaidLabel}>Amount Paid</Text>
          <Text style={styles.amountPaidValue}>
            {formatCurrency(amountPaid, currencySymbol)}
          </Text>
        </View>

        {/* Balance due (if any) */}
        {balanceDue > 0 && (
          <View style={styles.balanceDueRow}>
            <Text style={styles.balanceDueLabel}>Balance Due</Text>
            <Text style={styles.balanceDueValue}>
              {formatCurrency(balanceDue, currencySymbol)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/** Payment method badge display. */
function PaymentMethodBadge({ method }: { method: string }) {
  return (
    <View style={styles.paymentMethodSection}>
      <Text style={styles.paymentMethodLabel}>Payment Method</Text>
      <View style={styles.paymentMethodBadge}>
        <Text style={styles.paymentMethodText}>{method}</Text>
      </View>
    </View>
  );
}

/** "PAID" watermark stamp overlay — only rendered when balanceDue === 0. */
function PaidStamp() {
  return (
    <View style={styles.paidStampContainer}>
      <View style={styles.paidStamp}>
        <Text style={styles.paidStampText}>PAID</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * Payment Receipt PDF component.
 *
 * Renders a compact, single-page payment receipt with:
 * - Company branding (logo, name, address, contact)
 * - Receipt metadata (number, date, transaction ID)
 * - Customer information
 * - Itemized line items table (border-based, no alternating colors)
 * - Totals breakdown (subtotal, tax, total, amount paid, balance due)
 * - Payment method badge
 * - "PAID" watermark stamp when fully paid (balanceDue === 0)
 * - Thank-you footer with company contact
 */
export function Receipt(props: ReceiptProps) {
  const {
    company,
    receiptNumber,
    date,
    paymentMethod,
    transactionId,
    items,
    subtotal,
    tax,
    taxRate,
    total,
    amountPaid,
    balanceDue,
    customerName,
    customerEmail,
    currency = '$',
    notes,
  } = props;

  const footerParts: string[] = [];
  if (company.email) footerParts.push(company.email);
  if (company.phone) footerParts.push(company.phone);
  if (company.website) footerParts.push(company.website);

  return (
    <Document
      title={`Receipt ${receiptNumber}`}
      author={company.name}
      subject={`Payment receipt ${receiptNumber} for ${customerName}`}
      creator="@react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        {/* PAID watermark — rendered first so it sits behind content */}
        {balanceDue === 0 && <PaidStamp />}

        {/* Header: company info + RECEIPT badge */}
        <ReceiptHeader company={company} receiptNumber={receiptNumber} />

        {/* Receipt details row: receipt #, date, transaction ID */}
        <ReceiptDetails
          receiptNumber={receiptNumber}
          date={date}
          transactionId={transactionId}
        />

        {/* Customer info */}
        <CustomerInfo
          customerName={customerName}
          customerEmail={customerEmail}
        />

        {/* Line items table */}
        <ItemsTable items={items} currencySymbol={currency} />

        {/* Totals */}
        <TotalsSection
          subtotal={subtotal}
          tax={tax}
          taxRate={taxRate}
          total={total}
          amountPaid={amountPaid}
          balanceDue={balanceDue}
          currencySymbol={currency}
        />

        {/* Payment method */}
        <PaymentMethodBadge method={paymentMethod} />

        {/* Notes */}
        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerThankYou}>
            Thank you for your payment!
          </Text>
          {footerParts.length > 0 && (
            <Text style={styles.footerContact}>
              {footerParts.join('  |  ')}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

export default Receipt;
