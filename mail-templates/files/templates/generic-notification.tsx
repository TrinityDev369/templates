/**
 * GenericNotification — flexible fallback for one-off transactional notices.
 * Title + paragraphs + optional CTA. German-first, English fallback via i18n
 * for the chrome; the body copy itself is caller-supplied (already localised).
 * Includes a preheader.
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { text, section } from '../components/styles';
import { type Locale, DEFAULT_LOCALE, translator } from '../i18n';

export interface GenericNotificationProps {
  /** Hidden inbox preview text. */
  preheader: string;
  /** Headline shown at the top of the body. */
  title: string;
  /** One or more body paragraphs (caller-supplied, already localised). */
  paragraphs: string[];
  /** Optional call-to-action button label. */
  ctaLabel?: string;
  /** Optional call-to-action URL (required if `ctaLabel` is set). */
  ctaUrl?: string;
  /** Optional small footnote under the body. */
  footnote?: string;
  locale?: Locale;
  brandName?: string;
}

const dict = {
  defaultCta: { de: 'Ansehen', en: 'View' },
} as const;

export const GenericNotification: React.FC<GenericNotificationProps> = ({
  preheader,
  title,
  paragraphs,
  ctaLabel,
  ctaUrl,
  footnote,
  locale = DEFAULT_LOCALE,
  brandName,
}) => {
  const tr = translator(dict, locale);
  return (
    <EmailLayout
      preheader={preheader}
      locale={locale}
      header={{ brandName }}
      footer={{ companyName: brandName }}
    >
      <Text style={text.heading}>{title}</Text>
      {paragraphs.map((p, i) => (
        <Text key={i} style={text.body}>
          {p}
        </Text>
      ))}
      {ctaUrl ? (
        <Section style={section.button}>
          <EmailButton href={ctaUrl}>{ctaLabel ?? tr('defaultCta')}</EmailButton>
        </Section>
      ) : null}
      {footnote ? <Text style={text.note}>{footnote}</Text> : null}
    </EmailLayout>
  );
};

export default GenericNotification;
