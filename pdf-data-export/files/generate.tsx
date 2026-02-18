/**
 * Generate Data Export PDF — Example usage.
 *
 * Usage:
 *   npx tsx generate.tsx [output-path]
 *
 * Default output: ./data-export-example.pdf
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { DataExport, type DataExportProps } from './data-export';

// ---------------------------------------------------------------------------
// Example Data — Employee Directory (25 records)
// ---------------------------------------------------------------------------

const employees: Record<string, string | number>[] = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', role: 'Senior Developer', salary: 135000, location: 'San Francisco' },
  { id: 2, name: 'Bob Williams', department: 'Engineering', role: 'Tech Lead', salary: 155000, location: 'San Francisco' },
  { id: 3, name: 'Carol Martinez', department: 'Design', role: 'UX Designer', salary: 115000, location: 'New York' },
  { id: 4, name: 'David Lee', department: 'Engineering', role: 'Backend Developer', salary: 128000, location: 'Austin' },
  { id: 5, name: 'Eva Chen', department: 'Product', role: 'Product Manager', salary: 140000, location: 'San Francisco' },
  { id: 6, name: 'Frank Wilson', department: 'Engineering', role: 'DevOps Engineer', salary: 132000, location: 'Remote' },
  { id: 7, name: 'Grace Kim', department: 'Marketing', role: 'Content Strategist', salary: 95000, location: 'New York' },
  { id: 8, name: 'Henry Patel', department: 'Engineering', role: 'Frontend Developer', salary: 125000, location: 'Austin' },
  { id: 9, name: 'Iris Nakamura', department: 'Design', role: 'Design Lead', salary: 138000, location: 'San Francisco' },
  { id: 10, name: 'James Brown', department: 'Sales', role: 'Account Executive', salary: 110000, location: 'Chicago' },
  { id: 11, name: 'Karen Lopez', department: 'HR', role: 'HR Manager', salary: 105000, location: 'New York' },
  { id: 12, name: 'Leo Russo', department: 'Engineering', role: 'QA Engineer', salary: 112000, location: 'Remote' },
  { id: 13, name: 'Mia Thompson', department: 'Engineering', role: 'Senior Developer', salary: 140000, location: 'San Francisco' },
  { id: 14, name: 'Noah Garcia', department: 'Finance', role: 'Financial Analyst', salary: 98000, location: 'Chicago' },
  { id: 15, name: 'Olivia Wright', department: 'Product', role: 'Product Designer', salary: 120000, location: 'New York' },
  { id: 16, name: 'Peter Zhang', department: 'Engineering', role: 'ML Engineer', salary: 160000, location: 'San Francisco' },
  { id: 17, name: 'Quinn Adams', department: 'Marketing', role: 'Marketing Manager', salary: 108000, location: 'Austin' },
  { id: 18, name: 'Rachel Singh', department: 'Engineering', role: 'Security Engineer', salary: 145000, location: 'Remote' },
  { id: 19, name: 'Sam Taylor', department: 'Sales', role: 'Sales Director', salary: 150000, location: 'Chicago' },
  { id: 20, name: 'Tina Hernandez', department: 'Design', role: 'Visual Designer', salary: 105000, location: 'Austin' },
  { id: 21, name: 'Umar Khan', department: 'Engineering', role: 'Platform Engineer', salary: 138000, location: 'Remote' },
  { id: 22, name: 'Victoria Scott', department: 'Legal', role: 'General Counsel', salary: 175000, location: 'New York' },
  { id: 23, name: 'William Ng', department: 'Engineering', role: 'Staff Engineer', salary: 170000, location: 'San Francisco' },
  { id: 24, name: 'Xena Park', department: 'Product', role: 'Program Manager', salary: 130000, location: 'Austin' },
  { id: 25, name: 'Yusuf Ali', department: 'Engineering', role: 'Junior Developer', salary: 95000, location: 'Remote' },
];

const totalSalary = employees.reduce((sum, e) => sum + (e.salary as number), 0);
const avgSalary = totalSalary / employees.length;

const exportProps: DataExportProps = {
  title: 'Employee Directory',
  subtitle: 'Full-Time Staff — Q1 2026',
  exportDate: 'February 18, 2026',
  generatedBy: 'HR Admin Dashboard',
  pageSize: 'A4',
  orientation: 'landscape',

  columns: [
    { key: 'id', label: 'ID', width: '6%', align: 'center' },
    { key: 'name', label: 'Full Name', width: '20%' },
    { key: 'department', label: 'Department', width: '16%' },
    { key: 'role', label: 'Role', width: '22%' },
    { key: 'salary', label: 'Salary (USD)', width: '16%', align: 'right' },
    { key: 'location', label: 'Location', width: '20%' },
  ],

  rows: employees.map((e) => ({
    ...e,
    salary: `$${(e.salary as number).toLocaleString()}`,
  })),

  summary: [
    { label: 'Total Employees', value: String(employees.length) },
    { label: 'Total Annual Salary', value: `$${totalSalary.toLocaleString()}` },
    { label: 'Average Salary', value: `$${Math.round(avgSalary).toLocaleString()}` },
    { label: 'Departments', value: String(new Set(employees.map((e) => e.department)).size) },
    { label: 'Remote Workers', value: String(employees.filter((e) => e.location === 'Remote').length) },
  ],
};

// ---------------------------------------------------------------------------
// Generate PDF
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || './data-export-example.pdf';

  console.log('Generating Data Export PDF...');
  console.log(`  Title:    ${exportProps.title}`);
  console.log(`  Columns:  ${exportProps.columns.length}`);
  console.log(`  Rows:     ${exportProps.rows.length}`);
  console.log(`  Layout:   ${exportProps.orientation} ${exportProps.pageSize}`);
  console.log(`  Output:   ${outputPath}`);

  const element = React.createElement(DataExport, exportProps);
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
