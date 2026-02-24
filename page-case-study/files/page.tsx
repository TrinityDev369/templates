import { CaseStudyHero } from "./components/case-study-hero";
import { CaseStudyStats } from "./components/case-study-stats";
import { CaseStudyContent } from "./components/case-study-content";
import { CaseStudyTestimonial } from "./components/case-study-testimonial";
import type { Metadata } from "next";

/* -------------------------------------------------------------------------- */
/*  Metadata                                                                  */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: "Case Study - How TechFlow Increased Conversions by 150%",
  description:
    "Learn how TechFlow partnered with us to redesign their platform, resulting in 150% more conversions and 50% lower operational costs.",
};

/* -------------------------------------------------------------------------- */
/*  Sample Data - Replace with your client's story                            */
/* -------------------------------------------------------------------------- */

const STATS = [
  { value: "150%", label: "Increase in conversions" },
  { value: "50%", label: "Reduction in costs" },
  { value: "3x", label: "Faster time to market" },
  { value: "98%", label: "Customer satisfaction" },
];

const CONTENT_SECTIONS = [
  {
    heading: "The Challenge",
    paragraphs: [
      "TechFlow, a fast-growing B2B SaaS company in the logistics space, was struggling with an aging platform that could not keep pace with customer demands. Their legacy system suffered from slow page loads, a confusing user interface, and a brittle architecture that made every new feature release a multi-week ordeal.",
      "Customer churn had risen to 8% per quarter, and the sales team reported losing deals because prospects were underwhelmed during product demos. The engineering team spent 60% of their time on maintenance rather than building new capabilities.",
    ],
    bullets: [
      "Average page load time exceeded 6 seconds on key workflows",
      "Feature releases took 4-6 weeks due to tightly coupled architecture",
      "Customer support tickets had doubled in the previous 12 months",
      "Mobile experience was essentially non-functional",
    ],
  },
  {
    heading: "The Solution",
    paragraphs: [
      "We partnered with TechFlow to execute a phased platform modernization. Rather than a risky big-bang rewrite, we adopted an incremental migration strategy: new features were built on a modern Next.js and TypeScript stack while the legacy system continued to serve existing workflows.",
      "The redesigned UI was grounded in extensive user research. We conducted 30 customer interviews, mapped 12 critical user journeys, and prototyped three design directions before settling on a clean, task-oriented interface that reduced clicks-to-completion by 40%.",
    ],
    bullets: [
      "Migrated to Next.js with server-side rendering for sub-second page loads",
      "Introduced a component library ensuring design consistency across 50+ screens",
      "Implemented a microservices architecture enabling independent deployments",
      "Built a real-time notification system reducing support ticket volume",
    ],
  },
  {
    heading: "The Results",
    paragraphs: [
      "Within six months of the initial launch, TechFlow saw transformative improvements across every key metric. Conversions on the signup flow increased by 150%, driven primarily by the dramatically faster and more intuitive onboarding experience.",
      "Operational costs dropped by 50% thanks to the move from a monolithic infrastructure to a containerized, auto-scaling architecture. The engineering team reclaimed 70% of their time for feature development, shipping new capabilities every week instead of every month.",
    ],
    bullets: [
      "Page load times dropped from 6 seconds to under 800 milliseconds",
      "Customer churn fell from 8% to 2.5% per quarter",
      "Net Promoter Score increased from 32 to 71",
      "Engineering deployment frequency improved from bi-weekly to daily",
    ],
  },
];

const TESTIMONIAL = {
  quote:
    "The transformation was remarkable. Our customers immediately noticed the difference, and the numbers speak for themselves. This partnership did not just modernize our platform - it fundamentally changed how we deliver value to our users.",
  personName: "Sarah Chen",
  role: "Chief Product Officer",
  company: "TechFlow",
  avatarInitials: "SC",
  avatarGradient: "from-emerald-500 to-teal-600",
};

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-white antialiased">
      <CaseStudyHero
        clientName="TechFlow"
        clientInitials="TF"
        clientLogoGradient="from-emerald-500 to-teal-600"
        title="How TechFlow Increased Conversions by 150%"
        industryTag="B2B SaaS / Logistics"
        summary="A complete platform modernization that slashed costs, accelerated delivery, and transformed the customer experience."
      />

      <CaseStudyStats stats={STATS} />

      <CaseStudyContent sections={CONTENT_SECTIONS} />

      <CaseStudyTestimonial
        testimonial={TESTIMONIAL}
        ctaHeading="Ready to achieve similar results?"
        ctaDescription="Let us help you transform your business with a tailored solution. Our team is ready to understand your challenges and deliver measurable outcomes."
        ctaButtonLabel="Start Your Project"
        ctaButtonHref="/contact"
      />
    </div>
  );
}
