'use client';

import type { FieldDefinition, FieldRendererProps, FieldValue } from './types';

const inputClass =
  'w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800';

function Label({ field }: { field: FieldDefinition }) {
  return (
    <label className="block text-sm font-medium mb-1">
      {field.label}
      {field.required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function ReadOnlyValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <p className="text-sm text-zinc-700 dark:text-zinc-300">{value.join(', ') || '-'}</p>;
  if (typeof value === 'boolean') return <p className="text-sm text-zinc-700 dark:text-zinc-300">{value ? 'Yes' : 'No'}</p>;
  return <p className="text-sm text-zinc-700 dark:text-zinc-300">{String(value ?? '') || '-'}</p>;
}

function FieldInput({
  field, value, onUpdate, readOnly,
}: {
  field: FieldDefinition;
  value: string | number | boolean | string[] | undefined;
  onUpdate: (v: string | number | boolean | string[]) => void;
  readOnly?: boolean;
}) {
  if (readOnly) return <ReadOnlyValue value={value} />;

  const str = typeof value === 'string' ? value : (value?.toString() ?? '');

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return <input type={field.type} value={str} placeholder={field.placeholder}
        required={field.required} onChange={(e) => onUpdate(e.target.value)} className={inputClass} />;

    case 'number':
      return <input type="number" value={str} placeholder={field.placeholder}
        required={field.required} onChange={(e) => onUpdate(e.target.value === '' ? '' : Number(e.target.value))}
        className={inputClass} />;

    case 'date':
      return <input type="date" value={str} required={field.required}
        onChange={(e) => onUpdate(e.target.value)} className={inputClass} />;

    case 'textarea':
      return <textarea value={str} placeholder={field.placeholder} required={field.required}
        onChange={(e) => onUpdate(e.target.value)} rows={3} className={inputClass} />;

    case 'select':
      return (
        <select value={str} required={field.required}
          onChange={(e) => onUpdate(e.target.value)} className={inputClass}>
          <option value="">{field.placeholder || 'Select...'}</option>
          {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );

    case 'multiselect': {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (opt: string) => {
        onUpdate(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
      };
      return (
        <div className="space-y-1">
          {(field.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} />
              {o}
            </label>
          ))}
        </div>
      );
    }

    case 'checkbox':
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!value}
            onChange={(e) => onUpdate(e.target.checked)} />
          {field.placeholder || field.label}
        </label>
      );

    default:
      return null;
  }
}

export function CustomFieldRenderer({ fields, values, onChange, readOnly }: FieldRendererProps) {
  const sorted = [...fields].sort((a, b) => a.order - b.order);

  const handleUpdate = (id: string, v: string | number | boolean | string[]) => {
    onChange({ ...values, [id]: v });
  };

  return (
    <div className="space-y-4">
      {sorted.map((field) => (
        <div key={field.id}>
          {field.type !== 'checkbox' && <Label field={field} />}
          <FieldInput field={field} value={values[field.id]}
            onUpdate={(v) => handleUpdate(field.id, v)} readOnly={readOnly} />
        </div>
      ))}
    </div>
  );
}
