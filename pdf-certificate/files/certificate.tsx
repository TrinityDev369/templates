/**
 * Certificate PDF Template
 *
 * Elegant landscape certificate of completion/achievement PDF.
 * Designed for courses, awards, professional certifications, and achievements.
 *
 * Self-contained: uses ONLY @react-pdf/renderer with no external dependencies.
 *
 * @example
 * ```tsx
 * import { Certificate } from './certificate';
 *
 * <Certificate
 *   recipientName="Jane Doe"
 *   title="Certificate of Completion"
 *   subtitle="Advanced TypeScript Masterclass"
 *   description="has successfully completed the 40-hour Advanced TypeScript Masterclass, demonstrating proficiency in type-level programming, generics, and advanced patterns."
 *   date="February 18, 2026"
 *   issuerName="Sergej Goetz"
 *   issuerTitle="Lead Instructor"
 *   issuerOrganization="Trinity Academy"
 *   certificateId="CERT-2026-0042"
 * />
 * ```
 *
 * @module pdf-certificate
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

// -----------------------------------------------------------------------------
// Colors
// -----------------------------------------------------------------------------

const COLORS = {
  navy: '#1a1a2e',
  navyLight: '#2d2d4a',
  gold: '#c9a84c',
  goldLight: '#d4b96a',
  goldDark: '#b08d3a',
  cream: '#faf8f0',
  creamDark: '#f0edd8',
  white: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#4a4a5e',
  textMuted: '#7a7a8e',
} as const;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Props for the Certificate component.
 */
export interface CertificateProps {
  /** Name of the certificate recipient (displayed prominently) */
  recipientName: string;
  /** Main title, e.g. "Certificate of Completion" */
  title?: string;
  /** Subtitle line, e.g. course or program name */
  subtitle?: string;
  /** Description of the achievement — appears below the recipient name */
  description?: string;
  /** Formatted date string, e.g. "February 18, 2026" */
  date: string;
  /** Name of the person issuing/signing the certificate */
  issuerName: string;
  /** Title of the issuer, e.g. "Lead Instructor" */
  issuerTitle?: string;
  /** Organization issuing the certificate */
  issuerOrganization?: string;
  /** Unique certificate ID / serial number shown at bottom */
  certificateId?: string;
  /** Optional logo image source (base64 data URI or file path) */
  logoSrc?: string;
  /** Optional signature image source (base64 data URI or file path) */
  signatureSrc?: string;
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  // -- Page ------------------------------------------------------------------
  page: {
    backgroundColor: COLORS.cream,
    padding: 0,
    fontFamily: 'Helvetica',
  },

  // -- Outer border ----------------------------------------------------------
  outerBorder: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderWidth: 3,
    borderColor: COLORS.navy,
    borderStyle: 'solid',
  },
  innerBorder: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderStyle: 'solid',
  },

  // -- Corner decorations ----------------------------------------------------
  cornerTopLeft: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 24,
    left: 24,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  cornerOuter: {
    width: 40,
    height: 40,
    borderColor: COLORS.gold,
  },
  cornerOuterTL: {
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerOuterTR: {
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerOuterBL: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerOuterBR: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cornerInner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.goldDark,
  },
  cornerInnerTL: {
    top: 4,
    left: 4,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
  },
  cornerInnerTR: {
    top: 4,
    right: 4,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
  },
  cornerInnerBL: {
    bottom: 4,
    left: 4,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
  },
  cornerInnerBR: {
    bottom: 4,
    right: 4,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
  },

  // -- Gold accent lines -----------------------------------------------------
  topAccent: {
    position: 'absolute',
    top: 56,
    left: 80,
    right: 80,
    height: 2,
    backgroundColor: COLORS.gold,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 56,
    left: 80,
    right: 80,
    height: 2,
    backgroundColor: COLORS.gold,
  },

  // -- Diamond ornament (top center) -----------------------------------------
  diamondContainer: {
    position: 'absolute',
    top: 49,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  diamond: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.gold,
    transform: 'rotate(45deg)',
  },

  // -- Content area ----------------------------------------------------------
  content: {
    flex: 1,
    paddingTop: 72,
    paddingBottom: 60,
    paddingHorizontal: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Logo ------------------------------------------------------------------
  logoContainer: {
    position: 'absolute',
    top: 30,
    left: 40,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    maxWidth: 56,
    maxHeight: 56,
    objectFit: 'contain' as const,
  },

  // -- Title block -----------------------------------------------------------
  titleBlock: {
    alignItems: 'center',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    letterSpacing: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  titleDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  titleDividerLine: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.gold,
  },
  titleDividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
    marginHorizontal: 10,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: COLORS.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },

  // -- Preamble --------------------------------------------------------------
  preamble: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: COLORS.textSecondary,
    marginTop: 20,
    letterSpacing: 1.5,
  },

  // -- Recipient name --------------------------------------------------------
  recipientName: {
    fontSize: 32,
    fontFamily: 'Helvetica-BoldOblique',
    color: COLORS.navy,
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
  },
  recipientUnderline: {
    width: 300,
    height: 1.5,
    backgroundColor: COLORS.goldLight,
    marginBottom: 14,
  },

  // -- Description -----------------------------------------------------------
  description: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 1.7,
    maxWidth: 480,
    marginBottom: 16,
  },

  // -- Date ------------------------------------------------------------------
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateLine: {
    width: 30,
    height: 1,
    backgroundColor: COLORS.goldDark,
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.textMuted,
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  // -- Signature area --------------------------------------------------------
  signatureArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 4,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 220,
  },
  signatureImage: {
    height: 40,
    maxWidth: 120,
    objectFit: 'contain' as const,
    marginBottom: 4,
  },
  signatureLine: {
    width: 180,
    height: 1,
    backgroundColor: COLORS.navy,
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    marginBottom: 2,
  },
  signatureTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.textSecondary,
  },
  signatureOrg: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.textMuted,
    marginTop: 1,
  },

  // -- Certificate ID --------------------------------------------------------
  certificateIdContainer: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  certificateId: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

/**
 * Decorative corner element with nested L-shapes.
 */
function CornerDecoration({
  position,
}: {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) {
  const positionStyles = {
    topLeft: styles.cornerTopLeft,
    topRight: styles.cornerTopRight,
    bottomLeft: styles.cornerBottomLeft,
    bottomRight: styles.cornerBottomRight,
  };

  const outerStyles = {
    topLeft: styles.cornerOuterTL,
    topRight: styles.cornerOuterTR,
    bottomLeft: styles.cornerOuterBL,
    bottomRight: styles.cornerOuterBR,
  };

  const innerStyles = {
    topLeft: styles.cornerInnerTL,
    topRight: styles.cornerInnerTR,
    bottomLeft: styles.cornerInnerBL,
    bottomRight: styles.cornerInnerBR,
  };

  return (
    <View style={positionStyles[position]}>
      <View style={[styles.cornerOuter, outerStyles[position]]} />
      <View style={[styles.cornerInner, innerStyles[position]]} />
    </View>
  );
}

/**
 * Decorative divider between title and subtitle with dot in center.
 */
function TitleDivider() {
  return (
    <View style={styles.titleDividerRow}>
      <View style={styles.titleDividerLine} />
      <View style={styles.titleDividerDot} />
      <View style={styles.titleDividerLine} />
    </View>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

/**
 * Certificate PDF Component
 *
 * Renders an elegant landscape certificate suitable for course completions,
 * professional achievements, awards, and formal recognitions.
 *
 * Features:
 * - Landscape A4 orientation with cream background
 * - Decorative double-border frame (navy outer, gold inner)
 * - Ornamental corner decorations with nested L-shapes
 * - Gold accent lines and diamond ornament
 * - Distinguished title with decorative divider
 * - Prominent recipient name in italic bold styling
 * - Signature area with optional signature image
 * - Optional organization logo in corner
 * - Certificate ID / serial number
 *
 * Color scheme: navy (#1a1a2e), gold (#c9a84c), cream (#faf8f0)
 */
export function Certificate({
  recipientName,
  title = 'Certificate of Completion',
  subtitle,
  description,
  date,
  issuerName,
  issuerTitle,
  issuerOrganization,
  certificateId,
  logoSrc,
  signatureSrc,
}: CertificateProps) {
  // Split title into main word ("CERTIFICATE") and rest ("OF COMPLETION")
  // if it starts with "Certificate"
  const titleUpper = title.toUpperCase();
  let mainWord = titleUpper;
  let restWords = '';
  if (titleUpper.startsWith('CERTIFICATE')) {
    mainWord = 'CERTIFICATE';
    restWords = titleUpper.slice('CERTIFICATE'.length).trim();
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ── Decorative frame ─────────────────────────────────────── */}
        <View style={styles.outerBorder} />
        <View style={styles.innerBorder} />

        {/* ── Corner decorations ───────────────────────────────────── */}
        <CornerDecoration position="topLeft" />
        <CornerDecoration position="topRight" />
        <CornerDecoration position="bottomLeft" />
        <CornerDecoration position="bottomRight" />

        {/* ── Gold accent lines ────────────────────────────────────── */}
        <View style={styles.topAccent} />
        <View style={styles.bottomAccent} />

        {/* ── Diamond ornament at top center ───────────────────────── */}
        <View style={styles.diamondContainer}>
          <View style={styles.diamond} />
        </View>

        {/* ── Organization logo (optional, top-left) ───────────────── */}
        {logoSrc && (
          <View style={styles.logoContainer}>
            <Image src={logoSrc} style={styles.logo} />
          </View>
        )}

        {/* ── Main content ─────────────────────────────────────────── */}
        <View style={styles.content}>
          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>{mainWord}</Text>
            <TitleDivider />
            {restWords ? (
              <Text style={styles.subtitleText}>{restWords}</Text>
            ) : null}
          </View>

          {/* Course / program subtitle */}
          {subtitle && (
            <Text style={styles.subtitleText}>{subtitle.toUpperCase()}</Text>
          )}

          {/* Preamble */}
          <Text style={styles.preamble}>This is to certify that</Text>

          {/* Recipient name */}
          <Text style={styles.recipientName}>{recipientName}</Text>
          <View style={styles.recipientUnderline} />

          {/* Achievement description */}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          {/* Date */}
          <View style={styles.dateRow}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{date}</Text>
            <View style={styles.dateLine} />
          </View>

          {/* Signature area */}
          <View style={styles.signatureArea}>
            <View style={styles.signatureBlock}>
              {signatureSrc && (
                <Image src={signatureSrc} style={styles.signatureImage} />
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{issuerName}</Text>
              {issuerTitle && (
                <Text style={styles.signatureTitle}>{issuerTitle}</Text>
              )}
              {issuerOrganization && (
                <Text style={styles.signatureOrg}>{issuerOrganization}</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Certificate ID at bottom ─────────────────────────────── */}
        {certificateId && (
          <View style={styles.certificateIdContainer}>
            <Text style={styles.certificateId}>
              ID: {certificateId}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export default Certificate;
