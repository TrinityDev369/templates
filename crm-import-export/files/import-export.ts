// CRM CSV Import/Export Utilities — zero dependencies, pure TypeScript.

export interface ColumnSchema { name: string; type: 'string' | 'number' | 'date' | 'boolean'; required?: boolean }
export interface ParseError { row: number; column: string; message: string }
export interface ExportOptions { delimiter?: string; includeHeaders?: boolean; bom?: boolean }
export interface ValidationRule { field: string; type: 'required' | 'email' | 'phone' | 'date' | 'enum'; values?: string[] }
export type FieldMapping = Record<string, string>;

// -- Internal helpers --------------------------------------------------------

function detectDelimiter(line: string): string {
  let best = ',', max = 0;
  for (const d of [',', ';', '\t']) {
    const n = line.split(d).length - 1;
    if (n > max) { max = n; best = d; }
  }
  return best;
}

/** RFC-4180 parser: quoted fields, escaped quotes, newlines in quotes. */
function parseRows(input: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQ = false, i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (inQ) {
      if (ch === '"') {
        if (input[i + 1] === '"') { field += '"'; i += 2; }
        else { inQ = false; i++; }
      } else { field += ch; i++; }
      continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === delim) { row.push(field); field = ''; i++; continue; }
    if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      row.push(field); field = ''; rows.push(row); row = []; i++; continue;
    }
    field += ch; i++;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((a, k) =>
    a != null && typeof a === 'object' ? (a as Record<string, unknown>)[k] : undefined, obj);
}

function escapeField(v: string, d: string): string {
  return v.includes(d) || v.includes('"') || v.includes('\n') || v.includes('\r')
    ? '"' + v.replace(/"/g, '""') + '"' : v;
}

// -- Public API --------------------------------------------------------------

/** Parse a CSV string into row-objects. Optional schema for validation. */
export function parseCSV(
  input: string, schema?: ColumnSchema[],
): { headers: string[]; rows: Record<string, string>[]; errors: ParseError[] } {
  const trimmed = input.trim();
  if (!trimmed) return { headers: [], rows: [], errors: [] };
  const delim = detectDelimiter(trimmed.split(/\r?\n/)[0]);
  const raw = parseRows(trimmed, delim);
  if (!raw.length) return { headers: [], rows: [], errors: [] };

  const headers = raw[0].map((h) => h.trim());
  const errors: ParseError[] = [];
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < raw.length; r++) {
    const cells = raw[r];
    if (cells.length === 1 && !cells[0].trim()) continue;
    const rec: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) rec[headers[c]] = (cells[c] ?? '').trim();
    if (schema) {
      for (const col of schema) {
        const v = rec[col.name];
        if (col.required && !v) errors.push({ row: r, column: col.name, message: `Required field "${col.name}" is empty` });
        if (v && col.type === 'number' && isNaN(Number(v))) errors.push({ row: r, column: col.name, message: `"${v}" is not a valid number` });
        if (v && col.type === 'boolean' && !['true','false','1','0','yes','no'].includes(v.toLowerCase())) errors.push({ row: r, column: col.name, message: `"${v}" is not a valid boolean` });
        if (v && col.type === 'date' && isNaN(Date.parse(v))) errors.push({ row: r, column: col.name, message: `"${v}" is not a valid date` });
      }
    }
    rows.push(rec);
  }
  return { headers, rows, errors };
}

/** Convert objects to CSV string. Supports dot-notation for nested values. */
export function exportToCSV(
  data: Record<string, unknown>[], columns: string[], options?: ExportOptions,
): string {
  const d = options?.delimiter ?? ',';
  const lines: string[] = [];
  if (options?.includeHeaders !== false)
    lines.push(columns.map((c) => escapeField(c, d)).join(d));
  for (const row of data) {
    lines.push(columns.map((col) => {
      const raw = getNestedValue(row, col);
      return escapeField(raw == null ? '' : String(raw), d);
    }).join(d));
  }
  const csv = lines.join('\n');
  return options?.bom ? '\uFEFF' + csv : csv;
}

/** Trigger browser download of a CSV string. No-ops outside browser. */
export function downloadCSV(csv: string, filename: string): void {
  if (typeof document === 'undefined') return;
  const bom = '\uFEFF';
  const content = csv.startsWith(bom) ? csv : bom + csv;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Validate imported rows against a set of rules. */
export function validateRows(
  rows: Record<string, string>[], rules: ValidationRule[],
): { valid: Record<string, string>[]; invalid: { row: number; field: string; error: string }[] } {
  const valid: Record<string, string>[] = [];
  const invalid: { row: number; field: string; error: string }[] = [];
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?[\d\s\-().]{7,}$/;
  const dateRe = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let ok = true;
    for (const rule of rules) {
      const v = (row[rule.field] ?? '').trim();
      let err = '';
      if (rule.type === 'required' && !v) err = 'Field is required';
      else if (rule.type === 'email' && v && !emailRe.test(v)) err = 'Invalid email format';
      else if (rule.type === 'phone' && v && !phoneRe.test(v)) err = 'Invalid phone format';
      else if (rule.type === 'date' && v && !dateRe.test(v)) err = 'Invalid date format (expected YYYY-MM-DD)';
      else if (rule.type === 'enum' && v && rule.values && !rule.values.includes(v))
        err = `Value must be one of: ${rule.values.join(', ')}`;
      if (err) { invalid.push({ row: i, field: rule.field, error: err }); ok = false; }
    }
    if (ok) valid.push(row);
  }
  return { valid, invalid };
}

/** Map CSV columns to contact fields, trim whitespace, normalise emails. */
export function transformContacts(
  rows: Record<string, string>[], mapping: FieldMapping,
): Record<string, string>[] {
  return rows.map((row) => {
    const out: Record<string, string> = {};
    for (const [csvCol, target] of Object.entries(mapping)) {
      let v = (row[csvCol] ?? '').trim();
      if (target === 'email') v = v.toLowerCase();
      out[target] = v;
    }
    return out;
  });
}
