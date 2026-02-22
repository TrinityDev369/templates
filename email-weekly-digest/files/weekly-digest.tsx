import * as React from "react";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Stat {
  label: string;
  value: string;
  /** e.g. "+12%", "-5%", "0" */
  change: string;
}

export interface Activity {
  icon: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface WeeklyDigestEmailProps {
  recipientName?: string;
  weekRange?: string;
  stats?: Stat[];
  activities?: Activity[];
  topInsight?: string;
  dashboardUrl?: string;
  appName?: string;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultStats: Stat[] = [
  { label: "Tasks Completed", value: "47", change: "+12%" },
  { label: "Active Projects", value: "8", change: "+2" },
  { label: "Team Members", value: "12", change: "0" },
  { label: "Hours Tracked", value: "164", change: "-5%" },
];

const defaultActivities: Activity[] = [
  {
    icon: "\u{1F3AF}",
    title: "Project Alpha milestone reached",
    description: "Sprint 4 delivered on schedule with all acceptance criteria met.",
    timestamp: "2 hours ago",
  },
  {
    icon: "\u{1F464}",
    title: "New team member joined",
    description: "Maria Chen joined the engineering team as a senior developer.",
    timestamp: "1 day ago",
  },
  {
    icon: "\u{1F4CB}",
    title: "Quarterly review completed",
    description: "Q1 performance review finalized with all action items assigned.",
    timestamp: "2 days ago",
  },
  {
    icon: "\u{1F680}",
    title: "Deployment pipeline optimized",
    description: "CI/CD build times reduced by 40% after caching improvements.",
    timestamp: "3 days ago",
  },
];

const defaultTopInsight =
  "Your team's productivity increased 12% this week. The Sprint Planning automation saved an estimated 3.5 hours.";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a color for the change indicator based on its sign. */
function changeColor(change: string): string {
  const trimmed = change.trim();
  if (trimmed.startsWith("+")) return "#16a34a"; // green
  if (trimmed.startsWith("-")) return "#dc2626"; // red
  return "#6b7280"; // neutral gray
}

/** Return an arrow character for the change indicator. */
function changeArrow(change: string): string {
  const trimmed = change.trim();
  if (trimmed.startsWith("+")) return "\u2191"; // up arrow
  if (trimmed.startsWith("-")) return "\u2193"; // down arrow
  return "\u2014"; // em-dash for no change
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const WeeklyDigestEmail: React.FC<WeeklyDigestEmailProps> = ({
  recipientName = "there",
  weekRange = "Feb 10\u201316, 2026",
  stats = defaultStats,
  activities = defaultActivities,
  topInsight = defaultTopInsight,
  dashboardUrl = "https://app.example.com/dashboard",
  appName = "Acme Platform",
}) => {
  const previewText = `Your weekly summary for ${weekRange}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ---- Dark header ---- */}
          <Section style={styles.header}>
            <Text style={styles.headerAppName}>{appName}</Text>
          </Section>

          {/* ---- Main content area ---- */}
          <Section style={styles.content}>
            {/* Greeting */}
            <Heading as="h1" style={styles.greeting}>
              Hi {recipientName},
            </Heading>
            <Text style={styles.subGreeting}>
              Here&apos;s your weekly summary.
            </Text>

            {/* Week range badge */}
            <Section style={styles.badgeWrapper}>
              <Text style={styles.weekBadge}>{weekRange}</Text>
            </Section>

            {/* ---- Stats grid (2-column) ---- */}
            <Section style={styles.statsSection}>
              {/* First row */}
              {stats.length >= 2 && (
                <Row>
                  <Column style={styles.statCardLeft}>
                    <Text style={styles.statValue}>{stats[0].value}</Text>
                    <Text style={styles.statLabel}>{stats[0].label}</Text>
                    <Text
                      style={{
                        ...styles.statChange,
                        color: changeColor(stats[0].change),
                      }}
                    >
                      {changeArrow(stats[0].change)} {stats[0].change}
                    </Text>
                  </Column>
                  <Column style={styles.statCardRight}>
                    <Text style={styles.statValue}>{stats[1].value}</Text>
                    <Text style={styles.statLabel}>{stats[1].label}</Text>
                    <Text
                      style={{
                        ...styles.statChange,
                        color: changeColor(stats[1].change),
                      }}
                    >
                      {changeArrow(stats[1].change)} {stats[1].change}
                    </Text>
                  </Column>
                </Row>
              )}
              {/* Second row */}
              {stats.length >= 4 && (
                <Row style={{ marginTop: "12px" }}>
                  <Column style={styles.statCardLeft}>
                    <Text style={styles.statValue}>{stats[2].value}</Text>
                    <Text style={styles.statLabel}>{stats[2].label}</Text>
                    <Text
                      style={{
                        ...styles.statChange,
                        color: changeColor(stats[2].change),
                      }}
                    >
                      {changeArrow(stats[2].change)} {stats[2].change}
                    </Text>
                  </Column>
                  <Column style={styles.statCardRight}>
                    <Text style={styles.statValue}>{stats[3].value}</Text>
                    <Text style={styles.statLabel}>{stats[3].label}</Text>
                    <Text
                      style={{
                        ...styles.statChange,
                        color: changeColor(stats[3].change),
                      }}
                    >
                      {changeArrow(stats[3].change)} {stats[3].change}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            <Hr style={styles.divider} />

            {/* ---- Top Insight ---- */}
            {topInsight && (
              <>
                <Section style={styles.insightBox}>
                  <Text style={styles.insightHeading}>Key Insight</Text>
                  <Text style={styles.insightText}>{topInsight}</Text>
                </Section>
                <Hr style={styles.divider} />
              </>
            )}

            {/* ---- Recent Activity ---- */}
            <Heading as="h2" style={styles.sectionHeading}>
              Recent Activity
            </Heading>

            {activities.map((activity, index) => (
              <Section key={index} style={styles.activityRow}>
                <Row>
                  <Column style={styles.activityIconCol}>
                    <Text style={styles.activityIcon}>{activity.icon}</Text>
                  </Column>
                  <Column style={styles.activityBodyCol}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityTimestamp}>
                      {activity.timestamp}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}

            <Hr style={styles.divider} />

            {/* ---- CTA Button ---- */}
            <Section style={styles.ctaWrapper}>
              <Button href={dashboardUrl} style={styles.ctaButton}>
                View Full Dashboard
              </Button>
            </Section>
          </Section>

          {/* ---- Footer ---- */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              <Link href={`${dashboardUrl}/settings/notifications`} style={styles.footerLink}>
                Manage Preferences
              </Link>
              {" \u00B7 "}
              <Link href={`${dashboardUrl}/privacy`} style={styles.footerLink}>
                Privacy Policy
              </Link>
              {" \u00B7 "}
              <Link href={`${dashboardUrl}/unsubscribe`} style={styles.footerLink}>
                Unsubscribe
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
};

export default WeeklyDigestEmail;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const fontSans =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const styles: Record<string, React.CSSProperties> = {
  // Layout
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily: fontSans,
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
  },
  headerAppName: {
    fontFamily: fontSans,
    fontSize: "18px",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "0.02em",
  },

  // Content
  content: {
    padding: "32px 32px 16px",
  },
  greeting: {
    fontFamily: fontSans,
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px",
  },
  subGreeting: {
    fontFamily: fontSans,
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#64748b",
    margin: "0 0 24px",
  },

  // Week badge
  badgeWrapper: {
    margin: "0 0 24px",
  },
  weekBadge: {
    fontFamily: fontSans,
    fontSize: "13px",
    fontWeight: 600,
    color: "#0ea5e9",
    backgroundColor: "#f0f9ff",
    padding: "6px 14px",
    borderRadius: "9999px",
    display: "inline-block" as const,
    margin: 0,
  },

  // Stats grid
  statsSection: {
    margin: "0 0 8px",
  },
  statCardLeft: {
    width: "50%",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "16px",
    verticalAlign: "top" as const,
  },
  statCardRight: {
    width: "50%",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "16px",
    paddingLeft: "24px",
    verticalAlign: "top" as const,
  },
  statValue: {
    fontFamily: fontSans,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
    lineHeight: "1.2",
  },
  statLabel: {
    fontFamily: fontSans,
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 2px",
  },
  statChange: {
    fontFamily: fontSans,
    fontSize: "13px",
    fontWeight: 600,
    margin: 0,
  },

  // Divider
  divider: {
    borderColor: "#e2e8f0",
    borderTop: "1px solid #e2e8f0",
    margin: "24px 0",
  },

  // Insight box
  insightBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "16px 20px",
  },
  insightHeading: {
    fontFamily: fontSans,
    fontSize: "13px",
    fontWeight: 700,
    color: "#92400e",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "0 0 8px",
  },
  insightText: {
    fontFamily: fontSans,
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#78350f",
    margin: 0,
  },

  // Section heading
  sectionHeading: {
    fontFamily: fontSans,
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 16px",
  },

  // Activity
  activityRow: {
    margin: "0 0 16px",
  },
  activityIconCol: {
    width: "40px",
    verticalAlign: "top" as const,
  },
  activityIcon: {
    fontSize: "20px",
    margin: 0,
    lineHeight: "1.4",
  },
  activityBodyCol: {
    verticalAlign: "top" as const,
  },
  activityTitle: {
    fontFamily: fontSans,
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
    margin: "0 0 2px",
  },
  activityDescription: {
    fontFamily: fontSans,
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#64748b",
    margin: "0 0 2px",
  },
  activityTimestamp: {
    fontFamily: fontSans,
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
  },

  // CTA
  ctaWrapper: {
    textAlign: "center" as const,
    margin: "8px 0 16px",
  },
  ctaButton: {
    backgroundColor: "#0ea5e9",
    color: "#ffffff",
    fontFamily: fontSans,
    fontSize: "14px",
    fontWeight: 600,
    padding: "12px 28px",
    borderRadius: "6px",
    textDecoration: "none",
    display: "inline-block" as const,
  },

  // Footer
  footer: {
    backgroundColor: "#f8fafc",
    padding: "24px 32px",
    borderTop: "1px solid #e2e8f0",
  },
  footerText: {
    fontFamily: fontSans,
    fontSize: "13px",
    color: "#94a3b8",
    margin: "0 0 12px",
    textAlign: "center" as const,
  },
  footerLink: {
    color: "#64748b",
    textDecoration: "underline",
  },
  footerAddress: {
    fontFamily: fontSans,
    fontSize: "12px",
    color: "#cbd5e1",
    margin: 0,
    textAlign: "center" as const,
  },
};
