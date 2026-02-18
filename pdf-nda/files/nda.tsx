/**
 * Non-Disclosure Agreement (NDA) PDF Template
 *
 * A professional, self-contained NDA document rendered with @react-pdf/renderer.
 * Supports both mutual and unilateral agreements with fully customizable party
 * details, numbered legal articles, recitals, and signature blocks.
 *
 * Features:
 * - Self-contained: uses ONLY @react-pdf/renderer + react (no external design system)
 * - A4 page size with professional legal document typography
 * - Dark header (#1a1a2e) with legal blue accent (#1e40af)
 * - Title page with effective date, parties, and recitals
 * - Eight numbered articles covering standard NDA provisions
 * - Signature blocks for both parties with name, title, company, date, and signature lines
 * - Fixed header on subsequent pages with document title + page number
 * - "CONFIDENTIAL" watermark footer on every page
 * - Mutual or unilateral NDA mode
 * - Optional custom articles to override or extend defaults
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { renderToBuffer } from '@react-pdf/renderer';
 * import { NDA } from './nda';
 *
 * const element = React.createElement(NDA, {
 *   effectiveDate: 'February 18, 2026',
 *   ndaType: 'mutual',
 *   disclosingParty: {
 *     name: 'Sergej Goetz',
 *     title: 'Managing Director',
 *     company: 'Trinity Agency',
 *     address: '123 Innovation Drive, Berlin, Germany',
 *   },
 *   receivingParty: {
 *     name: 'Jane Doe',
 *     title: 'CTO',
 *     company: 'Acme Corp',
 *     address: '456 Tech Boulevard, San Francisco, CA 94107',
 *   },
 *   purpose: 'Evaluation of a potential joint software development partnership.',
 *   governingLaw: 'the Federal Republic of Germany',
 *   termMonths: 24,
 * });
 *
 * const buffer = await renderToBuffer(element);
 * ```
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Information about one party in the NDA */
export interface NDAParty {
  /** Full legal name of the signatory */
  name: string;
  /** Job title / position */
  title: string;
  /** Legal entity / company name */
  company: string;
  /** Registered address (optional, shown in the party block) */
  address?: string;
  /** Email address (optional, shown in the party block) */
  email?: string;
}

/** A single numbered article in the NDA body */
export interface NDAArticle {
  /** Article heading (e.g. "Definition of Confidential Information") */
  heading: string;
  /** One or more paragraphs of article body text */
  paragraphs: string[];
  /** Optional lettered sub-clauses (a, b, c, ...) */
  subClauses?: string[];
}

/** NDA type: mutual (both parties disclose) or unilateral (one-way) */
export type NDAType = 'mutual' | 'unilateral';

/** Full props interface for the NDA component */
export interface NDAProps {
  /** Date the NDA becomes effective (e.g. "February 18, 2026") */
  effectiveDate: string;
  /** Whether the NDA is mutual or unilateral */
  ndaType: NDAType;
  /** The disclosing party (or "Party A" in mutual mode) */
  disclosingParty: NDAParty;
  /** The receiving party (or "Party B" in mutual mode) */
  receivingParty: NDAParty;
  /** Purpose of the confidential disclosure */
  purpose: string;
  /** Jurisdiction / governing law (e.g. "the State of Delaware") */
  governingLaw?: string;
  /** Agreement duration in months (default: 24) */
  termMonths?: number;
  /** Survival period in months after termination (default: 36) */
  survivalMonths?: number;
  /** Optional override: provide custom articles instead of the defaults */
  customArticles?: NDAArticle[];
  /** Whether to show the CONFIDENTIAL watermark footer (default: true) */
  showConfidentialFooter?: boolean;
  /** Optional agreement/document reference number */
  referenceNumber?: string;
}

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

const colors = {
  /** Dark header background */
  headerBg: '#1a1a2e',
  /** Legal blue accent */
  accent: '#1e40af',
  /** Accent light (tinted backgrounds) */
  accentLight: '#eff6ff',
  /** Primary text */
  text: '#1f2937',
  /** Secondary / muted text */
  textMuted: '#6b7280',
  /** Light rule / border color */
  border: '#d1d5db',
  /** Dark rule / border color */
  borderDark: '#9ca3af',
  /** White */
  white: '#ffffff',
  /** Very light gray background */
  bgLight: '#f9fafb',
  /** Signature line */
  signatureLine: '#374151',
  /** Watermark text */
  watermark: '#cbd5e1',
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // -- Page ------------------------------------------------------------------
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    paddingTop: 70,
    paddingBottom: 70,
    paddingHorizontal: 56,
    lineHeight: 1.6,
  },
  firstPage: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    paddingTop: 0,
    paddingBottom: 70,
    paddingHorizontal: 0,
    lineHeight: 1.6,
  },

  // -- Title page header -----------------------------------------------------
  titleHeader: {
    backgroundColor: colors.headerBg,
    paddingTop: 48,
    paddingBottom: 36,
    paddingHorizontal: 56,
    marginBottom: 0,
  },
  titleText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    color: colors.white,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titleSubtext: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  accentBar: {
    height: 4,
    backgroundColor: colors.accent,
  },

  // -- Fixed header on subsequent pages --------------------------------------
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 56,
  },
  fixedHeaderTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#94a3b8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fixedHeaderPage: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#64748b',
  },
  fixedHeaderAccent: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent,
  },

  // -- Footer ----------------------------------------------------------------
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerConfidential: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.watermark,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  footerPage: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: colors.textMuted,
  },

  // -- Effective date / reference block --------------------------------------
  metaBlock: {
    paddingHorizontal: 56,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.bgLight,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.text,
  },

  // -- Body content area (padded for first page) ----------------------------
  bodyContent: {
    paddingHorizontal: 56,
    paddingTop: 20,
  },

  // -- Party blocks ----------------------------------------------------------
  partiesContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  partyBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 14,
    backgroundColor: colors.white,
  },
  partyRole: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  partyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.text,
    marginBottom: 2,
  },
  partyTitle: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  partyCompany: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.text,
    marginBottom: 4,
  },
  partyDetail: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 1,
  },

  // -- Section heading -------------------------------------------------------
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: colors.headerBg,
    marginBottom: 10,
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // -- Recitals --------------------------------------------------------------
  recitalsContainer: {
    marginBottom: 18,
    paddingLeft: 4,
  },
  whereasText: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.7,
    textAlign: 'justify',
    marginBottom: 8,
  },
  whereasKeyword: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.accent,
  },
  nowThereforeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.7,
    textAlign: 'justify',
    marginTop: 6,
    marginBottom: 6,
  },

  // -- Divider ---------------------------------------------------------------
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginVertical: 14,
  },
  accentDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.accent,
    marginVertical: 16,
    width: '30%',
  },

  // -- Articles --------------------------------------------------------------
  articleContainer: {
    marginBottom: 16,
  },
  articleHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.headerBg,
    marginBottom: 6,
  },
  articleNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.accent,
  },
  articleParagraph: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.7,
    textAlign: 'justify',
    marginBottom: 6,
  },
  subClauseContainer: {
    paddingLeft: 16,
    marginTop: 4,
    marginBottom: 6,
  },
  subClauseRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  subClauseLetter: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.accent,
    width: 20,
    marginTop: 1,
  },
  subClauseText: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: colors.text,
    lineHeight: 1.6,
    flex: 1,
    textAlign: 'justify',
  },

  // -- Signature blocks ------------------------------------------------------
  signatureSection: {
    marginTop: 24,
  },
  signatureIntro: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.7,
    textAlign: 'justify',
    marginBottom: 28,
  },
  signatureRow: {
    flexDirection: 'row',
    gap: 36,
    marginTop: 8,
  },
  signatureBlock: {
    flex: 1,
    paddingTop: 4,
  },
  signatureRole: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  signatureCompany: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.text,
    marginBottom: 24,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.signatureLine,
    marginBottom: 4,
    height: 28,
  },
  signatureLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 16,
  },
  signatureNamePrePrint: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 16,
  },
  signatureDateLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.signatureLine,
    marginBottom: 4,
    height: 20,
    width: '60%',
  },

  // -- Purpose highlight box -------------------------------------------------
  purposeBox: {
    backgroundColor: colors.accentLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: 12,
    marginBottom: 16,
    borderRadius: 2,
  },
  purposeLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  purposeText: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.6,
  },

  // -- Continuation header text ----------------------------------------------
  continuationTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: colors.headerBg,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
});

// ---------------------------------------------------------------------------
// Helper: default articles
// ---------------------------------------------------------------------------

function buildDefaultArticles(
  ndaType: NDAType,
  termMonths: number,
  survivalMonths: number,
  effectiveDate: string,
  governingLaw: string,
): NDAArticle[] {
  const isMutual = ndaType === 'mutual';
  const discloser = isMutual ? 'either Party' : 'the Disclosing Party';
  const receiver = isMutual ? 'the other Party' : 'the Receiving Party';
  const partyRef = isMutual ? 'Each Party' : 'The Receiving Party';

  return [
    // Article 1 - Definition
    {
      heading: 'Definition of Confidential Information',
      paragraphs: [
        `"Confidential Information" means any and all non-public information disclosed by ${discloser} to ${receiver}, whether orally, in writing, electronically, or by any other means, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure. Confidential Information includes, without limitation:`,
      ],
      subClauses: [
        'Trade secrets, inventions, patent applications, technical data, know-how, processes, designs, drawings, engineering specifications, and formulas;',
        'Business information including financial data, projections, marketing strategies, pricing models, customer lists, supplier agreements, and strategic plans;',
        'Software, source code, object code, algorithms, system architectures, database schemas, APIs, and related documentation;',
        'Product plans, product development roadmaps, research findings, and prototypes;',
        'Personnel information, organizational structures, and compensation data;',
        'Any information or materials derived from, containing, reflecting, or based upon any of the foregoing.',
      ],
    },

    // Article 2 - Obligations
    {
      heading: 'Obligations of Confidentiality',
      paragraphs: [
        `${partyRef} agrees to hold all Confidential Information in strict confidence and to take all reasonable precautions to protect such information from unauthorized disclosure or use. Specifically, ${partyRef.toLowerCase()} shall:`,
      ],
      subClauses: [
        'Not disclose any Confidential Information to any third party without the prior written consent of the disclosing party;',
        'Use the Confidential Information solely for the Purpose described herein and for no other purpose whatsoever;',
        'Restrict access to Confidential Information to those employees, agents, contractors, or advisors who have a demonstrable need to know and who are bound by written confidentiality obligations at least as restrictive as those set forth herein;',
        'Exercise at least the same degree of care to protect the Confidential Information as it uses to protect its own most valuable confidential information, but in no event less than reasonable care;',
        'Promptly notify the disclosing party in writing upon discovery of any unauthorized use or disclosure of Confidential Information.',
      ],
    },

    // Article 3 - Exclusions
    {
      heading: 'Exclusions from Confidential Information',
      paragraphs: [
        'The obligations of confidentiality under this Agreement shall not apply to any information that the receiving party can demonstrate by competent evidence:',
      ],
      subClauses: [
        'Was publicly known and generally available in the public domain at the time of disclosure, or subsequently became publicly available through no act or omission of the receiving party;',
        'Was rightfully in the possession of the receiving party, without restriction on disclosure, prior to the date of disclosure under this Agreement, as evidenced by written records;',
        'Was independently developed by the receiving party without use of or reference to the disclosing party\'s Confidential Information, as evidenced by written records;',
        'Was obtained by the receiving party from a third party who was not, at the time of disclosure, under an obligation of confidentiality to the disclosing party with respect to such information;',
        'Is required to be disclosed by applicable law, regulation, or valid court order, provided that the receiving party: (i) gives the disclosing party prompt written notice sufficient to allow the disclosing party to seek a protective order or other appropriate remedy; and (ii) discloses only the minimum information required.',
      ],
    },

    // Article 4 - Term / Duration
    {
      heading: 'Term and Duration',
      paragraphs: [
        `This Agreement shall become effective as of the Effective Date (${effectiveDate}) and shall remain in full force and effect for a period of ${termMonths} (${numberToWords(termMonths)}) months from the Effective Date, unless earlier terminated by either party upon thirty (30) days' prior written notice to the other party.`,
        `Notwithstanding the expiration or termination of this Agreement, the obligations of confidentiality with respect to Confidential Information disclosed during the term of this Agreement shall survive for an additional period of ${survivalMonths} (${numberToWords(survivalMonths)}) months following the date of expiration or termination.`,
      ],
    },

    // Article 5 - Return of Materials
    {
      heading: 'Return of Materials',
      paragraphs: [
        'Upon expiration or termination of this Agreement, or upon written request by the disclosing party at any time, the receiving party shall promptly:',
      ],
      subClauses: [
        'Return to the disclosing party all originals and copies of documents, materials, notes, and other tangible items containing or reflecting Confidential Information;',
        'Permanently destroy all electronic copies, files, and records containing Confidential Information, including any copies stored in backup systems, cloud services, or removable media;',
        'Certify in writing, signed by an authorized officer, that all such materials have been returned or destroyed in accordance with this provision.',
      ],
    },

    // Article 6 - Remedies
    {
      heading: 'Remedies',
      paragraphs: [
        'The parties acknowledge and agree that any breach or threatened breach of this Agreement may cause irreparable harm to the disclosing party for which monetary damages alone would be an inadequate remedy.',
        'Accordingly, the disclosing party shall be entitled to seek equitable relief, including injunctive relief and specific performance, in addition to all other remedies available at law or in equity, without the necessity of proving actual damages or posting any bond or other security.',
        'The rights and remedies provided herein are cumulative and shall not be construed to limit any other rights or remedies available under law or equity.',
      ],
    },

    // Article 7 - Governing Law
    {
      heading: 'Governing Law and Jurisdiction',
      paragraphs: [
        `This Agreement shall be governed by and construed in accordance with the laws of ${governingLaw}, without regard to its conflict of laws principles.`,
        `Any dispute, controversy, or claim arising out of or relating to this Agreement, or the breach, termination, or validity thereof, shall be submitted to the exclusive jurisdiction of the competent courts located in ${governingLaw}. The parties hereby consent to the personal jurisdiction of such courts and waive any objection to venue therein.`,
      ],
    },

    // Article 8 - Miscellaneous
    {
      heading: 'Miscellaneous',
      paragraphs: [
        'This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, understandings, negotiations, and discussions, whether oral or written.',
        'This Agreement may not be amended, modified, or waived except by a written instrument signed by both parties. No failure or delay by either party in exercising any right under this Agreement shall operate as a waiver thereof.',
        'If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect, and the invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.',
        `Neither party may assign or transfer this Agreement or any rights or obligations hereunder without the prior written consent of the other party. Any attempted assignment without such consent shall be void.`,
        'This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument. Signatures transmitted by electronic means shall be deemed originals for all purposes.',
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Helper: number to words (for term/survival months display)
// ---------------------------------------------------------------------------

function numberToWords(n: number): string {
  const words: Record<number, string> = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
    11: 'eleven', 12: 'twelve', 18: 'eighteen', 24: 'twenty-four',
    36: 'thirty-six', 48: 'forty-eight', 60: 'sixty',
  };
  return words[n] || String(n);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Title page header with dark background and accent bar */
function TitleHeader({
  ndaType,
  referenceNumber,
}: {
  ndaType: NDAType;
  referenceNumber?: string;
}) {
  const title = ndaType === 'mutual'
    ? 'Mutual Non-Disclosure Agreement'
    : 'Non-Disclosure Agreement';

  return (
    <View>
      <View style={styles.titleHeader}>
        <Text style={styles.titleText}>{title}</Text>
        {referenceNumber && (
          <Text style={styles.titleSubtext}>Reference: {referenceNumber}</Text>
        )}
      </View>
      <View style={styles.accentBar} />
    </View>
  );
}

/** Fixed header on continuation pages */
function FixedPageHeader({
  ndaType,
  pageNumber,
  totalPages,
}: {
  ndaType: NDAType;
  pageNumber: number;
  totalPages: number;
}) {
  const title = ndaType === 'mutual'
    ? 'Mutual Non-Disclosure Agreement'
    : 'Non-Disclosure Agreement';

  return (
    <View fixed>
      <View style={styles.fixedHeader}>
        <Text style={styles.fixedHeaderTitle}>{title}</Text>
        <Text style={styles.fixedHeaderPage}>
          Page {pageNumber} of {totalPages}
        </Text>
      </View>
      <View style={styles.fixedHeaderAccent} />
    </View>
  );
}

/** Confidential watermark footer */
function PageFooter({
  pageNumber,
  totalPages,
  showConfidential,
}: {
  pageNumber: number;
  totalPages: number;
  showConfidential: boolean;
}) {
  return (
    <View style={styles.footer} fixed>
      {showConfidential ? (
        <Text style={styles.footerConfidential}>Confidential</Text>
      ) : (
        <Text style={styles.footerPage}> </Text>
      )}
      <Text style={styles.footerPage}>
        Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
}

/** Effective date and reference meta block */
function MetaBlock({
  effectiveDate,
  referenceNumber,
}: {
  effectiveDate: string;
  referenceNumber?: string;
}) {
  return (
    <View style={styles.metaBlock}>
      <View>
        <Text style={styles.metaLabel}>Effective Date</Text>
        <Text style={styles.metaValue}>{effectiveDate}</Text>
      </View>
      {referenceNumber && (
        <View>
          <Text style={styles.metaLabel}>Document Reference</Text>
          <Text style={styles.metaValue}>{referenceNumber}</Text>
        </View>
      )}
    </View>
  );
}

/** Party information card */
function PartyCard({
  party,
  role,
}: {
  party: NDAParty;
  role: string;
}) {
  return (
    <View style={styles.partyBox}>
      <Text style={styles.partyRole}>{role}</Text>
      <Text style={styles.partyName}>{party.name}</Text>
      <Text style={styles.partyTitle}>{party.title}</Text>
      <Text style={styles.partyCompany}>{party.company}</Text>
      {party.address && (
        <Text style={styles.partyDetail}>{party.address}</Text>
      )}
      {party.email && (
        <Text style={styles.partyDetail}>{party.email}</Text>
      )}
    </View>
  );
}

/** Purpose highlight box */
function PurposeBlock({ purpose }: { purpose: string }) {
  return (
    <View style={styles.purposeBox}>
      <Text style={styles.purposeLabel}>Purpose of Disclosure</Text>
      <Text style={styles.purposeText}>{purpose}</Text>
    </View>
  );
}

/** Recitals / WHEREAS section */
function Recitals({
  ndaType,
  disclosingParty,
  receivingParty,
}: {
  ndaType: NDAType;
  disclosingParty: NDAParty;
  receivingParty: NDAParty;
}) {
  const isMutual = ndaType === 'mutual';

  return (
    <View style={styles.recitalsContainer}>
      <Text style={styles.sectionHeading}>Recitals</Text>

      {isMutual ? (
        <>
          <Text style={styles.whereasText}>
            <Text style={styles.whereasKeyword}>WHEREAS, </Text>
            {disclosingParty.company} ("{disclosingParty.company}" or "Party A")
            and {receivingParty.company} ("{receivingParty.company}" or "Party B"),
            each a duly organized entity, wish to explore a potential business
            relationship and, in connection therewith, each Party may disclose to
            the other certain confidential and proprietary information; and
          </Text>
          <Text style={styles.whereasText}>
            <Text style={styles.whereasKeyword}>WHEREAS, </Text>
            the Parties desire to establish the terms and conditions under which
            such confidential information shall be disclosed, received, and
            protected from unauthorized use and dissemination;
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.whereasText}>
            <Text style={styles.whereasKeyword}>WHEREAS, </Text>
            {disclosingParty.company} (the "Disclosing Party") possesses certain
            confidential and proprietary information relating to its business,
            technology, and operations; and
          </Text>
          <Text style={styles.whereasText}>
            <Text style={styles.whereasKeyword}>WHEREAS, </Text>
            {receivingParty.company} (the "Receiving Party") desires to receive
            certain of this Confidential Information for the Purpose described
            herein, and the Disclosing Party is willing to disclose such
            information subject to the terms and conditions set forth in this
            Agreement;
          </Text>
        </>
      )}

      <Text style={styles.nowThereforeText}>
        NOW, THEREFORE, in consideration of the mutual covenants and agreements
        contained herein, and for other good and valuable consideration, the
        receipt and sufficiency of which are hereby acknowledged, the parties
        agree as follows:
      </Text>
    </View>
  );
}

/** A single numbered article */
function Article({
  article,
  number,
}: {
  article: NDAArticle;
  number: number;
}) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';

  return (
    <View style={styles.articleContainer} wrap={false}>
      <Text style={styles.articleHeading}>
        <Text style={styles.articleNumber}>Article {number}. </Text>
        {article.heading}
      </Text>

      {article.paragraphs.map((para, i) => (
        <Text key={`p-${number}-${i}`} style={styles.articleParagraph}>
          {para}
        </Text>
      ))}

      {article.subClauses && article.subClauses.length > 0 && (
        <View style={styles.subClauseContainer}>
          {article.subClauses.map((clause, i) => (
            <View key={`sc-${number}-${i}`} style={styles.subClauseRow}>
              <Text style={styles.subClauseLetter}>
                ({letters[i]})
              </Text>
              <Text style={styles.subClauseText}>{clause}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Signature block for a single party */
function SignatureBlock({
  party,
  role,
}: {
  party: NDAParty;
  role: string;
}) {
  return (
    <View style={styles.signatureBlock}>
      <Text style={styles.signatureRole}>{role}</Text>
      <Text style={styles.signatureCompany}>{party.company}</Text>

      <View style={styles.signatureLine} />
      <Text style={styles.signatureLabel}>Signature</Text>

      <Text style={styles.signatureNamePrePrint}>
        Name: {party.name}
      </Text>

      <Text style={styles.signatureNamePrePrint}>
        Title: {party.title}
      </Text>

      <View style={styles.signatureDateLine} />
      <Text style={styles.signatureLabel}>Date</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main NDA Component
// ---------------------------------------------------------------------------

/**
 * NDA - Non-Disclosure Agreement PDF Document
 *
 * Renders a complete, professional NDA as a multi-page A4 PDF.
 * All styling is self-contained via StyleSheet.create().
 */
export function NDA({
  effectiveDate,
  ndaType,
  disclosingParty,
  receivingParty,
  purpose,
  governingLaw = 'the State of Delaware',
  termMonths = 24,
  survivalMonths = 36,
  customArticles,
  showConfidentialFooter = true,
  referenceNumber,
}: NDAProps) {
  const isMutual = ndaType === 'mutual';

  // Build the articles list
  const articles: NDAArticle[] = customArticles || buildDefaultArticles(
    ndaType,
    termMonths,
    survivalMonths,
    effectiveDate,
    governingLaw,
  );

  // Split articles across pages to balance layout:
  // Page 1: title, parties, recitals, purpose (no articles -- room is tight)
  // Page 2: articles 1-4
  // Page 3: articles 5-8 (or remaining)
  // Page 4: signature page
  const midpoint = Math.ceil(articles.length / 2);
  const firstHalf = articles.slice(0, midpoint);
  const secondHalf = articles.slice(midpoint);
  const totalPages = 4;

  // Introduction text
  const introText = isMutual
    ? `This Mutual Non-Disclosure Agreement (this "Agreement") is entered into as of ${effectiveDate} (the "Effective Date"), by and between ${disclosingParty.company} ("Party A") and ${receivingParty.company} ("Party B"), each referred to individually as a "Party" and collectively as the "Parties."`
    : `This Non-Disclosure Agreement (this "Agreement") is entered into as of ${effectiveDate} (the "Effective Date"), by and between ${disclosingParty.company} (the "Disclosing Party") and ${receivingParty.company} (the "Receiving Party").`;

  // Party role labels
  const roleA = isMutual ? 'Party A' : 'Disclosing Party';
  const roleB = isMutual ? 'Party B' : 'Receiving Party';

  return (
    <Document
      title={`${isMutual ? 'Mutual ' : ''}Non-Disclosure Agreement`}
      author={disclosingParty.company}
      subject={`NDA between ${disclosingParty.company} and ${receivingParty.company}`}
      keywords="NDA, non-disclosure, confidentiality, agreement"
      creator="Trinity PDF Template"
      producer="@react-pdf/renderer"
    >
      {/* ================================================================
          PAGE 1: Title, Parties, Recitals, Purpose
          ================================================================ */}
      <Page size="A4" style={styles.firstPage}>
        {/* Dark title header + accent bar */}
        <TitleHeader ndaType={ndaType} referenceNumber={referenceNumber} />

        {/* Effective date meta block */}
        <MetaBlock
          effectiveDate={effectiveDate}
          referenceNumber={referenceNumber}
        />

        {/* Body content with horizontal padding */}
        <View style={styles.bodyContent}>
          {/* Introduction paragraph */}
          <Text style={styles.articleParagraph}>{introText}</Text>

          <View style={styles.divider} />

          {/* Party information cards */}
          <Text style={styles.sectionHeading}>The Parties</Text>
          <View style={styles.partiesContainer}>
            <PartyCard party={disclosingParty} role={roleA} />
            <PartyCard party={receivingParty} role={roleB} />
          </View>

          {/* Recitals */}
          <Recitals
            ndaType={ndaType}
            disclosingParty={disclosingParty}
            receivingParty={receivingParty}
          />

          {/* Purpose highlight box */}
          <PurposeBlock purpose={purpose} />
        </View>

        {/* Page 1 footer */}
        <PageFooter
          pageNumber={1}
          totalPages={totalPages}
          showConfidential={showConfidentialFooter}
        />
      </Page>

      {/* ================================================================
          PAGE 2: Articles (first half)
          ================================================================ */}
      <Page size="A4" style={styles.page}>
        {/* Fixed header */}
        <FixedPageHeader
          ndaType={ndaType}
          pageNumber={2}
          totalPages={totalPages}
        />

        {/* Section title */}
        <Text style={styles.continuationTitle}>
          Terms and Conditions
        </Text>

        <View style={styles.accentDivider} />

        {/* Render first half of articles */}
        {firstHalf.map((article, index) => (
          <Article
            key={`art-${index}`}
            article={article}
            number={index + 1}
          />
        ))}

        {/* Page 2 footer */}
        <PageFooter
          pageNumber={2}
          totalPages={totalPages}
          showConfidential={showConfidentialFooter}
        />
      </Page>

      {/* ================================================================
          PAGE 3: Articles (second half)
          ================================================================ */}
      <Page size="A4" style={styles.page}>
        {/* Fixed header */}
        <FixedPageHeader
          ndaType={ndaType}
          pageNumber={3}
          totalPages={totalPages}
        />

        {/* Continuation title */}
        <Text style={styles.continuationTitle}>
          Terms and Conditions (continued)
        </Text>

        <View style={styles.accentDivider} />

        {/* Render second half of articles */}
        {secondHalf.map((article, index) => (
          <Article
            key={`art-${midpoint + index}`}
            article={article}
            number={midpoint + index + 1}
          />
        ))}

        {/* Page 3 footer */}
        <PageFooter
          pageNumber={3}
          totalPages={totalPages}
          showConfidential={showConfidentialFooter}
        />
      </Page>

      {/* ================================================================
          PAGE 4: Signature Page
          ================================================================ */}
      <Page size="A4" style={styles.page}>
        {/* Fixed header */}
        <FixedPageHeader
          ndaType={ndaType}
          pageNumber={4}
          totalPages={totalPages}
        />

        {/* Execution heading */}
        <Text style={styles.continuationTitle}>
          Execution of Agreement
        </Text>

        <View style={styles.accentDivider} />

        {/* Signature section */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureIntro}>
            IN WITNESS WHEREOF, the Parties have executed this{' '}
            {isMutual ? 'Mutual ' : ''}Non-Disclosure Agreement as of the
            Effective Date first written above. Each signatory represents and
            warrants that they are duly authorized to execute this Agreement on
            behalf of their respective organization.
          </Text>

          {/* Two-column signature blocks */}
          <View style={styles.signatureRow}>
            <SignatureBlock party={disclosingParty} role={roleA} />
            <SignatureBlock party={receivingParty} role={roleB} />
          </View>
        </View>

        {/* Page 4 footer */}
        <PageFooter
          pageNumber={4}
          totalPages={totalPages}
          showConfidential={showConfidentialFooter}
        />
      </Page>
    </Document>
  );
}

export { NDA as default };
