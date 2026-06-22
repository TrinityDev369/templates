/**
 * EmailFooter — legal/footer band with optional one-click unsubscribe
 * (vendored, standalone). Ported from the Trinity design-system email
 * components, de-`@trinity`-ified. Tenant brand facts are props, not constants,
 * so each project supplies its own company/address/links.
 */
import * as React from 'react';
import { Hr, Link, Section, Text } from '@react-email/components';
import { emailColors, emailFonts, emailSpacing } from '../theme';
import { type Locale, DEFAULT_LOCALE, t } from '../i18n';

export interface EmailFooterProps {
  /** Legal entity name shown first. */
  companyName?: string;
  /** Postal address line. */
  address?: string;
  /** Public website URL. */
  websiteUrl?: string;
  /** Contact mailbox (rendered as a mailto link). */
  contactEmail?: string;
  /** RFC 8058 one-click unsubscribe URL (bulk sends only). */
  unsubscribeUrl?: string;
  locale?: Locale;
}

const footerDict = {
  website: { de: 'Website', en: 'Website' },
  contact: { de: 'Kontakt', en: 'Contact' },
  unsubscribe: { de: 'Abmelden', en: 'Unsubscribe' },
} as const;

export const EmailFooter: React.FC<EmailFooterProps> = ({
  companyName = 'Trinity',
  address,
  websiteUrl,
  contactEmail,
  unsubscribeUrl,
  locale = DEFAULT_LOCALE,
}) => (
  <Section style={styles.wrapper}>
    <Hr style={styles.divider} />
    <Text style={styles.company}>{companyName}</Text>
    {address ? <Text style={styles.address}>{address}</Text> : null}
    <Text style={styles.links}>
      {websiteUrl ? (
        <Link href={websiteUrl} style={styles.link}>
          {t(footerDict, 'website', locale)}
        </Link>
      ) : null}
      {websiteUrl && contactEmail ? ' · ' : null}
      {contactEmail ? (
        <Link href={`mailto:${contactEmail}`} style={styles.link}>
          {t(footerDict, 'contact', locale)}
        </Link>
      ) : null}
      {unsubscribeUrl ? (
        <>
          {(websiteUrl || contactEmail) ? ' · ' : null}
          <Link href={unsubscribeUrl} style={styles.link}>
            {t(footerDict, 'unsubscribe', locale)}
          </Link>
        </>
      ) : null}
    </Text>
  </Section>
);

const styles = {
  wrapper: {
    padding: `0 ${emailSpacing.lg} ${emailSpacing.lg}`,
    textAlign: 'center' as const,
  },
  divider: {
    borderColor: emailColors.border,
    marginBottom: emailSpacing.md,
  },
  company: {
    fontFamily: emailFonts.sans,
    fontSize: '13px',
    color: emailColors.muted,
    margin: '0',
  },
  address: {
    fontFamily: emailFonts.sans,
    fontSize: '12px',
    color: emailColors.muted,
    margin: `${emailSpacing.xs} 0`,
  },
  links: {
    fontFamily: emailFonts.sans,
    fontSize: '12px',
    color: emailColors.muted,
    margin: `${emailSpacing.sm} 0 0`,
  },
  link: {
    color: emailColors.trinity,
    textDecoration: 'underline',
  },
};
