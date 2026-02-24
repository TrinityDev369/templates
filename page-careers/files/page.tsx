"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { JobCard } from "./components/job-card";
import type { Job } from "./components/job-card";
import { JobFiltersBar } from "./components/job-filters";
import type { JobFilters } from "./components/job-filters";
import { JobDetailModal } from "./components/job-detail-modal";

/* ================================================================== */
/* Sample job data -- edit these to match your openings                */
/* ================================================================== */
const JOBS: Job[] = [
  {
    id: "fe-engineer",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Berlin, Germany",
    type: "Full-time",
    postedDate: "Feb 10, 2026",
    shortDescription:
      "Build polished, high-performance interfaces with React, Next.js, and Tailwind CSS. Work closely with designers and backend engineers to ship features users love.",
    fullDescription:
      "We are looking for a Senior Frontend Engineer to join our product team in Berlin. You will own critical user-facing surfaces, drive frontend architecture decisions, and mentor junior engineers. You will collaborate daily with designers and product managers to translate complex requirements into elegant, accessible interfaces. Our stack is React 19, Next.js 15, Tailwind CSS, and TypeScript end-to-end.",
    requirements: [
      "5+ years of professional frontend development experience",
      "Deep expertise with React, TypeScript, and modern CSS",
      "Experience with Next.js App Router and server components",
      "Strong eye for design details and accessibility",
      "Comfortable working in a fast-paced, iterative environment",
    ],
    benefits: [
      "Competitive salary with equity participation",
      "30 days paid vacation",
      "Flexible hybrid work model (3 days office / 2 remote)",
      "Annual learning budget of EUR 2,000",
      "Modern office in Berlin Mitte with free lunch",
    ],
    applyUrl: "mailto:careers@example.com?subject=Senior%20Frontend%20Engineer",
  },
  {
    id: "be-engineer",
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote (EU)",
    type: "Remote",
    postedDate: "Feb 8, 2026",
    shortDescription:
      "Design and build scalable APIs and services powering our platform. Work with PostgreSQL, Node.js, and event-driven architectures.",
    fullDescription:
      "As a Backend Engineer you will design, implement, and operate the services that power our marketplace platform. You will work with PostgreSQL, Node.js/Bun, and event-driven patterns to build reliable, performant APIs. This is a fully remote role within EU time zones, with optional visits to our Berlin office.",
    requirements: [
      "3+ years of backend development with Node.js or similar",
      "Strong PostgreSQL skills including schema design and query optimization",
      "Experience with event-driven or message-queue architectures",
      "Familiarity with Docker and CI/CD pipelines",
      "Excellent written communication for async collaboration",
    ],
    benefits: [
      "Fully remote within EU time zones",
      "Competitive salary based on experience",
      "Home office setup budget of EUR 1,500",
      "Quarterly team offsites in Berlin",
      "Annual conference budget",
    ],
    applyUrl: "mailto:careers@example.com?subject=Backend%20Engineer",
  },
  {
    id: "product-designer",
    title: "Product Designer",
    department: "Design",
    location: "Berlin, Germany",
    type: "Full-time",
    postedDate: "Feb 5, 2026",
    shortDescription:
      "Shape the user experience of our platform from research through pixel-perfect handoff. Own the design process end to end.",
    fullDescription:
      "We are looking for a Product Designer to own the end-to-end design process for key product surfaces. You will conduct user research, create wireframes and prototypes, run usability tests, and deliver pixel-perfect designs to engineering. You will work in Figma and collaborate closely with product managers and frontend engineers.",
    requirements: [
      "4+ years of product design experience for web applications",
      "Expert-level Figma skills including component libraries",
      "Experience conducting user research and usability testing",
      "Strong understanding of responsive design and accessibility",
      "Portfolio demonstrating end-to-end design process",
    ],
    benefits: [
      "Competitive salary with equity participation",
      "30 days paid vacation",
      "Flexible hybrid work model",
      "Annual design conference attendance",
      "Latest MacBook Pro and peripherals",
    ],
    applyUrl: "mailto:careers@example.com?subject=Product%20Designer",
  },
  {
    id: "growth-marketer",
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "Berlin, Germany",
    type: "Full-time",
    postedDate: "Jan 28, 2026",
    shortDescription:
      "Drive user acquisition and retention through data-driven campaigns across paid, organic, and lifecycle channels.",
    fullDescription:
      "As our Growth Marketing Manager you will own the full acquisition and retention funnel. You will plan and execute campaigns across paid search, social, content, and email channels. You will set up tracking, run experiments, analyze results, and iterate rapidly. This role reports to the Head of Marketing and collaborates with product and design teams.",
    requirements: [
      "3+ years in growth or performance marketing for a SaaS or marketplace",
      "Hands-on experience with Google Ads, LinkedIn, and Meta ad platforms",
      "Strong analytical skills with tools like GA4, Mixpanel, or Amplitude",
      "Experience with email marketing automation (e.g. Customer.io, Mailchimp)",
      "Data-driven mindset with bias toward experimentation",
    ],
    benefits: [
      "Competitive salary plus performance bonus",
      "30 days paid vacation",
      "Marketing education budget",
      "Flexible working hours",
      "Team lunch on Wednesdays",
    ],
    applyUrl: "mailto:careers@example.com?subject=Growth%20Marketing%20Manager",
  },
  {
    id: "sales-ae",
    title: "Account Executive",
    department: "Sales",
    location: "Munich, Germany",
    type: "Full-time",
    postedDate: "Jan 22, 2026",
    shortDescription:
      "Close mid-market and enterprise deals, manage the full sales cycle, and build long-term client relationships.",
    fullDescription:
      "We are hiring an Account Executive based in Munich to drive revenue growth in the DACH region. You will manage the full sales cycle from prospecting through negotiation and close. You will work with marketing to qualify inbound leads and proactively build pipeline through outbound outreach. Ideal candidates are consultative sellers who thrive in a startup environment.",
    requirements: [
      "3+ years of B2B SaaS sales experience with a track record of hitting quota",
      "Experience selling to mid-market or enterprise accounts",
      "Fluent German and English",
      "Strong CRM hygiene (we use HubSpot)",
      "Self-motivated and comfortable with ambiguity",
    ],
    benefits: [
      "Competitive base salary plus uncapped commission",
      "30 days paid vacation",
      "Company car or mobility budget",
      "President's Club trip for top performers",
      "Modern office in central Munich",
    ],
    applyUrl: "mailto:careers@example.com?subject=Account%20Executive",
  },
  {
    id: "ops-contractor",
    title: "DevOps Contractor",
    department: "Operations",
    location: "Remote (Worldwide)",
    type: "Contract",
    postedDate: "Jan 15, 2026",
    shortDescription:
      "Help us level up our infrastructure, CI/CD, and observability. 6-month contract with potential to convert to full-time.",
    fullDescription:
      "We are looking for a DevOps contractor to improve our infrastructure and developer experience. You will work on Docker-based deployments, CI/CD pipelines (GitHub Actions), monitoring and alerting (Grafana, Prometheus), and infrastructure-as-code. This is a 6-month contract position, fully remote in any time zone, with the possibility of converting to a permanent role.",
    requirements: [
      "5+ years of DevOps or SRE experience",
      "Expert-level Docker and container orchestration skills",
      "Strong experience with GitHub Actions or similar CI/CD systems",
      "Familiarity with Grafana, Prometheus, and log aggregation",
      "Infrastructure-as-code experience (Terraform, Pulumi, or similar)",
    ],
    benefits: [
      "Competitive daily rate",
      "Fully remote with flexible hours",
      "Possibility to convert to permanent role",
      "Work with a small, senior engineering team",
      "Interesting technical challenges at scale",
    ],
    applyUrl: "mailto:careers@example.com?subject=DevOps%20Contractor",
  },
];

/* ================================================================== */
/* Hero stats                                                          */
/* ================================================================== */
const STATS = [
  { label: "Open Positions", value: JOBS.length.toString() },
  { label: "Team Members", value: "42" },
  { label: "Locations", value: "3" },
];

/* ================================================================== */
/* Page component                                                      */
/* ================================================================== */
export default function CareersPage() {
  const [filters, setFilters] = useState<JobFilters>({
    search: "",
    department: "",
    location: "",
    type: "",
  });

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  /* Derive unique filter options from data */
  const departments = useMemo(
    () => [...new Set(JOBS.map((j) => j.department))].sort(),
    []
  );
  const locations = useMemo(
    () => [...new Set(JOBS.map((j) => j.location))].sort(),
    []
  );

  /* Filter jobs */
  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      if (
        filters.search &&
        !job.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.department && job.department !== filters.department) {
        return false;
      }
      if (filters.location && job.location !== filters.location) {
        return false;
      }
      if (filters.type && job.type !== filters.type) {
        return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            Join Our Team
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Help us build the future of work. We are a passionate team solving
            hard problems at the intersection of technology, design, and
            business.
          </p>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Listings                                                    */}
      {/* ---------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filters */}
        <JobFiltersBar
          filters={filters}
          onChange={setFilters}
          departments={departments}
          locations={locations}
        />

        {/* Results count */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {filteredJobs.length}
          </span>{" "}
          {filteredJobs.length === 1 ? "position" : "positions"}
        </p>

        {/* Job list */}
        {filteredJobs.length > 0 ? (
          <div className="mt-4 grid gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              No positions found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              No open positions match your current filters. Try adjusting your
              search criteria or clearing all filters.
            </p>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  search: "",
                  department: "",
                  location: "",
                  type: "",
                })
              }
              className={cn(
                "mt-6 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium",
                "bg-blue-600 text-white hover:bg-blue-700 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              )}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Detail modal                                                */}
      {/* ---------------------------------------------------------- */}
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </main>
  );
}
