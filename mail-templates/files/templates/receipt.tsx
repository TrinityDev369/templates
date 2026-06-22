/**
 * Receipt — payment / order confirmation with a line-item summary.
 * German-first, English fallback via i18n. Includes a preheader.
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../components/layout';
import { EmailButton } from '../components/button';
import { EmailDivider } from '../components/divider';
import { text, section } from '../components/styles';
import { type Locale, DEFAULT_LOCALE, translator, fill } from '../i18n';

export interface ReceiptLineItem {
  /** Human-readable item description. */
  label: string;
  /** Pre-formatted amount string incl. currency, e.g. "€ 49,00". */
  amount: string;
}

export interface ReceiptProps {
  /** Recipient's display name. */
  customerName: string;
  /** Order / invoice identifier. */
  orderNumber: string;
  /** Order date, pre-formatted for the locale. */
  date: string;
  /** Line items rendered as a list. */
  items: ReceiptLineItem[];
  /** Pre-formatted total incl. currency. */
  total: string;
  /** Optional URL to view the full invoice / order. */
  viewUrl?: string;
  locale?: Locale;
  brandName?: string;
}

const dict = {
  preheader: {
    de: 'Deine Zahlung ist bei uns angekommen — hier die Übersicht.',
    en: 'Your payment is in — here is your summary.',
  },
  heading: { de: 'Zahlungsbestätigung', en: 'Payment confirmation' },
  greeting: { de: 'Hallo {name},', en: 'Hi {name},' },
  intro: {
    de: 'vielen Dank für deine Zahlung. Hier ist deine Übersicht.',
    en: 'thank you for your payment. Here is your summary.',
  },
  orderLabel: { de: 'Bestellnummer', en: 'Order number' },
  dateLabel: { de: 'Datum', en: 'Date' },
  totalLabel: { de: 'Gesamt', en: 'Total' },
  cta: { de: 'Beleg ansehen', en: 'View receipt' },
  footnote: {
    de: 'Bewahre diese E-Mail als Beleg auf. Bei Fragen sind wir für dich da.',
    en: 'Keep this email as your receipt. If you have questions, we are here for you.',
  },
} as const;

export const Receipt: React.FC<ReceiptProps> = ({
  customerName,
  orderNumber,
  date,
  items,
  total,
  viewUrl,
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
      <Text style={text.body}>{fill(tr('greeting'), { name: customerName })}</Text>
      <Text style={text.body}>{tr('intro')}</Text>
      <Section style={section.detailsBox}>
        <Text style={text.detailRow}>
          <strong>{tr('orderLabel')}:</strong> {orderNumber}
        </Text>
        <Text style={text.detailRow}>
          <strong>{tr('dateLabel')}:</strong> {date}
        </Text>
        <EmailDivider style={{ margin: '12px 0' }} />
        {items.map((item, i) => (
          <Text key={i} style={text.detailRow}>
            {item.label} — <strong>{item.amount}</strong>
          </Text>
        ))}
        <EmailDivider style={{ margin: '12px 0' }} />
        <Text style={text.detailRow}>
          <strong>{tr('totalLabel')}: {total}</strong>
        </Text>
      </Section>
      {viewUrl ? (
        <Section style={section.button}>
          <EmailButton href={viewUrl}>{tr('cta')}</EmailButton>
        </Section>
      ) : null}
      <Text style={text.note}>{tr('footnote')}</Text>
    </EmailLayout>
  );
};

export default Receipt;
