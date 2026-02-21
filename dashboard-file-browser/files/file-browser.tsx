'use client';

import { useState, useMemo } from 'react';

export type FileItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  modifiedAt: string;
  path: string;
};

type SortKey = 'name' | 'size' | 'modifiedAt' | 'type';
type SortDir = 'asc' | 'desc';

export type FileBrowserProps = {
  files: FileItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onFileSelect?: (file: FileItem) => void;
  className?: string;
};

const MOCK_FILES: FileItem[] = [
  { id: '1', name: 'Documents', type: 'folder', modifiedAt: '2026-02-20T10:00:00Z', path: '/Documents' },
  { id: '2', name: 'Images', type: 'folder', modifiedAt: '2026-02-19T14:30:00Z', path: '/Images' },
  { id: '3', name: 'report.pdf', type: 'file', size: 245000, mimeType: 'application/pdf', modifiedAt: '2026-02-18T09:15:00Z', path: '/report.pdf' },
  { id: '4', name: 'photo.png', type: 'file', size: 1800000, mimeType: 'image/png', modifiedAt: '2026-02-17T16:45:00Z', path: '/photo.png' },
  { id: '5', name: 'index.tsx', type: 'file', size: 3200, mimeType: 'text/typescript', modifiedAt: '2026-02-21T08:00:00Z', path: '/index.tsx' },
];

function formatFileSize(bytes?: number): string {
  if (bytes == null) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getFileCategory(item: FileItem): 'folder' | 'image' | 'document' | 'code' | 'generic' {
  if (item.type === 'folder') return 'folder';
  const ext = item.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = item.mimeType ?? '';
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'txt', 'md'].includes(ext)) return 'document';
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'css', 'html', 'json', 'yaml', 'sh'].includes(ext)) return 'code';
  return 'generic';
}

function FileIcon({ item, size = 20 }: { item: FileItem; size?: number }) {
  const cat = getFileCategory(item);
  const s = String(size);
  if (cat === 'folder') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="#FBBF24"/></svg>
  );
  if (cat === 'image') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" fill="#34D399"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fff"/><path d="M21 15l-5-5L5 21h14a2 2 0 002-2v-4z" fill="#fff" opacity=".5"/></svg>
  );
  if (cat === 'document') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" fill="#F87171"/><path d="M14 2v6h6" fill="#FCA5A5"/><path d="M8 13h8M8 17h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
  );
  if (cat === 'code') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" fill="#60A5FA"/><path d="M9 8l-3 4 3 4M15 8l3 4-3 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" fill="#9CA3AF"/><path d="M14 2v6h6" fill="#D1D5DB"/></svg>
  );
}

function SortHeader({ label, sortKey, current, dir, onSort }: { label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void }) {
  return (
    <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-200">
      {label}{current === sortKey && <span>{dir === 'asc' ? '\u2191' : '\u2193'}</span>}
    </button>
  );
}

export function FileBrowser({ files, currentPath, onNavigate, onFileSelect, className }: FileBrowserProps) {
  const items = files.length > 0 ? files : MOCK_FILES;
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    const folders = items.filter(f => f.type === 'folder');
    const filesOnly = items.filter(f => f.type === 'file');
    const cmp = (a: FileItem, b: FileItem) => {
      let r = 0;
      if (sortKey === 'name') r = a.name.localeCompare(b.name);
      else if (sortKey === 'size') r = (a.size ?? 0) - (b.size ?? 0);
      else if (sortKey === 'modifiedAt') r = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
      else r = a.type.localeCompare(b.type);
      return sortDir === 'asc' ? r : -r;
    };
    return [...folders.sort(cmp), ...filesOnly.sort(cmp)];
  }, [items, sortKey, sortDir]);

  const segments = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);

  const handleClick = (item: FileItem) => {
    if (item.type === 'folder') onNavigate(item.path);
    else onFileSelect?.(item);
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`rounded-lg border bg-white dark:bg-gray-950 ${className ?? ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <nav className="flex items-center gap-1 text-sm">
          <button onClick={() => onNavigate('/')} className="text-blue-600 hover:underline font-medium">Home</button>
          {segments.map((seg, i) => {
            const path = '/' + segments.slice(0, i + 1).join('/');
            const isLast = i === segments.length - 1;
            return (
              <span key={path} className="flex items-center gap-1">
                <span className="text-gray-400">/</span>
                {isLast ? <span className="font-medium text-gray-900 dark:text-gray-100">{seg}</span> : (
                  <button onClick={() => onNavigate(path)} className="text-blue-600 hover:underline">{seg}</button>
                )}
              </span>
            );
          })}
        </nav>
        <div className="flex gap-1 rounded-md border p-0.5">
          <button onClick={() => setView('grid')} className={`rounded px-2 py-1 text-xs font-medium ${view === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}>Grid</button>
          <button onClick={() => setView('list')} className={`rounded px-2 py-1 text-xs font-medium ${view === 'list' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}>List</button>
        </div>
      </div>

      {/* Content */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">This folder is empty</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map(item => (
            <button key={item.id} onClick={() => handleClick(item)} className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <FileIcon item={item} size={32} />
              <span className="w-full truncate text-sm font-medium">{item.name}</span>
              <span className="text-xs text-gray-500">{item.type === 'folder' ? 'Folder' : formatFileSize(item.size)}</span>
              <span className="text-xs text-gray-400">{fmtDate(item.modifiedAt)}</span>
            </button>
          ))}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left"><SortHeader label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={toggleSort} /></th>
              <th className="px-4 py-2 text-left"><SortHeader label="Size" sortKey="size" current={sortKey} dir={sortDir} onSort={toggleSort} /></th>
              <th className="px-4 py-2 text-left"><SortHeader label="Modified" sortKey="modifiedAt" current={sortKey} dir={sortDir} onSort={toggleSort} /></th>
              <th className="px-4 py-2 text-left"><SortHeader label="Type" sortKey="type" current={sortKey} dir={sortDir} onSort={toggleSort} /></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(item => (
              <tr key={item.id} onClick={() => handleClick(item)} className="border-b last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <td className="px-4 py-2 flex items-center gap-2"><FileIcon item={item} /><span className="truncate">{item.name}</span></td>
                <td className="px-4 py-2 text-gray-500">{item.type === 'folder' ? '--' : formatFileSize(item.size)}</td>
                <td className="px-4 py-2 text-gray-500">{fmtDate(item.modifiedAt)}</td>
                <td className="px-4 py-2 text-gray-500 capitalize">{getFileCategory(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
