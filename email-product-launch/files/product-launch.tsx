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
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface ProductLaunchEmailProps {
  recipientName?: string;
  productName: string;
  tagline: string;
  features: Array<{ icon: string; title: string; description: string }>;
  price?: string;
  savings?: string;
  earlyAdopters?: number;
  ctaUrl: string;
  demoUrl?: string;
  storeName?: string;
}

/* -------------------------------------------------------------------------- */
/*  Placeholder data                                                          */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_FEATURES = [
  {
    icon: "\u26A1",
    title: "Lightning Fast Sync",
    description:
      "Changes propagate across all devices in under 50ms. Work anywhere, stay in sync everywhere.",
  },
  {
    icon: "\uD83D\uDD12",
    title: "End-to-End Encryption",
    description:
      "Your data is encrypted at rest and in transit. Zero-knowledge architecture means only you hold the keys.",
  },
  {
    icon: "\uD83E\uDDE0",
    title: "Smart Workflows",
    description:
      "AI-powered automations learn your patterns and suggest optimizations to save hours every week.",
  },
];

/* -------------------------------------------------------------------------- */
/*  ProductLaunchEmail                                                        */
/* -------------------------------------------------------------------------- */

export function ProductLaunchEmail({
  recipientName = "there",
  productName = "CloudSync Pro",
  tagline = "Real-time collaboration, reimagined",
  features = PLACEHOLDER_FEATURES,
  price = "$9/mo",
  savings = "50% off for early birds",
  earlyAdopters = 3200,
  ctaUrl = "#",
  demoUrl = "#",
  storeName = "CloudSync",
}: ProductLaunchEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Introducing {productName} — {tagline}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* ---- Header ---- */}
          <Section style={header}>
            <Text style={logoText}>{storeName}</Text>
          </Section>

          {/* ---- Hero ---- */}
          <Section style={heroSection}>
            <div style={launchBadge}>
              <Text style={launchBadgeText}>JUST LAUNCHED</Text>
            </div>
            <Heading style={heading}>{productName} is here</Heading>
            <Text style={taglineText}>{tagline}</Text>
            {recipientName && recipientName !== "there" ? (
              <Text style={greeting}>Hey {recipientName},</Text>
            ) : (
              <Text style={greeting}>Hey there,</Text>
            )}
            <Text style={paragraph}>
              We&apos;ve been working on something big, and today we&apos;re
              thrilled to share it with you. Meet{" "}
              <strong>{productName}</strong> — built from the ground up to
              transform the way you work.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* ---- Key Features ---- */}
          <Section style={featuresSection}>
            <Text style={sectionTitle}>What makes it special</Text>
            {features.map((feature) => (
              <div key={feature.title} style={featureBlock}>
                <Text style={featureIcon}>{feature.icon}</Text>
                <Text style={featureTitle}>{feature.title}</Text>
                <Text style={featureDescription}>{feature.description}</Text>
              </div>
            ))}
          </Section>

          <Hr style={divider} />

          {/* ---- Social Proof ---- */}
          {earlyAdopters && (
            <Section style={proofSection}>
              <div style={proofBox}>
                <Text style={proofText}>
                  Join{" "}
                  <strong>{earlyAdopters.toLocaleString()}+</strong> early
                  adopters already using {productName}
                </Text>
              </div>
            </Section>
          )}

          {/* ---- Pricing Teaser ---- */}
          {price && (
            <Section style={pricingSection}>
              <div style={pricingBox}>
                <Text style={pricingLabel}>Starting at</Text>
                <Text style={pricingValue}>{price}</Text>
                {savings && <Text style={savingsText}>{savings}</Text>}
              </div>
            </Section>
          )}

          {/* ---- CTA ---- */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={ctaUrl}>
              Get Started — It&apos;s Free
            </Button>
          </Section>

          {/* ---- Secondary CTA ---- */}
          {demoUrl && (
            <Section style={secondaryCtaSection}>
              <Link href={demoUrl} style={secondaryLink}>
                Watch the demo →
              </Link>
            </Section>
          )}

          <Hr style={divider} />

          {/* ---- Footer ---- */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you signed up for updates from{" "}
              {storeName}. We only send emails when we have something worth
              sharing.
            </Text>
            <Text style={footerText}>
              <Link href="#" style={footerLink}>
                Unsubscribe
              </Link>{" "}
              ·{" "}
              <Link href="#" style={footerLink}>
                Privacy Policy
              </Link>{" "}
              ·{" "}
              <Link href="#" style={footerLink}>
                Contact Us
              </Link>
            </Text>
            <Text style={socialLinks}>
              <Link href="#" style={footerLink}>
                Twitter
              </Link>{" "}
              ·{" "}
              <Link href="#" style={footerLink}>
                LinkedIn
              </Link>{" "}
              ·{" "}
              <Link href="#" style={footerLink}>
                GitHub
              </Link>
            </Text>
            <Text style={footerAddress}>
              {storeName} · 123 Innovation Way · San Francisco, CA 94102
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ProductLaunchEmail;

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */

const body: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#0f172a",
  padding: "20px 32px",
  textAlign: "center" as const,
};

const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 700,
  margin: 0,
  letterSpacing: "0.5px",
};

const heroSection: React.CSSProperties = {
  padding: "32px 32px 16px",
  textAlign: "center" as const,
};

const launchBadge: React.CSSProperties = {
  backgroundColor: "#0ea5e9",
  borderRadius: "20px",
  display: "inline-block",
  padding: "4px 16px",
  marginBottom: "16px",
};

const launchBadgeText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: 0,
};

const heading: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "28px",
  fontWeight: 700,
  lineHeight: "36px",
  margin: "0 0 8px",
};

const taglineText: React.CSSProperties = {
  color: "#0ea5e9",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  margin: "0 0 20px",
};

const greeting: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 8px",
  textAlign: "left" as const,
};

const paragraph: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 8px",
  textAlign: "left" as const,
};

const divider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 32px",
};

const featuresSection: React.CSSProperties = {
  padding: "0 32px",
};

const sectionTitle: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 20px",
};

const featureBlock: React.CSSProperties = {
  marginBottom: "24px",
};

const featureIcon: React.CSSProperties = {
  fontSize: "28px",
  margin: "0 0 4px",
};

const featureTitle: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "16px",
  fontWeight: 700,
  margin: "0 0 4px",
};

const featureDescription: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "22px",
  margin: 0,
};

const proofSection: React.CSSProperties = {
  padding: "0 32px 16px",
};

const proofBox: React.CSSProperties = {
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  border: "1px solid #bae6fd",
  padding: "14px 20px",
  textAlign: "center" as const,
};

const proofText: React.CSSProperties = {
  color: "#0369a1",
  fontSize: "14px",
  lineHeight: "22px",
  margin: 0,
};

const pricingSection: React.CSSProperties = {
  padding: "0 32px 16px",
};

const pricingBox: React.CSSProperties = {
  backgroundColor: "#0f172a",
  borderRadius: "8px",
  padding: "20px 24px",
  textAlign: "center" as const,
};

const pricingLabel: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 4px",
};

const pricingValue: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: 700,
  margin: "0 0 4px",
};

const savingsText: React.CSSProperties = {
  color: "#38bdf8",
  fontSize: "14px",
  fontWeight: 600,
  margin: 0,
};

const ctaSection: React.CSSProperties = {
  padding: "16px 32px",
  textAlign: "center" as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#0ea5e9",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 700,
  padding: "14px 40px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const secondaryCtaSection: React.CSSProperties = {
  padding: "0 32px 8px",
  textAlign: "center" as const,
};

const secondaryLink: React.CSSProperties = {
  color: "#0ea5e9",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  padding: "0 32px 32px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const footerLink: React.CSSProperties = {
  color: "#9ca3af",
  textDecoration: "underline",
};

const socialLinks: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const footerAddress: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: "8px 0 0",
};
