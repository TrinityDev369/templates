/**
 * EmailButton — branded call-to-action button (vendored, standalone)
 * Ported from the Trinity design-system email components, de-`@trinity`-ified.
 */
import * as React from 'react';
import { Button } from '@react-email/components';
import { emailColors, emailFonts, emailBorderRadius } from '../theme';

export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export const EmailButton: React.FC<EmailButtonProps> = ({ href, children }) => (
  <Button href={href} style={styles.button}>
    {children}
  </Button>
);

const styles = {
  button: {
    backgroundColor: emailColors.trinity,
    color: emailColors.white,
    fontFamily: emailFonts.sans,
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    textAlign: 'center' as const,
    padding: '12px 24px',
    borderRadius: emailBorderRadius.md,
    display: 'inline-block',
  },
};
