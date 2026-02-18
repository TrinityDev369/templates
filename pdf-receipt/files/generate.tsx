/**
 * Generate Receipt PDF — Example usage of the Receipt template.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./receipt-example.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { Receipt, type ReceiptProps } from './receipt';

// ---------------------------------------------------------------------------
// Example Receipt Data
// ---------------------------------------------------------------------------

const receiptData: ReceiptProps = {
  company: {
    name: 'Acme Digital Studio',
    address: '742 Innovation Drive, Suite 300, San Francisco, CA 94105',
    email: 'billing@acmedigital.io',
    phone: '+1 (415) 555-0192',
    website: 'https://acmedigital.io',
    // logo: './path-to-logo.png',  // Uncomment and set path if you have a logo
  },

  receiptNumber: 'RCT-2026-0087',
  date: 'February 18, 2026',
  paymentMethod: 'VISA ending 4242',
  transactionId: 'txn_3R8kPw2eZvKYlo2C0F4xVnBq',

  customerName: 'Alexandra Chen',
  customerEmail: 'alexandra.chen@example.com',

  items: [
    {
      description: 'Pro Plan Subscription — Monthly',
      quantity: 1,
      unitPrice: 49.00,
      amount: 49.00,
    },
    {
      description: 'Additional Team Seat (3 seats)',
      quantity: 3,
      unitPrice: 12.00,
      amount: 36.00,
    },
    {
      description: 'Priority Support Add-on',
      quantity: 1,
      unitPrice: 19.99,
      amount: 19.99,
    },
  ],

  subtotal: 104.99,
  tax: 8.92,
  taxRate: 8.5,
  total: 113.91,
  amountPaid: 113.91,
  balanceDue: 0,

  currency: '$',

  notes:
    'Your subscription renews automatically on March 18, 2026. ' +
    'You can manage your plan and payment methods at acmedigital.io/billing. ' +
    'For questions, contact billing@acmedigital.io.',
};

// ---------------------------------------------------------------------------
// Generate PDF
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './receipt-example.pdf';

  console.log('Generating Receipt PDF...');
  console.log(`  Receipt:    ${receiptData.receiptNumber}`);
  console.log(`  Customer:   ${receiptData.customerName}`);
  console.log(`  Items:      ${receiptData.items.length}`);
  console.log(`  Total:      ${receiptData.currency}${receiptData.total.toFixed(2)}`);
  console.log(`  Paid:       ${receiptData.currency}${receiptData.amountPaid.toFixed(2)}`);
  console.log(`  Balance:    ${receiptData.currency}${receiptData.balanceDue.toFixed(2)}`);
  console.log(`  Output:     ${outputPath}`);

  const element = React.createElement(Receipt, receiptData);
  const buffer = await renderToBuffer(element);

  writeFileSync(outputPath, buffer);
  console.log(
    `\nDone. ${(buffer.length / 1024).toFixed(1)} KB written to ${outputPath}`,
  );
}

main().catch((err) => {
  console.error('Receipt PDF generation failed:', err);
  process.exit(1);
});
