/**
 * PasswordReset — reset-password link email.
 * German-first, English fallback via i18n. Includes a preheader.
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { text, section } from '../components/styles';
import { type Locale, DEFAULT_LOCALE, translator, fill } from '../i18n';

export interface PasswordResetProps {
  /** Recipient's display name. */
  userName: string;
  /** Absolute reset URL. */
  resetUrl: string;
  /** Link validity window, e.g. "1 Stunde". Optional. */
  expiresIn?: string;
  locale?: Locale;
  brandName?: string;
}

const dict = {
  preheader: {
    de: 'Setze dein Passwort zurück — der Link ist nur kurz gültig.',
    en: 'Reset your password — the link is valid for a short time.',
  },
  heading: { de: 'Passwort zurücksetzen', en: 'Reset your password' },
  greeting: { de: 'Hallo {name},', en: 'Hi {name},' },
  intro: {
    de: 'du hast angefragt, dein Passwort zurückzusetzen. Klicke auf den Button, um ein neues Passwort zu vergeben.',
    en: 'you asked to reset your password. Click the button below to set a new one.',
  },
  cta: { de: 'Neues Passwort wählen', en: 'Choose a new password' },
  expiry: {
    de: 'Dieser Link ist {expiresIn} gültig.',
    en: 'This link is valid for {expiresIn}.',
  },
  safety: {
    de: 'Hast du das nicht angefragt? Dann ignoriere diese E-Mail — dein Passwort bleibt unverändert.',
    en: 'Did you not request this? Just ignore this email — your password stays unchanged.',
  },
} as const;

export const PasswordReset: React.FC<PasswordResetProps> = ({
  userName,
  resetUrl,
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
        <EmailButton href={resetUrl}>{tr('cta')}</EmailButton>
      </Section>
      {expiresIn ? (
        <Text style={text.body}>{fill(tr('expiry'), { expiresIn })}</Text>
      ) : null}
      <Text style={text.note}>{tr('safety')}</Text>
    </EmailLayout>
  );
};

export default PasswordReset;
