/**
 * Generate Certificate PDF — example usage.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./certificate.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { Certificate } from './certificate';

// ---------------------------------------------------------------------------
// Example data
// ---------------------------------------------------------------------------

const RECIPIENT = 'Alexandra Chen';
const COURSE = 'Advanced Cloud Architecture';
const DESCRIPTION =
  'has successfully completed the 40-hour Advanced Cloud Architecture program, ' +
  'demonstrating exceptional proficiency in distributed systems design, ' +
  'container orchestration, infrastructure-as-code, and production-grade ' +
  'deployment strategies.';
const DATE = 'February 18, 2026';
const ISSUER_NAME = 'Sergej Goetz';
const ISSUER_TITLE = 'Lead Instructor';
const ISSUER_ORG = 'Trinity Academy';
const CERT_ID = 'CERT-2026-0042';

// ---------------------------------------------------------------------------
// Generate PDF
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './certificate.pdf';

  console.log('Generating Certificate PDF...');
  console.log(`  Recipient:  ${RECIPIENT}`);
  console.log(`  Course:     ${COURSE}`);
  console.log(`  Issuer:     ${ISSUER_NAME}, ${ISSUER_TITLE}`);
  console.log(`  Cert ID:    ${CERT_ID}`);
  console.log(`  Output:     ${outputPath}`);

  const element = React.createElement(Certificate, {
    recipientName: RECIPIENT,
    title: 'Certificate of Completion',
    subtitle: COURSE,
    description: DESCRIPTION,
    date: DATE,
    issuerName: ISSUER_NAME,
    issuerTitle: ISSUER_TITLE,
    issuerOrganization: ISSUER_ORG,
    certificateId: CERT_ID,
    // logoSrc: './logo.png',       // Uncomment and provide a path or base64 data URI
    // signatureSrc: './sig.png',   // Uncomment and provide a path or base64 data URI
  });

  const buffer = await renderToBuffer(element);

  writeFileSync(outputPath, buffer);
  console.log(
    `\nDone. ${(buffer.length / 1024).toFixed(1)} KB written to ${outputPath}`,
  );
}

main().catch((err) => {
  console.error('Certificate PDF generation failed:', err);
  process.exit(1);
});
