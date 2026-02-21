'use client';

import { useState } from 'react';
import type { FieldBuilderProps, FieldDefinition, FieldType } from './types';
import { FIELD_TYPES, FIELD_TYPE_LABELS } from './types';

const GripIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="5" cy="3" r="1" /><circle cx="11" cy="3" r="1" />
    <circle cx="5" cy="8" r="1" /><circle cx="11" cy="8" r="1" />
    <circle cx="5" cy="13" r="1" /><circle cx="11" cy="13" r="1" />
  </svg>
);

const emptyDraft = (): Omit<FieldDefinition, 'id' | 'order'> => ({
  label: '', type: 'text', required: false, placeholder: '', options: [],
});

export function CustomFieldBuilder({ fields, onChange }: FieldBuilderProps) {
  const [draft, setDraft] = useState<Omit<FieldDefinition, 'id' | 'order'> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [optionsText, setOptionsText] = useState('');

  const sorted = [...fields].sort((a, b) => a.order - b.order);
  const needsOptions = (t: FieldType) => t === 'select' || t === 'multiselect';

  const save = () => {
    if (!draft || !draft.label.trim()) return;
    const opts = needsOptions(draft.type)
      ? optionsText.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    if (editId) {
      onChange(fields.map((f) => f.id === editId
        ? { ...f, ...draft, options: opts } : f));
    } else {
      const id = `cf_${Date.now()}`;
      const order = fields.length ? Math.max(...fields.map((f) => f.order)) + 1 : 0;
      onChange([...fields, { ...draft, id, order, options: opts }]);
    }
    setDraft(null); setEditId(null); setOptionsText('');
  };

  const startEdit = (f: FieldDefinition) => {
    setDraft({ label: f.label, type: f.type, required: f.required, placeholder: f.placeholder, options: f.options });
    setOptionsText((f.options ?? []).join(', '));
    setEditId(f.id); setDeleteId(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    const s = [...sorted];
    const i = s.findIndex((f) => f.id === id);
    if ((dir === -1 && i === 0) || (dir === 1 && i === s.length - 1)) return;
    [s[i], s[i + dir]] = [s[i + dir], s[i]];
    onChange(s.map((f, idx) => ({ ...f, order: idx })));
  };

  const confirmDelete = (id: string) => {
    onChange(fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i })));
    setDeleteId(null);
  };

  return (
    <div className="space-y-3">
      {sorted.map((f) => (
        <div key={f.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
          <span className="cursor-grab text-zinc-400"><GripIcon /></span>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm">{f.label}</span>
            <span className="ml-2 text-xs text-zinc-500">{FIELD_TYPE_LABELS[f.type]}</span>
            {f.required && <span className="ml-1 text-xs text-red-500">*</span>}
          </div>
          <button onClick={() => move(f.id, -1)} className="p-1 text-zinc-400 hover:text-zinc-700" title="Move up" type="button">&uarr;</button>
          <button onClick={() => move(f.id, 1)} className="p-1 text-zinc-400 hover:text-zinc-700" title="Move down" type="button">&darr;</button>
          <button onClick={() => startEdit(f)} className="p-1 text-blue-500 hover:text-blue-700 text-xs" type="button">Edit</button>
          {deleteId === f.id ? (
            <>
              <button onClick={() => confirmDelete(f.id)} className="p-1 text-red-600 text-xs font-semibold" type="button">Confirm</button>
              <button onClick={() => setDeleteId(null)} className="p-1 text-zinc-500 text-xs" type="button">Cancel</button>
            </>
          ) : (
            <button onClick={() => setDeleteId(f.id)} className="p-1 text-red-400 hover:text-red-600 text-xs" type="button">Delete</button>
          )}
        </div>
      ))}

      {draft ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2 dark:border-blue-800 dark:bg-blue-950">
          <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="Field label" className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
          <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as FieldType })}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800">
            {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
          </select>
          {needsOptions(draft.type) && (
            <input value={optionsText} onChange={(e) => setOptionsText(e.target.value)}
              placeholder="Options (comma-separated)" className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
          )}
          <input value={draft.placeholder ?? ''} onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })}
            placeholder="Placeholder text" className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.required ?? false} onChange={(e) => setDraft({ ...draft, required: e.target.checked })} />
            Required
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700" type="button">
              {editId ? 'Update' : 'Add'}
            </button>
            <button onClick={() => { setDraft(null); setEditId(null); setOptionsText(''); }}
              className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800" type="button">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setDraft(emptyDraft())}
          className="w-full rounded-lg border-2 border-dashed border-zinc-300 py-2 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-500 dark:border-zinc-600" type="button">
          + Add Field
        </button>
      )}
    </div>
  );
}
