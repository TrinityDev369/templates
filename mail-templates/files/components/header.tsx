/**
 * EmailHeader — wordmark band at the top of every email (vendored, standalone)
 *
 * Renders the brand logo when `logoUrl` is supplied; otherwise falls back to a
 * text wordmark so the email is self-contained even before assets are hosted.
 * Ported from the Trinity design-system email components, de-`@trinity`-ified.
 */
import * as React from 'react';
import { Img, Section, Text } from '@react-email/components';
import { emailColors, emailFonts, emailSpacing } from '../theme';

export interface EmailHeaderProps {
  /** Absolute URL to a hosted logo. Omit to render the text wordmark. */
  logoUrl?: string;
  /** Brand name shown as the text wordmark / logo alt. */
  brandName?: string;
}

export const EmailHeader: React.FC<EmailHeaderProps> = ({
  logoUrl,
  brandName = 'Trinity',
}) => (
  <Section style={styles.wrapper}>
    {logoUrl ? (
      <Img src={logoUrl} width="140" height="40" alt={brandName} style={styles.logo} />
    ) : (
      <Text style={styles.wordmark}>{brandName}</Text>
    )}
  </Section>
);

const styles = {
  wrapper: {
    padding: `${emailSpacing.lg} ${emailSpacing.lg} 0`,
    textAlign: 'center' as const,
  },
  logo: {
    margin: '0 auto',
  },
  wordmark: {
    fontFamily: emailFonts.heading,
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: emailColors.trinityDark,
    margin: 0,
  },
};
