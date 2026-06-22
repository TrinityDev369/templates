/**
 * EmailLayout — the base shell every Trinity Mail template renders inside
 * (vendored, standalone).
 *
 * Responsibilities:
 *  - `<Head>` loads the brand web fonts (JetBrains Mono / IBM Plex Sans) with
 *    graceful system fallbacks.
 *  - `preheader` renders BOTH the client preview text (`<Preview>`) and a
 *    visually-hidden span, so inbox previews show intentional copy instead of
 *    leaking the first body line.
 *  - Wraps header + content + footer in an email-safe 600px container.
 *
 * Ported in structure from `packages/design-system/src/email`, de-`@trinity`-ified.
 */
import * as React from 'react';
import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Preview,
  Section,
} from '@react-email/components';
import {
  emailColors,
  emailFonts,
  emailSpacing,
  emailBorderRadius,
  emailWebFonts,
} from '../theme';
import { EmailHeader, type EmailHeaderProps } from './header';
import { EmailFooter, type EmailFooterProps } from './footer';
import { type Locale, DEFAULT_LOCALE } from '../i18n';

export interface EmailLayoutProps {
  /** Hidden inbox preview text (shown next to the subject in most clients). */
  preheader: string;
  /** Document language attribute + locale passed to header/footer. */
  locale?: Locale;
  /** Header brand options (logo URL, brand name). */
  header?: EmailHeaderProps;
  /** Footer brand facts (company, address, links, unsubscribe). */
  footer?: EmailFooterProps;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  preheader,
  locale = DEFAULT_LOCALE,
  header,
  footer,
  children,
}) => (
  <Html lang={locale}>
    <Head>
      <Font
        fontFamily="JetBrains Mono"
        fallbackFontFamily="monospace"
        webFont={{ url: emailWebFonts.headingWoff2, format: 'woff2' }}
        fontWeight={700}
        fontStyle="normal"
      />
      <Font
        fontFamily="IBM Plex Sans"
        fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
        webFont={{ url: emailWebFonts.bodyWoff2, format: 'woff2' }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="IBM Plex Sans"
        fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
        webFont={{ url: emailWebFonts.bodySemiBoldWoff2, format: 'woff2' }}
        fontWeight={600}
        fontStyle="normal"
      />
    </Head>
    <Preview>{preheader}</Preview>
    <Body style={styles.body}>
      {/* Visually-hidden preheader span — belt-and-braces with <Preview>. */}
      <div style={styles.hiddenPreheader}>{preheader}</div>
      <Container style={styles.container}>
        <EmailHeader {...header} />
        <Section style={styles.content}>{children}</Section>
        <EmailFooter locale={locale} {...footer} />
      </Container>
    </Body>
  </Html>
);

const styles = {
  body: {
    backgroundColor: emailColors.background,
    fontFamily: emailFonts.sans,
    margin: 0,
    padding: `${emailSpacing.lg} 0`,
  },
  hiddenPreheader: {
    display: 'none',
    overflow: 'hidden',
    lineHeight: '1px',
    opacity: 0,
    maxHeight: 0,
    maxWidth: 0,
    fontSize: '1px',
    color: emailColors.background,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: emailColors.surface,
    borderRadius: emailBorderRadius.lg,
  },
  content: {
    padding: `${emailSpacing.sm} ${emailSpacing.lg} ${emailSpacing.lg}`,
  },
};
