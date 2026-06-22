/**
 * Trinity Mail — email design tokens (vendored, standalone)
 *
 * Inlined brand tokens — HEX values ported verbatim from the Trinity
 * design-system (`packages/design-system/src/pdf/theme.ts` + `email/theme.ts`)
 * so this template carries no `@trinity/*` runtime dependency.
 *
 * 369-Dichte brand blues, JetBrains Mono headings, IBM Plex Sans body.
 * Tweak here once and every template + component follows.
 */

export const emailColors = {
  // Trinity 369-Dichte Brand Blues
  trinity: '#3369B6', // Mittel — primary buttons, links
  trinityLight: '#3696E9', // Hell — highlights, CTAs, active
  trinitySteel: '#336699', // Steel — secondary, subtle
  trinityDark: '#163996', // Dunkel — headers, accents, depth
  trinityHover: '#2B5A9E', // Hover state (derived from mittel)

  // Layout
  background: '#F4F4F5',
  surface: '#FFFFFF',
  foreground: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',

  // Status
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0284C7',

  // Grayscale
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const;

export const emailFonts = {
  /** JetBrains Mono — headings only */
  heading: "'JetBrains Mono', 'Courier New', monospace",
  /** IBM Plex Sans — body text */
  sans: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  /** Mono — code snippets, numeric codes */
  mono: "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace",
} as const;

export const emailSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const emailBorderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
} as const;

/**
 * Web-font URLs loaded by the `<EmailLayout>` head. Clients that strip web
 * fonts fall back to the families declared in `emailFonts`.
 */
export const emailWebFonts = {
  headingWoff2:
    'https://fonts.gstatic.com/s/jetbrainsmono/v21/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjNFqUsaaDhw.woff2',
  bodyWoff2:
    'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdHeFaxOedc.woff2',
  bodySemiBoldWoff2:
    'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIFsdP3pBms.woff2',
} as const;

export type EmailColors = typeof emailColors;
export type EmailFonts = typeof emailFonts;
