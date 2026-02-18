/**
 * Tabular Data Export PDF Template
 *
 * A self-contained @react-pdf/renderer component for exporting database records,
 * analytics data, reports, or any tabular data into a professional PDF with
 * configurable columns, auto-pagination with repeated headers, alternating row
 * colors, and an optional summary section.
 *
 * Color scheme:
 *   - Header/accent: #1e3a5f (professional blue)
 *   - Column header: #1e3a5f with white text
 *   - Row even:      #f4f6f8
 *   - Row odd:       #ffffff
 *   - Text:          #333333 / #666666
 *
 * @example
 * ```tsx
 * import { DataExport } from './data-export';
 * import { renderToBuffer } from '@react-pdf/renderer';
 *
 * const buffer = await renderToBuffer(
 *   <DataExport
 *     title="Employee Directory"
 *     columns={[{ key: 'name', label: 'Name' }, { key: 'dept', label: 'Department' }]}
 *     rows={[{ name: 'Alice', dept: 'Engineering' }]}
 *   />
 * );
 * ```
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for a single table column. */
export interface ColumnDef {
  /** Key used to look up the value in each row object */
  key: string;
  /** Display label shown in the column header */
  label: string;
  /** Explicit width as a percentage string (e.g., '20%'). Auto-calculated if omitted. */
  width?: string;
  /** Text alignment for both header and data cells. Default: 'left' */
  align?: 'left' | 'center' | 'right';
}

/** A single key-value pair displayed in the summary section. */
export interface SummaryItem {
  label: string;
  value: string;
}

/** Full props for the DataExport component. */
export interface DataExportProps {
  /** Main title displayed in the document header */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Date string shown in the header (e.g., "February 18, 2026") */
  exportDate?: string;
  /** Column definitions controlling table layout */
  columns: ColumnDef[];
  /** Array of data rows — each row is a record keyed by column keys */
  rows: Record<string, string | number>[];
  /** Optional summary items displayed after the table (e.g., totals, averages) */
  summary?: SummaryItem[];
  /** Attribution line shown in the header (e.g., "Admin Dashboard") */
  generatedBy?: string;
  /** Page size. Default: 'A4' */
  pageSize?: 'A4' | 'LETTER';
  /** Page orientation. Default: 'portrait' */
  orientation?: 'portrait' | 'landscape';
}

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

const colors = {
  primary: '#1e3a5f',
  primaryLight: '#2c5282',
  accent: '#3182ce',
  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  white: '#ffffff',
  rowEven: '#f4f6f8',
  rowOdd: '#ffffff',
  border: '#d0d5dd',
  borderLight: '#e8ecf0',
  headerBg: '#1e3a5f',
  summaryBg: '#f0f4f8',
  summaryBorder: '#2c5282',
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
    paddingHorizontal: 36,
  },

  // --- Document Header ---
  docHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    maxWidth: '70%',
  },
  exportDateBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
  exportDateText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- Record Count Bar ---
  recordCountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.summaryBg,
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  recordCountText: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  recordCountValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },

  // --- Table ---
  table: {
    marginBottom: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.headerBg,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableRowEven: {
    backgroundColor: colors.rowEven,
  },
  tableRowOdd: {
    backgroundColor: colors.rowOdd,
  },
  tableCellText: {
    fontSize: 8,
    color: colors.text,
  },
  // Row number column
  colRowNum: {
    width: '5%',
    textAlign: 'center',
  },
  colRowNumText: {
    fontSize: 7,
    color: colors.textMuted,
  },

  // --- Summary ---
  summarySection: {
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.summaryBg,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.summaryBorder,
  },
  summaryTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingRight: 16,
  },
  summaryLabel: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerLeft: {
    fontSize: 7,
    color: colors.textMuted,
  },
  footerRight: {
    fontSize: 7,
    color: colors.textMuted,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute auto-distributed column widths.
 * Columns with an explicit `width` keep theirs; remaining space is divided
 * equally among columns without one. An extra 5% is reserved for the row
 * number column.
 */
function resolveColumnWidths(columns: ColumnDef[]): string[] {
  const ROW_NUM_WIDTH = 5;
  const availablePercent = 100 - ROW_NUM_WIDTH;

  let explicitTotal = 0;
  let autoCount = 0;

  for (const col of columns) {
    if (col.width) {
      explicitTotal += parseFloat(col.width);
    } else {
      autoCount++;
    }
  }

  const remaining = Math.max(0, availablePercent - explicitTotal);
  const autoWidth = autoCount > 0 ? remaining / autoCount : 0;

  return columns.map((col) =>
    col.width ? col.width : `${autoWidth.toFixed(2)}%`,
  );
}

/**
 * Format a cell value for display.
 * Numbers are formatted with locale-aware separators; strings pass through.
 */
function formatCellValue(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') {
    // Integers stay clean; floats get 2 decimal places
    return Number.isInteger(value)
      ? value.toLocaleString('en-US')
      : value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Document header with title, subtitle, date badge, and metadata. */
function DocumentHeader({
  title,
  subtitle,
  exportDate,
  generatedBy,
}: {
  title: string;
  subtitle?: string;
  exportDate?: string;
  generatedBy?: string;
}) {
  return (
    <View style={styles.docHeader} fixed>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {exportDate && (
          <View style={styles.exportDateBadge}>
            <Text style={styles.exportDateText}>{exportDate}</Text>
          </View>
        )}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {generatedBy && (
        <Text style={styles.metaLine}>Generated by {generatedBy}</Text>
      )}
    </View>
  );
}

/** Record count bar showing total rows and column count. */
function RecordCountBar({
  rowCount,
  columnCount,
}: {
  rowCount: number;
  columnCount: number;
}) {
  return (
    <View style={styles.recordCountBar}>
      <Text style={styles.recordCountText}>
        Total Records: <Text style={styles.recordCountValue}>{rowCount.toLocaleString('en-US')}</Text>
      </Text>
      <Text style={styles.recordCountText}>
        Columns: <Text style={styles.recordCountValue}>{columnCount}</Text>
      </Text>
    </View>
  );
}

/** Repeated table column header row. Marked `fixed` for auto-repeat on new pages. */
function TableHeader({
  columns,
  columnWidths,
}: {
  columns: ColumnDef[];
  columnWidths: string[];
}) {
  return (
    <View style={styles.tableHeaderRow} fixed>
      <Text style={[styles.tableHeaderCell, styles.colRowNum]}>#</Text>
      {columns.map((col, i) => (
        <Text
          key={col.key}
          style={[
            styles.tableHeaderCell,
            {
              width: columnWidths[i],
              textAlign: col.align || 'left',
            },
          ]}
        >
          {col.label}
        </Text>
      ))}
    </View>
  );
}

/** A single data row with alternating background. */
function TableRow({
  row,
  rowIndex,
  columns,
  columnWidths,
}: {
  row: Record<string, string | number>;
  rowIndex: number;
  columns: ColumnDef[];
  columnWidths: string[];
}) {
  const isEven = rowIndex % 2 === 0;

  return (
    <View
      style={[
        styles.tableRow,
        isEven ? styles.tableRowEven : styles.tableRowOdd,
      ]}
      wrap={false}
    >
      <Text style={[styles.colRowNumText, styles.colRowNum]}>
        {rowIndex + 1}
      </Text>
      {columns.map((col, i) => (
        <Text
          key={col.key}
          style={[
            styles.tableCellText,
            {
              width: columnWidths[i],
              textAlign: col.align || 'left',
            },
          ]}
        >
          {formatCellValue(row[col.key])}
        </Text>
      ))}
    </View>
  );
}

/** Summary section with key-value pairs in a two-column grid. */
function SummarySection({ items }: { items: SummaryItem[] }) {
  return (
    <View style={styles.summarySection} wrap={false}>
      <Text style={styles.summaryTitle}>Summary</Text>
      <View style={styles.summaryGrid}>
        {items.map((item, i) => (
          <View key={i} style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <Text style={styles.summaryValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Fixed footer with generation timestamp and page numbers. */
function PageFooter({ generatedBy }: { generatedBy?: string }) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerLeft}>
        {generatedBy ? `${generatedBy} | ` : ''}Generated {timestamp}
      </Text>
      <Text
        style={styles.footerRight}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * Tabular Data Export PDF component.
 *
 * Renders a complete, paginated PDF document containing:
 * - Professional header with title, subtitle, export date, and attribution
 * - Record count bar
 * - Configurable data table with auto-widths or explicit column widths
 * - Dark column headers that repeat on every page
 * - Alternating row colors for readability
 * - Optional summary section with key-value pairs
 * - Footer with page numbers and generation timestamp
 *
 * The table automatically paginates — column headers repeat on each new
 * page via the `fixed` prop, and rows use `wrap={false}` to avoid splitting
 * a single row across pages.
 */
export function DataExport(props: DataExportProps) {
  const {
    title,
    subtitle,
    exportDate,
    columns,
    rows,
    summary,
    generatedBy,
    pageSize = 'A4',
    orientation = 'portrait',
  } = props;

  const columnWidths = resolveColumnWidths(columns);

  return (
    <Document
      title={title}
      subject={subtitle || `Data export — ${rows.length} records`}
      creator="@react-pdf/renderer"
    >
      <Page size={pageSize} orientation={orientation} style={styles.page}>
        {/* Header — repeated on every page */}
        <DocumentHeader
          title={title}
          subtitle={subtitle}
          exportDate={exportDate}
          generatedBy={generatedBy}
        />

        {/* Record count bar */}
        <RecordCountBar rowCount={rows.length} columnCount={columns.length} />

        {/* Data table */}
        <View style={styles.table}>
          {/* Column headers — repeated on every page */}
          <TableHeader columns={columns} columnWidths={columnWidths} />

          {/* Data rows */}
          {rows.map((row, index) => (
            <TableRow
              key={index}
              row={row}
              rowIndex={index}
              columns={columns}
              columnWidths={columnWidths}
            />
          ))}
        </View>

        {/* Summary section */}
        {summary && summary.length > 0 && (
          <SummarySection items={summary} />
        )}

        {/* Footer — page numbers + timestamp */}
        <PageFooter generatedBy={generatedBy} />
      </Page>
    </Document>
  );
}

export default DataExport;
