/**
 * Generate Branded Report PDF — example usage.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./branded-report.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import {
  BrandedReport,
  type BrandedReportProps,
  type ReportSection,
  type TableData,
  type ChartDataPoint,
} from './report';

// ---------------------------------------------------------------------------
// Example Data
// ---------------------------------------------------------------------------

const sections: ReportSection[] = [
  {
    title: 'Project Overview',
    body:
      'This report summarizes the key metrics, milestones, and outcomes for Q4 2025. ' +
      'The team successfully delivered three major feature releases, onboarded 12 enterprise ' +
      'clients, and achieved a 98.7% uptime SLA across all production services.',
    bullets: [
      'Feature releases: Dashboard v3.0, API Gateway v2.1, Mobile SDK 1.0',
      'Client onboarding: 12 enterprise accounts ($480K ARR added)',
      'Infrastructure: migrated to multi-region deployment with < 50ms p99 latency',
    ],
  },
  {
    title: 'Key Achievements',
    body:
      'The engineering team exceeded all quarterly OKRs. Deployment frequency increased ' +
      'from 8 to 23 per week, change failure rate dropped below 2%, and mean time to recovery ' +
      'improved to under 15 minutes. The customer satisfaction score reached an all-time high of 4.8/5.',
    bullets: [
      'Deploy frequency: 23/week (up 188%)',
      'Change failure rate: 1.8% (down from 5.2%)',
      'MTTR: 14 minutes (down from 45 minutes)',
      'CSAT: 4.8/5.0',
    ],
  },
  {
    title: 'Revenue Analysis',
    body:
      'Total revenue for Q4 reached $2.4M, representing a 32% quarter-over-quarter increase. ' +
      'Subscription revenue grew 28%, while professional services contributed an additional $320K. ' +
      'Customer churn remained below 3% for the third consecutive quarter.',
  },
  {
    title: 'Risk Assessment',
    body:
      'Two medium-risk items require attention heading into Q1 2026. First, the legacy ' +
      'authentication service needs migration to the new identity platform before the March ' +
      'deprecation deadline. Second, the growing data volume (projected 40TB by Q2) requires ' +
      'a storage tier optimization strategy to control infrastructure costs.',
    bullets: [
      'Auth migration: 60% complete, on track for March deadline',
      'Storage optimization: RFP issued to three vendors, decision by January 30',
    ],
  },
];

const tableData: TableData = {
  caption: 'Quarterly Performance Metrics',
  headers: ['Metric', 'Q3 2025', 'Q4 2025', 'Change', 'Target'],
  rows: [
    ['Monthly Active Users', '45,200', '62,800', '+38.9%', '55,000'],
    ['Revenue (USD)', '$1.82M', '$2.40M', '+31.9%', '$2.20M'],
    ['Uptime SLA', '99.2%', '99.87%', '+0.67pp', '99.9%'],
    ['Avg Response Time', '210ms', '142ms', '-32.4%', '150ms'],
    ['Support Tickets', '342', '218', '-36.3%', '<250'],
    ['NPS Score', '62', '71', '+9pts', '65'],
    ['Deploy Frequency', '8/wk', '23/wk', '+187.5%', '15/wk'],
    ['Customer Churn', '3.1%', '2.7%', '-0.4pp', '<3%'],
  ],
};

const chartData: ChartDataPoint[] = [
  { label: 'Jan', value: 42 },
  { label: 'Feb', value: 55 },
  { label: 'Mar', value: 48 },
  { label: 'Apr', value: 63 },
  { label: 'May', value: 71 },
  { label: 'Jun', value: 68 },
  { label: 'Jul', value: 75 },
  { label: 'Aug', value: 82 },
  { label: 'Sep', value: 78 },
  { label: 'Oct', value: 88 },
  { label: 'Nov', value: 95 },
  { label: 'Dec', value: 100 },
];

// ---------------------------------------------------------------------------
// Assemble props
// ---------------------------------------------------------------------------

const props: BrandedReportProps = {
  title: 'Q4 2025 Performance Report',
  subtitle: 'Engineering & Business Metrics — October through December',
  companyName: 'Acme Corporation',
  author: 'Jane Smith, VP of Engineering',
  date: 'January 15, 2026',
  documentNumber: 'RPT-2026-Q4-001',
  confidential: true,

  // Optional: pass a base64-encoded logo
  // logoSrc: 'data:image/png;base64,...',

  executiveSummary:
    'Q4 2025 was a transformative quarter for Acme Corporation. Revenue grew 32% to $2.4M, ' +
    'driven by strong enterprise adoption and improved product reliability. The engineering ' +
    'team delivered three major releases while reducing deployment failures by 65%. Customer ' +
    'satisfaction reached an all-time high of 4.8/5, and net promoter score climbed to 71 — ' +
    'firmly in the "excellent" range. This report details the key achievements, performance ' +
    'metrics, and strategic priorities heading into Q1 2026.',

  sections,
  tableData,
  chartData,
  chartTitle: 'Monthly Active Users — 2025',

  conclusion:
    'Q4 demonstrated strong execution across all dimensions. The team is well-positioned ' +
    'to capitalize on the momentum heading into 2026. Priority areas for Q1 include completing ' +
    'the authentication migration, finalizing the storage optimization strategy, and expanding ' +
    'the enterprise sales pipeline to achieve the $3M quarterly revenue target. We recommend ' +
    'increasing the engineering headcount by 4 to support the growing product surface area.',

  colors: {
    primary: '#1a365d',
    secondary: '#2b6cb0',
    // muted, text, light use defaults
  },
};

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './branded-report.pdf';

  console.log('Generating Branded Report PDF...');
  console.log(`  Title:    ${props.title}`);
  console.log(`  Company:  ${props.companyName}`);
  console.log(`  Sections: ${props.sections.length}`);
  console.log(`  Output:   ${outputPath}`);

  const element = React.createElement(BrandedReport, props);
  const buffer = await renderToBuffer(element);

  writeFileSync(outputPath, buffer);
  console.log(
    `\nDone. ${(buffer.length / 1024).toFixed(1)} KB written to ${outputPath}`
  );
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
