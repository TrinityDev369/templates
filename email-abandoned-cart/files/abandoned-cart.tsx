import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface CartItem {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface AbandonedCartEmailProps {
  customerName: string;
  cartItems: CartItem[];
  subtotal: number;
  currency?: string;
  checkoutUrl: string;
  storeUrl: string;
  storeName?: string;
  expiresAt?: string;
}

/* -------------------------------------------------------------------------- */
/*  Placeholder data                                                          */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_ITEMS: CartItem[] = [
  { name: "Wireless Headphones", variant: "Matte Black", quantity: 1, price: 79.99 },
  { name: "Phone Case", variant: "Clear / iPhone 15", quantity: 1, price: 24.99 },
  { name: "USB-C Cable", variant: "2m / White", quantity: 1, price: 12.99 },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatPrice(amount: number, currency: string): string {
  return currency === "EUR"
    ? `€${amount.toFixed(2)}`
    : `$${amount.toFixed(2)}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

/* -------------------------------------------------------------------------- */
/*  AbandonedCartEmail                                                        */
/* -------------------------------------------------------------------------- */

export function AbandonedCartEmail({
  customerName = "Sarah",
  cartItems = PLACEHOLDER_ITEMS,
  subtotal = 117.97,
  currency = "USD",
  checkoutUrl = "#",
  storeUrl = "#",
  storeName = "ShopName",
  expiresAt = "48 hours",
}: AbandonedCartEmailProps) {
  const currencySymbol = currency === "EUR" ? "€" : "$";

  return (
    <Html>
      <Head />
      <Preview>
        You left items in your cart — complete your order before they&apos;re
        gone!
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* ---- Header ---- */}
          <Section style={header}>
            <Text style={logoText}>{storeName}</Text>
          </Section>

          {/* ---- Hero ---- */}
          <Section style={heroSection}>
            <Heading style={heading}>
              Hey {customerName}, you left something behind!
            </Heading>
            <Text style={paragraph}>
              Looks like you added some great items to your cart but didn&apos;t
              finish checking out. No worries — we saved everything for you.
            </Text>
          </Section>

          {/* ---- Cart Items ---- */}
          <Section style={cartSection}>
            <Text style={sectionTitle}>Your cart</Text>
            {cartItems.map((item, i) => (
              <Row key={item.name} style={cartRow}>
                <Column style={itemImageCol}>
                  <div
                    style={{
                      ...itemImagePlaceholder,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  >
                    <Text style={itemInitials}>{getInitials(item.name)}</Text>
                  </div>
                </Column>
                <Column style={itemDetailsCol}>
                  <Text style={itemName}>{item.name}</Text>
                  {item.variant && (
                    <Text style={itemVariant}>{item.variant}</Text>
                  )}
                  <Text style={itemQty}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>
                    {formatPrice(item.price * item.quantity, currency)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* ---- Order Summary ---- */}
          <Section style={summarySection}>
            <Row>
              <Column>
                <Text style={summaryLabel}>Subtotal</Text>
              </Column>
              <Column style={summaryValueCol}>
                <Text style={summaryValue}>
                  {formatPrice(subtotal, currency)}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={summaryLabel}>Shipping</Text>
              </Column>
              <Column style={summaryValueCol}>
                <Text style={summaryShipping}>
                  {subtotal >= 50
                    ? "FREE"
                    : formatPrice(4.99, currency)}
                </Text>
              </Column>
            </Row>
            <Hr style={thinDivider} />
            <Row>
              <Column>
                <Text style={totalLabel}>Estimated Total</Text>
              </Column>
              <Column style={summaryValueCol}>
                <Text style={totalValue}>
                  {formatPrice(
                    subtotal >= 50 ? subtotal : subtotal + 4.99,
                    currency
                  )}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ---- CTA ---- */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={checkoutUrl}>
              Complete Your Purchase
            </Button>
          </Section>

          {/* ---- Urgency ---- */}
          <Section style={urgencySection}>
            <div style={urgencyBox}>
              <Text style={urgencyIcon}>⏰</Text>
              <Text style={urgencyText}>
                Your cart is reserved for{" "}
                <strong>{expiresAt}</strong>. After that, items may sell out.
              </Text>
            </div>
          </Section>

          {/* ---- Secondary CTA ---- */}
          <Section style={secondaryCtaSection}>
            <Link href={storeUrl} style={secondaryLink}>
              Continue Shopping →
            </Link>
          </Section>

          <Hr style={divider} />

          {/* ---- Footer ---- */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you started a checkout at{" "}
              {storeName}. If you&apos;ve already completed your purchase,
              please ignore this email.
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
                Contact Support
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

export default AbandonedCartEmail;

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
  backgroundColor: "#1f2937",
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

const cartSection: React.CSSProperties = {
  padding: "0 32px",
};

const sectionTitle: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 16px",
};

const cartRow: React.CSSProperties = {
  marginBottom: "16px",
};

const itemImageCol: React.CSSProperties = {
  width: "56px",
  verticalAlign: "top",
};

const itemImagePlaceholder: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const itemInitials: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
  margin: 0,
  textAlign: "center" as const,
  lineHeight: "48px",
};

const itemDetailsCol: React.CSSProperties = {
  verticalAlign: "top",
  paddingLeft: "8px",
};

const itemName: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "15px",
  fontWeight: 600,
  margin: "0 0 2px",
};

const itemVariant: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 2px",
};

const itemQty: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  margin: 0,
};

const itemPriceCol: React.CSSProperties = {
  verticalAlign: "top",
  textAlign: "right" as const,
  width: "100px",
};

const itemPrice: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "15px",
  fontWeight: 600,
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 32px",
};

const thinDivider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "8px 0",
};

const summarySection: React.CSSProperties = {
  padding: "0 32px",
};

const summaryLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "4px 0",
};

const summaryValueCol: React.CSSProperties = {
  textAlign: "right" as const,
};

const summaryValue: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "14px",
  margin: "4px 0",
};

const summaryShipping: React.CSSProperties = {
  color: "#059669",
  fontSize: "14px",
  fontWeight: 600,
  margin: "4px 0",
};

const totalLabel: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: 700,
  margin: "4px 0",
};

const totalValue: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: 700,
  margin: "4px 0",
};

const ctaSection: React.CSSProperties = {
  padding: "24px 32px 16px",
  textAlign: "center" as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 700,
  padding: "14px 32px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const urgencySection: React.CSSProperties = {
  padding: "0 32px 8px",
};

const urgencyBox: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "12px 16px",
  textAlign: "center" as const,
};

const urgencyIcon: React.CSSProperties = {
  fontSize: "20px",
  margin: "0 0 4px",
};

const urgencyText: React.CSSProperties = {
  color: "#92400e",
  fontSize: "13px",
  lineHeight: "20px",
  margin: 0,
};

const secondaryCtaSection: React.CSSProperties = {
  padding: "8px 32px 8px",
  textAlign: "center" as const,
};

const secondaryLink: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "14px",
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

const footerAddress: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: "8px 0 0",
};
