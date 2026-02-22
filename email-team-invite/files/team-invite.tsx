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

export interface TeamInviteEmailProps {
  recipientName: string;
  inviterName: string;
  inviterRole: string;
  teamName: string;
  teamDescription: string;
  acceptUrl: string;
  declineUrl: string;
  expiresIn: string;
  appName: string;
}

const defaultProps: TeamInviteEmailProps = {
  recipientName: "Alex Johnson",
  inviterName: "Sarah Chen",
  inviterRole: "Admin",
  teamName: "Design Engineering",
  teamDescription:
    "We build and maintain the design system, component library, and frontend infrastructure that powers all of our products.",
  acceptUrl: "https://app.example.com/invite/accept?token=abc123",
  declineUrl: "https://app.example.com/invite/decline?token=abc123",
  expiresIn: "7 days",
  appName: "Trinity Agency",
};

export const TeamInviteEmail: React.FC<TeamInviteEmailProps> = ({
  recipientName = defaultProps.recipientName,
  inviterName = defaultProps.inviterName,
  inviterRole = defaultProps.inviterRole,
  teamName = defaultProps.teamName,
  teamDescription = defaultProps.teamDescription,
  acceptUrl = defaultProps.acceptUrl,
  declineUrl = defaultProps.declineUrl,
  expiresIn = defaultProps.expiresIn,
  appName = defaultProps.appName,
}) => (
  <Html>
    <Head />
    <Preview>
      {inviterName} invited you to join {teamName} on {appName}
    </Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        {/* Dark header */}
        <Section style={styles.header}>
          <Text style={styles.headerText}>{appName}</Text>
        </Section>

        {/* Main content */}
        <Section style={styles.content}>
          {/* Greeting */}
          <Heading as="h1" style={styles.heading}>
            You have been invited!
          </Heading>
          <Text style={styles.text}>Hi {recipientName},</Text>
          <Text style={styles.text}>
            <strong>{inviterName}</strong> has invited you to join{" "}
            <strong>{teamName}</strong> on {appName}.
          </Text>

          {/* Team info card */}
          <Section style={styles.teamCard}>
            <Text style={styles.teamCardName}>{teamName}</Text>
            <Text style={styles.teamCardDescription}>{teamDescription}</Text>
          </Section>

          {/* Role badge */}
          <Section style={styles.roleBadgeWrapper}>
            <Text style={styles.roleLabel}>Your role</Text>
            <Text style={styles.roleBadge}>{inviterRole}</Text>
          </Section>

          {/* Accept CTA */}
          <Section style={styles.ctaSection}>
            <Button href={acceptUrl} style={styles.acceptButton}>
              Accept Invitation
            </Button>
          </Section>

          {/* Decline link */}
          <Text style={styles.declineText}>
            Not interested?{" "}
            <Link href={declineUrl} style={styles.declineLink}>
              Decline this invitation
            </Link>
          </Text>

          {/* Expiration notice */}
          <Text style={styles.expirationText}>
            This invitation will expire in {expiresIn}. After that, you will
            need to request a new invitation from {inviterName}.
          </Text>

          <Hr style={styles.divider} />

          {/* Safety notice */}
          <Text style={styles.safetyText}>
            If you don&apos;t recognize this invitation, you can safely ignore
            this email. No action will be taken on your behalf.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={styles.footer}>
          <Hr style={styles.footerDivider} />
          <Text style={styles.footerLinks}>
            <Link href="https://example.com/unsubscribe" style={styles.footerLink}>
              Unsubscribe
            </Link>
            {" | "}
            <Link href="https://example.com/privacy" style={styles.footerLink}>
              Privacy Policy
            </Link>
            {" | "}
            <Link href="https://example.com/contact" style={styles.footerLink}>
              Contact Us
            </Link>
          </Text>
          <Text style={styles.footerAddress}>
            {appName} &middot; 123 Main Street, Suite 100 &middot; San
            Francisco, CA 94105
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default TeamInviteEmail;

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

  // Header
  header: {
    backgroundColor: "#0f172a",
    padding: "24px 32px",
    textAlign: "center" as const,
  },
  headerText: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    margin: 0,
  },

  // Content
  content: {
    padding: "32px 32px 16px",
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

  // Team card
  teamCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "20px 24px",
    margin: "24px 0",
  },
  teamCardName: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  teamCardDescription: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#64748b",
    margin: 0,
  },

  // Role badge
  roleBadgeWrapper: {
    margin: "0 0 24px",
  },
  roleLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "0 0 6px",
  },
  roleBadge: {
    display: "inline-block" as const,
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontSize: "13px",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "9999px",
    margin: 0,
  },

  // CTA
  ctaSection: {
    textAlign: "center" as const,
    margin: "28px 0 16px",
  },
  acceptButton: {
    backgroundColor: "#0ea5e9",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "14px 32px",
    borderRadius: "6px",
    display: "inline-block" as const,
  },

  // Decline
  declineText: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "0 0 24px",
  },
  declineLink: {
    color: "#0ea5e9",
    textDecoration: "underline",
  },

  // Expiration
  expirationText: {
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#94a3b8",
    textAlign: "center" as const,
    margin: "0 0 24px",
  },

  // Divider
  divider: {
    borderColor: "#e2e8f0",
    margin: "0 0 16px",
  },

  // Safety
  safetyText: {
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#94a3b8",
    margin: "0 0 8px",
  },

  // Footer
  footer: {
    padding: "0 32px 24px",
    textAlign: "center" as const,
  },
  footerDivider: {
    borderColor: "#e2e8f0",
    margin: "0 0 16px",
  },
  footerLinks: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "0 0 8px",
  },
  footerLink: {
    color: "#0ea5e9",
    textDecoration: "underline",
  },
  footerAddress: {
    fontSize: "11px",
    color: "#cbd5e1",
    margin: "0",
    lineHeight: "1.5",
  },
};
