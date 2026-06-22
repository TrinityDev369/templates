/**
 * VerifyEmail — confirm a new email address.
 * German-first, English fallback via i18n. Includes a preheader.
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { text, section } from '../components/styles';
import { type Locale, DEFAULT_LOCALE, translator, fill } from '../i18n';

export interface VerifyEmailProps {
  /** Recipient's display name. */
  userName: string;
  /** Absolute confirmation URL. */
  verifyUrl: string;
  /** Link validity window, e.g. "24 Stunden". Optional. */
  expiresIn?: string;
  locale?: Locale;
  /** Brand name for header/footer. */
  brandName?: string;
}

const dict = {
  preheader: {
    de: 'Bestätige deine E-Mail-Adresse, um loszulegen.',
    en: 'Confirm your email address to get started.',
  },
  heading: { de: 'E-Mail bestätigen', en: 'Confirm your email' },
  greeting: { de: 'Hallo {name},', en: 'Hi {name},' },
  intro: {
    de: 'schön, dass du dabei bist. Bitte bestätige deine E-Mail-Adresse, damit wir wissen, dass du es wirklich bist.',
    en: 'welcome aboard. Please confirm your email address so we know it is really you.',
  },
  cta: { de: 'E-Mail bestätigen', en: 'Confirm email' },
  expiry: {
    de: 'Dieser Link ist {expiresIn} gültig. Falls du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.',
    en: 'This link is valid for {expiresIn}. If you did not sign up, you can safely ignore this email.',
  },
  noExpiry: {
    de: 'Falls du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.',
    en: 'If you did not sign up, you can safely ignore this email.',
  },
} as const;

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  userName,
  verifyUrl,
  expiresIn,
  locale = DEFAULT_LOCALE,
  brandName,
}) => {
  const tr = translator(dict, locale);
  return (
    <EmailLayout
      preheader={tr('preheader')}
      locale={locale}
      header={{ brandName }}
      footer={{ companyName: brandName }}
    >
      <Text style={text.heading}>{tr('heading')}</Text>
      <Text style={text.body}>{fill(tr('greeting'), { name: userName })}</Text>
      <Text style={text.body}>{tr('intro')}</Text>
      <Section style={section.button}>
        <EmailButton href={verifyUrl}>{tr('cta')}</EmailButton>
      </Section>
      <Text style={text.note}>
        {expiresIn ? fill(tr('expiry'), { expiresIn }) : tr('noExpiry')}
      </Text>
    </EmailLayout>
  );
};

export default VerifyEmail;
