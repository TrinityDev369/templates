/**
 * Business Proposal PDF Template
 *
 * A professional, multi-page proposal document for agencies, consultants,
 * and freelancers. Self-contained -- uses only @react-pdf/renderer primitives.
 *
 * Features:
 *  - Cover page with company branding and client info
 *  - Table of contents (auto-generated section listing)
 *  - Executive summary
 *  - Project scope sections (dynamic)
 *  - Deliverables table
 *  - Pricing table with line items, subtotal, and total
 *  - Timeline / milestones table
 *  - Terms & conditions
 *  - Consistent header (company name + proposal #) and footer (page numbers, "Confidential")
 *
 * Color scheme: professional blue (#2563eb) accent, dark text (#111827), light backgrounds.
 *
 * @module pdf-proposal
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

export interface CompanyInfo {
  name: string;
  logo?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface ClientInfo {
  name: string;
  company?: string;
  address?: string;
  email?: string;
}

export interface Section {
  title: string;
  content: string;
}

export interface Deliverable {
  item: string;
  description: string;
}

export interface PricingItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface TimelinePhase {
  phase: string;
  description: string;
  duration: string;
}

export interface ProposalProps {
  /** Company / sender information */
  company: CompanyInfo;
  /** Client / recipient information */
  client: ClientInfo;
  /** Unique proposal identifier (e.g. "PROP-2026-001") */
  proposalNumber: string;
  /** Proposal issue date (formatted string) */
  date: string;
  /** Expiry date for the proposal */
  validUntil: string;
  /** Headline title of the proposal */
  title: string;
  /** High-level executive summary paragraph(s) */
  executiveSummary: string;
  /** Dynamic scope / body sections */
  sections: Section[];
  /** List of deliverables */
  deliverables: Deliverable[];
  /** Itemised pricing */
  pricingItems: PricingItem[];
  /** Grand total price (same unit as amounts -- e.g. dollars, not cents) */
  totalPrice: number;
  /** Project timeline / milestones */
  timeline: TimelinePhase[];
  /** Terms & conditions text (may contain newlines) */
  terms: string;
  /** ISO 4217 currency code (default: "USD") */
  currency?: string;
}

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

const colors = {
  /** Primary accent blue */
  accent: '#2563eb',
  accentLight: '#dbeafe',
  accentDark: '#1e40af',

  /** Text hierarchy */
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  textInverse: '#ffffff',

  /** Backgrounds */
  bgWhite: '#ffffff',
  bgLight: '#f9fafb',
  bgMedium: '#f3f4f6',
  bgAccent: '#eff6ff',

  /** Borders */
  border: '#e5e7eb',
  borderDark: '#d1d5db',

  /** Functional */
  white: '#ffffff',
  black: '#000000',
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // -- Page ------------------------------------------------------------------
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.textPrimary,
    backgroundColor: colors.bgWhite,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  coverPage: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.textPrimary,
    backgroundColor: colors.bgWhite,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },

  // -- Page Header -----------------------------------------------------------
  pageHeader: {
    position: 'absolute',
    top: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCompany: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerProposalNum: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // -- Page Footer -----------------------------------------------------------
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerConfidential: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerPageNum: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // -- Cover Page ------------------------------------------------------------
  coverContainer: {
    flex: 1,
  },
  coverAccentBar: {
    height: 6,
    backgroundColor: colors.accent,
  },
  coverBody: {
    flex: 1,
    paddingHorizontal: 60,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  coverTop: {},
  coverLogoContainer: {
    marginBottom: 40,
  },
  coverLogo: {
    width: 140,
    height: 50,
    objectFit: 'contain',
  },
  coverBadge: {
    backgroundColor: colors.accentLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  coverBadgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  coverTitle: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
    lineHeight: 1.15,
    marginBottom: 16,
  },
  coverDivider: {
    width: 60,
    height: 3,
    backgroundColor: colors.accent,
    marginBottom: 24,
  },
  coverPreparedFor: {
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  coverClientName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  coverClientCompany: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  coverBottom: {
    paddingBottom: 50,
  },
  coverMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  coverMetaBlock: {},
  coverMetaLabel: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
  coverCompanyDetails: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 16,
  },
  coverCompanyDetail: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // -- Typography ------------------------------------------------------------
  h1: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  h2: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  h3: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 1.6,
    marginBottom: 8,
  },

  // -- Section ---------------------------------------------------------------
  section: {
    marginBottom: 20,
  },
  sectionAccent: {
    width: 40,
    height: 2,
    backgroundColor: colors.accent,
    marginBottom: 12,
  },

  // -- Table of Contents -----------------------------------------------------
  tocEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 3,
  },
  tocEntryEven: {
    backgroundColor: colors.bgLight,
  },
  tocNumber: {
    width: 28,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
  },
  tocTitle: {
    flex: 1,
    fontSize: 11,
    color: colors.textPrimary,
  },
  tocDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dotted',
    marginHorizontal: 8,
    marginBottom: 2,
  },

  // -- Table (generic) -------------------------------------------------------
  table: {
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.textInverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowStriped: {
    backgroundColor: colors.bgLight,
  },
  tableCell: {
    fontSize: 9,
    color: colors.textPrimary,
    lineHeight: 1.4,
  },
  tableCellSecondary: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 1.4,
  },

  // -- Pricing ---------------------------------------------------------------
  pricingTotalRow: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  pricingTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textInverse,
  },
  pricingTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.textInverse,
  },
  subtotalRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.bgMedium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subtotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },
  subtotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.textPrimary,
  },

  // -- Deliverables ----------------------------------------------------------
  deliverableItemCol: {
    fontFamily: 'Helvetica-Bold',
  },

  // -- Timeline --------------------------------------------------------------
  timelinePhaseName: {
    fontFamily: 'Helvetica-Bold',
  },

  // -- Terms -----------------------------------------------------------------
  termsText: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 1.6,
  },

  // -- Helpers ---------------------------------------------------------------
  row: {
    flexDirection: 'row',
  },
  flex1: { flex: 1 },
  alignRight: { textAlign: 'right' },
  alignCenter: { textAlign: 'center' },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },

  // Column widths for pricing table
  colPricingDesc: { width: '45%' },
  colPricingQty: { width: '15%', textAlign: 'center' },
  colPricingUnit: { width: '20%', textAlign: 'right' },
  colPricingAmount: { width: '20%', textAlign: 'right' },

  // Column widths for deliverables table
  colDeliverableItem: { width: '35%' },
  colDeliverableDesc: { width: '65%' },

  // Column widths for timeline table
  colTimelinePhase: { width: '25%' },
  colTimelineDesc: { width: '50%' },
  colTimelineDuration: { width: '25%', textAlign: 'right' },
});

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Formats a numeric value as a currency string.
 * Values are treated as whole currency units (e.g. 1500 = $1,500.00).
 */
function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

/**
 * Persistent page header rendered on content pages (not cover).
 */
function PageHeader({
  companyName,
  proposalNumber,
}: {
  companyName: string;
  proposalNumber: string;
}) {
  return (
    <View style={styles.pageHeader} fixed>
      <Text style={styles.headerCompany}>{companyName}</Text>
      <Text style={styles.headerProposalNum}>Proposal {proposalNumber}</Text>
    </View>
  );
}

/**
 * Persistent page footer rendered on content pages (not cover).
 */
function PageFooter() {
  return (
    <View style={styles.pageFooter} fixed>
      <Text style={styles.footerConfidential}>Confidential</Text>
      <Text
        style={styles.footerPageNum}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

/**
 * Cover page -- first page of the proposal.
 */
function CoverPage({
  company,
  client,
  proposalNumber,
  date,
  validUntil,
  title,
}: {
  company: CompanyInfo;
  client: ClientInfo;
  proposalNumber: string;
  date: string;
  validUntil: string;
  title: string;
}) {
  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverContainer}>
        {/* Top accent bar */}
        <View style={styles.coverAccentBar} />

        <View style={styles.coverBody}>
          {/* Top section: logo, badge, title, client */}
          <View style={styles.coverTop}>
            {/* Company logo */}
            {company.logo && (
              <View style={styles.coverLogoContainer}>
                <Image src={company.logo} style={styles.coverLogo} />
              </View>
            )}

            {/* Badge */}
            <View style={styles.coverBadge}>
              <Text style={styles.coverBadgeText}>Business Proposal</Text>
            </View>

            {/* Proposal title */}
            <Text style={styles.coverTitle}>{title}</Text>

            {/* Divider */}
            <View style={styles.coverDivider} />

            {/* Prepared for */}
            <Text style={styles.coverPreparedFor}>Prepared for</Text>
            <Text style={styles.coverClientName}>{client.name}</Text>
            {client.company && (
              <Text style={styles.coverClientCompany}>{client.company}</Text>
            )}
          </View>

          {/* Bottom section: metadata */}
          <View style={styles.coverBottom}>
            <View style={styles.coverMetaRow}>
              <View style={styles.coverMetaBlock}>
                <Text style={styles.coverMetaLabel}>Proposal Number</Text>
                <Text style={styles.coverMetaValue}>{proposalNumber}</Text>
              </View>
              <View style={styles.coverMetaBlock}>
                <Text style={styles.coverMetaLabel}>Date</Text>
                <Text style={styles.coverMetaValue}>{date}</Text>
              </View>
              <View style={styles.coverMetaBlock}>
                <Text style={styles.coverMetaLabel}>Valid Until</Text>
                <Text style={styles.coverMetaValue}>{validUntil}</Text>
              </View>
              <View style={styles.coverMetaBlock}>
                <Text style={styles.coverMetaLabel}>From</Text>
                <Text style={styles.coverMetaValue}>{company.name}</Text>
              </View>
            </View>

            {/* Company contact details */}
            {(company.email || company.phone || company.website) && (
              <View style={styles.coverCompanyDetails}>
                {company.email && (
                  <Text style={styles.coverCompanyDetail}>{company.email}</Text>
                )}
                {company.phone && (
                  <Text style={styles.coverCompanyDetail}>{company.phone}</Text>
                )}
                {company.website && (
                  <Text style={styles.coverCompanyDetail}>
                    {company.website}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Page>
  );
}

/**
 * Table of Contents page.
 * Generates entries based on the proposal's dynamic sections.
 */
function TableOfContentsPage({
  company,
  proposalNumber,
  sections,
  hasDeliverables,
  hasPricing,
  hasTimeline,
  hasTerms,
}: {
  company: CompanyInfo;
  proposalNumber: string;
  sections: Section[];
  hasDeliverables: boolean;
  hasPricing: boolean;
  hasTimeline: boolean;
  hasTerms: boolean;
}) {
  // Build dynamic TOC entries
  const entries: string[] = [];
  entries.push('Executive Summary');
  sections.forEach((s) => entries.push(s.title));
  if (hasDeliverables) entries.push('Deliverables');
  if (hasPricing) entries.push('Pricing');
  if (hasTimeline) entries.push('Timeline & Milestones');
  if (hasTerms) entries.push('Terms & Conditions');

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader companyName={company.name} proposalNumber={proposalNumber} />
      <PageFooter />

      <View style={styles.section}>
        <Text style={styles.h1}>Table of Contents</Text>
        <View style={styles.sectionAccent} />
      </View>

      <View style={styles.mt16}>
        {entries.map((entry, idx) => (
          <View
            key={`toc-${idx}`}
            style={[
              styles.tocEntry,
              idx % 2 === 0 ? styles.tocEntryEven : {},
            ]}
          >
            <Text style={styles.tocNumber}>
              {String(idx + 1).padStart(2, '0')}
            </Text>
            <Text style={styles.tocTitle}>{entry}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
}

/**
 * Executive Summary page.
 */
function ExecutiveSummaryPage({
  company,
  proposalNumber,
  executiveSummary,
}: {
  company: CompanyInfo;
  proposalNumber: string;
  executiveSummary: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader companyName={company.name} proposalNumber={proposalNumber} />
      <PageFooter />

      <View style={styles.section}>
        <Text style={styles.h2}>Executive Summary</Text>
        <View style={styles.sectionAccent} />
      </View>

      <Text style={styles.bodyText}>{executiveSummary}</Text>
    </Page>
  );
}

/**
 * Dynamic scope / body sections rendered as flowing pages.
 * react-pdf will auto-paginate when content overflows.
 */
function ScopePages({
  company,
  proposalNumber,
  sections,
}: {
  company: CompanyInfo;
  proposalNumber: string;
  sections: Section[];
}) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <PageHeader companyName={company.name} proposalNumber={proposalNumber} />
      <PageFooter />

      <View style={styles.section}>
        <Text style={styles.h2}>Project Scope</Text>
        <View style={styles.sectionAccent} />
      </View>

      {sections.map((section, idx) => (
        <View key={`scope-${idx}`} style={styles.section} wrap={false}>
          <Text style={styles.h3}>{section.title}</Text>
          <Text style={styles.bodyText}>{section.content}</Text>
        </View>
      ))}
    </Page>
  );
}

/**
 * Deliverables table page.
 */
function DeliverablesPage({
  company,
  proposalNumber,
  deliverables,
}: {
  company: CompanyInfo;
  proposalNumber: string;
  deliverables: Deliverable[];
}) {
  if (deliverables.length === 0) return null;

  return (
    <Page size="A4" style={styles.page} wrap>
      <PageHeader companyName={company.name} proposalNumber={proposalNumber} />
      <PageFooter />

      <View style={styles.section}>
        <Text style={styles.h2}>Deliverables</Text>
        <View style={styles.sectionAccent} />
      </View>

      <Text style={[styles.bodyText, styles.mb8]}>
        The following deliverables will be produced as part of this engagement.
      </Text>

      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeaderRow}>
          <View style={styles.colDeliverableItem}>
            <Text style={styles.tableHeaderCell}>Deliverable</Text>
          </View>
          <View style={styles.colDeliverableDesc}>
            <Text style={styles.tableHeaderCell}>Description</Text>
          </View>
        </View>

        {/* Rows */}
        {deliverables.map((d, idx) => (
          <View
            key={`del-${idx}`}
            style={[
              styles.tableRow,
              idx % 2 === 1 ? styles.tableRowStriped : {},
            ]}
            wrap={false}
          >
            <View style={styles.colDeliverableItem}>
              <Text style={[styles.tableCell, styles.deliverableItemCol]}>
                {d.item}
              </Text>
            </View>
            <View style={styles.colDeliverableDesc}>
              <Text style={styles.tableCellSecondary}>{d.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}

/**
 * Pricing table page with line items, subtotal, and grand total.
 */
function PricingPage({
  company,
  proposalNumber,
  pricingItems,
  totalPrice,
  currency,
}: {
  company: CompanyInfo;
  proposalNumber: string;
  pricingItems: PricingItem[];
  totalPrice: number;
  currency: string;
}) {
  if (pricingItems.length === 0) return null;

  const subtotal = pricingItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Page size="A4" style={styles.page} wrap>
      <PageHeader companyName={company.name} proposalNumber={proposalNumber} />
      <PageFooter />

      <View style={styles.section}>
        <Text style={styles.h2}>Pricing</Text>
        <View style={styles.sectionAccent} />
      </View>

      <Text style={[styles.bodyText, styles.mb8]}>
        All prices are quoted in {currency}. This pricing is valid for the
        duration specified in this proposal.
      </Text>

      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeaderRow}>
          <View style={styles.colPricingDesc}>
            <Text style={styles.tableHeaderCell}>Description</Text>
          </View>
          <View style={styles.colPricingQty}>
            <Text style={[styles.tableHeaderCell, styles.alignCenter]}>
              Qty
            </Text>
          </View>
          <View style={styles.colPricingUnit}>
            <Text style={[styles.tableHeaderCell, styles.alignRight]}>
              Unit Price
            </Text>
          </View>
          <View style={styles.colPricingAmount}>
            <Text style={[styles.tableHeaderCell, styles.alignRight]}>
              Amount
            </Text>
          </View>
        </View>

        {/* Line items */}
        {pricingItems.map((item, idx) => (
          <View
            key={`price-${idx}`}
            style={[
              styles.tableRow,
              idx % 2 === 1 ? styles.tableRowStriped : {},
            ]}
            wrap={false}
          >
            <View style={styles.colPricingDesc}>
              <Text style={styles.tableCell}>{item.description}</Text>
            </View>
            <View style={styles.colPricingQty}>
              <Text style={[styles.tableCell, styles.alignCenter]}>
                {item.quantity}
              </Text>
            </View>
            <View style={styles.colPricingUnit}>
              <Text style={[styles.tableCell, styles.alignRight]}>
                {formatCurrency(item.unitPrice, currency)}
              </Text>
            </View>
            <View style={styles.colPricingAmount}>
              <Text style={[styles.tableCell, styles.alignRight]}>
                {formatCurrency(item.amount, currency)}
              </Text>
            </View>
          </View>
        ))}

        {/* Subtotal row */}
        <View style={styles.subtotalRow}>
          <View style={styles.colPricingDesc}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
          </View>
          <View style={styles.colPricingQty} />
          <View style={styles.colPricingUnit} />
          <View style={styles.colPricingAmount}>
            <Text style={[styles.subtotalValue, styles.alignRight]}>
              {formatCurrency(subtotal, currency)}
            </Text>
          </View>
        </View>

        {/* Grand total row */}
        <View style={styles.pricingTotalRow}>
          <View style={styles.colPricingDesc}>
            <Text style={styles.pricingTotalLabel}>Total</Text>
          </View>
          <View style={styles.colPricingQty} />
          <View style={styles.colPricingUnit} />
          <View style={styles.colPricingAmount}>
            <Text style={[styles.pricingTotalValue, styles.alignRight]}>
              {formatCurrency(totalPrice, currency)}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

/**
 * Timeline / milestones table page.
 */
function TimelinePage({
  company,
  proposalNumber,
  timeline,
}: {
  company: CompanyInfo;
  proposalNumber: string;
  timeline: TimelinePhase[];
}) {
  if (timeline.length === 0) return null;

  return (
    <Page size="A4" style={styles.page} wrap>
      <PageHeader companyName={company.name} proposalNumber={proposalNumber} />
      <PageFooter />

      <View style={styles.section}>
        <Text style={styles.h2}>Timeline & Milestones</Text>
        <View style={styles.sectionAccent} />
      </View>

      <Text style={[styles.bodyText, styles.mb8]}>
        The project is structured into the following phases. Durations are
        estimates and may be adjusted based on scope changes.
      </Text>

      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeaderRow}>
          <View style={styles.colTimelinePhase}>
            <Text style={styles.tableHeaderCell}>Phase</Text>
          </View>
          <View style={styles.colTimelineDesc}>
            <Text style={styles.tableHeaderCell}>Description</Text>
          </View>
          <View style={styles.colTimelineDuration}>
            <Text style={[styles.tableHeaderCell, styles.alignRight]}>
              Duration
            </Text>
          </View>
        </View>

        {/* Rows */}
        {timeline.map((phase, idx) => (
          <View
            key={`timeline-${idx}`}
            style={[
              styles.tableRow,
              idx % 2 === 1 ? styles.tableRowStriped : {},
            ]}
            wrap={false}
          >
            <View style={styles.colTimelinePhase}>
              <Text style={[styles.tableCell, styles.timelinePhaseName]}>
                {phase.phase}
              </Text>
            </View>
            <View style={styles.colTimelineDesc}>
              <Text style={styles.tableCellSecondary}>{phase.description}</Text>
            </View>
            <View style={styles.colTimelineDuration}>
              <Text style={[styles.tableCell, styles.alignRight]}>
                {phase.duration}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}

/**
 * Terms & Conditions page.
 */
function TermsPage({
  company,
  proposalNumber,
  terms,
}: {
  company: CompanyInfo;
  proposalNumber: string;
  terms: string;
}) {
  if (!terms) return null;

  return (
    <Page size="A4" style={styles.page} wrap>
      <PageHeader companyName={company.name} proposalNumber={proposalNumber} />
      <PageFooter />

      <View style={styles.section}>
        <Text style={styles.h2}>Terms & Conditions</Text>
        <View style={styles.sectionAccent} />
      </View>

      <Text style={styles.termsText}>{terms}</Text>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * Proposal -- Professional multi-page business proposal PDF.
 *
 * Renders a complete proposal document with cover page, table of contents,
 * executive summary, scope sections, deliverables, pricing, timeline, and terms.
 *
 * @example
 * ```tsx
 * import { Proposal } from './proposal';
 * import { renderToBuffer } from '@react-pdf/renderer';
 *
 * const buffer = await renderToBuffer(
 *   <Proposal
 *     company={{ name: 'Acme Consulting', email: 'hello@acme.com' }}
 *     client={{ name: 'Jane Doe', company: 'BigCorp' }}
 *     proposalNumber="PROP-2026-001"
 *     date="February 18, 2026"
 *     validUntil="March 18, 2026"
 *     title="Platform Modernization"
 *     executiveSummary="We propose a complete modernization of your platform..."
 *     sections={[{ title: 'Architecture', content: 'Migrate to microservices...' }]}
 *     deliverables={[{ item: 'API Layer', description: 'RESTful API with OpenAPI spec' }]}
 *     pricingItems={[{ description: 'Development', quantity: 160, unitPrice: 150, amount: 24000 }]}
 *     totalPrice={24000}
 *     timeline={[{ phase: 'Phase 1', description: 'Discovery', duration: '2 weeks' }]}
 *     terms="Payment is due within 30 days of invoice..."
 *   />
 * );
 * ```
 */
export function Proposal({
  company,
  client,
  proposalNumber,
  date,
  validUntil,
  title,
  executiveSummary,
  sections,
  deliverables,
  pricingItems,
  totalPrice,
  timeline,
  terms,
  currency = 'USD',
}: ProposalProps) {
  return (
    <Document
      title={`${title} - Proposal ${proposalNumber}`}
      author={company.name}
      subject={`Business Proposal for ${client.name}`}
      creator="@react-pdf/renderer"
    >
      {/* 1. Cover Page */}
      <CoverPage
        company={company}
        client={client}
        proposalNumber={proposalNumber}
        date={date}
        validUntil={validUntil}
        title={title}
      />

      {/* 2. Table of Contents */}
      <TableOfContentsPage
        company={company}
        proposalNumber={proposalNumber}
        sections={sections}
        hasDeliverables={deliverables.length > 0}
        hasPricing={pricingItems.length > 0}
        hasTimeline={timeline.length > 0}
        hasTerms={!!terms}
      />

      {/* 3. Executive Summary */}
      <ExecutiveSummaryPage
        company={company}
        proposalNumber={proposalNumber}
        executiveSummary={executiveSummary}
      />

      {/* 4. Project Scope Sections */}
      <ScopePages
        company={company}
        proposalNumber={proposalNumber}
        sections={sections}
      />

      {/* 5. Deliverables */}
      <DeliverablesPage
        company={company}
        proposalNumber={proposalNumber}
        deliverables={deliverables}
      />

      {/* 6. Pricing */}
      <PricingPage
        company={company}
        proposalNumber={proposalNumber}
        pricingItems={pricingItems}
        totalPrice={totalPrice}
        currency={currency}
      />

      {/* 7. Timeline */}
      <TimelinePage
        company={company}
        proposalNumber={proposalNumber}
        timeline={timeline}
      />

      {/* 8. Terms & Conditions */}
      <TermsPage
        company={company}
        proposalNumber={proposalNumber}
        terms={terms}
      />
    </Document>
  );
}

export default Proposal;
