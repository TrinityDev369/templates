/**
 * Generate Invoice PDF — Example usage of the Invoice template.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./invoice-example.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { Invoice, type InvoiceProps } from './invoice';

// ---------------------------------------------------------------------------
// Example Invoice Data
// ---------------------------------------------------------------------------

const invoiceData: InvoiceProps = {
  company: {
    name: 'Acme Digital Studio',
    address: ['742 Innovation Drive', 'Suite 300', 'San Francisco, CA 94105'],
    email: 'billing@acmedigital.io',
    phone: '+1 (415) 555-0192',
    taxId: 'US-82-1234567',
    website: 'https://acmedigital.io',
    // logo: './path-to-logo.png',  // Uncomment and set path if you have a logo
  },

  client: {
    name: 'Northwind Traders GmbH',
    address: ['Friedrichstr. 123', '10117 Berlin', 'Germany'],
    email: 'accounts@northwind-traders.de',
    phone: '+49 30 1234 5678',
  },

  invoiceNumber: 'INV-2026-0042',
  date: 'February 18, 2026',
  dueDate: 'March 20, 2026',

  items: [
    {
      description: 'Web Application Development — Sprint 14 (2 weeks)',
      quantity: 80,
      unitPrice: 150.0,
      amount: 12000.0,
    },
    {
      description: 'UI/UX Design — Dashboard Redesign',
      quantity: 24,
      unitPrice: 130.0,
      amount: 3120.0,
    },
    {
      description: 'Security Audit — Penetration Testing & Report',
      quantity: 1,
      unitPrice: 2500.0,
      amount: 2500.0,
    },
    {
      description: 'Cloud Infrastructure Setup — AWS / Docker / CI Pipeline',
      quantity: 16,
      unitPrice: 175.0,
      amount: 2800.0,
    },
    {
      description: 'Project Management & Technical Consultation',
      quantity: 12,
      unitPrice: 120.0,
      amount: 1440.0,
    },
  ],

  subtotal: 21860.0,
  taxRate: 19,
  taxAmount: 4153.4,
  total: 26013.4,

  paymentTerms:
    'Net 30 days. A late payment fee of 1.5% per month will be applied to overdue balances. ' +
    'Please reference the invoice number in your payment.',

  paymentDetails: {
    bankName: 'Deutsche Bank AG',
    accountName: 'Acme Digital Studio LLC',
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX',
    instructions:
      'Wire transfer preferred. For PayPal payments, send to billing@acmedigital.io.',
  },

  notes:
    'Hours are tracked via Toggl and detailed time logs are available upon request. ' +
    'Sprint 14 included authentication module, dashboard analytics, and API rate limiting.',

  termsAndConditions:
    'All intellectual property rights for deliverables transfer to the client upon full payment. ' +
    'Source code is provided via private Git repository. ' +
    'Support for delivered work is included for 30 days after final payment. ' +
    'This invoice is governed by the Master Services Agreement dated January 5, 2026.',

  currencySymbol: '$',
};

// ---------------------------------------------------------------------------
// Generate PDF
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './invoice-example.pdf';

  console.log('Generating Invoice PDF...');
  console.log(`  Invoice:  ${invoiceData.invoiceNumber}`);
  console.log(`  Client:   ${invoiceData.client.name}`);
  console.log(`  Items:    ${invoiceData.items.length}`);
  console.log(`  Total:    ${invoiceData.currencySymbol}${invoiceData.total.toFixed(2)}`);
  console.log(`  Output:   ${outputPath}`);

  const element = React.createElement(Invoice, invoiceData);
  const buffer = await renderToBuffer(element);

  writeFileSync(outputPath, buffer);
  console.log(
    `\nDone. ${(buffer.length / 1024).toFixed(1)} KB written to ${outputPath}`,
  );
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
