/**
 * Generate Contract PDF — Example usage.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./contract-example.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { Contract, type ContractProps } from './contract';

// ---------------------------------------------------------------------------
// Example Contract Data
// ---------------------------------------------------------------------------

const contractData: ContractProps = {
  title: 'Web Development Services Agreement',
  contractNumber: 'SVC-2026-0042',
  effectiveDate: 'March 1, 2026',
  endDate: 'August 31, 2026',

  parties: [
    {
      name: 'Northwind Traders GmbH',
      role: 'Client',
      address: 'Friedrichstr. 123, 10117 Berlin, Germany',
      email: 'legal@northwind-traders.de',
    },
    {
      name: 'Acme Digital Studio LLC',
      role: 'Service Provider',
      address: '742 Innovation Drive, Suite 300, San Francisco, CA 94105',
      email: 'contracts@acmedigital.io',
    },
  ],

  recitals:
    'WHEREAS, Client desires to engage Service Provider for the design, development, and deployment ' +
    'of a custom web application platform; and WHEREAS, Service Provider possesses the expertise, ' +
    'personnel, and resources necessary to perform the services described herein; and WHEREAS, both ' +
    'parties wish to set forth the terms and conditions under which such services will be provided; ' +
    'NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, ' +
    'and for other good and valuable consideration, the receipt and sufficiency of which are hereby ' +
    'acknowledged, the parties agree as follows:',

  sections: [
    {
      number: '1',
      title: 'Scope of Work',
      content:
        'Service Provider shall design, develop, test, and deploy a custom web application ' +
        'platform as described in Exhibit A (the "Project"). The Project shall include the ' +
        'following major deliverables:',
      subSections: [
        {
          number: '1.1',
          content:
            'Frontend application built with React and Next.js, including responsive design ' +
            'for desktop, tablet, and mobile devices.',
        },
        {
          number: '1.2',
          content:
            'Backend API services with authentication, authorization, and data management ' +
            'capabilities using Node.js and PostgreSQL.',
        },
        {
          number: '1.3',
          content:
            'Cloud infrastructure setup on AWS including CI/CD pipelines, monitoring, ' +
            'and automated deployment scripts.',
        },
        {
          number: '1.4',
          content:
            'Documentation including technical architecture documentation, API reference, ' +
            'and user guides.',
        },
      ],
    },
    {
      number: '2',
      title: 'Timeline and Milestones',
      content:
        'The Project shall be completed in three phases over a six-month period. Each phase ' +
        'shall conclude with a milestone review and written acceptance by the Client.',
      subSections: [
        {
          number: '2.1',
          title: 'Phase 1 — Discovery & Design',
          content:
            'Weeks 1-4: Requirements gathering, wireframing, UI/UX design, and architecture ' +
            'documentation. Deliverable: Approved design specifications and technical architecture.',
        },
        {
          number: '2.2',
          title: 'Phase 2 — Development',
          content:
            'Weeks 5-18: Iterative development in two-week sprints with bi-weekly demos. ' +
            'Deliverable: Functional application with all core features.',
        },
        {
          number: '2.3',
          title: 'Phase 3 — Testing & Deployment',
          content:
            'Weeks 19-24: Quality assurance, performance testing, security audit, and ' +
            'production deployment. Deliverable: Production-ready application.',
        },
      ],
    },
    {
      number: '3',
      title: 'Intellectual Property',
      content:
        'All intellectual property rights in the deliverables created under this Agreement ' +
        'shall transfer to the Client upon full payment of all fees. Service Provider retains ' +
        'the right to use general knowledge, skills, and experience gained during the Project, ' +
        'as well as any pre-existing tools, libraries, or frameworks that are not specific to ' +
        'the Client\'s business. Any open-source components shall be identified in the technical ' +
        'documentation and remain subject to their respective licenses.',
    },
    {
      number: '4',
      title: 'Warranties and Representations',
      content:
        'Service Provider warrants that: (a) it has the authority and capacity to enter into this ' +
        'Agreement; (b) the deliverables will conform to the specifications set forth in Exhibit A; ' +
        '(c) the deliverables will be free from material defects for a period of 90 days following ' +
        'acceptance; and (d) the deliverables will not infringe upon any third-party intellectual ' +
        'property rights. Client warrants that it will provide timely feedback, access to required ' +
        'systems, and all necessary content and materials.',
    },
  ],

  paymentTerms: {
    amount: 120000,
    currency: 'USD',
    schedule: 'Monthly installments of $20,000 upon completion of each milestone review',
    method: 'Wire transfer to the account specified in Exhibit B',
    notes:
      'Payment is due within 15 business days of invoice date. Late payments shall accrue ' +
      'interest at 1.5% per month. All amounts are exclusive of applicable taxes.',
  },

  confidentialityClause:
    'Each party agrees to maintain the confidentiality of all proprietary and confidential ' +
    'information disclosed by the other party during the term of this Agreement and for a ' +
    'period of two (2) years thereafter. Confidential information includes, but is not limited ' +
    'to, business plans, technical specifications, source code, customer data, financial ' +
    'information, and trade secrets. This obligation shall not apply to information that: ' +
    '(a) is or becomes publicly available through no fault of the receiving party; (b) was ' +
    'known to the receiving party prior to disclosure; (c) is independently developed by the ' +
    'receiving party; or (d) is required to be disclosed by law or regulation.',

  terminationClause:
    'Either party may terminate this Agreement with thirty (30) days\' written notice to the ' +
    'other party. In the event of termination: (a) Client shall pay for all work completed ' +
    'and accepted through the termination date; (b) Service Provider shall deliver all work ' +
    'in progress and related documentation; (c) each party shall return all confidential ' +
    'materials belonging to the other party. Termination for cause (material breach, insolvency, ' +
    'or failure to cure a breach within 15 days of written notice) shall be effective immediately.',

  governingLaw: 'State of Delaware, United States of America',

  signatures: [
    {
      name: 'Hans Mueller',
      title: 'Chief Technology Officer',
      company: 'Northwind Traders GmbH',
    },
    {
      name: 'Sarah Chen',
      title: 'Managing Director',
      company: 'Acme Digital Studio LLC',
    },
  ],

  confidential: true,
};

// ---------------------------------------------------------------------------
// Generate PDF
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './contract-example.pdf';

  console.log('Generating Contract PDF...');
  console.log(`  Contract:  ${contractData.contractNumber}`);
  console.log(`  Title:     ${contractData.title}`);
  console.log(`  Parties:   ${contractData.parties.map((p) => p.company || p.name).join(' & ')}`);
  console.log(`  Sections:  ${contractData.sections.length}`);
  console.log(`  Output:    ${outputPath}`);

  const element = React.createElement(Contract, contractData);
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
