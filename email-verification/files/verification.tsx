import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface VerificationEmailProps {
  /** Recipient's display name */
  recipientName: string;
  /** Full URL the user clicks to verify their email */
  verificationUrl: string;
  /** Human-readable expiration window (e.g. "24 hours") */
  expiresIn?: string;
  /** Application / brand name shown in header and copy */
  appName?: string;
}

// ---------------------------------------------------------------------------
// Defaults (used for preview & when props are omitted)
// ---------------------------------------------------------------------------

const defaults: Required<VerificationEmailProps> = {
  recipientName: "User",
  verificationUrl: "https://example.com/verify?token=abc123",
  expiresIn: "24 hours",
  appName: "MyApp",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  recipientName = defaults.recipientName,
  verificationUrl = defaults.verificationUrl,
  expiresIn = defaults.expiresIn,
  appName = defaults.appName,
}) => {
  const previewText = `Verify your email address for ${appName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ── Dark header ─────────────────────────────────────────── */}
          <Section style={styles.header}>
            <Text style={styles.headerText}>{appName}</Text>
          </Section>

          {/* ── Main content ────────────────────────────────────────── */}
          <Section style={styles.content}>
            <Heading as="h1" style={styles.heading}>
              Verify Your Email Address
            </Heading>

            <Text style={styles.text}>Hi {recipientName},</Text>

            <Text style={styles.text}>
              Thanks for signing up! Please confirm your email address by
              clicking the button below. This helps us keep your account secure.
            </Text>

            {/* CTA button */}
            <Section style={styles.buttonSection}>
              <Button style={styles.button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>

            {/* Fallback URL */}
            <Text style={styles.fallbackLabel}>
              If the button above doesn't work, copy and paste this URL into
              your browser:
            </Text>
            <Text style={styles.fallbackUrl}>
              <Link href={verificationUrl} style={styles.fallbackLink}>
                {verificationUrl}
              </Link>
            </Text>

            {/* Expiration notice */}
            <Text style={styles.note}>
              This verification link will expire in{" "}
              <strong>{expiresIn}</strong>. After that you'll need to request a
              new one.
            </Text>

            <Hr style={styles.hr} />

            {/* Ignore notice */}
            <Text style={styles.muted}>
              If you didn't create an account, you can safely ignore this
              email. No action is needed.
            </Text>
          </Section>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <Section style={styles.footer}>
            <Text style={styles.footerLinks}>
              <Link href="https://example.com/unsubscribe" style={styles.footerLink}>
                Unsubscribe
              </Link>
              {"  |  "}
              <Link href="https://example.com/privacy" style={styles.footerLink}>
                Privacy Policy
              </Link>
              {"  |  "}
              <Link href="https://example.com/contact" style={styles.footerLink}>
                Contact Us
              </Link>
            </Text>
            <Text style={styles.footerAddress}>
              {appName} Inc. - 123 Main Street, Suite 100, San Francisco, CA
              94105
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: 0,
    padding: 0,
  },

  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    overflow: "hidden" as const,
  },

  // ── Header ──────────────────────────────────────────────────────────────

  header: {
    backgroundColor: "#0f172a",
    padding: "24px 32px",
    textAlign: "center" as const,
  },

  headerText: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "0.5px",
  },

  // ── Content ─────────────────────────────────────────────────────────────

  content: {
    padding: "32px 32px 24px",
  },

  heading: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 16px",
    lineHeight: "1.3",
  },

  text: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#334155",
    margin: "0 0 16px",
  },

  // ── CTA Button ──────────────────────────────────────────────────────────

  buttonSection: {
    textAlign: "center" as const,
    margin: "24px 0",
  },

  button: {
    backgroundColor: "#0ea5e9",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 600,
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 32px",
    borderRadius: "6px",
    lineHeight: "1",
  },

  // ── Fallback URL ────────────────────────────────────────────────────────

  fallbackLabel: {
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#64748b",
    margin: "0 0 4px",
  },

  fallbackUrl: {
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 24px",
    wordBreak: "break-all" as const,
  },

  fallbackLink: {
    color: "#0ea5e9",
    textDecoration: "underline",
  },

  // ── Notes ───────────────────────────────────────────────────────────────

  note: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#334155",
    margin: "0 0 16px",
  },

  hr: {
    borderColor: "#e2e8f0",
    margin: "24px 0",
  },

  muted: {
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#94a3b8",
    margin: "0",
  },

  // ── Footer ──────────────────────────────────────────────────────────────

  footer: {
    backgroundColor: "#f8fafc",
    padding: "24px 32px",
    textAlign: "center" as const,
    borderTop: "1px solid #e2e8f0",
  },

  footerLinks: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#64748b",
    margin: "0 0 8px",
  },

  footerLink: {
    color: "#64748b",
    textDecoration: "underline",
  },

  footerAddress: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#94a3b8",
    margin: 0,
  },
};
