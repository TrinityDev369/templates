/**
 * MagicLink — passwordless sign-in link (optionally with a numeric code).
 * German-first, English fallback via i18n. Includes a preheader.
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { text, section } from '../components/styles';
import { type Locale, DEFAULT_LOCALE, translator, fill } from '../i18n';

export interface MagicLinkProps {
  /** Recipient's display name. */
  userName: string;
  /** Absolute sign-in URL. */
  loginUrl: string;
  /** Optional one-time code shown for manual entry. */
  code?: string;
  /** Link validity window, e.g. "10 Minuten". Optional. */
  expiresIn?: string;
  locale?: Locale;
  brandName?: string;
}

const dict = {
  preheader: {
    de: 'Dein Anmelde-Link wartet — ein Klick genügt.',
    en: 'Your sign-in link is ready — one click is all it takes.',
  },
  heading: { de: 'Anmelden', en: 'Sign in' },
  greeting: { de: 'Hallo {name},', en: 'Hi {name},' },
  intro: {
    de: 'mit diesem Link meldest du dich ohne Passwort an.',
    en: 'use this link to sign in without a password.',
  },
  cta: { de: 'Jetzt anmelden', en: 'Sign in now' },
  codeLabel: {
    de: 'Oder gib diesen Code ein:',
    en: 'Or enter this code:',
  },
  expiry: {
    de: 'Der Link ist {expiresIn} gültig.',
    en: 'The link is valid for {expiresIn}.',
  },
  safety: {
    de: 'Wenn du das nicht warst, ignoriere diese E-Mail einfach.',
    en: 'If this was not you, just ignore this email.',
  },
} as const;

export const MagicLink: React.FC<MagicLinkProps> = ({
  userName,
  loginUrl,
  code,
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
        <EmailButton href={loginUrl}>{tr('cta')}</EmailButton>
      </Section>
      {code ? (
        <Section style={section.codeBox}>
          <Text style={text.note}>{tr('codeLabel')}</Text>
          <Text style={text.code}>{code}</Text>
        </Section>
      ) : null}
      {expiresIn ? (
        <Text style={text.body}>{fill(tr('expiry'), { expiresIn })}</Text>
      ) : null}
      <Text style={text.note}>{tr('safety')}</Text>
    </EmailLayout>
  );
};

export default MagicLink;
