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

export interface PaymentFailedEmailProps {
  recipientName: string;
  amount: string;
  planName: string;
  lastFourDigits: string;
  cardBrand: string;
  nextRetryDate: string;
  retryCount: number;
  updatePaymentUrl: string;
  supportUrl: string;
  appName: string;
}

export const PaymentFailedEmail: React.FC<PaymentFailedEmailProps> = ({
  recipientName = "Alex",
  amount = "$29.00",
  planName = "Pro",
  lastFourDigits = "4242",
  cardBrand = "Visa",
  nextRetryDate = "February 25, 2026",
  retryCount = 1,
  updatePaymentUrl = "https://app.example.com/billing/update",
  supportUrl = "https://app.example.com/support",
  appName = "Acme",
}) => (
  <Html>
    <Head />
    <Preview>
      Payment of {amount} failed for your {planName} plan
    </Preview>
    <Body style={body}>
      <Container style={container}>
        {/* Dark header */}
        <Section style={header}>
          <Text style={headerText}>{appName}</Text>
        </Section>

        {/* Content area */}
        <Section style={content}>
          {/* Alert badge */}
          <Section style={alertBadgeWrapper}>
            <Text style={alertBadge}>PAYMENT FAILED</Text>
          </Section>

          {/* Greeting */}
          <Heading as="h1" style={heading}>
            Hi {recipientName},
          </Heading>

          {/* Main message */}
          <Text style={paragraph}>
            We couldn't process your payment of{" "}
            <strong>{amount}</strong> for your {planName} plan. This
            is usually caused by an expired card, insufficient funds, or a
            temporary bank issue.
          </Text>

          {/* Payment details card */}
          <Section style={detailsCard}>
            <Text style={detailsTitle}>Payment Details</Text>
            <Hr style={detailsDivider} />
            <table
              cellPadding="0"
              cellSpacing="0"
              style={detailsTable}
              role="presentation"
            >
              <tbody>
                <tr>
                  <td style={detailLabel}>Amount</td>
                  <td style={detailValue}>{amount}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Plan</td>
                  <td style={detailValue}>{planName}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Card</td>
                  <td style={detailValue}>
                    {cardBrand} ending in {lastFourDigits}
                  </td>
                </tr>
                <tr>
                  <td style={detailLabel}>Status</td>
                  <td style={detailValueFailed}>Declined</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Retry info */}
          <Section style={retryBox}>
            <Text style={retryText}>
              We'll automatically retry on{" "}
              <strong>{nextRetryDate}</strong> (attempt {retryCount + 1}{" "}
              of 3).
            </Text>
          </Section>

          {/* Warning */}
          <Text style={warningText}>
            If all retry attempts fail, your {planName} plan will be
            paused and you'll lose access to premium features. To avoid any
            interruption, please update your payment method now.
          </Text>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button style={ctaButton} href={updatePaymentUrl}>
              Update Payment Method
            </Button>
          </Section>

          {/* Secondary link */}
          <Text style={secondaryLinkText}>
            Need help?{" "}
            <Link href={supportUrl} style={supportLink}>
              Contact Support
            </Link>
          </Text>

          <Hr style={divider} />

          {/* Reassurance */}
          <Text style={reassuranceText}>
            Your data is safe — we'll keep everything intact while you resolve
            this. No action is needed beyond updating your payment method.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            <Link href={supportUrl} style={footerLink}>
              Help Center
            </Link>
            {"  |  "}
            <Link
              href="https://app.example.com/privacy"
              style={footerLink}
            >
              Privacy Policy
            </Link>
            {"  |  "}
            <Link
              href="https://app.example.com/settings/notifications"
              style={footerLink}
            >
              Unsubscribe
            </Link>
          </Text>
          <Text style={footerAddress}>
            {appName}, Inc. 123 Main Street, San Francisco, CA 94105
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

/* ---------------------------------------------------------------------------
 * Styles
 * ------------------------------------------------------------------------- */

const body: React.CSSProperties = {
  backgroundColor: "#f1f5f9",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const header: React.CSSProperties = {
  backgroundColor: "#0f172a",
  padding: "24px 32px",
};

const headerText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 700,
  margin: 0,
  letterSpacing: "0.5px",
};

const content: React.CSSProperties = {
  padding: "32px 32px 24px",
};

const alertBadgeWrapper: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const alertBadge: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1px",
  padding: "6px 16px",
  borderRadius: "100px",
  border: "1px solid #fecaca",
  margin: 0,
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#0f172a",
  margin: "0 0 16px",
  lineHeight: "1.3",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#334155",
  margin: "0 0 24px",
};

const detailsCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  padding: "20px 24px",
  margin: "0 0 24px",
};

const detailsTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#0f172a",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const detailsDivider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  borderWidth: "1px 0 0 0",
  margin: "0 0 16px",
};

const detailsTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const detailLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  padding: "4px 0",
  width: "100px",
  verticalAlign: "top" as const,
};

const detailValue: React.CSSProperties = {
  fontSize: "14px",
  color: "#0f172a",
  fontWeight: 600,
  padding: "4px 0",
  textAlign: "right" as const,
};

const detailValueFailed: React.CSSProperties = {
  ...detailValue,
  color: "#dc2626",
};

const retryBox: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  borderRadius: "6px",
  border: "1px solid #fde68a",
  padding: "12px 16px",
  margin: "0 0 20px",
};

const retryText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#92400e",
  margin: 0,
};

const warningText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#64748b",
  margin: "0 0 28px",
};

const buttonSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#0ea5e9",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  padding: "14px 32px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center" as const,
};

const secondaryLinkText: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const supportLink: React.CSSProperties = {
  color: "#0ea5e9",
  textDecoration: "underline",
};

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  borderWidth: "1px 0 0 0",
  margin: "0 0 20px",
};

const reassuranceText: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#94a3b8",
  fontStyle: "italic" as const,
  margin: 0,
  textAlign: "center" as const,
};

const footer: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  padding: "20px 32px",
  borderTop: "1px solid #e2e8f0",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const footerLink: React.CSSProperties = {
  color: "#64748b",
  textDecoration: "underline",
};

const footerAddress: React.CSSProperties = {
  fontSize: "12px",
  color: "#cbd5e1",
  textAlign: "center" as const,
  margin: 0,
};

export default PaymentFailedEmail;
