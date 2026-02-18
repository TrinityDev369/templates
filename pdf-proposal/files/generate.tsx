/**
 * Generate Example Proposal PDF
 *
 * Renders a sample web-development proposal with three phases, deliverables,
 * pricing, timeline, and standard terms & conditions.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./proposal.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { Proposal } from './proposal';

// ---------------------------------------------------------------------------
// Sample Data
// ---------------------------------------------------------------------------

const company = {
  name: 'Apex Digital Studio',
  email: 'hello@apexdigital.io',
  phone: '+1 (415) 555-0192',
  website: 'https://apexdigital.io',
  address: '100 Market Street, Suite 300, San Francisco, CA 94105',
};

const client = {
  name: 'Sarah Chen',
  company: 'GreenLeaf Health',
  address: '250 Park Avenue, New York, NY 10177',
  email: 'sarah.chen@greenleafhealth.com',
};

const sections = [
  {
    title: 'Current State Assessment',
    content:
      'GreenLeaf Health currently operates a legacy PHP monolith serving approximately 12,000 monthly active users. ' +
      'Page load times average 4.2 seconds, the mobile experience is not optimised, and the content management ' +
      'workflow requires developer involvement for routine updates. The existing infrastructure lacks automated ' +
      'testing and CI/CD pipelines, resulting in a 2-week average deployment cycle. User feedback surveys ' +
      'consistently highlight slow performance and difficulty navigating the patient portal as top pain points.',
  },
  {
    title: 'Proposed Architecture',
    content:
      'We recommend a modern JAMstack architecture built on Next.js 15 with React Server Components, a headless ' +
      'CMS (Sanity.io) for content management, and a PostgreSQL database behind a type-safe API layer using tRPC. ' +
      'The frontend will be deployed on Vercel with edge caching, targeting sub-1-second page loads. Authentication ' +
      'will use Auth.js with OIDC support for existing SSO integration. The patient portal will be rebuilt as a ' +
      'Progressive Web App with offline-first capabilities for appointment management and health records access.',
  },
  {
    title: 'Security & Compliance',
    content:
      'Given the healthcare context, HIPAA compliance is a first-class requirement. All patient data will be encrypted ' +
      'at rest (AES-256) and in transit (TLS 1.3). We will implement role-based access control (RBAC) with audit ' +
      'logging for all data access events. The infrastructure will be deployed on AWS with BAA coverage, and we will ' +
      'conduct a third-party penetration test before launch. SOC 2 Type II compliance documentation will be ' +
      'maintained throughout the engagement.',
  },
  {
    title: 'Performance Strategy',
    content:
      'Our performance strategy targets a Lighthouse score of 95+ across all key pages. We will implement ' +
      'image optimisation with next/image, code splitting with dynamic imports, and aggressive caching strategies. ' +
      'Server-side rendering for critical paths ensures fast first-contentful paint. A CDN edge network will serve ' +
      'static assets globally. We will establish performance budgets and automated regression testing in CI to ' +
      'prevent degradation over time.',
  },
];

const deliverables = [
  {
    item: 'Design System',
    description:
      'Figma component library with design tokens, responsive grid system, and accessibility-compliant components (WCAG 2.1 AA).',
  },
  {
    item: 'Frontend Application',
    description:
      'Next.js application with server components, patient portal PWA, appointment booking flow, and health records viewer.',
  },
  {
    item: 'API Layer',
    description:
      'Type-safe tRPC API with PostgreSQL integration, authentication middleware, rate limiting, and OpenAPI documentation.',
  },
  {
    item: 'CMS Integration',
    description:
      'Sanity.io workspace with custom schemas for blog posts, provider profiles, service pages, and FAQ content.',
  },
  {
    item: 'Infrastructure',
    description:
      'Terraform IaC modules for AWS deployment, CI/CD pipelines (GitHub Actions), staging and production environments.',
  },
  {
    item: 'Testing Suite',
    description:
      'End-to-end test suite (Playwright), unit tests (Vitest), API integration tests, and accessibility audit automation.',
  },
  {
    item: 'Documentation',
    description:
      'Technical architecture docs, API reference, deployment runbook, and content editor training materials.',
  },
];

const pricingItems = [
  {
    description: 'Discovery & UX Research (Phase 1)',
    quantity: 1,
    unitPrice: 12000,
    amount: 12000,
  },
  {
    description: 'UI/UX Design — Design System & Prototypes',
    quantity: 1,
    unitPrice: 18000,
    amount: 18000,
  },
  {
    description: 'Frontend Development — Next.js Application',
    quantity: 1,
    unitPrice: 45000,
    amount: 45000,
  },
  {
    description: 'Backend Development — API & Database',
    quantity: 1,
    unitPrice: 32000,
    amount: 32000,
  },
  {
    description: 'Patient Portal PWA',
    quantity: 1,
    unitPrice: 22000,
    amount: 22000,
  },
  {
    description: 'CMS Setup & Content Migration',
    quantity: 1,
    unitPrice: 8000,
    amount: 8000,
  },
  {
    description: 'Infrastructure & DevOps',
    quantity: 1,
    unitPrice: 10000,
    amount: 10000,
  },
  {
    description: 'QA, Testing & Security Audit',
    quantity: 1,
    unitPrice: 9500,
    amount: 9500,
  },
  {
    description: 'Project Management (12 weeks)',
    quantity: 12,
    unitPrice: 1500,
    amount: 18000,
  },
];

const totalPrice = 174500;

const timeline = [
  {
    phase: 'Phase 1: Discovery',
    description:
      'Stakeholder interviews, user research, competitive analysis, information architecture, and technical planning.',
    duration: '2 weeks',
  },
  {
    phase: 'Phase 2: Design',
    description:
      'Design system creation, wireframes, high-fidelity prototypes, usability testing, and design sign-off.',
    duration: '3 weeks',
  },
  {
    phase: 'Phase 3: Build',
    description:
      'Frontend and backend development, CMS integration, patient portal PWA, infrastructure setup, and iterative QA.',
    duration: '6 weeks',
  },
  {
    phase: 'Phase 4: Launch',
    description:
      'Security audit, performance optimisation, content migration, staging review, production deployment, and handover.',
    duration: '1 week',
  },
];

const terms =
  'Payment Terms: 30% deposit upon acceptance, 40% at Phase 2 completion, 30% upon final delivery. ' +
  'Invoices are due within 14 days of issue. Late payments incur 1.5% monthly interest.\n\n' +
  'Intellectual Property: All work product, source code, and design assets become the exclusive property of ' +
  'the Client upon full payment. Apex Digital Studio retains the right to showcase the project in its portfolio ' +
  'unless otherwise agreed in writing.\n\n' +
  'Scope Changes: Changes to the agreed scope will be documented via a Change Order with updated timeline ' +
  'and pricing. No additional work will commence without written approval from both parties.\n\n' +
  'Warranty: We provide a 90-day warranty period after launch covering defects in the delivered software. ' +
  'This does not cover new feature requests, third-party service outages, or issues caused by Client modifications.\n\n' +
  'Confidentiality: Both parties agree to keep all project-related information confidential. This includes ' +
  'technical specifications, business data, pricing, and any proprietary methodologies shared during the engagement.\n\n' +
  'Termination: Either party may terminate this agreement with 14 days written notice. In such case, the Client ' +
  'will be invoiced for all work completed to date, and all deliverables produced will be transferred to the Client.';

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './proposal.pdf';

  console.log('Generating Proposal PDF...');
  console.log(`  Company:   ${company.name}`);
  console.log(`  Client:    ${client.name} (${client.company})`);
  console.log(`  Sections:  ${sections.length}`);
  console.log(`  Items:     ${pricingItems.length} line items`);
  console.log(`  Total:     $${totalPrice.toLocaleString()}`);
  console.log(`  Output:    ${outputPath}`);
  console.log('');

  const element = React.createElement(Proposal, {
    company,
    client,
    proposalNumber: 'PROP-2026-042',
    date: 'February 18, 2026',
    validUntil: 'March 18, 2026',
    title: 'GreenLeaf Health\nPlatform Modernization',
    executiveSummary:
      'GreenLeaf Health is a growing digital health platform serving over 12,000 monthly active users. ' +
      'As patient expectations evolve and the competitive landscape intensifies, the current legacy infrastructure ' +
      'is becoming a bottleneck — slow page loads, a suboptimal mobile experience, and a cumbersome content ' +
      'management workflow are limiting growth.\n\n' +
      'Apex Digital Studio proposes a complete platform modernization built on Next.js, a headless CMS, and a ' +
      'type-safe API layer. The new architecture will deliver sub-1-second page loads, a mobile-first patient ' +
      'portal with offline capabilities, and a self-service content management system that eliminates developer ' +
      'dependencies for routine updates.\n\n' +
      'This proposal outlines our approach across four phases over 12 weeks, with a fixed-price investment of ' +
      '$174,500. HIPAA compliance, security best practices, and performance are embedded at every stage — not ' +
      'bolted on after the fact.',
    sections,
    deliverables,
    pricingItems,
    totalPrice,
    timeline,
    terms,
    currency: 'USD',
  });

  const buffer = await renderToBuffer(element);
  writeFileSync(outputPath, buffer);

  console.log(
    `Done. ${(buffer.length / 1024).toFixed(1)} KB written to ${outputPath}`
  );
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
