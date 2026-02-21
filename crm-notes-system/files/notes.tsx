'use client';

import { useState, type KeyboardEvent, type FormEvent } from 'react';
import type { Note, NotesFeedProps, NoteComposerProps } from './types';

const extractMentions = (t: string) => [...new Set((t.match(/@(\w+)/g) ?? []).map((m) => m.slice(1)))];

const initials = (n: string) => n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}

function highlightMentions(text: string) {
  return text.split(/(@\w+)/g).map((p, i) =>
    p.startsWith('@') ? <span key={i} className="text-blue-600 font-medium">{p}</span> : p,
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9z" />
    </svg>
  );
}

export function NoteComposer({ onSubmit, authorName, placeholder }: NoteComposerProps) {
  const [content, setContent] = useState('');
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const v = content.trim();
    if (!v) return;
    onSubmit(v, extractMentions(v));
    setContent('');
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };
  return (
    <form onSubmit={submit} className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={onKey}
          placeholder={placeholder ?? 'Add a note... Use @ to mention someone'} rows={2}
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
        {content.length > 0 && (
          <span className="absolute bottom-1.5 right-2 text-[10px] text-gray-300">{content.length}</span>
        )}
      </div>
      <button type="submit" disabled={!content.trim()} aria-label={`Submit note as ${authorName}`}
        className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
        <SendIcon />
      </button>
    </form>
  );
}

export function NotesFeed({ notes, currentUserId, onDelete, onEdit }: NotesFeedProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const startEdit = (n: Note) => { setEditingId(n.id); setEditContent(n.content); };
  const cancelEdit = () => { setEditingId(null); setEditContent(''); };
  const saveEdit = (id: string) => { onEdit?.(id, editContent); cancelEdit(); };
  const sorted = [...notes].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  if (!sorted.length) return <p className="py-8 text-center text-sm text-gray-400">No notes yet</p>;

  return (
    <div className="space-y-4">
      {sorted.map((note) => {
        const isOwn = note.authorId === currentUserId;
        const editing = editingId === note.id;
        return (
          <div key={note.id} className="group flex gap-3">
            {note.authorAvatar
              ? <img src={note.authorAvatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
              : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">{initials(note.authorName)}</div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{note.authorName}</span>
                <span className="text-xs text-gray-400">{relativeTime(note.createdAt)}</span>
                {isOwn && !editing && (
                  <span className="ml-auto hidden gap-1 text-xs group-hover:flex">
                    {onEdit && <button onClick={() => startEdit(note)} className="text-gray-400 hover:text-blue-600">Edit</button>}
                    {onDelete && <button onClick={() => onDelete(note.id)} className="text-gray-400 hover:text-red-500">Delete</button>}
                  </span>
                )}
              </div>
              {editing ? (
                <div className="mt-1 space-y-1">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2}
                    className="w-full resize-none rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-blue-400" />
                  <div className="flex gap-1">
                    <button onClick={() => saveEdit(note.id)} className="rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-700">Save</button>
                    <button onClick={cancelEdit} className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap">{highlightMentions(note.content)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
