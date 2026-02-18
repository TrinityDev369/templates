/**
 * Generate Resume PDF — Example usage of the Resume template.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./resume.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { Resume } from './resume';

// -----------------------------------------------------------------------------
// Example Data — Software Engineer Resume
// -----------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './resume.pdf';

  const element = React.createElement(Resume, {
    name: 'Alexandra Chen',
    title: 'Senior Software Engineer',
    email: 'alex.chen@example.com',
    phone: '+1 (415) 555-0198',
    location: 'San Francisco, CA',
    website: 'alexchen.dev',
    linkedIn: 'alexandrachen',

    summary:
      'Senior Software Engineer with 8+ years of experience building scalable distributed ' +
      'systems and leading cross-functional teams. Proven track record delivering ' +
      'high-impact products at both startups and enterprise companies. Passionate about ' +
      'developer experience, system reliability, and mentoring junior engineers.',

    experience: [
      {
        company: 'Stripe',
        role: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: 'Jan 2022',
        endDate: 'Present',
        highlights: [
          'Architected and led migration of payment processing pipeline to event-driven architecture, reducing p99 latency by 40% and handling 50K+ transactions per second.',
          'Designed real-time fraud detection microservice using Kafka Streams, catching $2.3M in fraudulent transactions in first quarter after launch.',
          'Mentored 4 junior engineers through structured growth plans, with 2 promoted to mid-level within 18 months.',
          'Drove adoption of OpenTelemetry across 12 services, reducing mean time to resolution from 45 minutes to 12 minutes.',
        ],
      },
      {
        company: 'Datadog',
        role: 'Software Engineer II',
        location: 'New York, NY',
        startDate: 'Mar 2019',
        endDate: 'Dec 2021',
        highlights: [
          'Built high-throughput metrics ingestion pipeline processing 2 billion data points per day using Go and Apache Kafka.',
          'Implemented custom time-series compression algorithm that reduced storage costs by 35% ($1.2M annual savings).',
          'Led cross-team initiative to standardize API design patterns, resulting in shared OpenAPI tooling adopted by 8 teams.',
        ],
      },
      {
        company: 'Palantir Technologies',
        role: 'Software Engineer',
        location: 'Palo Alto, CA',
        startDate: 'Jul 2016',
        endDate: 'Feb 2019',
        highlights: [
          'Developed data pipeline orchestration framework used across 15+ government and commercial deployments.',
          'Optimized Spark job scheduling, reducing average pipeline execution time from 4 hours to 45 minutes.',
          'Contributed to open-source libraries for secure data serialization (2.1K GitHub stars).',
        ],
      },
    ],

    education: [
      {
        institution: 'Stanford University',
        degree: 'M.S.',
        field: 'Computer Science',
        startDate: '2014',
        endDate: '2016',
        gpa: '3.92/4.00',
      },
      {
        institution: 'University of California, Berkeley',
        degree: 'B.S.',
        field: 'Electrical Engineering & Computer Science',
        startDate: '2010',
        endDate: '2014',
        gpa: '3.85/4.00',
      },
    ],

    skills: [
      {
        category: 'Languages',
        items: ['TypeScript', 'Go', 'Python', 'Rust', 'Java', 'SQL'],
      },
      {
        category: 'Frameworks',
        items: ['React', 'Next.js', 'Node.js', 'FastAPI', 'gRPC', 'GraphQL'],
      },
      {
        category: 'Infrastructure',
        items: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Kafka', 'PostgreSQL', 'Redis'],
      },
      {
        category: 'Practices',
        items: ['System Design', 'CI/CD', 'Observability', 'Event-Driven Architecture', 'TDD'],
      },
    ],

    certifications: [
      {
        name: 'AWS Solutions Architect Professional',
        issuer: 'Amazon Web Services',
        date: 'Mar 2023',
      },
      {
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'CNCF',
        date: 'Nov 2022',
      },
    ],

    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Mandarin Chinese', level: 'Professional Working' },
      { name: 'Spanish', level: 'Conversational' },
    ],
  });

  console.log('Generating Resume PDF...');
  console.log(`  Name:       Alexandra Chen`);
  console.log(`  Title:      Senior Software Engineer`);
  console.log(`  Experience: 3 positions`);
  console.log(`  Education:  2 degrees`);
  console.log(`  Output:     ${outputPath}`);

  const buffer = await renderToBuffer(element);
  writeFileSync(outputPath, buffer);

  console.log(`\nDone. ${(buffer.length / 1024).toFixed(1)} KB written to ${outputPath}`);
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
