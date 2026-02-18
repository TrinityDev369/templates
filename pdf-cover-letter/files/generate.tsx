/**
 * Generate Cover Letter PDF — Example usage of the CoverLetter template.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./cover-letter-example.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { CoverLetter, type CoverLetterProps } from './cover-letter';

// -----------------------------------------------------------------------------
// Example Data — Software Developer Applying to a Tech Company
// -----------------------------------------------------------------------------

const coverLetterData: CoverLetterProps = {
  applicant: {
    name: 'Elena Rodriguez',
    title: 'Full-Stack Software Engineer',
    email: 'elena.rodriguez@example.com',
    phone: '+1 (628) 555-0147',
    location: 'Austin, TX',
    website: 'elenarodriguez.dev',
    linkedIn: 'elenarodriguez',
  },

  recipient: {
    name: 'Marcus Chen',
    title: 'Director of Engineering',
    company: 'Nebula Systems',
    department: 'Platform Engineering',
    address: '2400 Congress Ave, Suite 300, Austin, TX 78701',
  },

  date: 'February 18, 2026',
  reference: 'Ref: NSY-ENG-2026-087',
  subject: 'Application for Senior Full-Stack Engineer — Platform Team',

  salutation: 'Dear Mr. Chen',

  body: [
    'I am writing to express my strong interest in the Senior Full-Stack Engineer position on the Platform Team at Nebula Systems. Having followed your company\'s trajectory since the Series B announcement, I am particularly impressed by the distributed systems architecture behind your real-time collaboration engine and the engineering culture that produced it.',

    'In my current role at Vertex Labs, I lead a cross-functional team of five engineers responsible for the core data pipeline that processes 12 million events daily. Over the past two years, I have redesigned our ingestion layer using TypeScript, Node.js, and Apache Kafka, reducing end-to-end latency from 4.2 seconds to 340 milliseconds while cutting infrastructure costs by 28%. I also introduced a comprehensive observability stack with OpenTelemetry and Grafana that decreased our mean time to resolution from 38 minutes to under 9 minutes.',

    'What draws me to Nebula Systems is your commitment to building developer-first tooling at scale. The challenges described in your recent engineering blog post on CRDTs and offline-first sync align closely with problems I have tackled in previous roles. At DataBridge Inc., I designed and shipped a conflict resolution system for collaborative editing that served 45,000 concurrent users with sub-second merge times. I am eager to bring that experience — and the lessons learned from it — to your platform team.',

    'I am confident that my combination of distributed systems expertise, leadership experience, and passion for developer tools makes me a strong fit for this role. I would welcome the opportunity to discuss how my background can contribute to the exciting work at Nebula Systems. I am available for a conversation at your convenience and look forward to hearing from you.',
  ],

  closing: 'Best regards',

  signature: {
    name: 'Elena Rodriguez',
    title: 'Full-Stack Software Engineer',
  },

  postscript:
    'I will be attending Austin Tech Summit on March 12 and would love the opportunity to connect in person if your schedule permits.',

  enclosures: ['Resume', 'Portfolio', 'References'],
};

// -----------------------------------------------------------------------------
// Generate
// -----------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './cover-letter-example.pdf';

  console.log('Generating Cover Letter PDF...');
  console.log(`  Applicant:  ${coverLetterData.applicant.name}`);
  console.log(`  Recipient:  ${coverLetterData.recipient.name}, ${coverLetterData.recipient.company}`);
  console.log(`  Subject:    ${coverLetterData.subject}`);
  console.log(`  Paragraphs: ${Array.isArray(coverLetterData.body) ? coverLetterData.body.length : 1}`);
  console.log(`  Output:     ${outputPath}`);

  const element = React.createElement(CoverLetter, coverLetterData);
  const buffer = await renderToBuffer(element);

  writeFileSync(outputPath, buffer);
  console.log(`\nDone. ${(buffer.length / 1024).toFixed(1)} KB written to ${outputPath}`);
}

main().catch((err) => {
  console.error('Cover Letter PDF generation failed:', err);
  process.exit(1);
});
