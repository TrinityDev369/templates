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

export interface ReferralProgramEmailProps {
  referrerName: string;
  referrerEmail?: string;
  recipientName?: string;
  storeName?: string;
  discount: string;
  referrerReward?: string;
  referralCode: string;
  referralUrl: string;
  storeUrl: string;
  validDays?: number;
  minOrder?: number;
  totalReferrals?: number;
}

/* -------------------------------------------------------------------------- */
/*  ReferralProgramEmail                                                      */
/* -------------------------------------------------------------------------- */

export function ReferralProgramEmail({
  referrerName = "Alex Chen",
  referrerEmail = "alex@example.com",
  recipientName = "Friend",
  storeName = "TechStore",
  discount = "$15",
  referrerReward = "$10 credit",
  referralCode = "REF-AX7K92",
  referralUrl = "#",
  storeUrl = "#",
  validDays = 30,
  minOrder = 50,
  totalReferrals = 2847,
}: ReferralProgramEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {referrerName} thinks you&apos;ll love {storeName} — get {discount} off
        your first order!
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* ---- Header ---- */}
          <Section style={header}>
            <Text style={logoText}>{storeName}</Text>
          </Section>

          {/* ---- Hero ---- */}
          <Section style={heroSection}>
            <Text style={giftIcon}>🎁</Text>
            <Heading style={heading}>
              {referrerName} invited you to {storeName}!
            </Heading>
            <Text style={paragraph}>
              Your friend {referrerName} wants to share something special with
              you. As a welcome gift, you&apos;ll get{" "}
              <strong>{discount} off</strong> your first order.
            </Text>
          </Section>

          {/* ---- Benefit Box ---- */}
          <Section style={benefitSection}>
            <div style={benefitBox}>
              <Text style={benefitTitle}>Here&apos;s the deal</Text>
              <Text style={benefitItem}>
                🛍️ You get <strong>{discount} off</strong> your first order
              </Text>
              <Text style={benefitItem}>
                🎉 {referrerName} gets <strong>{referrerReward}</strong> too!
              </Text>
            </div>
          </Section>

          {/* ---- How It Works ---- */}
          <Section style={stepsSection}>
            <Text style={sectionTitle}>How it works</Text>

            <div style={stepRow}>
              <div style={stepCircle}>
                <Text style={stepNumber}>1</Text>
              </div>
              <div style={stepContent}>
                <Text style={stepLabel}>Sign up with the link below</Text>
              </div>
            </div>

            <div style={stepConnector} />

            <div style={stepRow}>
              <div style={stepCircle}>
                <Text style={stepNumber}>2</Text>
              </div>
              <div style={stepContent}>
                <Text style={stepLabel}>Shop and add items to your cart</Text>
              </div>
            </div>

            <div style={stepConnector} />

            <div style={stepRow}>
              <div style={stepCircle}>
                <Text style={stepNumber}>3</Text>
              </div>
              <div style={stepContent}>
                <Text style={stepLabel}>
                  Discount applied automatically at checkout
                </Text>
              </div>
            </div>
          </Section>

          {/* ---- CTA ---- */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={referralUrl}>
              Claim Your {discount} Discount
            </Button>
          </Section>

          {/* ---- Referral Code ---- */}
          <Section style={codeSection}>
            <Text style={codeLabel}>Or use your referral code:</Text>
            <div style={codeBox}>
              <Text style={codeText}>{referralCode}</Text>
            </div>
          </Section>

          {/* ---- Social Proof ---- */}
          <Section style={proofSection}>
            <div style={proofBox}>
              <Text style={proofText}>
                ✨ {totalReferrals?.toLocaleString()}+ people have already
                joined through referrals
              </Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* ---- Terms ---- */}
          <Section style={termsSection}>
            <Text style={termsText}>
              Offer valid for {validDays} days. Minimum order ${minOrder}. One
              use per customer. Cannot be combined with other offers.
            </Text>
          </Section>

          {/* ---- Footer ---- */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this because {referrerName} ({referrerEmail}) referred
              you to {storeName}.
            </Text>
            <Text style={footerText}>
              <Link href="#" style={footerLink}>
                Unsubscribe
              </Link>{" "}
              ·{" "}
              <Link href={storeUrl} style={footerLink}>
                Visit {storeName}
              </Link>{" "}
              ·{" "}
              <Link href="#" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
            <Text style={footerAddress}>
              {storeName} · 123 Commerce St · San Francisco, CA 94102
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ReferralProgramEmail;

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
  backgroundColor: "#7c3aed",
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

const giftIcon: React.CSSProperties = {
  fontSize: "40px",
  margin: "0 0 8px",
};

const heading: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: "32px",
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 8px",
};

const benefitSection: React.CSSProperties = {
  padding: "0 32px 16px",
};

const benefitBox: React.CSSProperties = {
  backgroundColor: "#faf5ff",
  borderRadius: "8px",
  border: "1px solid #e9d5ff",
  padding: "16px 20px",
};

const benefitTitle: React.CSSProperties = {
  color: "#7c3aed",
  fontSize: "14px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const benefitItem: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 4px",
};

const stepsSection: React.CSSProperties = {
  padding: "8px 32px 16px",
};

const sectionTitle: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 16px",
};

const stepRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const stepCircle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#7c3aed",
  display: "inline-block",
  textAlign: "center" as const,
  lineHeight: "32px",
  flexShrink: 0,
};

const stepNumber: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
  margin: 0,
  lineHeight: "32px",
};

const stepContent: React.CSSProperties = {
  display: "inline-block",
  paddingLeft: "12px",
};

const stepLabel: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  margin: 0,
};

const stepConnector: React.CSSProperties = {
  width: "2px",
  height: "16px",
  backgroundColor: "#ddd6fe",
  marginLeft: "15px",
};

const ctaSection: React.CSSProperties = {
  padding: "16px 32px",
  textAlign: "center" as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#7c3aed",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 700,
  padding: "14px 32px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const codeSection: React.CSSProperties = {
  padding: "0 32px 16px",
  textAlign: "center" as const,
};

const codeLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 8px",
};

const codeBox: React.CSSProperties = {
  border: "2px dashed #d1d5db",
  borderRadius: "8px",
  padding: "12px 24px",
  display: "inline-block",
  backgroundColor: "#f9fafb",
};

const codeText: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: 700,
  fontFamily: '"Courier New", Courier, monospace',
  letterSpacing: "2px",
  margin: 0,
};

const proofSection: React.CSSProperties = {
  padding: "0 32px 16px",
};

const proofBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "12px 16px",
  textAlign: "center" as const,
};

const proofText: React.CSSProperties = {
  color: "#166534",
  fontSize: "13px",
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "8px 32px",
};

const termsSection: React.CSSProperties = {
  padding: "0 32px",
};

const termsText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "11px",
  lineHeight: "18px",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const footer: React.CSSProperties = {
  padding: "8px 32px 32px",
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

const footerAddress: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: "8px 0 0",
};
