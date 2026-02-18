/**
 * Generate NDA PDF — example usage of the self-contained NDA template.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./nda-example.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { NDA, type NDAProps } from './nda';

// ---------------------------------------------------------------------------
// Example NDA data: mutual NDA between Trinity Agency and Horizon Labs
// ---------------------------------------------------------------------------

const ndaData: NDAProps = {
  effectiveDate: 'February 18, 2026',
  ndaType: 'mutual',
  referenceNumber: 'NDA-2026-0042',

  disclosingParty: {
    name: 'Sergej Goetz',
    title: 'Managing Director',
    company: 'Trinity Agency',
    address: 'Musterstrasse 12, 10115 Berlin, Germany',
    email: 'sergej@trinity.agency',
  },

  receivingParty: {
    name: 'Elena Vasquez',
    title: 'Chief Technology Officer',
    company: 'Horizon Labs Inc.',
    address: '2500 Innovation Way, Suite 400, Austin, TX 78701',
    email: 'elena.vasquez@horizonlabs.io',
  },

  purpose:
    'Evaluation of a potential joint software development partnership ' +
    'involving the integration of Trinity Agency\'s AI-powered project ' +
    'management platform with Horizon Labs\' distributed computing ' +
    'infrastructure, including the exchange of technical specifications, ' +
    'API documentation, architecture diagrams, and business projections.',

  governingLaw: 'the State of Delaware',
  termMonths: 24,
  survivalMonths: 36,
  showConfidentialFooter: true,
};

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './nda-example.pdf';

  console.log('Generating NDA PDF...');
  console.log(`  Type:       ${ndaData.ndaType}`);
  console.log(`  Party A:    ${ndaData.disclosingParty.name} (${ndaData.disclosingParty.company})`);
  console.log(`  Party B:    ${ndaData.receivingParty.name} (${ndaData.receivingParty.company})`);
  console.log(`  Effective:  ${ndaData.effectiveDate}`);
  console.log(`  Term:       ${ndaData.termMonths} months`);
  console.log(`  Reference:  ${ndaData.referenceNumber}`);
  console.log(`  Output:     ${outputPath}`);

  const element = React.createElement(NDA, ndaData);
  const buffer = await renderToBuffer(element);

  writeFileSync(outputPath, buffer);
  console.log(`\nDone. ${(buffer.length / 1024).toFixed(1)} KB written to ${outputPath}`);
}

main().catch((err) => {
  console.error('NDA PDF generation failed:', err);
  process.exit(1);
});
