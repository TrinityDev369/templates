"use client";

import { useState, useMemo, useCallback } from "react";
import { Puzzle } from "lucide-react";
import { IntegrationCard } from "./components/integration-card";
import {
  IntegrationFilters,
  type CategoryFilter,
} from "./components/integration-filters";
import { IntegrationDetail } from "./components/integration-detail";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Integration {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  category: "Communication" | "Analytics" | "Storage" | "Payments" | "DevOps" | "CRM";
  status: "available" | "beta" | "coming-soon";
  popular: boolean;
  color: string;
  features: string[];
  setupSteps: string[];
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const INTEGRATIONS: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Real-time messaging and notifications for your team.",
    fullDescription:
      "Connect Slack to receive instant notifications about project updates, task completions, and team activity. Set up custom channels for different projects and configure alerts so your team never misses a beat.",
    category: "Communication",
    status: "available",
    popular: true,
    color: "#4A154B",
    features: [
      "Real-time project notifications",
      "Custom channel routing per project",
      "Slash commands for quick task creation",
      "Thread-based discussion syncing",
      "Scheduled status digests",
    ],
    setupSteps: [
      "Navigate to Settings > Integrations and click Connect for Slack.",
      "Authorize the app in your Slack workspace.",
      "Choose default channels for notifications.",
      "Configure notification preferences per project.",
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Source control and CI/CD pipeline integration.",
    fullDescription:
      "Link your GitHub repositories to automatically track commits, pull requests, and deployments. Sync issues bidirectionally and trigger workflows based on code events for a seamless development experience.",
    category: "DevOps",
    status: "available",
    popular: true,
    color: "#24292F",
    features: [
      "Automatic commit and PR tracking",
      "Bidirectional issue syncing",
      "Deployment status monitoring",
      "Branch protection rule awareness",
      "Code review assignment integration",
    ],
    setupSteps: [
      "Install the GitHub App from the marketplace.",
      "Select the repositories you want to connect.",
      "Map repositories to projects in your dashboard.",
      "Enable webhook events for real-time updates.",
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing and subscription management.",
    fullDescription:
      "Integrate Stripe to handle payments, invoicing, and subscription billing directly within the platform. Track revenue metrics, manage customer payment methods, and automate recurring charges effortlessly.",
    category: "Payments",
    status: "available",
    popular: true,
    color: "#635BFF",
    features: [
      "One-time and recurring payments",
      "Automated invoice generation",
      "Revenue dashboard and analytics",
      "Customer payment portal",
      "Multi-currency support",
    ],
    setupSteps: [
      "Enter your Stripe API keys in Settings > Payments.",
      "Configure webhook endpoints for event handling.",
      "Set up your pricing plans and products.",
      "Test with Stripe test mode before going live.",
    ],
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    description: "Cloud file storage and asset management.",
    fullDescription:
      "Connect to Amazon S3 for scalable file storage, asset hosting, and backup management. Upload project files, share deliverables with clients, and maintain version history with automatic backups to your S3 buckets.",
    category: "Storage",
    status: "available",
    popular: false,
    color: "#FF9900",
    features: [
      "Drag-and-drop file uploads",
      "Automatic version history",
      "Pre-signed URL sharing",
      "Bucket policy management",
      "Storage usage analytics",
    ],
    setupSteps: [
      "Provide your AWS access key and secret in Settings > Storage.",
      "Select or create an S3 bucket for the integration.",
      "Configure folder structure and naming conventions.",
      "Set file size limits and allowed file types.",
    ],
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Website traffic and user behavior analytics.",
    fullDescription:
      "Embed Google Analytics data directly into your project dashboards. Monitor website performance, track conversion funnels, and generate client-ready reports without leaving the platform.",
    category: "Analytics",
    status: "available",
    popular: true,
    color: "#E37400",
    features: [
      "Embedded analytics dashboards",
      "Custom report generation",
      "Goal and conversion tracking",
      "Real-time visitor monitoring",
      "Automated monthly report emails",
    ],
    setupSteps: [
      "Sign in with your Google account.",
      "Select the Analytics property to connect.",
      "Choose the metrics to display on your dashboard.",
      "Configure automated reporting schedules.",
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM, contact management, and deal tracking.",
    fullDescription:
      "Sync your HubSpot CRM to manage contacts, track deals, and automate outreach from within the platform. Keep your sales pipeline up to date and nurture leads with integrated email sequences and activity tracking.",
    category: "CRM",
    status: "available",
    popular: false,
    color: "#FF7A59",
    features: [
      "Two-way contact syncing",
      "Deal pipeline visualization",
      "Email sequence automation",
      "Activity timeline tracking",
      "Custom property mapping",
    ],
    setupSteps: [
      "Authorize your HubSpot account via OAuth.",
      "Map contact fields between platforms.",
      "Select deal stages to sync.",
      "Enable activity logging for emails and calls.",
    ],
  },
  {
    id: "jira",
    name: "Jira",
    description: "Agile project tracking and sprint management.",
    fullDescription:
      "Bridge your Jira boards with the platform for unified task management. Sync epics, stories, and bugs bidirectionally so engineering and project management stay aligned without context switching.",
    category: "DevOps",
    status: "beta",
    popular: false,
    color: "#0052CC",
    features: [
      "Bidirectional issue syncing",
      "Sprint board mirroring",
      "Automatic status transitions",
      "Epic and story hierarchy mapping",
      "Custom field synchronization",
    ],
    setupSteps: [
      "Connect your Atlassian account.",
      "Select the Jira projects to sync.",
      "Map issue types to local task categories.",
      "Configure sync frequency and conflict rules.",
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automate workflows across 5,000+ apps.",
    fullDescription:
      "Use Zapier to connect the platform with thousands of other tools. Create automated workflows (Zaps) that trigger on project events, push data to spreadsheets, send notifications, and much more -- all without writing code.",
    category: "Communication",
    status: "available",
    popular: true,
    color: "#FF4F00",
    features: [
      "5,000+ app connections",
      "Custom trigger events",
      "Multi-step Zap workflows",
      "Conditional logic and filters",
      "Error notification and retry handling",
    ],
    setupSteps: [
      "Create a Zapier account if you do not have one.",
      "Search for the platform in Zapier's app directory.",
      "Authorize your account and select a trigger event.",
      "Build your Zap workflow with actions and filters.",
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Enterprise CRM and sales automation.",
    fullDescription:
      "Integrate Salesforce for enterprise-grade CRM capabilities. Synchronize accounts, opportunities, and contacts to maintain a single source of truth across your sales and delivery workflows.",
    category: "CRM",
    status: "coming-soon",
    popular: false,
    color: "#00A1E0",
    features: [
      "Account and opportunity syncing",
      "Lead scoring integration",
      "Custom object mapping",
      "Automated task creation from opportunities",
      "Salesforce report embedding",
    ],
    setupSteps: [
      "Integration will be available soon.",
      "Join the waitlist to be notified on launch.",
    ],
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Infrastructure monitoring and log management.",
    fullDescription:
      "Connect Datadog to monitor application performance, track infrastructure health, and aggregate logs in one view. Set up alerts that feed into your project dashboard for rapid incident response.",
    category: "Analytics",
    status: "beta",
    popular: false,
    color: "#632CA6",
    features: [
      "APM dashboard embedding",
      "Custom metric tracking",
      "Log aggregation and search",
      "Alert-to-task creation",
      "Infrastructure topology maps",
    ],
    setupSteps: [
      "Provide your Datadog API and application keys.",
      "Select the services and hosts to monitor.",
      "Configure alert thresholds and notification rules.",
      "Choose dashboard widgets to embed.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const filtered = useMemo(() => {
    let results = INTEGRATIONS;

    if (activeCategory !== "All") {
      results = results.filter((i) => i.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    return results;
  }, [activeCategory, searchQuery]);

  const handleSelect = useCallback((integration: Integration) => {
    setSelectedIntegration(integration);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIntegration(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Puzzle className="h-4 w-4" />
              Marketplace
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Integrations
            </h1>
            <p className="text-lg text-muted-foreground">
              Connect the tools you already use. Browse our growing library of
              integrations to streamline workflows and keep everything in sync.
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <IntegrationFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Puzzle className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              No integrations found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </section>

      {/* Detail panel */}
      {selectedIntegration && (
        <IntegrationDetail
          integration={selectedIntegration}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
