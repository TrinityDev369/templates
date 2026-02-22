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

export interface TrialEndingEmailProps {
  recipientName: string;
  daysRemaining: number;
  trialEndDate: string;
  planName: string;
  planPrice: string;
  features: string[];
  upgradeUrl: string;
  comparePlansUrl: string;
  appName: string;
}

const defaultProps: TrialEndingEmailProps = {
  recipientName: "Alex",
  daysRemaining: 3,
  trialEndDate: "February 25, 2026",
  planName: "Pro",
  planPrice: "$29/mo",
  features: [
    "Unlimited projects",
    "Advanced analytics",
    "Priority support",
    "Custom integrations",
    "Team collaboration",
  ],
  upgradeUrl: "https://example.com/upgrade",
  comparePlansUrl: "https://example.com/pricing",
  appName: "Trinity",
};

export const TrialEndingEmail: React.FC<TrialEndingEmailProps> = ({
  recipientName = defaultProps.recipientName,
  daysRemaining = defaultProps.daysRemaining,
  trialEndDate = defaultProps.trialEndDate,
  planName = defaultProps.planName,
  planPrice = defaultProps.planPrice,
  features = defaultProps.features,
  upgradeUrl = defaultProps.upgradeUrl,
  comparePlansUrl = defaultProps.comparePlansUrl,
  appName = defaultProps.appName,
}) => (
  <Html>
    <Head />
    <Preview>
      Your {appName} free trial ends in {daysRemaining} day
      {daysRemaining === 1 ? "" : "s"} — upgrade now to keep access
    </Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        {/* Dark header */}
        <Section style={styles.header}>
          <Text style={styles.headerText}>{appName}</Text>
        </Section>

        {/* Main content */}
        <Section style={styles.content}>
          {/* Urgency badge */}
          <Section style={styles.badgeWrapper}>
            <Text style={styles.urgencyBadge}>
              &#9203; {daysRemaining} DAY{daysRemaining === 1 ? "" : "S"} LEFT
            </Text>
          </Section>

          {/* Greeting */}
          <Heading as="h1" style={styles.heading}>
            Hi {recipientName},
          </Heading>

          <Text style={styles.text}>
            Your free trial of <strong>{appName}</strong> ends on{" "}
            <strong>{trialEndDate}</strong>. After that date, you will lose
            access to the features you have been using.
          </Text>

          <Hr style={styles.hr} />

          {/* Feature loss box */}
          <Text style={styles.subheading}>What you will lose access to:</Text>
          <Section style={styles.featureBox}>
            {features.map((feature) => (
              <Text key={feature} style={styles.featureItem}>
                <span style={styles.crossMark}>&#10007;</span> {feature}
              </Text>
            ))}
          </Section>

          <Hr style={styles.hr} />

          {/* Pricing card */}
          <Section style={styles.pricingCard}>
            <Text style={styles.pricingPlan}>{planName} Plan</Text>
            <Text style={styles.pricingPrice}>{planPrice}</Text>
            <Text style={styles.pricingCopy}>
              Keep everything — upgrade now and never miss a beat.
            </Text>
          </Section>

          {/* CTA button */}
          <Section style={styles.buttonSection}>
            <Button style={styles.ctaButton} href={upgradeUrl}>
              Upgrade Now
            </Button>
          </Section>

          {/* Compare plans */}
          <Text style={styles.comparePlans}>
            Not sure which plan is right for you?{" "}
            <Link href={comparePlansUrl} style={styles.link}>
              Compare all plans
            </Link>
          </Text>

          <Hr style={styles.hr} />

          {/* Reassurance */}
          <Text style={styles.reassurance}>
            Questions? Simply reply to this email — we are here to help.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={styles.footer}>
          <Text style={styles.footerLinks}>
            <Link href={comparePlansUrl} style={styles.footerLink}>
              Pricing
            </Link>
            {" | "}
            <Link
              href="https://example.com/privacy"
              style={styles.footerLink}
            >
              Privacy Policy
            </Link>
            {" | "}
            <Link
              href="https://example.com/unsubscribe"
              style={styles.footerLink}
            >
              Unsubscribe
            </Link>
            {" | "}
            <Link
              href="mailto:support@example.com"
              style={styles.footerLink}
            >
              Contact Us
            </Link>
          </Text>
          <Text style={styles.footerAddress}>
            {appName} Inc. 123 Innovation Drive, Suite 400, San Francisco, CA
            94105
          </Text>
          <Text style={styles.footerMuted}>
            You are receiving this email because you signed up for a free trial
            of {appName}.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f1f5f9",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
    padding: "24px 40px",
    textAlign: "center" as const,
  },
  headerText: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "1px",
    margin: 0,
  },

  // Content
  content: {
    padding: "32px 40px",
  },

  // Urgency badge
  badgeWrapper: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  urgencyBadge: {
    display: "inline-block" as const,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    padding: "6px 16px",
    borderRadius: "20px",
    border: "1px solid #fcd34d",
    margin: 0,
  },

  // Typography
  heading: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 16px",
    lineHeight: "1.3",
  },
  subheading: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 12px",
  },
  text: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#334155",
    margin: "0 0 16px",
  },

  hr: {
    borderColor: "#e2e8f0",
    borderTop: "1px solid #e2e8f0",
    margin: "24px 0",
  },

  // Feature loss box
  featureBox: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px 20px",
    backgroundColor: "#fafafa",
  },
  featureItem: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#475569",
    margin: "6px 0",
  },
  crossMark: {
    color: "#ef4444",
    fontWeight: 700,
    marginRight: "8px",
  },

  // Pricing card
  pricingCard: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    padding: "24px",
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  pricingPlan: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#0ea5e9",
    textTransform: "uppercase" as const,
    letterSpacing: "1.5px",
    margin: "0 0 4px",
  },
  pricingPrice: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  pricingCopy: {
    fontSize: "14px",
    color: "#475569",
    margin: 0,
  },

  // CTA button
  buttonSection: {
    textAlign: "center" as const,
    margin: "0 0 20px",
  },
  ctaButton: {
    backgroundColor: "#0ea5e9",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    padding: "14px 32px",
    borderRadius: "6px",
    textDecoration: "none",
    display: "inline-block" as const,
  },

  // Compare plans link
  comparePlans: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "0 0 8px",
  },
  link: {
    color: "#0ea5e9",
    textDecoration: "underline",
  },

  // Reassurance
  reassurance: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center" as const,
    fontStyle: "italic" as const,
    margin: 0,
  },

  // Footer
  footer: {
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    padding: "24px 40px",
    textAlign: "center" as const,
  },
  footerLinks: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "0 0 12px",
  },
  footerLink: {
    color: "#64748b",
    textDecoration: "underline",
  },
  footerAddress: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "0 0 8px",
  },
  footerMuted: {
    fontSize: "11px",
    color: "#cbd5e1",
    margin: 0,
  },
};

export default TrialEndingEmail;
