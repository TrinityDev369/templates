/**
 * Professional Resume / CV PDF Template
 *
 * ATS-friendly resume layout with sections for experience, education,
 * skills, certifications, and languages. Uses plain text rendering
 * throughout to ensure compatibility with applicant tracking systems.
 *
 * Self-contained: uses only @react-pdf/renderer — no external design
 * system imports required.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { renderToBuffer } from '@react-pdf/renderer';
 * import { Resume } from './resume';
 *
 * const buffer = await renderToBuffer(
 *   <Resume
 *     name="Jane Doe"
 *     title="Senior Software Engineer"
 *     email="jane@example.com"
 *     phone="+1 555-0123"
 *     location="San Francisco, CA"
 *     summary="Experienced engineer with 8+ years..."
 *     experience={[{ company: "Acme", role: "Lead", ... }]}
 *     education={[{ institution: "MIT", degree: "B.S.", ... }]}
 *     skills={[{ category: "Languages", items: ["TypeScript", "Go"] }]}
 *   />
 * );
 * ```
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet, Link } from '@react-pdf/renderer';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ExperienceEntry {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageEntry {
  name: string;
  level: string;
}

export interface ResumeProps {
  /** Full name displayed as the resume heading */
  name: string;
  /** Current job title or professional headline */
  title: string;
  /** Contact email address */
  email: string;
  /** Phone number with country code */
  phone?: string;
  /** City, State/Country */
  location?: string;
  /** Personal website or portfolio URL */
  website?: string;
  /** LinkedIn profile URL or handle */
  linkedIn?: string;
  /** Professional summary paragraph (2-4 sentences recommended) */
  summary?: string;
  /** Work experience entries, ordered most-recent first */
  experience?: ExperienceEntry[];
  /** Education entries, ordered most-recent first */
  education?: EducationEntry[];
  /** Skills grouped by category */
  skills?: SkillGroup[];
  /** Professional certifications (optional section) */
  certifications?: CertificationEntry[];
  /** Spoken/written languages (optional section) */
  languages?: LanguageEntry[];
}

// -----------------------------------------------------------------------------
// Color Palette
// -----------------------------------------------------------------------------

const colors = {
  /** Primary text color — dark charcoal */
  text: '#2d2d2d',
  /** Secondary/muted text */
  muted: '#6b7280',
  /** Accent blue for headers and decorative lines */
  accent: '#2563eb',
  /** Light gray for subtle backgrounds */
  bgLight: '#f5f5f5',
  /** Divider line color */
  divider: '#d1d5db',
  /** White */
  white: '#ffffff',
} as const;

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  // -- Page ------------------------------------------------------------------
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
  },

  // -- Header ----------------------------------------------------------------
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'column',
    maxWidth: '60%',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '38%',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: colors.accent,
    fontFamily: 'Helvetica',
    marginBottom: 0,
  },
  contactLine: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 2,
    textAlign: 'right',
  },
  contactLink: {
    fontSize: 9,
    color: colors.accent,
    textDecoration: 'none',
    marginBottom: 2,
  },

  // -- Horizontal Rule -------------------------------------------------------
  hr: {
    height: 2,
    backgroundColor: colors.accent,
    marginTop: 8,
    marginBottom: 14,
  },
  hrThin: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: 6,
    marginBottom: 10,
  },

  // -- Section ---------------------------------------------------------------
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.accent,
  },
  sectionAccent: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accent,
    marginLeft: 8,
    opacity: 0.3,
  },

  // -- Summary ---------------------------------------------------------------
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.text,
  },

  // -- Experience ------------------------------------------------------------
  experienceEntry: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  experienceHeaderLeft: {
    flexDirection: 'column',
    maxWidth: '70%',
  },
  experienceRole: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  experienceCompany: {
    fontSize: 10,
    color: colors.muted,
  },
  experienceDateLocation: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'right',
  },
  highlightList: {
    marginTop: 3,
    paddingLeft: 2,
  },
  highlightRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    fontSize: 10,
    color: colors.accent,
    width: 12,
  },
  highlightText: {
    fontSize: 9.5,
    lineHeight: 1.45,
    color: colors.text,
    flex: 1,
  },

  // -- Education -------------------------------------------------------------
  educationEntry: {
    marginBottom: 6,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  educationHeaderLeft: {
    flexDirection: 'column',
    maxWidth: '70%',
  },
  educationDegree: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  educationInstitution: {
    fontSize: 10,
    color: colors.muted,
  },
  educationDate: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'right',
  },
  educationGpa: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 1,
  },

  // -- Skills ----------------------------------------------------------------
  skillRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skillCategory: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    width: 110,
    minWidth: 110,
  },
  skillItems: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
    lineHeight: 1.4,
  },

  // -- Certifications --------------------------------------------------------
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  certName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    maxWidth: '55%',
  },
  certIssuer: {
    fontSize: 9.5,
    color: colors.muted,
    maxWidth: '25%',
    textAlign: 'center',
  },
  certDate: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'right',
  },

  // -- Languages -------------------------------------------------------------
  languageRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  languageName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    width: 110,
  },
  languageLevel: {
    fontSize: 10,
    color: colors.muted,
  },

  // -- Footer ----------------------------------------------------------------
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: colors.divider,
  },
});

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

/** Renders a section title with an uppercase label and extending accent line. */
function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionAccent} />
    </View>
  );
}

/** Header block: name + title on left, contact details on right. */
function Header(props: Pick<
  ResumeProps,
  'name' | 'title' | 'email' | 'phone' | 'location' | 'website' | 'linkedIn'
>) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.name}>{props.name}</Text>
        <Text style={styles.title}>{props.title}</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.contactLine}>{props.email}</Text>
        {props.phone && <Text style={styles.contactLine}>{props.phone}</Text>}
        {props.location && <Text style={styles.contactLine}>{props.location}</Text>}
        {props.website && (
          <Link src={props.website.startsWith('http') ? props.website : `https://${props.website}`}>
            <Text style={styles.contactLink}>{props.website}</Text>
          </Link>
        )}
        {props.linkedIn && (
          <Link src={props.linkedIn.startsWith('http') ? props.linkedIn : `https://linkedin.com/in/${props.linkedIn}`}>
            <Text style={styles.contactLink}>{props.linkedIn.startsWith('http') ? props.linkedIn : `linkedin.com/in/${props.linkedIn}`}</Text>
          </Link>
        )}
      </View>
    </View>
  );
}

/** Professional summary paragraph. */
function SummarySection({ text }: { text: string }) {
  return (
    <View style={styles.section}>
      <SectionHeading title="Professional Summary" />
      <Text style={styles.summary}>{text}</Text>
    </View>
  );
}

/** Single experience entry with role, company, dates, and bullet highlights. */
function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
  const dateRange = `${entry.startDate} - ${entry.endDate}`;
  return (
    <View style={styles.experienceEntry} wrap={false}>
      <View style={styles.experienceHeader}>
        <View style={styles.experienceHeaderLeft}>
          <Text style={styles.experienceRole}>{entry.role}</Text>
          <Text style={styles.experienceCompany}>{entry.company}</Text>
        </View>
        <View>
          <Text style={styles.experienceDateLocation}>{dateRange}</Text>
          {entry.location && (
            <Text style={styles.experienceDateLocation}>{entry.location}</Text>
          )}
        </View>
      </View>

      {entry.highlights.length > 0 && (
        <View style={styles.highlightList}>
          {entry.highlights.map((highlight, i) => (
            <View key={i} style={styles.highlightRow}>
              <Text style={styles.bullet}>&#8226;</Text>
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Experience section with all entries. */
function ExperienceSection({ entries }: { entries: ExperienceEntry[] }) {
  return (
    <View style={styles.section}>
      <SectionHeading title="Experience" />
      {entries.map((entry, i) => (
        <ExperienceItem key={i} entry={entry} />
      ))}
    </View>
  );
}

/** Single education entry. */
function EducationItem({ entry }: { entry: EducationEntry }) {
  const dateRange = `${entry.startDate} - ${entry.endDate}`;
  return (
    <View style={styles.educationEntry} wrap={false}>
      <View style={styles.educationHeader}>
        <View style={styles.educationHeaderLeft}>
          <Text style={styles.educationDegree}>{entry.degree} in {entry.field}</Text>
          <Text style={styles.educationInstitution}>{entry.institution}</Text>
        </View>
        <Text style={styles.educationDate}>{dateRange}</Text>
      </View>
      {entry.gpa && (
        <Text style={styles.educationGpa}>GPA: {entry.gpa}</Text>
      )}
    </View>
  );
}

/** Education section with all entries. */
function EducationSection({ entries }: { entries: EducationEntry[] }) {
  return (
    <View style={styles.section}>
      <SectionHeading title="Education" />
      {entries.map((entry, i) => (
        <EducationItem key={i} entry={entry} />
      ))}
    </View>
  );
}

/** Skills section with category groupings. */
function SkillsSection({ groups }: { groups: SkillGroup[] }) {
  return (
    <View style={styles.section}>
      <SectionHeading title="Skills" />
      {groups.map((group, i) => (
        <View key={i} style={styles.skillRow}>
          <Text style={styles.skillCategory}>{group.category}:</Text>
          <Text style={styles.skillItems}>{group.items.join(', ')}</Text>
        </View>
      ))}
    </View>
  );
}

/** Certifications section (optional). */
function CertificationsSection({ entries }: { entries: CertificationEntry[] }) {
  return (
    <View style={styles.section}>
      <SectionHeading title="Certifications" />
      {entries.map((cert, i) => (
        <View key={i} style={styles.certRow}>
          <Text style={styles.certName}>{cert.name}</Text>
          <Text style={styles.certIssuer}>{cert.issuer}</Text>
          <Text style={styles.certDate}>{cert.date}</Text>
        </View>
      ))}
    </View>
  );
}

/** Languages section (optional). */
function LanguagesSection({ entries }: { entries: LanguageEntry[] }) {
  return (
    <View style={styles.section}>
      <SectionHeading title="Languages" />
      {entries.map((lang, i) => (
        <View key={i} style={styles.languageRow}>
          <Text style={styles.languageName}>{lang.name}</Text>
          <Text style={styles.languageLevel}>{lang.level}</Text>
        </View>
      ))}
    </View>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

/**
 * Resume PDF Component
 *
 * Renders a professional, ATS-friendly resume/CV with sections for
 * experience, education, skills, certifications, and languages.
 *
 * Designed for clean single- or two-page output depending on content
 * volume. Uses plain text throughout for maximum ATS compatibility.
 */
export function Resume({
  name,
  title: jobTitle,
  email,
  phone,
  location,
  website,
  linkedIn,
  summary,
  experience,
  education,
  skills,
  certifications,
  languages,
}: ResumeProps) {
  const hasExperience = experience && experience.length > 0;
  const hasEducation = education && education.length > 0;
  const hasSkills = skills && skills.length > 0;
  const hasCertifications = certifications && certifications.length > 0;
  const hasLanguages = languages && languages.length > 0;

  return (
    <Document
      title={`${name} - Resume`}
      author={name}
      subject={`Resume for ${name} - ${jobTitle}`}
      keywords={`resume, cv, ${jobTitle}`}
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header: Name + Title | Contact Details ── */}
        <Header
          name={name}
          title={jobTitle}
          email={email}
          phone={phone}
          location={location}
          website={website}
          linkedIn={linkedIn}
        />

        {/* ── Accent Rule ── */}
        <View style={styles.hr} />

        {/* ── Professional Summary ── */}
        {summary && <SummarySection text={summary} />}

        {/* ── Experience ── */}
        {hasExperience && <ExperienceSection entries={experience} />}

        {/* ── Education ── */}
        {hasEducation && <EducationSection entries={education} />}

        {/* ── Skills ── */}
        {hasSkills && <SkillsSection groups={skills} />}

        {/* ── Certifications (optional) ── */}
        {hasCertifications && <CertificationsSection entries={certifications} />}

        {/* ── Languages (optional) ── */}
        {hasLanguages && <LanguagesSection entries={languages} />}
      </Page>
    </Document>
  );
}

export default Resume;
