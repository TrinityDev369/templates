# Trinity Mail — `mail-templates`

Branded, German-first React Email templates for the shared Trinity Mail relay.
You render a component to `{ html, text }`; `mail-client` sends both parts. Fully
self-contained — vendored brand theme, no `@trinity/*` imports, no service
binding.

```ts
import { renderEmail, VerifyEmail } from './emails';
import { createMailClient } from './mail'; // from the mail-client template

const { html, text } = await renderEmail(
  <VerifyEmail
    userName="Antonia"
    verifyUrl="https://app.example.com/verify?t=abc"
    expiresIn="24 Stunden"
    brandName="Ozean Licht"
  />,
);

await mail.send({
  to: 'member@example.com',
  subject: 'Bestätige deine E-Mail',
  html,
  text,                 // plaintext alternative — always sent alongside HTML
  category: 'auth',
});
```

## What you get

| Concern | How |
| --- | --- |
| **Multipart by default** | `renderEmail()` renders twice — HTML **and** a plain-text alternative — the exact `{ html, text }` shape `mail-client.send` consumes |
| **German-first i18n** | every template defaults to `de`; pass `locale="en"` for the English fallback. Tiny built-in helper (`i18n.ts`), no library |
| **Preheader** | `EmailLayout` renders intentional inbox preview text (via `<Preview>` + a hidden span) so previews never leak the first body line |
| **Brand-consistent** | vendored 369-Dichte blues, JetBrains Mono headings, IBM Plex Sans body — HEX values copied from the Trinity design-system |
| **Standalone** | no `@trinity/*` imports; one rendering peer dep (`@react-email/components`) + `react` |

## Templates

| Component | Key props | Use |
| --- | --- | --- |
| `VerifyEmail` | `userName`, `verifyUrl`, `expiresIn?` | confirm a new email address |
| `PasswordReset` | `userName`, `resetUrl`, `expiresIn?` | reset-password link |
| `MagicLink` | `userName`, `loginUrl`, `code?`, `expiresIn?` | passwordless sign-in |
| `Welcome` | `userName`, `ctaUrl?`, `brandName?` | onboarding after sign-up |
| `Receipt` | `customerName`, `orderNumber`, `date`, `items[]`, `total`, `viewUrl?` | payment / order confirmation |
| `GenericNotification` | `preheader`, `title`, `paragraphs[]`, `ctaLabel?`, `ctaUrl?` | flexible one-off notice |

Each template takes `locale?: 'de' | 'en'` (default `de`) and `brandName?` to
brand the header/footer wordmark and footer company line.

## Components

`EmailLayout` (base shell with `preheader`, web-font head, header/footer slots) ·
`EmailHeader` (logo or text wordmark) · `EmailFooter` (company, address, links,
RFC-8058 unsubscribe) · `EmailButton` · `EmailDivider`. Theme tokens live in
`theme.ts`; shared text/section styles in `components/styles.ts`.

## Tone (doctrine)

Copy follows the Trinity brand rule: **the human directs, the machine serves.**
Warm, simple, German-first. No "become one" / human-machine-fusion / merge
metaphors — the recipient is always in charge, we just do the work in the
background.

## Pairs with

`mail-client` (transport + outbox + plaintext autogen) · `mail-webhook`
(delivery events, suppression) · `mail-dns` (DNS) · `mail-tresor` (env contract).

## Tests

```bash
npx vitest run
```

Renders all six templates and asserts the HTML is non-empty, carries a brand
token, and the plain-text part is non-empty.
