/**
 * Professional Cover Letter PDF Template
 *
 * A polished, single-page-optimized cover letter for job applications,
 * freelance proposals, or formal business correspondence. Features a
 * dark navy header with applicant branding, structured recipient and
 * body sections, and an optional postscript area.
 *
 * Self-contained: uses only `@react-pdf/renderer` and `react` — no
 * external design system imports required.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { renderToBuffer } from '@react-pdf/renderer';
 * import { CoverLetter } from './cover-letter';
 *
 * const buffer = await renderToBuffer(
 *   <CoverLetter
 *     applicant={{
 *       name: 'Jane Doe',
 *       title: 'Senior Software Engineer',
 *       email: 'jane@example.com',
 *       phone: '+1 555-0123',
 *       location: 'San Francisco, CA',
 *     }}
 *     recipient={{
 *       name: 'Alex Rivera',
 *       title: 'Engineering Manager',
 *       company: 'Acme Corp',
 *       address: '100 Market St, San Francisco, CA 94105',
 *     }}
 *     date="February 18, 2026"
 *     subject="Application for Senior Software Engineer"
 *     salutation="Dear Alex Rivera"
 *     body={[
 *       'I am writing to express my strong interest in the Senior Software Engineer role...',
 *       'In my current position at Widget Inc., I have led a team of 6 engineers...',
 *       'I am particularly drawn to Acme Corp because of your commitment to...',
 *     ]}
 *     closing="Sincerely"
 *     signature={{ name: 'Jane Doe', title: 'Senior Software Engineer' }}
 *   />
 * );
 * ```
 *
 * @module pdf/cover-letter
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Link,
  StyleSheet,
} from '@react-pdf/renderer';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Applicant contact and identity information displayed in the header.
 */
export interface Applicant {
  /** Full name of the applicant */
  name: string;
  /** Current job title or professional headline */
  title?: string;
  /** Contact email address */
  email: string;
  /** Phone number with country code */
  phone?: string;
  /** City, state/country */
  location?: string;
  /** Personal website or portfolio URL */
  website?: string;
  /** LinkedIn profile URL or handle */
  linkedIn?: string;
}

/**
 * Recipient / hiring manager information shown in the address block.
 */
export interface Recipient {
  /** Full name of the recipient */
  name: string;
  /** Recipient's job title */
  title?: string;
  /** Company or organization name */
  company: string;
  /** Department within the company (optional) */
  department?: string;
  /** Street address or multi-line address string */
  address?: string;
}

/**
 * Signature block displayed at the bottom of the letter.
 */
export interface Signature {
  /** Printed name */
  name: string;
  /** Job title or professional designation */
  title?: string;
}

/**
 * Props for the CoverLetter PDF template.
 */
export interface CoverLetterProps {
  // -- Identity ---------------------------------------------------------------

  /** Applicant contact and identity information */
  applicant: Applicant;

  /** Recipient / hiring manager information */
  recipient: Recipient;

  // -- Content ----------------------------------------------------------------

  /** Formatted date string (e.g. "February 18, 2026") */
  date: string;

  /**
   * Subject line displayed below the date and above the salutation.
   * Typically the position title or reference number.
   */
  subject?: string;

  /**
   * Salutation line. Defaults to "Dear {recipient.name}" if omitted.
   * Examples: "Dear Hiring Manager", "Dear Ms. Rivera"
   */
  salutation?: string;

  /**
   * Body paragraphs of the cover letter.
   * Pass a single string for one paragraph or an array for multiple.
   * Recommended: 3-4 paragraphs (intro, experience, motivation, closing thought).
   */
  body: string | string[];

  /**
   * Closing phrase before the signature.
   * @default "Sincerely"
   */
  closing?: string;

  /** Signature block (name and optional title) */
  signature?: Signature;

  /**
   * Optional postscript (P.S.) appended after the signature.
   * Useful for drawing attention to a key achievement or availability.
   */
  postscript?: string;

  // -- Branding ---------------------------------------------------------------

  /**
   * Path or base64-encoded data URI for a company/personal logo
   * displayed in the top-right corner of the header. Recommended
   * height: 30-40px equivalent.
   */
  logoSrc?: string;

  // -- Customization ----------------------------------------------------------

  /**
   * Override the default color palette. Any key omitted falls back
   * to the built-in default.
   */
  colors?: Partial<ColorPalette>;

  /**
   * Reference line displayed below the date (e.g. "Ref: JOB-2026-042").
   * Handy for formal applications that cite a requisition number.
   */
  reference?: string;

  /**
   * Enclosures line displayed at the very bottom (e.g. "Resume, Portfolio").
   * Rendered as "Enclosures: ..." when provided.
   */
  enclosures?: string[];
}

// -----------------------------------------------------------------------------
// Color Palette
// -----------------------------------------------------------------------------

/**
 * Full color palette used throughout the template.
 * Override individual keys via `CoverLetterProps.colors`.
 */
export interface ColorPalette {
  /** Dark navy used for the header background */
  headerBg: string;
  /** Text color rendered on the header background */
  headerText: string;
  /** Muted/secondary text on the header background */
  headerMuted: string;
  /** Accent color for decorative elements and links */
  accent: string;
  /** Primary body text color */
  text: string;
  /** Secondary / muted body text */
  muted: string;
  /** Divider and border color */
  divider: string;
  /** Page background */
  pageBg: string;
  /** Subject line background highlight */
  subjectBg: string;
}

const DEFAULT_COLORS: ColorPalette = {
  headerBg: '#1a1a2e',
  headerText: '#ffffff',
  headerMuted: '#94a3b8',
  accent: '#3b82f6',
  text: '#1e293b',
  muted: '#64748b',
  divider: '#e2e8f0',
  pageBg: '#ffffff',
  subjectBg: '#f1f5f9',
} as const;

// -----------------------------------------------------------------------------
// Style Factory
// -----------------------------------------------------------------------------

/**
 * Creates the full StyleSheet for the cover letter.
 * Accepts a merged color palette so user overrides flow through.
 */
function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    // -- Page ----------------------------------------------------------------
    page: {
      fontFamily: 'Helvetica',
      fontSize: 10.5,
      color: c.text,
      backgroundColor: c.pageBg,
      paddingBottom: 40,
    },

    // -- Header (dark navy banner) -------------------------------------------
    header: {
      backgroundColor: c.headerBg,
      paddingTop: 32,
      paddingBottom: 28,
      paddingHorizontal: 48,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      flexDirection: 'column',
      maxWidth: '65%',
    },
    headerRight: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      maxWidth: '33%',
    },
    applicantName: {
      fontSize: 22,
      fontFamily: 'Helvetica-Bold',
      color: c.headerText,
      letterSpacing: -0.3,
      marginBottom: 2,
    },
    applicantTitle: {
      fontSize: 11,
      color: c.accent,
      marginBottom: 8,
    },
    headerContactLine: {
      fontSize: 9,
      color: c.headerMuted,
      marginBottom: 3,
    },
    headerContactLink: {
      fontSize: 9,
      color: c.accent,
      textDecoration: 'none',
      marginBottom: 3,
    },
    headerAccent: {
      height: 3,
      backgroundColor: c.accent,
      width: 48,
      marginTop: 6,
    },
    logo: {
      width: 80,
      height: 32,
      objectFit: 'contain',
    },

    // -- Body wrapper --------------------------------------------------------
    bodyWrapper: {
      paddingHorizontal: 48,
      paddingTop: 28,
      flex: 1,
    },

    // -- Date & Reference ----------------------------------------------------
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    dateText: {
      fontSize: 10.5,
      color: c.text,
    },
    referenceText: {
      fontSize: 9.5,
      color: c.muted,
    },

    // -- Recipient address block ---------------------------------------------
    recipientBlock: {
      marginBottom: 20,
    },
    recipientName: {
      fontSize: 10.5,
      fontFamily: 'Helvetica-Bold',
      color: c.text,
      marginBottom: 1,
    },
    recipientLine: {
      fontSize: 10,
      color: c.text,
      lineHeight: 1.5,
    },
    recipientMuted: {
      fontSize: 10,
      color: c.muted,
      lineHeight: 1.5,
    },

    // -- Subject line --------------------------------------------------------
    subjectContainer: {
      backgroundColor: c.subjectBg,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 18,
      borderLeftWidth: 3,
      borderLeftColor: c.accent,
      borderRadius: 2,
    },
    subjectLabel: {
      fontSize: 8,
      fontFamily: 'Helvetica-Bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: c.muted,
      marginBottom: 2,
    },
    subjectText: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: c.text,
    },

    // -- Salutation ----------------------------------------------------------
    salutation: {
      fontSize: 10.5,
      color: c.text,
      marginBottom: 14,
    },

    // -- Body paragraphs -----------------------------------------------------
    bodySection: {
      marginBottom: 6,
    },
    paragraph: {
      fontSize: 10.5,
      color: c.text,
      lineHeight: 1.65,
      marginBottom: 12,
      textAlign: 'justify',
    },
    paragraphLast: {
      fontSize: 10.5,
      color: c.text,
      lineHeight: 1.65,
      marginBottom: 0,
      textAlign: 'justify',
    },

    // -- Closing & Signature -------------------------------------------------
    closingSection: {
      marginTop: 22,
    },
    closingText: {
      fontSize: 10.5,
      color: c.text,
      marginBottom: 28,
    },
    signatureBlock: {
      flexDirection: 'column',
    },
    signatureName: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: c.text,
      marginBottom: 1,
    },
    signatureTitle: {
      fontSize: 10,
      color: c.muted,
    },

    // -- Postscript ----------------------------------------------------------
    postscriptSection: {
      marginTop: 24,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    postscriptLabel: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: c.accent,
      marginBottom: 4,
    },
    postscriptText: {
      fontSize: 10,
      color: c.text,
      lineHeight: 1.55,
      fontStyle: 'italic',
    },

    // -- Enclosures ----------------------------------------------------------
    enclosuresSection: {
      marginTop: 18,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    enclosuresLabel: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: c.muted,
      marginBottom: 3,
    },
    enclosuresText: {
      fontSize: 9.5,
      color: c.text,
      lineHeight: 1.4,
    },

    // -- Footer accent -------------------------------------------------------
    footerAccent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: c.accent,
    },
  });
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

/**
 * Normalize body content to an array of paragraph strings.
 */
function normalizeParagraphs(body: string | string[]): string[] {
  if (typeof body === 'string') {
    return [body];
  }
  return body;
}

/**
 * Build the default salutation from the recipient name.
 */
function buildDefaultSalutation(recipient: Recipient): string {
  return `Dear ${recipient.name}`;
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

/**
 * Dark navy header banner with applicant identity and contact info.
 * Optionally renders a logo in the top-right corner.
 */
interface HeaderBannerProps {
  applicant: Applicant;
  logoSrc?: string;
  styles: ReturnType<typeof createStyles>;
  colors: ColorPalette;
}

function HeaderBanner({ applicant, logoSrc, styles: s, colors: c }: HeaderBannerProps) {
  return (
    <View style={s.header}>
      {/* Left column: name, title, accent bar */}
      <View style={s.headerLeft}>
        <Text style={s.applicantName}>{applicant.name}</Text>
        {applicant.title && (
          <Text style={s.applicantTitle}>{applicant.title}</Text>
        )}
        <View style={s.headerAccent} />
      </View>

      {/* Right column: contact details or logo */}
      <View style={s.headerRight}>
        {logoSrc ? (
          <Image src={logoSrc} style={s.logo} />
        ) : (
          <>
            <Text style={s.headerContactLine}>{applicant.email}</Text>
            {applicant.phone && (
              <Text style={s.headerContactLine}>{applicant.phone}</Text>
            )}
            {applicant.location && (
              <Text style={s.headerContactLine}>{applicant.location}</Text>
            )}
            {applicant.website && (
              <Link
                src={
                  applicant.website.startsWith('http')
                    ? applicant.website
                    : `https://${applicant.website}`
                }
              >
                <Text style={s.headerContactLink}>{applicant.website}</Text>
              </Link>
            )}
            {applicant.linkedIn && (
              <Link
                src={
                  applicant.linkedIn.startsWith('http')
                    ? applicant.linkedIn
                    : `https://linkedin.com/in/${applicant.linkedIn}`
                }
              >
                <Text style={s.headerContactLink}>
                  {applicant.linkedIn.startsWith('http')
                    ? applicant.linkedIn
                    : `linkedin.com/in/${applicant.linkedIn}`}
                </Text>
              </Link>
            )}
          </>
        )}
      </View>
    </View>
  );
}

/**
 * Contact details row rendered below the header when a logo is present.
 * If no logo is used the contact details are already inside the header
 * banner, so this component returns null.
 */
interface ContactBarProps {
  applicant: Applicant;
  logoSrc?: string;
  styles: ReturnType<typeof createStyles>;
  colors: ColorPalette;
}

function ContactBar({ applicant, logoSrc, styles: s, colors: c }: ContactBarProps) {
  if (!logoSrc) return null;

  const items: string[] = [applicant.email];
  if (applicant.phone) items.push(applicant.phone);
  if (applicant.location) items.push(applicant.location);

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 48,
        backgroundColor: c.subjectBg,
        borderBottomWidth: 1,
        borderBottomColor: c.divider,
      }}
    >
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <Text style={{ fontSize: 9, color: c.muted, marginHorizontal: 4 }}>
              |
            </Text>
          )}
          <Text style={{ fontSize: 9, color: c.muted }}>{item}</Text>
        </React.Fragment>
      ))}
      {applicant.website && (
        <>
          <Text style={{ fontSize: 9, color: c.muted, marginHorizontal: 4 }}>
            |
          </Text>
          <Link
            src={
              applicant.website.startsWith('http')
                ? applicant.website
                : `https://${applicant.website}`
            }
          >
            <Text style={{ fontSize: 9, color: c.accent, textDecoration: 'none' }}>
              {applicant.website}
            </Text>
          </Link>
        </>
      )}
      {applicant.linkedIn && (
        <>
          <Text style={{ fontSize: 9, color: c.muted, marginHorizontal: 4 }}>
            |
          </Text>
          <Link
            src={
              applicant.linkedIn.startsWith('http')
                ? applicant.linkedIn
                : `https://linkedin.com/in/${applicant.linkedIn}`
            }
          >
            <Text style={{ fontSize: 9, color: c.accent, textDecoration: 'none' }}>
              {applicant.linkedIn.startsWith('http')
                ? applicant.linkedIn
                : `linkedin.com/in/${applicant.linkedIn}`}
            </Text>
          </Link>
        </>
      )}
    </View>
  );
}

/**
 * Date row with optional reference number aligned to the right.
 */
interface DateRowProps {
  date: string;
  reference?: string;
  styles: ReturnType<typeof createStyles>;
}

function DateRow({ date, reference, styles: s }: DateRowProps) {
  return (
    <View style={s.dateRow}>
      <Text style={s.dateText}>{date}</Text>
      {reference && <Text style={s.referenceText}>{reference}</Text>}
    </View>
  );
}

/**
 * Recipient address block with name, title, company, department, and address.
 */
interface RecipientBlockProps {
  recipient: Recipient;
  styles: ReturnType<typeof createStyles>;
}

function RecipientBlock({ recipient, styles: s }: RecipientBlockProps) {
  return (
    <View style={s.recipientBlock}>
      <Text style={s.recipientName}>{recipient.name}</Text>
      {recipient.title && (
        <Text style={s.recipientLine}>{recipient.title}</Text>
      )}
      <Text style={s.recipientLine}>{recipient.company}</Text>
      {recipient.department && (
        <Text style={s.recipientMuted}>{recipient.department}</Text>
      )}
      {recipient.address && (
        <Text style={s.recipientMuted}>{recipient.address}</Text>
      )}
    </View>
  );
}

/**
 * Highlighted subject line rendered below the recipient block.
 */
interface SubjectBlockProps {
  subject: string;
  styles: ReturnType<typeof createStyles>;
}

function SubjectBlock({ subject, styles: s }: SubjectBlockProps) {
  return (
    <View style={s.subjectContainer}>
      <Text style={s.subjectLabel}>Re</Text>
      <Text style={s.subjectText}>{subject}</Text>
    </View>
  );
}

/**
 * Salutation line (e.g. "Dear Ms. Rivera,").
 */
interface SalutationLineProps {
  text: string;
  styles: ReturnType<typeof createStyles>;
}

function SalutationLine({ text, styles: s }: SalutationLineProps) {
  return <Text style={s.salutation}>{text},</Text>;
}

/**
 * Body content: an array of justified paragraphs.
 */
interface BodyContentProps {
  paragraphs: string[];
  styles: ReturnType<typeof createStyles>;
}

function BodyContent({ paragraphs, styles: s }: BodyContentProps) {
  return (
    <View style={s.bodySection}>
      {paragraphs.map((text, idx) => {
        const isLast = idx === paragraphs.length - 1;
        return (
          <Text key={idx} style={isLast ? s.paragraphLast : s.paragraph}>
            {text}
          </Text>
        );
      })}
    </View>
  );
}

/**
 * Closing phrase and signature block.
 */
interface ClosingSignatureProps {
  closing: string;
  signature?: Signature;
  styles: ReturnType<typeof createStyles>;
}

function ClosingSignature({ closing, signature, styles: s }: ClosingSignatureProps) {
  return (
    <View style={s.closingSection}>
      <Text style={s.closingText}>{closing},</Text>
      {signature && (
        <View style={s.signatureBlock}>
          <Text style={s.signatureName}>{signature.name}</Text>
          {signature.title && (
            <Text style={s.signatureTitle}>{signature.title}</Text>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Italicized postscript section separated by a thin divider.
 */
interface PostscriptSectionProps {
  text: string;
  styles: ReturnType<typeof createStyles>;
}

function PostscriptSection({ text, styles: s }: PostscriptSectionProps) {
  return (
    <View style={s.postscriptSection}>
      <Text style={s.postscriptLabel}>P.S.</Text>
      <Text style={s.postscriptText}>{text}</Text>
    </View>
  );
}

/**
 * Enclosures line listing attached documents.
 */
interface EnclosuresSectionProps {
  items: string[];
  styles: ReturnType<typeof createStyles>;
}

function EnclosuresSection({ items, styles: s }: EnclosuresSectionProps) {
  return (
    <View style={s.enclosuresSection}>
      <Text style={s.enclosuresLabel}>Enclosures</Text>
      <Text style={s.enclosuresText}>{items.join('  |  ')}</Text>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

/**
 * Cover Letter PDF Component
 *
 * Renders a professional, single-page-optimized cover letter with:
 *
 * - **Dark navy header** with applicant name, title, and contact details
 * - **Accent bar** in configurable blue for visual branding
 * - **Recipient address block** with name, title, company, and address
 * - **Subject line** with left-border accent highlight
 * - **Body paragraphs** with justified text and comfortable line height
 * - **Closing and signature** block
 * - **Optional postscript** (P.S.) for a memorable final note
 * - **Optional enclosures** line listing attached documents
 * - **Optional logo** in the header (replaces inline contact details)
 * - **Customizable colors** via partial palette override
 *
 * Designed for A4 output. Content is optimized for a single page but
 * wraps gracefully to page 2 when longer body text is provided.
 *
 * @example
 * ```tsx
 * // Minimal usage
 * <CoverLetter
 *   applicant={{ name: 'Jane Doe', email: 'jane@example.com' }}
 *   recipient={{ name: 'Hiring Team', company: 'Acme Corp' }}
 *   date="February 18, 2026"
 *   body="I am writing to express my interest in the open position..."
 * />
 *
 * // Full-featured usage
 * <CoverLetter
 *   applicant={{
 *     name: 'Jane Doe',
 *     title: 'Senior Software Engineer',
 *     email: 'jane@example.com',
 *     phone: '+1 555-0123',
 *     location: 'San Francisco, CA',
 *     website: 'janedoe.dev',
 *     linkedIn: 'janedoe',
 *   }}
 *   recipient={{
 *     name: 'Alex Rivera',
 *     title: 'VP of Engineering',
 *     company: 'Acme Corp',
 *     department: 'Platform Team',
 *     address: '100 Market St, San Francisco, CA 94105',
 *   }}
 *   date="February 18, 2026"
 *   reference="Ref: JOB-2026-042"
 *   subject="Application for Senior Software Engineer"
 *   salutation="Dear Alex Rivera"
 *   body={[
 *     'I am writing to express my strong interest...',
 *     'In my current position at Widget Inc...',
 *     'I am drawn to Acme Corp because...',
 *   ]}
 *   closing="Sincerely"
 *   signature={{ name: 'Jane Doe', title: 'Senior Software Engineer' }}
 *   postscript="I will be attending the React Summit next month and would love to connect in person."
 *   enclosures={['Resume', 'Portfolio']}
 *   colors={{ accent: '#6366f1' }}
 * />
 * ```
 */
export function CoverLetter({
  applicant,
  recipient,
  date,
  subject,
  salutation,
  body,
  closing = 'Sincerely',
  signature,
  postscript,
  logoSrc,
  colors: colorOverrides,
  reference,
  enclosures,
}: CoverLetterProps) {
  // Merge user color overrides with defaults
  const colors: ColorPalette = { ...DEFAULT_COLORS, ...colorOverrides };
  const styles = createStyles(colors);

  // Resolve defaults
  const effectiveSalutation = salutation || buildDefaultSalutation(recipient);
  const paragraphs = normalizeParagraphs(body);

  return (
    <Document
      title={`Cover Letter - ${applicant.name}`}
      author={applicant.name}
      subject={subject || `Cover Letter from ${applicant.name} to ${recipient.company}`}
      keywords={`cover letter, ${applicant.name}, ${recipient.company}`}
    >
      <Page size="A4" style={styles.page}>
        {/* -- Header Banner ------------------------------------------------- */}
        <HeaderBanner
          applicant={applicant}
          logoSrc={logoSrc}
          styles={styles}
          colors={colors}
        />

        {/* -- Contact Bar (only when logo is used) -------------------------- */}
        <ContactBar
          applicant={applicant}
          logoSrc={logoSrc}
          styles={styles}
          colors={colors}
        />

        {/* -- Body Content -------------------------------------------------- */}
        <View style={styles.bodyWrapper}>
          {/* Date and reference */}
          <DateRow date={date} reference={reference} styles={styles} />

          {/* Recipient address block */}
          <RecipientBlock recipient={recipient} styles={styles} />

          {/* Subject line (optional) */}
          {subject && <SubjectBlock subject={subject} styles={styles} />}

          {/* Salutation */}
          <SalutationLine text={effectiveSalutation} styles={styles} />

          {/* Body paragraphs */}
          <BodyContent paragraphs={paragraphs} styles={styles} />

          {/* Closing and signature */}
          <ClosingSignature
            closing={closing}
            signature={signature}
            styles={styles}
          />

          {/* Postscript (optional) */}
          {postscript && (
            <PostscriptSection text={postscript} styles={styles} />
          )}

          {/* Enclosures (optional) */}
          {enclosures && enclosures.length > 0 && (
            <EnclosuresSection items={enclosures} styles={styles} />
          )}
        </View>

        {/* -- Footer accent bar --------------------------------------------- */}
        <View style={styles.footerAccent} />
      </Page>
    </Document>
  );
}

export default CoverLetter;
