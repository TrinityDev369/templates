---
name: i18n
description: Internationalization and localization skill — next-intl, message extraction, RTL support, date/number formatting, locale routing
---

# Internationalization & Localization

Guide for implementing i18n/l10n in Next.js applications. Covers library selection, message patterns, locale routing, RTL support, and translation workflows.

## i18n Architecture Decision

### Library Comparison

| Library | App Router | Type-safety | ICU Format | Bundle Size | Verdict |
|---------|-----------|-------------|------------|-------------|---------|
| **next-intl** | Native | Excellent | Yes | ~14kb | Recommended |
| react-intl | Partial | Good | Yes | ~25kb | Mature, heavier |
| i18next | Via adapter | Plugin-based | Via plugin | ~40kb+ | Overkill for Next.js |
| next-translate | Yes | Basic | No | ~5kb | Lightweight but limited |

### Decision Criteria

- **App Router support**: Must work with React Server Components, `generateMetadata`, and streaming
- **Type-safety**: Compile-time checks for translation keys prevent runtime missing-key errors
- **Message format**: ICU MessageFormat for plurals, selects, and rich text
- **DX**: Minimal boilerplate, intuitive API, good error messages

### Recommendation: next-intl

`next-intl` is the recommended choice for Next.js projects because:
1. First-class App Router and RSC support (no client boundary needed for `t()`)
2. Full TypeScript integration with autocomplete on translation keys
3. ICU MessageFormat for complex pluralization and gender-aware messages
4. Built-in formatters for dates, numbers, relative time, and lists
5. Middleware-based locale detection with cookie, header, and URL strategies
6. Active maintenance aligned with Next.js release cycle

## next-intl Setup

### Installation

```bash
pnpm add next-intl
```

### Configuration File

```typescript
// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming locale is supported
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### Routing Configuration

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'de', 'fr', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // No prefix for default locale
});

// Locale-aware navigation APIs
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

### Middleware

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API, static files, and assets
  matcher: ['/', '/(de|en|fr|ar)/:path*'],
};
```

### Message Files

```json
// messages/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "save": "Save",
    "cancel": "Cancel",
    "back": "Back"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact",
    "dashboard": "Dashboard"
  },
  "auth": {
    "login": "Log in",
    "logout": "Log out",
    "signup": "Sign up",
    "forgotPassword": "Forgot password?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome, {name}!",
    "items": "You have {count, plural, =0 {no items} one {# item} other {# items}}.",
    "lastLogin": "Last login: {date, date, medium}"
  }
}
```

```json
// messages/de.json
{
  "common": {
    "loading": "Wird geladen...",
    "error": "Etwas ist schiefgelaufen",
    "save": "Speichern",
    "cancel": "Abbrechen",
    "back": "Zurueck"
  },
  "nav": {
    "home": "Startseite",
    "about": "Ueber uns",
    "contact": "Kontakt",
    "dashboard": "Dashboard"
  },
  "auth": {
    "login": "Anmelden",
    "logout": "Abmelden",
    "signup": "Registrieren",
    "forgotPassword": "Passwort vergessen?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Willkommen, {name}!",
    "items": "Sie haben {count, plural, =0 {keine Eintraege} one {# Eintrag} other {# Eintraege}}.",
    "lastLogin": "Letzte Anmeldung: {date, date, medium}"
  }
}
```

### App Router Integration

```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch messages for client components
  const messages = await getMessages();

  // Set dir for RTL locales
  const dir = ['ar', 'he', 'fa'].includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Server Component Usage

```typescript
// src/app/[locale]/dashboard/page.tsx
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = useTranslations('dashboard');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('welcome', { name: 'Sergej' })}</p>
      <p>{t('items', { count: 42 })}</p>
    </main>
  );
}
```

### Client Component Usage

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function LoginButton() {
  const t = useTranslations('auth');

  return <button onClick={handleLogin}>{t('login')}</button>;
}
```

## Message Patterns

### Simple Strings

```typescript
const t = useTranslations('common');
t('loading');    // "Loading..."
t('save');       // "Save"
```

### Interpolation

```json
{ "welcome": "Welcome, {name}!" }
```

```typescript
t('welcome', { name: 'Sergej' }); // "Welcome, Sergej!"
```

### Plurals (ICU)

```json
{
  "items": "You have {count, plural, =0 {no items} one {# item} other {# items}}.",
  "messages": "{count, plural, =0 {No new messages} one {# new message} other {# new messages}}"
}
```

```typescript
t('items', { count: 0 });  // "You have no items."
t('items', { count: 1 });  // "You have 1 item."
t('items', { count: 5 });  // "You have 5 items."
```

### Rich Text / HTML

```json
{
  "terms": "By signing up, you agree to our <link>Terms of Service</link>.",
  "highlight": "This is <bold>important</bold> information."
}
```

```typescript
t.rich('terms', {
  link: (chunks) => <a href="/terms">{chunks}</a>,
});

t.rich('highlight', {
  bold: (chunks) => <strong>{chunks}</strong>,
});
```

### Nested Namespaces

```json
{
  "nav": {
    "home": "Home",
    "settings": {
      "profile": "Profile",
      "security": "Security"
    }
  }
}
```

```typescript
const t = useTranslations('nav');
t('home');                // "Home"
t('settings.profile');    // "Profile"

// Or scope deeper
const tSettings = useTranslations('nav.settings');
tSettings('profile');     // "Profile"
```

### Enum / Dynamic Keys

```json
{
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "pending": "Pending review"
  }
}
```

```typescript
type Status = 'active' | 'inactive' | 'pending';

function StatusBadge({ status }: { status: Status }) {
  const t = useTranslations('status');
  return <span>{t(status)}</span>;
}
```

### Select (Gender-Aware)

```json
{
  "invitation": "{gender, select, male {He invited you} female {She invited you} other {They invited you}} to the project."
}
```

```typescript
t('invitation', { gender: 'female' }); // "She invited you to the project."
```

## Date, Time & Number Formatting

### useFormatter Hook

```typescript
'use client';

import { useFormatter } from 'next-intl';

export function FormattedContent() {
  const format = useFormatter();
  const now = new Date();

  return (
    <div>
      {/* Date formatting */}
      <p>{format.dateTime(now, { dateStyle: 'full' })}</p>
      {/* en: "Wednesday, February 19, 2026" */}
      {/* de: "Mittwoch, 19. Februar 2026" */}

      <p>{format.dateTime(now, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      {/* en: "February 19, 2026" */}

      <p>{format.dateTime(now, { hour: 'numeric', minute: '2-digit', hour12: false })}</p>
      {/* de: "14:30" */}

      {/* Number formatting */}
      <p>{format.number(1234567.89, { style: 'decimal' })}</p>
      {/* en: "1,234,567.89"  de: "1.234.567,89" */}

      {/* Currency */}
      <p>{format.number(4999.99, { style: 'currency', currency: 'EUR' })}</p>
      {/* en: "EUR 4,999.99"  de: "4.999,99 EUR" */}

      <p>{format.number(4999.99, { style: 'currency', currency: 'USD' })}</p>
      {/* en: "$4,999.99" */}

      {/* Percentages */}
      <p>{format.number(0.847, { style: 'percent', maximumFractionDigits: 1 })}</p>
      {/* en: "84.7%" */}

      {/* Relative time */}
      <p>{format.relativeTime(now)}</p>
      {/* "just now", "2 hours ago", "in 3 days" */}

      <p>{format.relativeTime(new Date(2026, 1, 15), now)}</p>
      {/* "4 days ago" */}

      {/* List formatting */}
      <p>{format.list(['Alice', 'Bob', 'Charlie'], { type: 'conjunction' })}</p>
      {/* en: "Alice, Bob, and Charlie" */}
      {/* de: "Alice, Bob und Charlie" */}

      <p>{format.list(['React', 'Vue'], { type: 'disjunction' })}</p>
      {/* en: "React or Vue" */}
    </div>
  );
}
```

### Server-Side Formatting

```typescript
// In server components or API routes
import { getFormatter } from 'next-intl/server';

export default async function InvoicePage() {
  const format = await getFormatter();

  const amount = format.number(15000, {
    style: 'currency',
    currency: 'EUR',
  });

  const date = format.dateTime(new Date(), {
    dateStyle: 'long',
  });

  return (
    <div>
      <p>Amount: {amount}</p>
      <p>Date: {date}</p>
    </div>
  );
}
```

## Locale Routing

### Middleware-Based Detection

The middleware detects the user locale in this priority order:

1. **URL prefix**: `/de/about` explicitly sets German
2. **Cookie**: `NEXT_LOCALE` cookie from previous selection
3. **Accept-Language header**: Browser preference negotiation
4. **Default locale**: Falls back to `en`

### Locale Switcher Component

```typescript
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

const localeNames: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Francais',
  ar: 'Arabic',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <select value={locale} onChange={onSelectChange} aria-label="Select language">
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
```

### Locale-Aware Links

```typescript
// Always use the locale-aware Link from your routing config
import { Link } from '@/i18n/routing';

// Automatically prefixes with current locale
<Link href="/about">About</Link>
// Renders: /de/about (when locale is de)

// Explicit locale override
<Link href="/about" locale="fr">A propos</Link>
// Renders: /fr/about
```

### Static Generation with All Locales

```typescript
// src/app/[locale]/about/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // ...page content
}
```

## RTL Support

### HTML Direction Attribute

Set `dir` on the `<html>` element in your locale layout (shown in the setup section above). This is the foundation for all RTL behavior.

### Tailwind RTL Plugin

```bash
pnpm add tailwindcss-rtl
```

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import rtlPlugin from 'tailwindcss-rtl';

export default {
  plugins: [rtlPlugin],
} satisfies Config;
```

Usage with `rtl:` and `ltr:` variants:

```html
<!-- Padding that adapts to text direction -->
<div class="ps-4 pe-2">
  <!-- ps = padding-inline-start, pe = padding-inline-end -->
</div>

<!-- Direction-specific overrides -->
<div class="ltr:pl-4 rtl:pr-4">
  <!-- Explicit LTR/RTL control -->
</div>
```

### Logical Properties (Preferred)

Always prefer CSS logical properties over physical ones:

| Physical (avoid) | Logical (prefer) | Tailwind |
|-------------------|-------------------|----------|
| `margin-left` | `margin-inline-start` | `ms-4` |
| `margin-right` | `margin-inline-end` | `me-4` |
| `padding-left` | `padding-inline-start` | `ps-4` |
| `padding-right` | `padding-inline-end` | `pe-4` |
| `text-align: left` | `text-align: start` | `text-start` |
| `text-align: right` | `text-align: end` | `text-end` |
| `float: left` | `float: inline-start` | `float-start` |
| `border-left` | `border-inline-start` | `border-s` |

### Common RTL Pitfalls

1. **Icons with directional meaning**: Arrows, chevrons, and navigation icons must flip.
   ```html
   <ChevronRight className="rtl:rotate-180" />
   ```

2. **Box shadows**: Shadows that cast to the right in LTR should cast left in RTL.
   ```html
   <div class="ltr:shadow-[4px_0_8px_rgba(0,0,0,0.1)] rtl:shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
   ```

3. **Border radius on specific corners**: Use logical corner properties.
   ```html
   <!-- Instead of rounded-tl-lg, use start/end variants -->
   <div class="rounded-ss-lg rounded-es-lg">
   ```

4. **Absolute positioning**: Replace `left`/`right` with `inset-inline-start`/`inset-inline-end`.
   ```html
   <div class="absolute inset-inline-start-0 top-0">
   ```

5. **Transforms and transitions**: `translateX` values need negation in RTL.
   ```html
   <div class="ltr:translate-x-4 rtl:-translate-x-4">
   ```

## Translation Workflow

### JSON Message File Structure

```
messages/
  en.json          # Source of truth (English)
  de.json          # German
  fr.json          # French
  ar.json          # Arabic (RTL)
```

### Key Naming Conventions

- **Dot-separated namespaces**: `dashboard.settings.title`
- **snake_case for compound keys**: `forgot_password`, `sign_up`
- **Group by feature/page**: `auth.*`, `dashboard.*`, `settings.*`
- **Shared keys in `common`**: `common.save`, `common.cancel`, `common.error`
- **Avoid positional names**: Use `greeting` not `header_text_1`

```json
{
  "common": { "save": "Save", "cancel": "Cancel" },
  "auth": {
    "login": "Log in",
    "errors": {
      "invalid_credentials": "Invalid email or password",
      "account_locked": "Account locked. Try again in {minutes} minutes."
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "stats": {
      "total_users": "Total users",
      "active_sessions": "Active sessions"
    }
  }
}
```

### Missing Translation Handling

```typescript
// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    onError(error) {
      if (error.code === 'MISSING_MESSAGE') {
        // Log missing translations in development
        console.warn(`Missing translation: ${error.message}`);
      } else {
        // Re-throw other errors
        throw error;
      }
    },
    getMessageFallback({ namespace, key }) {
      // Show key path as fallback instead of empty string
      return `${namespace}.${key}`;
    },
  };
});
```

### Type-Safe Messages with TypeScript

```typescript
// src/types/next-intl.d.ts
import en from '../../messages/en.json';

type Messages = typeof en;

declare global {
  // Use type-safe message keys
  interface IntlMessages extends Messages {}
}
```

With this declaration, `useTranslations()` provides autocomplete for all translation keys and flags invalid keys at compile time.

### CI Check for Missing Translations

```typescript
// scripts/check-translations.ts
import fs from 'node:fs';
import path from 'node:path';

const messagesDir = path.resolve('messages');
const sourceLocale = 'en';
const sourceMessages = JSON.parse(
  fs.readFileSync(path.join(messagesDir, `${sourceLocale}.json`), 'utf-8')
);

function getKeys(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return getKeys(value, fullKey);
    }
    return [fullKey];
  });
}

const sourceKeys = new Set(getKeys(sourceMessages));
const localeFiles = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json') && f !== `${sourceLocale}.json`);

let hasErrors = false;

for (const file of localeFiles) {
  const locale = file.replace('.json', '');
  const messages = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf-8'));
  const keys = new Set(getKeys(messages));

  const missing = [...sourceKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !sourceKeys.has(k));

  if (missing.length > 0) {
    console.error(`[${locale}] Missing ${missing.length} keys:\n  ${missing.join('\n  ')}`);
    hasErrors = true;
  }

  if (extra.length > 0) {
    console.warn(`[${locale}] Extra ${extra.length} keys (unused):\n  ${extra.join('\n  ')}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log('All translations are complete.');
```

Add to CI:

```json
// package.json
{
  "scripts": {
    "i18n:check": "tsx scripts/check-translations.ts"
  }
}
```

## Common Patterns

### Metadata Localization

```typescript
// src/app/[locale]/layout.tsx
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('og.title'),
      description: t('og.description'),
      locale: locale,
    },
  };
}
```

### SEO: hreflang Tags

```typescript
// src/app/[locale]/layout.tsx
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `https://example.com/${loc}`])
      ),
    },
  };
}
```

### Localized Sitemap

```typescript
// src/app/sitemap.ts
import { routing } from '@/i18n/routing';
import type { MetadataRoute } from 'next';

const baseUrl = 'https://example.com';
const pages = ['', '/about', '/contact', '/pricing'];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, `${baseUrl}/${loc}${page}`])
        ),
      },
    }))
  );
}
```

### Dynamic Content Localization

For content that comes from a database or API, use a locale-keyed object pattern:

```typescript
// Database model with localized fields
type LocalizedContent = {
  title: Record<string, string>;   // { en: "Hello", de: "Hallo" }
  body: Record<string, string>;
};

// Helper to resolve localized field
function localize<T>(record: Record<string, T>, locale: string, fallback = 'en'): T {
  return record[locale] ?? record[fallback];
}

// Usage in a component
export default async function BlogPost({ params }: Props) {
  const { locale } = await params;
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{localize(post.title, locale)}</h1>
      <div>{localize(post.body, locale)}</div>
    </article>
  );
}
```

### Fallback Locale Chain

```typescript
// src/i18n.ts — with fallback chain
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? 'en';

  // Load messages with fallback chain
  const [defaultMessages, localeMessages] = await Promise.all([
    import('../messages/en.json').then((m) => m.default),
    locale !== 'en'
      ? import(`../messages/${locale}.json`).then((m) => m.default).catch(() => ({}))
      : {},
  ]);

  // Merge: locale-specific messages override English defaults
  const messages = deepMerge(defaultMessages, localeMessages);

  return { locale, messages };
});

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
```

### Server-Only vs Client Messages

To reduce client bundle size, split messages by usage:

```typescript
// src/app/[locale]/layout.tsx
import { getMessages } from 'next-intl/server';
import { pick } from 'lodash-es';

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();

  // Only send client-needed namespaces to the browser
  const clientMessages = pick(messages, ['common', 'auth', 'nav']);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={clientMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Server components can access all namespaces without increasing the client bundle:

```typescript
// Server component — no bundle cost for these translations
import { useTranslations } from 'next-intl';

export default function ServerDashboard() {
  const t = useTranslations('dashboard');
  // These translations stay on the server, never shipped to the client
  return <h1>{t('title')}</h1>;
}
```

## Checklist

When implementing i18n, verify these items:

- [ ] `next-intl` installed and `src/i18n.ts` configured
- [ ] Middleware handles locale detection and routing
- [ ] `[locale]` dynamic segment in app directory
- [ ] `generateStaticParams` returns all locales
- [ ] `setRequestLocale` called in every page/layout for static rendering
- [ ] Type declaration file for autocomplete on translation keys
- [ ] `NextIntlClientProvider` wraps client components with scoped messages
- [ ] Message files exist for all supported locales
- [ ] Locale switcher component allows user to change language
- [ ] `dir` attribute set on `<html>` for RTL locales
- [ ] Logical CSS properties used instead of physical left/right
- [ ] `generateMetadata` returns localized title, description, and alternates
- [ ] hreflang links present for all locales
- [ ] CI script checks for missing translation keys
- [ ] Date/number formatting uses `useFormatter` (not `toLocaleString`)
