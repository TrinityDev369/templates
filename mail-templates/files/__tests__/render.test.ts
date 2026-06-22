import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { renderEmail } from '../render';
import { emailColors } from '../theme';
import { VerifyEmail } from '../templates/verify-email';
import { PasswordReset } from '../templates/password-reset';
import { MagicLink } from '../templates/magic-link';
import { Welcome } from '../templates/welcome';
import { Receipt } from '../templates/receipt';
import { GenericNotification } from '../templates/generic-notification';

/** A brand token we expect to find in every rendered HTML body. */
const BRAND_TOKEN = emailColors.trinity; // '#3369B6'

const cases: Array<{ name: string; element: React.ReactElement }> = [
  {
    name: 'VerifyEmail',
    element: React.createElement(VerifyEmail, {
      userName: 'Antonia',
      verifyUrl: 'https://example.com/verify?t=abc',
      expiresIn: '24 Stunden',
    }),
  },
  {
    name: 'PasswordReset',
    element: React.createElement(PasswordReset, {
      userName: 'Antonia',
      resetUrl: 'https://example.com/reset?t=abc',
      expiresIn: '1 Stunde',
    }),
  },
  {
    name: 'MagicLink',
    element: React.createElement(MagicLink, {
      userName: 'Antonia',
      loginUrl: 'https://example.com/login?t=abc',
      code: '482913',
      expiresIn: '10 Minuten',
    }),
  },
  {
    name: 'Welcome',
    element: React.createElement(Welcome, {
      userName: 'Antonia',
      ctaUrl: 'https://example.com/start',
      brandName: 'Ozean Licht',
    }),
  },
  {
    name: 'Receipt',
    element: React.createElement(Receipt, {
      customerName: 'Antonia',
      orderNumber: 'OL-2026-0001',
      date: '21.06.2026',
      items: [
        { label: 'Meditation Pass', amount: '€ 49,00' },
        { label: 'Versand', amount: '€ 0,00' },
      ],
      total: '€ 49,00',
      viewUrl: 'https://example.com/receipt/OL-2026-0001',
    }),
  },
  {
    name: 'GenericNotification',
    element: React.createElement(GenericNotification, {
      preheader: 'Es gibt Neuigkeiten zu deinem Konto.',
      title: 'Kurze Info',
      paragraphs: ['Wir haben deine Einstellungen aktualisiert.', 'Danke für deine Geduld.'],
      ctaLabel: 'Konto öffnen',
      ctaUrl: 'https://example.com/account',
      footnote: 'Diese E-Mail wurde automatisch versendet.',
    }),
  },
];

describe('renderEmail — six templates emit multipart HTML + text', () => {
  for (const { name, element } of cases) {
    it(`${name}: html non-empty, contains brand token, text non-empty`, async () => {
      const { html, text } = await renderEmail(element);

      // HTML present and substantial
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(100);

      // Contains a key brand token (the primary Trinity blue)
      expect(html).toContain(BRAND_TOKEN);

      // Plain-text alternative present and non-empty
      expect(typeof text).toBe('string');
      expect(text.trim().length).toBeGreaterThan(0);

      // Text part is genuinely a plaintext alternative (no leftover tags)
      expect(text).not.toContain('<html');
      expect(text).not.toContain('<table');
    });
  }

  it('VerifyEmail renders English when locale=en', async () => {
    const { html } = await renderEmail(
      React.createElement(VerifyEmail, {
        userName: 'Antonia',
        verifyUrl: 'https://example.com/verify',
        locale: 'en',
      }),
    );
    expect(html).toContain('Confirm your email');
  });

  it('VerifyEmail renders German by default', async () => {
    const { text } = await renderEmail(
      React.createElement(VerifyEmail, {
        userName: 'Antonia',
        verifyUrl: 'https://example.com/verify',
      }),
    );
    expect(text).toContain('bestätigen');
  });
});
