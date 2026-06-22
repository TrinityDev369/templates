/**
 * Shared text/section styles for templates (vendored, standalone).
 * Centralises heading/body/note/code/detail styling so every template renders
 * with consistent vertical rhythm. Pure objects — no React, no dependencies.
 */
import { emailColors, emailFonts, emailSpacing, emailBorderRadius } from '../theme';

export const text = {
  heading: {
    fontFamily: emailFonts.heading,
    fontSize: '24px',
    fontWeight: 700,
    color: emailColors.foreground,
    margin: `0 0 ${emailSpacing.md}`,
  },
  body: {
    fontFamily: emailFonts.sans,
    fontSize: '15px',
    lineHeight: '1.6',
    color: emailColors.foreground,
    margin: `0 0 ${emailSpacing.md}`,
  },
  note: {
    fontFamily: emailFonts.sans,
    fontSize: '13px',
    lineHeight: '1.5',
    color: emailColors.muted,
    margin: `${emailSpacing.md} 0 0`,
  },
  code: {
    fontFamily: emailFonts.mono,
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: emailColors.trinityDark,
    textAlign: 'center' as const,
    margin: `${emailSpacing.sm} 0`,
  },
  detailRow: {
    fontFamily: emailFonts.sans,
    fontSize: '15px',
    lineHeight: '1.6',
    color: emailColors.foreground,
    margin: `${emailSpacing.xs} 0`,
  },
} as const;

export const section = {
  button: {
    textAlign: 'center' as const,
    margin: `${emailSpacing.lg} 0`,
  },
  codeBox: {
    backgroundColor: emailColors.background,
    borderRadius: emailBorderRadius.lg,
    padding: `${emailSpacing.md} ${emailSpacing.lg}`,
    margin: `${emailSpacing.md} 0`,
    textAlign: 'center' as const,
  },
  detailsBox: {
    backgroundColor: emailColors.background,
    borderRadius: emailBorderRadius.lg,
    padding: `${emailSpacing.md} ${emailSpacing.lg}`,
    margin: `${emailSpacing.md} 0`,
  },
} as const;
