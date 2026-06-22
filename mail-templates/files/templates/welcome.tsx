/**
 * Welcome — friendly onboarding email after sign-up.
 * German-first, English fallback via i18n. Includes a preheader.
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { text, section } from '../components/styles';
import { type Locale, DEFAULT_LOCALE, translator, fill } from '../i18n';

export interface WelcomeProps {
  /** Recipient's display name. */
  userName: string;
  /** Optional "get started" URL — renders a CTA when present. */
  ctaUrl?: string;
  /** Optional brand/product name woven into the copy + header/footer. */
  brandName?: string;
  locale?: Locale;
}

const dict = {
  preheader: {
    de: 'Willkommen — schön, dass du da bist.',
    en: 'Welcome — we are glad you are here.',
  },
  heading: { de: 'Willkommen{brand}', en: 'Welcome{brand}' },
  greeting: { de: 'Hallo {name},', en: 'Hi {name},' },
  intro: {
    de: 'dein Konto ist startklar. Wir helfen dir, schnell ans Ziel zu kommen — in deinem Tempo.',
    en: 'your account is ready. We are here to help you get where you want to go — at your own pace.',
  },
  body: {
    de: 'Du bestimmst, was passiert; wir kümmern uns um den Rest im Hintergrund. Sag einfach Bescheid, wenn du etwas brauchst.',
    en: 'You decide what happens; we take care of the rest in the background. Just let us know if you need anything.',
  },
  cta: { de: 'Loslegen', en: 'Get started' },
  signoff: {
    de: 'Wir freuen uns auf dich.',
    en: 'We look forward to having you.',
  },
} as const;

export const Welcome: React.FC<WelcomeProps> = ({
  userName,
  ctaUrl,
  brandName,
  locale = DEFAULT_LOCALE,
}) => {
  const tr = translator(dict, locale);
  const brandSuffix = brandName ? ` bei ${brandName}` : '';
  const brandSuffixEn = brandName ? ` to ${brandName}` : '';
  const heading = fill(tr('heading'), {
    brand: locale === 'en' ? brandSuffixEn : brandSuffix,
  });
  return (
    <EmailLayout
      preheader={tr('preheader')}
      locale={locale}
      header={{ brandName }}
      footer={{ companyName: brandName }}
    >
      <Text style={text.heading}>{heading}</Text>
      <Text style={text.body}>{fill(tr('greeting'), { name: userName })}</Text>
      <Text style={text.body}>{tr('intro')}</Text>
      <Text style={text.body}>{tr('body')}</Text>
      {ctaUrl ? (
        <Section style={section.button}>
          <EmailButton href={ctaUrl}>{tr('cta')}</EmailButton>
        </Section>
      ) : null}
      <Text style={text.note}>{tr('signoff')}</Text>
    </EmailLayout>
  );
};

export default Welcome;
