/**
 * Service Contract PDF Template
 *
 * A multi-page professional legal contract with numbered clauses,
 * payment terms, confidentiality and termination sections, and
 * signature blocks. Built entirely with @react-pdf/renderer.
 *
 * Self-contained -- no external design system imports required.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { renderToBuffer } from '@react-pdf/renderer';
 * import Contract from './contract';
 *
 * const buffer = await renderToBuffer(
 *   <Contract
 *     title="Web Development Services Agreement"
 *     contractNumber="SVC-2026-001"
 *     effectiveDate="March 1, 2026"
 *     endDate="August 31, 2026"
 *     parties={[
 *       { name: 'Acme Corp', role: 'Client', address: '123 Main St', email: 'legal@acme.com' },
 *       { name: 'Dev Studio', role: 'Service Provider', address: '456 Oak Ave', email: 'contracts@devstudio.io' },
 *     ]}
 *     recitals="WHEREAS, Client desires to engage Provider for software development services..."
 *     sections={[{ number: '1', title: 'Scope of Work', content: 'Provider shall deliver...' }]}
 *     paymentTerms={{ amount: 50000, currency: 'USD', schedule: 'Monthly', method: 'Wire transfer' }}
 *     confidentialityClause="Both parties agree to maintain strict confidentiality..."
 *     terminationClause="Either party may terminate with 30 days written notice..."
 *     governingLaw="State of Delaware, United States"
 *     signatures={[
 *       { name: 'Jane Doe', title: 'CEO', company: 'Acme Corp' },
 *       { name: 'John Smith', title: 'Managing Director', company: 'Dev Studio' },
 *     ]}
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

/** A contracting party with contact details */
export interface ContractParty {
  /** Full legal name of the party */
  name: string;
  /** Role in the contract (e.g. "Client", "Service Provider") */
  role: string;
  /** Mailing or registered address */
  address: string;
  /** Contact email */
  email: string;
}

/** A numbered contract section / clause */
export interface ContractSection {
  /** Section number (e.g. "1", "2", "3") */
  number: string;
  /** Section heading */
  title: string;
  /** Full text content of the section */
  content: string;
  /** Optional sub-sections with 1.1, 1.2 numbering */
  subSections?: { number: string; title?: string; content: string }[];
}

/** Payment terms for the contract */
export interface PaymentTerms {
  /** Total contract amount */
  amount: number;
  /** Currency code (e.g. "USD", "EUR") */
  currency: string;
  /** Payment schedule description (e.g. "Monthly", "Upon milestones") */
  schedule: string;
  /** Payment method (e.g. "Wire transfer", "ACH") */
  method: string;
  /** Optional additional payment notes */
  notes?: string;
}

/** A signature block entry */
export interface ContractSignature {
  /** Full name of the signatory */
  name: string;
  /** Title / position */
  title: string;
  /** Company / organization name */
  company: string;
  /** Date signed, if already signed */
  dateSigned?: string;
}

/** Props for the Contract component */
export interface ContractProps {
  /** Contract title displayed on the cover / header */
  title: string;
  /** Unique contract identifier */
  contractNumber: string;
  /** Date the contract becomes effective */
  effectiveDate: string;
  /** Date the contract term ends */
  endDate: string;
  /** Contracting parties (minimum 2) */
  parties: ContractParty[];
  /** Recitals / "WHEREAS" preamble text */
  recitals: string;
  /** Numbered contract sections */
  sections: ContractSection[];
  /** Payment terms */
  paymentTerms: PaymentTerms;
  /** Confidentiality clause text */
  confidentialityClause: string;
  /** Termination clause text */
  terminationClause: string;
  /** Governing law jurisdiction */
  governingLaw: string;
  /** Signature blocks */
  signatures: ContractSignature[];
  /** Show "CONFIDENTIAL" watermark text in footer (default: false) */
  confidential?: boolean;
}

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

const colors = {
  black: '#1a1a1a',
  darkGray: '#333333',
  mediumGray: '#666666',
  lightGray: '#999999',
  borderGray: '#d1d5db',
  bgGray: '#f3f4f6',
  bgLightGray: '#f9fafb',
  accent: '#374151',
  accentLight: '#6b7280',
  white: '#ffffff',
  ruleLine: '#e5e7eb',
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // -- Page --
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.black,
    paddingTop: 50,
    paddingBottom: 70,
    paddingHorizontal: 55,
    lineHeight: 1.6,
  },

  // -- Header --
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerMetaItem: {
    flexDirection: 'row',
  },
  headerLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.lightGray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginRight: 6,
  },
  headerValue: {
    fontSize: 9,
    color: colors.darkGray,
  },

  // -- Section headings --
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 22,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.ruleLine,
  },
  clauseHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.darkGray,
    marginTop: 14,
    marginBottom: 6,
  },
  subClauseHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.mediumGray,
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 16,
  },

  // -- Body text --
  body: {
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.7,
    textAlign: 'justify',
  },
  bodyIndented: {
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.7,
    textAlign: 'justify',
    marginLeft: 16,
  },

  // -- Parties --
  partiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  partyCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: colors.bgLightGray,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 4,
    padding: 14,
  },
  partyRole: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  partyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: 4,
  },
  partyDetail: {
    fontSize: 9,
    color: colors.mediumGray,
    lineHeight: 1.5,
  },

  // -- Payment box --
  paymentBox: {
    backgroundColor: colors.bgGray,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 4,
    padding: 16,
    marginTop: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  paymentLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.mediumGray,
    width: 120,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentValue: {
    fontSize: 10,
    color: colors.darkGray,
    flex: 1,
  },
  paymentAmountValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: colors.accent,
    flex: 1,
  },

  // -- Divider --
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ruleLine,
    marginVertical: 16,
  },
  dividerThick: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    marginVertical: 20,
  },

  // -- Signature blocks --
  signaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 24,
  },
  signatureBlock: {
    flex: 1,
    paddingTop: 8,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGray,
    marginBottom: 6,
    marginTop: 40,
    width: '100%',
  },
  signatureLabel: {
    fontSize: 8,
    color: colors.lightGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  signatureName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.darkGray,
  },
  signatureTitle: {
    fontSize: 9,
    color: colors.mediumGray,
  },
  signatureCompany: {
    fontSize: 9,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  dateLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
    marginTop: 20,
    marginBottom: 4,
    width: '60%',
  },

  // -- Footer --
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 55,
    right: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.ruleLine,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.lightGray,
  },
  footerConfidential: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  footerPage: {
    fontSize: 7,
    color: colors.lightGray,
  },

  // -- Recitals --
  recitalsBlock: {
    backgroundColor: colors.bgLightGray,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  recitalsText: {
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.7,
    fontStyle: 'italic',
  },

  // -- Witness block --
  witnessBlock: {
    marginTop: 24,
    marginBottom: 16,
  },
  witnessText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.7,
    textAlign: 'justify',
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a number as currency */
function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    CHF: 'CHF ',
    JPY: '\u00A5',
  };
  const symbol = symbols[currency] ?? `${currency} `;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Contract header with title and metadata */
function ContractHeader({
  title,
  contractNumber,
  effectiveDate,
  endDate,
}: {
  title: string;
  contractNumber: string;
  effectiveDate: string;
  endDate: string;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerMeta}>
        <View style={styles.headerMetaItem}>
          <Text style={styles.headerLabel}>Contract No.</Text>
          <Text style={styles.headerValue}>{contractNumber}</Text>
        </View>
        <View style={styles.headerMetaItem}>
          <Text style={styles.headerLabel}>Effective</Text>
          <Text style={styles.headerValue}>{effectiveDate}</Text>
        </View>
        <View style={styles.headerMetaItem}>
          <Text style={styles.headerLabel}>Expires</Text>
          <Text style={styles.headerValue}>{endDate}</Text>
        </View>
      </View>
    </View>
  );
}

/** Party info card */
function PartyCard({ party }: { party: ContractParty }) {
  return (
    <View style={styles.partyCard}>
      <Text style={styles.partyRole}>{party.role}</Text>
      <Text style={styles.partyName}>{party.name}</Text>
      <Text style={styles.partyDetail}>{party.address}</Text>
      <Text style={styles.partyDetail}>{party.email}</Text>
    </View>
  );
}

/** Recitals / WHEREAS block */
function RecitalsBlock({ text }: { text: string }) {
  return (
    <>
      <Text style={styles.sectionHeading}>Recitals</Text>
      <View style={styles.recitalsBlock}>
        <Text style={styles.recitalsText}>{text}</Text>
      </View>
    </>
  );
}

/** Numbered clause with optional sub-clauses */
function ClauseBlock({ section }: { section: ContractSection }) {
  return (
    <View wrap={false}>
      <Text style={styles.clauseHeading}>
        {section.number}. {section.title}
      </Text>
      <Text style={styles.body}>{section.content}</Text>
      {section.subSections?.map((sub) => (
        <View key={sub.number}>
          <Text style={styles.subClauseHeading}>
            {sub.number}
            {sub.title ? `. ${sub.title}` : '.'}
          </Text>
          <Text style={styles.bodyIndented}>{sub.content}</Text>
        </View>
      ))}
    </View>
  );
}

/** Payment terms display box */
function PaymentBlock({ terms }: { terms: PaymentTerms }) {
  return (
    <View style={styles.paymentBox}>
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Total Amount</Text>
        <Text style={styles.paymentAmountValue}>
          {formatCurrency(terms.amount, terms.currency)}
        </Text>
      </View>
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Currency</Text>
        <Text style={styles.paymentValue}>{terms.currency}</Text>
      </View>
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Schedule</Text>
        <Text style={styles.paymentValue}>{terms.schedule}</Text>
      </View>
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Method</Text>
        <Text style={styles.paymentValue}>{terms.method}</Text>
      </View>
      {terms.notes && (
        <View style={[styles.paymentRow, { marginTop: 4 }]}>
          <Text style={styles.paymentLabel}>Notes</Text>
          <Text style={styles.paymentValue}>{terms.notes}</Text>
        </View>
      )}
    </View>
  );
}

/** Signature block for one signatory */
function SignatureBlock({ sig }: { sig: ContractSignature }) {
  return (
    <View style={styles.signatureBlock}>
      <View style={styles.signatureLine} />
      <Text style={styles.signatureLabel}>Signature</Text>
      <Text style={styles.signatureName}>{sig.name}</Text>
      <Text style={styles.signatureTitle}>{sig.title}</Text>
      <Text style={styles.signatureCompany}>{sig.company}</Text>
      <View style={styles.dateLine} />
      <Text style={styles.signatureLabel}>
        Date: {sig.dateSigned ?? '____________________'}
      </Text>
    </View>
  );
}

/** Page footer with optional confidential mark and page number */
function PageFooter({
  contractNumber,
  pageNumber,
  totalPages,
  confidential,
}: {
  contractNumber: string;
  pageNumber: number;
  totalPages: number;
  confidential: boolean;
}) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{contractNumber}</Text>
      {confidential && (
        <Text style={styles.footerConfidential}>Confidential</Text>
      )}
      <Text style={styles.footerPage}>
        Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * Contract -- a multi-page service contract PDF.
 *
 * Renders a professional legal document with:
 * - Header with contract metadata
 * - Parties section
 * - Recitals / WHEREAS preamble
 * - Numbered sections (custom clauses)
 * - Payment terms
 * - Confidentiality clause
 * - Termination clause
 * - Governing law
 * - Signature blocks with date lines
 * - Page numbers and optional confidentiality marking
 */
export function Contract({
  title,
  contractNumber,
  effectiveDate,
  endDate,
  parties,
  recitals,
  sections,
  paymentTerms,
  confidentialityClause,
  terminationClause,
  governingLaw,
  signatures,
  confidential = false,
}: ContractProps) {
  // Calculate the next clause number after user-defined sections
  const nextNumber = sections.length > 0
    ? parseInt(sections[sections.length - 1].number, 10) + 1
    : 1;
  const paymentSectionNum = nextNumber;
  const confidentialitySectionNum = nextNumber + 1;
  const terminationSectionNum = nextNumber + 2;
  const governingLawSectionNum = nextNumber + 3;

  // Total pages: 1 (header+parties+recitals) + N (sections spread) + 1 (signature)
  // We use a fixed 4-page layout for clarity; content wraps automatically.
  const totalPages = 4;

  return (
    <Document
      title={title}
      subject={`Contract ${contractNumber}`}
      keywords="contract, agreement, services, legal"
      creator="pdf-contract template"
      producer="@react-pdf/renderer"
    >
      {/* ====================================================================
          PAGE 1: Header, Parties, Recitals
          ==================================================================== */}
      <Page size="A4" style={styles.page}>
        <ContractHeader
          title={title}
          contractNumber={contractNumber}
          effectiveDate={effectiveDate}
          endDate={endDate}
        />

        {/* Parties */}
        <Text style={styles.sectionHeading}>Parties</Text>
        <View style={styles.partiesContainer}>
          {parties.map((party, idx) => (
            <PartyCard key={idx} party={party} />
          ))}
        </View>

        {/* Recitals */}
        <RecitalsBlock text={recitals} />

        <View style={styles.divider} />

        {/* Preamble agreement text */}
        <Text style={styles.body}>
          NOW, THEREFORE, in consideration of the mutual covenants and agreements
          set forth herein, and for other good and valuable consideration, the
          receipt and sufficiency of which are hereby acknowledged, the Parties
          agree as follows:
        </Text>

        <PageFooter
          contractNumber={contractNumber}
          pageNumber={1}
          totalPages={totalPages}
          confidential={confidential}
        />
      </Page>

      {/* ====================================================================
          PAGE 2: Contract Sections (custom clauses)
          ==================================================================== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionHeading}>Terms and Conditions</Text>
        {sections.map((section) => (
          <ClauseBlock key={section.number} section={section} />
        ))}

        <PageFooter
          contractNumber={contractNumber}
          pageNumber={2}
          totalPages={totalPages}
          confidential={confidential}
        />
      </Page>

      {/* ====================================================================
          PAGE 3: Payment, Confidentiality, Termination, Governing Law
          ==================================================================== */}
      <Page size="A4" style={styles.page}>
        {/* Payment Terms */}
        <Text style={styles.sectionHeading}>
          {paymentSectionNum}. Payment Terms
        </Text>
        <PaymentBlock terms={paymentTerms} />

        <View style={styles.divider} />

        {/* Confidentiality */}
        <Text style={styles.clauseHeading}>
          {confidentialitySectionNum}. Confidentiality
        </Text>
        <Text style={styles.body}>{confidentialityClause}</Text>

        <View style={styles.divider} />

        {/* Termination */}
        <Text style={styles.clauseHeading}>
          {terminationSectionNum}. Termination
        </Text>
        <Text style={styles.body}>{terminationClause}</Text>

        <View style={styles.divider} />

        {/* Governing Law */}
        <Text style={styles.clauseHeading}>
          {governingLawSectionNum}. Governing Law
        </Text>
        <Text style={styles.body}>
          This Agreement shall be governed by and construed in accordance with
          the laws of {governingLaw}, without regard to its conflict of laws
          principles. Any dispute arising out of or relating to this Agreement
          shall be subject to the exclusive jurisdiction of the courts located in{' '}
          {governingLaw}.
        </Text>

        <PageFooter
          contractNumber={contractNumber}
          pageNumber={3}
          totalPages={totalPages}
          confidential={confidential}
        />
      </Page>

      {/* ====================================================================
          PAGE 4: Execution / Signature Page
          ==================================================================== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionHeading}>Execution</Text>

        <View style={styles.witnessBlock}>
          <Text style={styles.witnessText}>
            IN WITNESS WHEREOF, the Parties hereto have executed this Agreement
            as of the Effective Date first written above. Each signatory below
            represents and warrants that they are duly authorized to execute this
            Agreement on behalf of the respective Party and to bind such Party to
            the terms and conditions set forth herein.
          </Text>
        </View>

        <View style={styles.dividerThick} />

        {/* Render signature blocks in rows of 2 */}
        {Array.from({ length: Math.ceil(signatures.length / 2) }).map(
          (_, rowIdx) => {
            const pair = signatures.slice(rowIdx * 2, rowIdx * 2 + 2);
            return (
              <View key={rowIdx} style={styles.signaturesContainer}>
                {pair.map((sig, idx) => (
                  <SignatureBlock key={idx} sig={sig} />
                ))}
              </View>
            );
          },
        )}

        <View style={[styles.divider, { marginTop: 40 }]} />

        {/* Agreement reference footer */}
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.footerText, { fontSize: 8 }]}>
            Contract Reference: {contractNumber}
          </Text>
          <Text style={[styles.footerText, { fontSize: 8, marginTop: 2 }]}>
            Effective: {effectiveDate} through {endDate}
          </Text>
          <Text style={[styles.footerText, { fontSize: 8, marginTop: 2 }]}>
            This Agreement may be executed in counterparts, each of which shall
            be deemed an original and all of which together shall constitute one
            and the same instrument.
          </Text>
        </View>

        <PageFooter
          contractNumber={contractNumber}
          pageNumber={4}
          totalPages={totalPages}
          confidential={confidential}
        />
      </Page>
    </Document>
  );
}

export default Contract;
