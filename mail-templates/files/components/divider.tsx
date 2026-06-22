/**
 * EmailDivider — hairline rule between sections (vendored, standalone)
 * Ported from the Trinity design-system email components, de-`@trinity`-ified.
 */
import * as React from 'react';
import { Hr } from '@react-email/components';
import { emailColors, emailSpacing } from '../theme';

export interface EmailDividerProps {
  style?: React.CSSProperties;
}

export const EmailDivider: React.FC<EmailDividerProps> = ({ style }) => (
  <Hr style={{ ...styles.hr, ...style }} />
);

const styles = {
  hr: {
    borderColor: emailColors.border,
    margin: `${emailSpacing.lg} 0`,
  },
};
