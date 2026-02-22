import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface FeatureHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureAnnouncementEmailProps {
  recipientName: string;
  featureName: string;
  featureTagline: string;
  featureDescription: string;
  screenshotUrl?: string;
  highlights: FeatureHighlight[];
  ctaUrl: string;
  ctaLabel: string;
  learnMoreUrl: string;
  appName: string;
}

const defaultProps: FeatureAnnouncementEmailProps = {
  recipientName: "Alex",
  featureName: "Smart Workflows",
  featureTagline: "Automate your repetitive tasks in seconds",
  featureDescription:
    "We have been listening to your feedback, and today we are thrilled to introduce Smart Workflows — a powerful new way to automate the tasks you do every day. Build custom automations with our visual editor, connect your favorite tools, and let your workflows handle the rest.",
  screenshotUrl: undefined,
  highlights: [
    {
      icon: "\u26A1",
      title: "One-Click Setup",
      description:
        "Create workflows from pre-built templates or start from scratch",
    },
    {
      icon: "\uD83D\uDD04",
      title: "Real-Time Triggers",
      description:
        "Workflows fire instantly when conditions are met \u2014 no delays",
    },
    {
      icon: "\uD83D\uDCCA",
      title: "Built-In Analytics",
      description:
        "Track every workflow run with detailed execution logs",
    },
  ],
  ctaUrl: "https://app.example.com/workflows",
  ctaLabel: "Try Smart Workflows",
  learnMoreUrl: "https://docs.example.com/workflows",
  appName: "Acme",
};

export const FeatureAnnouncementEmail: React.FC<
  Partial<FeatureAnnouncementEmailProps>
> = (props) => {
  const {
    recipientName,
    featureName,
    featureTagline,
    featureDescription,
    screenshotUrl,
    highlights,
    ctaUrl,
    ctaLabel,
    learnMoreUrl,
    appName,
  } = {
    ...defaultProps,
    ...props,
  };

  return (
    <Html>
      <Head />
      <Preview>
        {featureName} — {featureTagline}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ── Dark Header ── */}
          <Section style={styles.header}>
            <Text style={styles.headerAppName}>{appName}</Text>
          </Section>

          {/* ── Main Content ── */}
          <Section style={styles.content}>
            {/* NEW FEATURE badge */}
            <table
              cellPadding="0"
              cellSpacing="0"
              border={0}
              width="100%"
              role="presentation"
            >
              <tbody>
                <tr>
                  <td align="center" style={{ paddingBottom: "16px" }}>
                    <span style={styles.badge}>NEW FEATURE</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Feature name heading */}
            <Heading as="h1" style={styles.featureName}>
              {featureName}
            </Heading>

            {/* Tagline */}
            <Text style={styles.tagline}>{featureTagline}</Text>

            <Hr style={styles.divider} />

            {/* Greeting */}
            <Text style={styles.paragraph}>
              Hi {recipientName},
            </Text>

            {/* Description */}
            <Text style={styles.paragraph}>{featureDescription}</Text>

            {/* Screenshot (optional) */}
            {screenshotUrl && (
              <Section style={styles.screenshotSection}>
                <Img
                  src={screenshotUrl}
                  alt={`${featureName} screenshot`}
                  width="536"
                  style={styles.screenshot}
                />
              </Section>
            )}

            {/* Highlights grid */}
            <Section style={styles.highlightsSection}>
              {highlights.map((highlight, index) => (
                <table
                  key={index}
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  width="100%"
                  role="presentation"
                  style={styles.highlightRow}
                >
                  <tbody>
                    <tr>
                      <td style={styles.highlightIconCell}>
                        <Text style={styles.highlightIcon}>
                          {highlight.icon}
                        </Text>
                      </td>
                      <td style={styles.highlightTextCell}>
                        <Text style={styles.highlightTitle}>
                          {highlight.title}
                        </Text>
                        <Text style={styles.highlightDescription}>
                          {highlight.description}
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ))}
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={ctaUrl} style={styles.ctaButton}>
                {ctaLabel}
              </Button>
            </Section>

            {/* Learn more link */}
            <Text style={styles.learnMore}>
              Want to dive deeper?{" "}
              <Link href={learnMoreUrl} style={styles.learnMoreLink}>
                Learn more in our docs
              </Link>
            </Text>
          </Section>

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Hr style={styles.footerDivider} />
            <Text style={styles.footerText}>
              You are receiving this email because you are a registered user
              of {appName}.
            </Text>
            <Text style={styles.footerLinks}>
              <Link href="#unsubscribe" style={styles.footerLink}>
                Unsubscribe
              </Link>
              {" \u00B7 "}
              <Link href="#privacy" style={styles.footerLink}>
                Privacy Policy
              </Link>
              {" \u00B7 "}
              <Link href="#contact" style={styles.footerLink}>
                Contact Us
              </Link>
            </Text>
            <Text style={styles.footerAddress}>
              {appName}, Inc. 123 Main Street, Suite 100, San Francisco, CA
              94105
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

FeatureAnnouncementEmail.PreviewProps = defaultProps;

export default FeatureAnnouncementEmail;

/* ── Styles ── */

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f1f5f9",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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

  /* Header */
  header: {
    backgroundColor: "#0f172a",
    padding: "24px 32px",
    textAlign: "center" as const,
  },
  headerAppName: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    margin: 0,
  },

  /* Content */
  content: {
    padding: "40px 32px 32px",
  },
  badge: {
    display: "inline-block" as const,
    backgroundColor: "#0ea5e9",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "4px 12px",
    borderRadius: "9999px",
    textTransform: "uppercase" as const,
  },
  featureName: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#0f172a",
    textAlign: "center" as const,
    margin: "0 0 8px",
    lineHeight: "1.2",
  },
  tagline: {
    fontSize: "16px",
    color: "#0ea5e9",
    textAlign: "center" as const,
    fontWeight: 500,
    margin: "0 0 24px",
    lineHeight: "1.4",
  },
  divider: {
    borderColor: "#e2e8f0",
    borderTop: "1px solid #e2e8f0",
    margin: "0 0 24px",
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#334155",
    margin: "0 0 16px",
  },

  /* Screenshot */
  screenshotSection: {
    margin: "24px 0",
    textAlign: "center" as const,
  },
  screenshot: {
    maxWidth: "100%",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  /* Highlights */
  highlightsSection: {
    margin: "28px 0",
  },
  highlightRow: {
    marginBottom: "16px",
  },
  highlightIconCell: {
    width: "48px",
    verticalAlign: "top" as const,
    paddingTop: "2px",
    paddingRight: "12px",
  },
  highlightIcon: {
    fontSize: "24px",
    margin: 0,
    lineHeight: "1",
  },
  highlightTextCell: {
    verticalAlign: "top" as const,
    paddingBottom: "16px",
  },
  highlightTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px",
    lineHeight: "1.3",
  },
  highlightDescription: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.5",
  },

  /* CTA */
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0 24px",
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
  learnMore: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "0 0 8px",
    lineHeight: "1.5",
  },
  learnMoreLink: {
    color: "#0ea5e9",
    textDecoration: "underline",
  },

  /* Footer */
  footer: {
    padding: "0 32px 32px",
  },
  footerDivider: {
    borderColor: "#e2e8f0",
    borderTop: "1px solid #e2e8f0",
    margin: "24px 0",
  },
  footerText: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#94a3b8",
    textAlign: "center" as const,
    margin: "0 0 12px",
  },
  footerLinks: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#94a3b8",
    textAlign: "center" as const,
    margin: "0 0 12px",
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "underline",
  },
  footerAddress: {
    fontSize: "11px",
    lineHeight: "1.5",
    color: "#cbd5e1",
    textAlign: "center" as const,
    margin: 0,
  },
};
