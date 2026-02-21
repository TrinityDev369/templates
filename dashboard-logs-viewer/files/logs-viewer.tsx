'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

interface LogsViewerProps {
  logs: LogEntry[];
  autoScroll?: boolean;
  follow?: boolean;
  maxLines?: number;
  className?: string;
}

const LEVEL_STYLES: Record<LogLevel, { badge: string; border: string }> = {
  debug: { badge: 'bg-gray-700 text-gray-300', border: 'border-l-gray-500' },
  info: { badge: 'bg-blue-900 text-blue-300', border: 'border-l-blue-500' },
  warn: { badge: 'bg-yellow-900 text-yellow-300', border: 'border-l-yellow-500' },
  error: { badge: 'bg-red-900 text-red-300', border: 'border-l-red-500' },
  fatal: { badge: 'bg-purple-900 text-purple-300', border: 'border-l-purple-500' },
};

const ALL_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-500/40 text-yellow-200 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {highlightMatch(text.slice(idx + query.length), query)}
    </>
  );
}

export function LogsViewer({ logs, autoScroll = true, follow: initialFollow = false, maxLines = 1000, className }: LogsViewerProps) {
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(new Set(ALL_LEVELS));
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState(initialFollow || autoScroll);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  const toggleLevel = (level: LogLevel) => {
    setActiveLevels(prev => {
      const next = new Set(prev);
      next.has(level) ? next.delete(level) : next.add(level);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const sliced = logs.slice(-maxLines);
    return sliced.filter(l => activeLevels.has(l.level) && (!search || l.message.toLowerCase().includes(search.toLowerCase())));
  }, [logs, activeLevels, search, maxLines]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (following) scrollToBottom();
  }, [logs.length, following, scrollToBottom]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (!atBottom) userScrolledRef.current = true;
    if (atBottom && userScrolledRef.current) {
      userScrolledRef.current = false;
      setFollowing(true);
    } else if (!atBottom && following) {
      setFollowing(false);
    }
  };

  const clearFilters = () => { setActiveLevels(new Set(ALL_LEVELS)); setSearch(''); };

  return (
    <div className={`flex flex-col rounded-lg border border-gray-800 bg-gray-950 overflow-hidden ${className ?? ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 bg-gray-900 px-3 py-2 text-xs">
        {ALL_LEVELS.map(level => (
          <button key={level} onClick={() => toggleLevel(level)}
            className={`rounded px-2 py-0.5 font-mono uppercase transition ${activeLevels.has(level) ? LEVEL_STYLES[level].badge : 'bg-gray-800 text-gray-600 line-through'}`}>
            {level}
          </button>
        ))}
        <div className="relative ml-auto flex items-center">
          <svg className="absolute left-2 h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="13" y1="13" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            className="rounded bg-gray-800 py-1 pl-7 pr-2 text-xs text-gray-300 placeholder-gray-600 outline-none ring-1 ring-gray-700 focus:ring-gray-500 w-48" />
        </div>
        <button onClick={() => { setFollowing(true); scrollToBottom(); }}
          className={`rounded px-2 py-0.5 transition ${following ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
          <svg className="mr-1 inline h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 14l-5-5h3V4h4v5h3l-5 5z"/></svg>
          Follow
        </button>
        <button onClick={clearFilters} className="rounded bg-gray-800 px-2 py-0.5 text-gray-400 hover:text-gray-200 transition">Clear</button>
        <span className="text-gray-500">Showing {filtered.length} of {logs.length}</span>
      </div>

      {/* Log lines */}
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto font-mono text-xs leading-5 min-h-[200px] max-h-[600px]">
        {filtered.length === 0 && <div className="p-4 text-center text-gray-600">No log entries match filters</div>}
        {filtered.map(entry => (
          <div key={entry.id}>
            <div onClick={() => entry.metadata && setExpandedId(prev => prev === entry.id ? null : entry.id)}
              className={`flex gap-2 border-l-2 px-3 py-0.5 hover:bg-gray-900/60 ${LEVEL_STYLES[entry.level].border} ${entry.metadata ? 'cursor-pointer' : ''}`}>
              <span className="shrink-0 text-gray-500">{formatTime(entry.timestamp)}</span>
              <span className={`shrink-0 rounded px-1.5 text-center uppercase ${LEVEL_STYLES[entry.level].badge}`} style={{ minWidth: '3rem' }}>{entry.level}</span>
              {entry.source && <span className="shrink-0 text-gray-600">[{entry.source}]</span>}
              <span className="text-gray-300 break-all">{highlightMatch(entry.message, search)}</span>
              {entry.metadata && (
                <svg className={`ml-auto h-3 w-3 shrink-0 self-center text-gray-600 transition ${expandedId === entry.id ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 4l6 6-6 6z"/>
                </svg>
              )}
            </div>
            {expandedId === entry.id && entry.metadata && (
              <pre className="mx-8 my-1 rounded bg-gray-900 p-2 text-[10px] text-gray-400 overflow-x-auto border border-gray-800">
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
