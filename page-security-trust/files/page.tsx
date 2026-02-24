import {
  Shield,
  Server,
  Globe,
  CheckCircle,
  Mail,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ComplianceBadges } from "./components/compliance-badges";
import type { ComplianceBadge } from "./components/compliance-badges";
import { SecurityFeatures } from "./components/security-features";
import type { SecurityFeature } from "./components/security-features";
import { TrustStats } from "./components/trust-stats";
import type { TrustStat } from "./components/trust-stats";

/* ================================================================== */
/* Sample data -- replace with your own values                         */
/* ================================================================== */

const COMPLIANCE_BADGES: ComplianceBadge[] = [
  {
    name: "Service Organization Control 2",
    shortName: "SOC 2 Type II",
    description:
      "Independently audited controls for security, availability, and confidentiality of customer data.",
    icon: "shield",
    status: "certified",
  },
  {
    name: "General Data Protection Regulation",
    shortName: "GDPR",
    description:
      "Full compliance with EU data protection regulations including data subject rights and lawful processing.",
    icon: "globe",
    status: "certified",
  },
  {
    name: "Health Insurance Portability and Accountability Act",
    shortName: "HIPAA",
    description:
      "Technical and administrative safeguards for protected health information in healthcare workflows.",
    icon: "lock",
    status: "certified",
  },
  {
    name: "International Organization for Standardization",
    shortName: "ISO 27001",
    description:
      "Certified information security management system covering risk assessment, access control, and incident response.",
    icon: "fileCheck",
    status: "certified",
  },
];

const SECURITY_FEATURES: SecurityFeature[] = [
  {
    title: "Encryption at Rest",
    description:
      "All data is encrypted at rest using AES-256. Database volumes, backups, and object storage are fully encrypted.",
    icon: "lock",
  },
  {
    title: "Encryption in Transit",
    description:
      "TLS 1.3 enforced on all connections. HSTS headers, certificate pinning, and perfect forward secrecy enabled.",
    icon: "key",
  },
  {
    title: "SSO & SAML",
    description:
      "Enterprise single sign-on via SAML 2.0 and OIDC. Integrate with Okta, Azure AD, Google Workspace, and more.",
    icon: "users",
  },
  {
    title: "Two-Factor Authentication",
    description:
      "TOTP and WebAuthn support for all accounts. Admins can enforce 2FA organization-wide via security policies.",
    icon: "key",
  },
  {
    title: "Role-Based Access Control",
    description:
      "Granular permissions with predefined roles and custom role creation. Audit trail for all permission changes.",
    icon: "eye",
  },
  {
    title: "Audit Logging",
    description:
      "Immutable, tamper-proof audit logs for every action. Export to your SIEM or download as structured JSON.",
    icon: "fileCheck",
  },
  {
    title: "DDoS Protection",
    description:
      "Multi-layer DDoS mitigation at network and application layers with automatic traffic scrubbing.",
    icon: "shield",
  },
  {
    title: "Penetration Testing",
    description:
      "Annual third-party penetration tests by certified security firms. Remediation tracked to resolution.",
    icon: "alertTriangle",
  },
];

const TRUST_STATS: TrustStat[] = [
  {
    label: "Uptime SLA",
    value: "99.99%",
    sublabel: "Measured over the last 12 months",
  },
  {
    label: "Data Centers",
    value: "6",
    sublabel: "Across 3 continents",
  },
  {
    label: "Security Team",
    value: "24",
    sublabel: "Dedicated engineers",
  },
  {
    label: "Bug Bounty Paid",
    value: "$450K+",
    sublabel: "Since program launch",
  },
];

/* ------------------------------------------------------------------ */
/* Data handling policies                                               */
/* ------------------------------------------------------------------ */

interface DataPolicy {
  title: string;
  description: string;
}

const DATA_POLICIES: DataPolicy[] = [
  {
    title: "Data Residency",
    description:
      "Your data is stored in the region you select during onboarding. Available regions include US-East, EU-West, and AP-Southeast. No cross-region transfers without explicit consent.",
  },
  {
    title: "Data Retention",
    description:
      "Active account data is retained for the duration of your subscription. After cancellation, data is retained for 30 days to allow reactivation, then scheduled for permanent deletion.",
  },
  {
    title: "Data Deletion",
    description:
      "Request full data deletion at any time through your account settings or by contacting support. Deletion is processed within 72 hours and verified with a confirmation receipt.",
  },
  {
    title: "Backup & Recovery",
    description:
      "Encrypted backups run every 6 hours with 30-day retention. Point-in-time recovery available for database records. Backups are stored in a separate geographic zone.",
  },
];

/* ================================================================== */
/* Page component                                                      */
/* ================================================================== */

export default function SecurityTrustPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-emerald-50 via-white to-white dark:border-gray-800 dark:from-emerald-950/20 dark:via-gray-950 dark:to-gray-950">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 shadow-sm dark:bg-emerald-900/40">
            <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl lg:text-5xl">
            Security & Trust
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
            Your data security is our highest priority. We employ industry-leading
            practices, maintain rigorous compliance certifications, and operate with
            full transparency so you can build with confidence.
          </p>

          {/* Quick trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {["SOC 2", "GDPR", "HIPAA", "ISO 27001"].map((badge) => (
              <span
                key={badge}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                  "border-emerald-200 bg-emerald-50 text-emerald-700",
                  "dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                )}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* -------------------------------------------------------- */}
        {/* Trust Stats                                               */}
        {/* -------------------------------------------------------- */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trust by the Numbers
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Key metrics that demonstrate our commitment to reliability and security.
          </p>
          <TrustStats stats={TRUST_STATS} className="mt-4" />
        </section>

        {/* -------------------------------------------------------- */}
        {/* Compliance Badges                                         */}
        {/* -------------------------------------------------------- */}
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Compliance & Certifications
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Independently verified certifications that validate our security posture.
          </p>
          <ComplianceBadges badges={COMPLIANCE_BADGES} className="mt-4" />
        </section>

        {/* -------------------------------------------------------- */}
        {/* Security Features                                         */}
        {/* -------------------------------------------------------- */}
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Security Features
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Comprehensive security controls protecting your data at every layer.
          </p>
          <SecurityFeatures features={SECURITY_FEATURES} className="mt-4" />
        </section>

        {/* -------------------------------------------------------- */}
        {/* Data Handling                                              */}
        {/* -------------------------------------------------------- */}
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Data Handling
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            How we store, retain, and delete your data.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {DATA_POLICIES.map((policy) => (
              <div
                key={policy.title}
                className={cn(
                  "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
                  "dark:border-gray-800 dark:bg-gray-950"
                )}
              >
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {policy.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {policy.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Security Contact / Responsible Disclosure                  */}
        {/* -------------------------------------------------------- */}
        <section className="mt-14 mb-16">
          <div
            className={cn(
              "rounded-xl border border-gray-200 bg-white p-8 shadow-sm",
              "dark:border-gray-800 dark:bg-gray-950"
            )}
          >
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-6">
              {/* Icon */}
              <div
                className={cn(
                  "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full",
                  "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                <Globe className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Content */}
              <div className="mt-4 sm:mt-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Responsible Disclosure
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Found a vulnerability? We appreciate responsible disclosure and
                  reward valid reports through our bug bounty program. Please do not
                  publicly disclose issues before we have had a chance to address them.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="mailto:security@example.com"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
                      "bg-blue-600 text-white transition-colors hover:bg-blue-700",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                      "dark:bg-blue-500 dark:hover:bg-blue-600"
                    )}
                  >
                    <Mail className="h-4 w-4" />
                    security@example.com
                  </a>

                  <a
                    href="https://example.com/bug-bounty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium",
                      "text-gray-700 transition-colors hover:bg-gray-50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                      "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                    )}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Bug Bounty Program
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
