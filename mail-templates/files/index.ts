/**
 * Trinity Mail — `mail-templates` public barrel.
 *
 * Vendored, standalone React Email templates + the render helper + brand theme.
 * No `@trinity/*` imports. Pairs with `mail-client` for sending.
 */

// Theme + i18n
export * from './theme';
export * from './i18n';

// Render helper (consumed by mail-client.send)
export { renderEmail } from './render';
export type { RenderedEmail } from './render';

// Layout + components
export { EmailLayout } from './components/layout';
export type { EmailLayoutProps } from './components/layout';
export { EmailHeader } from './components/header';
export type { EmailHeaderProps } from './components/header';
export { EmailFooter } from './components/footer';
export type { EmailFooterProps } from './components/footer';
export { EmailButton } from './components/button';
export type { EmailButtonProps } from './components/button';
export { EmailDivider } from './components/divider';
export type { EmailDividerProps } from './components/divider';

// Templates
export { VerifyEmail } from './templates/verify-email';
export type { VerifyEmailProps } from './templates/verify-email';
export { PasswordReset } from './templates/password-reset';
export type { PasswordResetProps } from './templates/password-reset';
export { MagicLink } from './templates/magic-link';
export type { MagicLinkProps } from './templates/magic-link';
export { Welcome } from './templates/welcome';
export type { WelcomeProps } from './templates/welcome';
export { Receipt } from './templates/receipt';
export type { ReceiptProps, ReceiptLineItem } from './templates/receipt';
export { GenericNotification } from './templates/generic-notification';
export type { GenericNotificationProps } from './templates/generic-notification';
