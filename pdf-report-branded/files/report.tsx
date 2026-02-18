/**
 * BrandedReport PDF Template
 *
 * A general-purpose branded PDF report with cover page, table of contents,
 * executive summary, data tables, bar chart visualization, and professional
 * header/footer on every page.
 *
 * Built entirely with @react-pdf/renderer primitives — no external UI
 * libraries required. Fully self-contained with inline types.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { renderToBuffer } from '@react-pdf/renderer';
 * import { BrandedReport } from './report';
 *
 * const buffer = await renderToBuffer(
 *   <BrandedReport
 *     title="Q4 Performance Report"
 *     subtitle="October - December 2025"
 *     companyName="Acme Corp"
 *     author="Jane Smith"
 *     date="January 15, 2026"
 *     sections={[{ title: 'Overview', body: 'This quarter exceeded targets...' }]}
 *     tableData={{ headers: ['Metric', 'Value'], rows: [['Revenue', '$1.2M']] }}
 *     chartData={[{ label: 'Q1', value: 80 }, { label: 'Q2', value: 120 }]}
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
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single section in the report body. */
export interface ReportSection {
  /** Section title displayed as a heading. */
  title: string;
  /** Main body text for the section. */
  body: string;
  /** Optional bullet-point items rendered below the body. */
  bullets?: string[];
}

/** Tabular data block with column headers and string rows. */
export interface TableData {
  /** Column header labels. */
  headers: string[];
  /** Two-dimensional array of cell values — each inner array is one row. */
  rows: string[][];
  /** Optional caption rendered above the table. */
  caption?: string;
}

/** A single data point for the bar chart. */
export interface ChartDataPoint {
  /** Axis label displayed beneath the bar. */
  label: string;
  /** Numeric value controlling the bar height (0-100 scale recommended). */
  value: number;
}

/** Branding color overrides. All values must be valid CSS color strings. */
export interface BrandColors {
  /** Primary brand color used for headings and accents. Default: '#1a365d' */
  primary?: string;
  /** Secondary color for subtle accents and chart bars. Default: '#2b6cb0' */
  secondary?: string;
  /** Background tint for alternating table rows. Default: '#f7fafc' */
  muted?: string;
  /** Body text color. Default: '#1a202c' */
  text?: string;
  /** Light text color used in the cover page and footer. Default: '#ffffff' */
  light?: string;
}

/** Top-level props for the BrandedReport component. */
export interface BrandedReportProps {
  /** Report title displayed on the cover page and headers. */
  title: string;
  /** Subtitle displayed beneath the title on the cover page. */
  subtitle?: string;
  /** Company or organization name. */
  companyName: string;
  /** Author or team name. */
  author?: string;
  /** Report date string (e.g., "January 15, 2026"). */
  date?: string;
  /**
   * Optional logo image source — base64 data URI or absolute file path.
   * Displayed on the cover page and in the page header.
   */
  logoSrc?: string;
  /** Executive summary paragraph shown before sections. */
  executiveSummary?: string;
  /** Ordered array of report sections. */
  sections: ReportSection[];
  /** Optional data table rendered after the sections. */
  tableData?: TableData;
  /** Optional bar chart data rendered after the table. */
  chartData?: ChartDataPoint[];
  /** Chart title displayed above the bar chart. */
  chartTitle?: string;
  /** Conclusion paragraph rendered at the end. */
  conclusion?: string;
  /** Branding color overrides. */
  colors?: BrandColors;
  /** Mark the document as confidential (shows watermark text in footer). */
  confidential?: boolean;
  /** Document reference number shown in the header. */
  documentNumber?: string;
}

// ---------------------------------------------------------------------------
// Default palette
// ---------------------------------------------------------------------------

const DEFAULT_COLORS: Required<BrandColors> = {
  primary: '#1a365d',
  secondary: '#2b6cb0',
  muted: '#f7fafc',
  text: '#1a202c',
  light: '#ffffff',
};

// ---------------------------------------------------------------------------
// Font registration (optional — falls back to Helvetica)
// ---------------------------------------------------------------------------

// Register Helvetica variants that ship with react-pdf by default.
// No external font files are needed.
Font.registerHyphenationCallback((word) => [word]);

// ---------------------------------------------------------------------------
// Stylesheet factory — parameterised by brand colors
// ---------------------------------------------------------------------------

function createStyles(c: Required<BrandColors>) {
  return StyleSheet.create({
    // -- Page --
    page: {
      fontFamily: 'Helvetica',
      fontSize: 10,
      color: c.text,
      paddingTop: 72,
      paddingBottom: 60,
      paddingHorizontal: 50,
    },

    // -- Cover page --
    coverPage: {
      fontFamily: 'Helvetica',
      fontSize: 10,
      color: c.light,
      backgroundColor: c.primary,
      paddingHorizontal: 50,
      paddingVertical: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    coverLogoContainer: {
      marginBottom: 40,
      alignItems: 'center',
    },
    coverLogo: {
      width: 120,
      height: 120,
      objectFit: 'contain' as const,
    },
    coverTitle: {
      fontSize: 32,
      fontFamily: 'Helvetica-Bold',
      color: c.light,
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    coverSubtitle: {
      fontSize: 16,
      color: c.light,
      textAlign: 'center',
      opacity: 0.85,
      marginBottom: 40,
    },
    coverDivider: {
      width: 80,
      height: 2,
      backgroundColor: c.light,
      opacity: 0.5,
      marginBottom: 40,
    },
    coverMeta: {
      fontSize: 11,
      color: c.light,
      opacity: 0.8,
      textAlign: 'center',
      marginBottom: 6,
    },

    // -- Header --
    header: {
      position: 'absolute',
      top: 20,
      left: 50,
      right: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.primary,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerLogo: {
      width: 20,
      height: 20,
      objectFit: 'contain' as const,
    },
    headerCompany: {
      fontSize: 8,
      fontFamily: 'Helvetica-Bold',
      color: c.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    headerTitle: {
      fontSize: 8,
      color: '#718096',
    },
    headerDocNum: {
      fontSize: 7,
      color: '#a0aec0',
    },

    // -- Footer --
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 50,
      right: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 0.5,
      borderTopColor: '#e2e8f0',
      paddingTop: 8,
    },
    footerText: {
      fontSize: 7,
      color: '#a0aec0',
    },
    footerConfidential: {
      fontSize: 7,
      fontFamily: 'Helvetica-Bold',
      color: '#e53e3e',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    // -- Table of Contents --
    tocTitle: {
      fontSize: 22,
      fontFamily: 'Helvetica-Bold',
      color: c.primary,
      marginBottom: 24,
    },
    tocEntry: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: '#e2e8f0',
    },
    tocNumber: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: c.secondary,
      width: 28,
    },
    tocLabel: {
      fontSize: 10,
      color: c.text,
      flex: 1,
    },
    tocPage: {
      fontSize: 10,
      color: '#718096',
      width: 30,
      textAlign: 'right',
    },

    // -- Section headings --
    sectionHeading: {
      fontSize: 18,
      fontFamily: 'Helvetica-Bold',
      color: c.primary,
      marginBottom: 12,
      marginTop: 8,
      paddingBottom: 6,
      borderBottomWidth: 2,
      borderBottomColor: c.secondary,
    },
    bodyText: {
      fontSize: 10,
      lineHeight: 1.7,
      color: c.text,
      marginBottom: 12,
      textAlign: 'justify',
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: 4,
      paddingLeft: 8,
    },
    bulletDot: {
      width: 14,
      fontSize: 10,
      color: c.secondary,
    },
    bulletText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 1.6,
      color: c.text,
    },

    // -- Data Table --
    tableCaption: {
      fontSize: 9,
      fontFamily: 'Helvetica-Oblique',
      color: '#718096',
      marginBottom: 6,
    },
    tableContainer: {
      marginVertical: 12,
      borderWidth: 0.5,
      borderColor: '#cbd5e0',
    },
    tableHeaderRow: {
      flexDirection: 'row',
      backgroundColor: c.primary,
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    tableHeaderCell: {
      flex: 1,
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: c.light,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: '#e2e8f0',
    },
    tableRowAlt: {
      backgroundColor: c.muted,
    },
    tableCell: {
      flex: 1,
      fontSize: 9,
      color: c.text,
    },

    // -- Bar Chart --
    chartContainer: {
      marginVertical: 16,
    },
    chartTitle: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: c.primary,
      marginBottom: 12,
    },
    chartArea: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 160,
      borderBottomWidth: 1,
      borderBottomColor: '#cbd5e0',
      borderLeftWidth: 1,
      borderLeftColor: '#cbd5e0',
      paddingLeft: 4,
      paddingBottom: 0,
    },
    chartBarGroup: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 4,
    },
    chartBar: {
      width: '70%',
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
    },
    chartBarValue: {
      fontSize: 7,
      fontFamily: 'Helvetica-Bold',
      color: c.primary,
      marginBottom: 2,
      textAlign: 'center',
    },
    chartLabels: {
      flexDirection: 'row',
      marginTop: 4,
      borderTopWidth: 0,
    },
    chartLabel: {
      flex: 1,
      fontSize: 7,
      color: '#718096',
      textAlign: 'center',
    },
    chartYAxis: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 30,
      justifyContent: 'space-between',
      paddingVertical: 2,
    },
    chartYLabel: {
      fontSize: 6,
      color: '#a0aec0',
      textAlign: 'right',
      width: 26,
    },

    // -- Conclusion --
    conclusionBox: {
      marginTop: 16,
      padding: 16,
      backgroundColor: c.muted,
      borderLeftWidth: 3,
      borderLeftColor: c.secondary,
    },
    conclusionHeading: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: c.primary,
      marginBottom: 8,
    },
    conclusionText: {
      fontSize: 10,
      lineHeight: 1.7,
      color: c.text,
    },
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface PageHeaderProps {
  companyName: string;
  title: string;
  documentNumber?: string;
  logoSrc?: string;
  styles: ReturnType<typeof createStyles>;
}

function PageHeader({
  companyName,
  title,
  documentNumber,
  logoSrc,
  styles,
}: PageHeaderProps) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerLeft}>
        {logoSrc && <Image src={logoSrc} style={styles.headerLogo} />}
        <Text style={styles.headerCompany}>{companyName}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {documentNumber && (
          <Text style={styles.headerDocNum}>{documentNumber}</Text>
        )}
      </View>
    </View>
  );
}

interface PageFooterProps {
  companyName: string;
  confidential?: boolean;
  styles: ReturnType<typeof createStyles>;
}

function PageFooter({ companyName, confidential, styles }: PageFooterProps) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{companyName}</Text>
      {confidential && (
        <Text style={styles.footerConfidential}>Confidential</Text>
      )}
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

interface DataTableProps {
  data: TableData;
  styles: ReturnType<typeof createStyles>;
}

function DataTable({ data, styles }: DataTableProps) {
  return (
    <View style={styles.tableContainer} wrap={false}>
      {data.caption && <Text style={styles.tableCaption}>{data.caption}</Text>}
      {/* Header */}
      <View style={styles.tableHeaderRow}>
        {data.headers.map((header, i) => (
          <Text key={`th-${i}`} style={styles.tableHeaderCell}>
            {header}
          </Text>
        ))}
      </View>
      {/* Rows */}
      {data.rows.map((row, ri) => (
        <View
          key={`tr-${ri}`}
          style={[styles.tableRow, ri % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          {row.map((cell, ci) => (
            <Text key={`td-${ri}-${ci}`} style={styles.tableCell}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  barColor: string;
  styles: ReturnType<typeof createStyles>;
}

function BarChart({ data, title, barColor, styles }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 140; // inner height for bars

  // Y-axis tick values (5 ticks)
  const ticks = Array.from({ length: 5 }, (_, i) =>
    Math.round((maxValue / 4) * (4 - i))
  );

  return (
    <View style={styles.chartContainer} wrap={false}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}

      {/* Chart body with Y-axis labels and bars */}
      <View style={{ flexDirection: 'row' }}>
        {/* Y-axis labels */}
        <View
          style={{
            width: 36,
            height: chartHeight,
            justifyContent: 'space-between',
            paddingRight: 4,
          }}
        >
          {ticks.map((tick, i) => (
            <Text key={`y-${i}`} style={styles.chartYLabel}>
              {tick}
            </Text>
          ))}
        </View>

        {/* Bars area */}
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.chartArea,
              { height: chartHeight },
            ]}
          >
            {data.map((point, i) => {
              const barHeight = Math.max(
                (point.value / maxValue) * (chartHeight - 20),
                2
              );
              return (
                <View key={`bar-${i}`} style={styles.chartBarGroup}>
                  <Text style={styles.chartBarValue}>{point.value}</Text>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: barHeight,
                        backgroundColor: barColor,
                        opacity: 0.7 + (i % 3) * 0.1,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
          {/* X-axis labels */}
          <View style={styles.chartLabels}>
            {data.map((point, i) => (
              <Text key={`lbl-${i}`} style={styles.chartLabel}>
                {point.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * BrandedReport
 *
 * Renders a multi-page branded PDF report document.
 *
 * Pages:
 *  1. Cover page (logo, title, subtitle, author, date)
 *  2. Table of contents (auto-generated from sections)
 *  3+ Content pages (executive summary, sections, table, chart, conclusion)
 */
export function BrandedReport({
  title,
  subtitle,
  companyName,
  author,
  date,
  logoSrc,
  executiveSummary,
  sections,
  tableData,
  chartData,
  chartTitle,
  conclusion,
  colors,
  confidential = false,
  documentNumber,
}: BrandedReportProps) {
  const c: Required<BrandColors> = { ...DEFAULT_COLORS, ...colors };
  const styles = createStyles(c);

  // Build TOC entries from sections
  // Page numbering: cover=1, toc=2, content starts at 3
  const tocEntries: { number: string; label: string; page: number }[] = [];
  let currentPage = 3;

  if (executiveSummary) {
    tocEntries.push({
      number: '01',
      label: 'Executive Summary',
      page: currentPage,
    });
  }

  sections.forEach((section, i) => {
    const num = String(
      (executiveSummary ? 2 : 1) + i
    ).padStart(2, '0');
    tocEntries.push({ number: num, label: section.title, page: currentPage });
    // Rough page estimation: advance every ~2 sections
    if ((i + 1) % 2 === 0) currentPage++;
  });

  if (tableData) {
    tocEntries.push({
      number: String(tocEntries.length + 1).padStart(2, '0'),
      label: tableData.caption || 'Data Table',
      page: currentPage,
    });
  }

  if (chartData && chartData.length > 0) {
    tocEntries.push({
      number: String(tocEntries.length + 1).padStart(2, '0'),
      label: chartTitle || 'Chart',
      page: currentPage,
    });
  }

  if (conclusion) {
    tocEntries.push({
      number: String(tocEntries.length + 1).padStart(2, '0'),
      label: 'Conclusion',
      page: currentPage + 1,
    });
  }

  return (
    <Document
      title={`${title} - ${companyName}`}
      author={author || companyName}
      subject={subtitle || title}
      creator="pdf-report-branded"
      producer="@react-pdf/renderer"
    >
      {/* ============================================================
          COVER PAGE
          ============================================================ */}
      <Page size="A4" style={styles.coverPage}>
        {/* Logo */}
        {logoSrc && (
          <View style={styles.coverLogoContainer}>
            <Image src={logoSrc} style={styles.coverLogo} />
          </View>
        )}

        {/* Title */}
        <Text style={styles.coverTitle}>{title}</Text>

        {subtitle && <Text style={styles.coverSubtitle}>{subtitle}</Text>}

        {/* Divider */}
        <View style={styles.coverDivider} />

        {/* Meta */}
        {companyName && (
          <Text style={styles.coverMeta}>{companyName}</Text>
        )}
        {author && (
          <Text style={styles.coverMeta}>Prepared by {author}</Text>
        )}
        {date && <Text style={styles.coverMeta}>{date}</Text>}
        {documentNumber && (
          <Text style={[styles.coverMeta, { marginTop: 20, opacity: 0.5, fontSize: 9 }]}>
            {documentNumber}
          </Text>
        )}

        {confidential && (
          <Text
            style={{
              marginTop: 40,
              fontSize: 8,
              color: c.light,
              opacity: 0.5,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Confidential
          </Text>
        )}
      </Page>

      {/* ============================================================
          TABLE OF CONTENTS
          ============================================================ */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          companyName={companyName}
          title={title}
          documentNumber={documentNumber}
          logoSrc={logoSrc}
          styles={styles}
        />

        <Text style={styles.tocTitle}>Table of Contents</Text>

        {tocEntries.map((entry, i) => (
          <View key={`toc-${i}`} style={styles.tocEntry}>
            <Text style={styles.tocNumber}>{entry.number}</Text>
            <Text style={styles.tocLabel}>{entry.label}</Text>
            <Text style={styles.tocPage}>{entry.page}</Text>
          </View>
        ))}

        <PageFooter
          companyName={companyName}
          confidential={confidential}
          styles={styles}
        />
      </Page>

      {/* ============================================================
          CONTENT PAGES
          ============================================================ */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          companyName={companyName}
          title={title}
          documentNumber={documentNumber}
          logoSrc={logoSrc}
          styles={styles}
        />

        {/* Executive Summary */}
        {executiveSummary && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionHeading}>Executive Summary</Text>
            <Text style={styles.bodyText}>{executiveSummary}</Text>
          </View>
        )}

        {/* Report Sections */}
        {sections.map((section, si) => (
          <View key={`section-${si}`} style={{ marginBottom: 16 }}>
            <Text style={styles.sectionHeading}>{section.title}</Text>
            <Text style={styles.bodyText}>{section.body}</Text>
            {section.bullets && section.bullets.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                {section.bullets.map((bullet, bi) => (
                  <View key={`bullet-${si}-${bi}`} style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>{'\u2022'}</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Data Table */}
        {tableData && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionHeading}>
              {tableData.caption || 'Data Summary'}
            </Text>
            <DataTable data={tableData} styles={styles} />
          </View>
        )}

        {/* Bar Chart */}
        {chartData && chartData.length > 0 && (
          <BarChart
            data={chartData}
            title={chartTitle || 'Performance Overview'}
            barColor={c.secondary}
            styles={styles}
          />
        )}

        {/* Conclusion */}
        {conclusion && (
          <View style={styles.conclusionBox} wrap={false}>
            <Text style={styles.conclusionHeading}>Conclusion</Text>
            <Text style={styles.conclusionText}>{conclusion}</Text>
          </View>
        )}

        <PageFooter
          companyName={companyName}
          confidential={confidential}
          styles={styles}
        />
      </Page>
    </Document>
  );
}

export default BrandedReport;
