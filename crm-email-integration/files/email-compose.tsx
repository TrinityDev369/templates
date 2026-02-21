'use client';
/**
 * CRM Email Integration — Compose Component
 *
 * Rich compose form with reply mode, collapsible CC/BCC, and loading state.
 * Connect `onSend` to your email API (SendGrid, Resend, Postmark, etc.).
 * Styling: Tailwind CSS. Icons: inline SVG only.
 */
import React, { useState, useCallback, type FC, type FormEvent } from 'react';
import type { ComposeProps } from './types';

const SendIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path d="M2.94 5.34a1 1 0 0 1 1.3-.45L18 10l-13.76 5.11a1 1 0 0 1-1.3-.45L1 10l1.94-4.66ZM5 10l-1.2 2.87L15.28 10 3.8 7.13 5 10Z" />
  </svg>
);

const ChevronIcon: FC<{ open: boolean }> = ({ open }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className="inline"
    style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
  </svg>
);

function buildQuote(body: string, from: string, sentAt: string): string {
  const d = new Date(sentAt).toLocaleString();
  return `<br/><br/><blockquote style="border-left:2px solid #ccc;padding-left:8px;color:#666">On ${d}, ${from} wrote:<br/>${body}</blockquote>`;
}

const parse = (raw: string): string[] => raw.split(',').map((s) => s.trim()).filter(Boolean);

const IC = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500';
const LC = 'w-12 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400';

export const EmailCompose: FC<ComposeProps> = ({ onSend, defaultTo = [], replyTo }) => {
  const [to, setTo] = useState(defaultTo.join(', '));
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState(
    replyTo ? (replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`) : '',
  );
  const [body, setBody] = useState(replyTo ? buildQuote(replyTo.body, replyTo.from, replyTo.sentAt) : '');
  const [sending, setSending] = useState(false);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (sending || !to.trim()) return;
    setSending(true);
    try {
      await onSend({ from: '', to: parse(to), cc: parse(cc), bcc: parse(bcc), subject, body, attachments: [] });
      if (!replyTo) { setTo(''); setSubject(''); }
      setCc(''); setBcc(''); setBody('');
    } finally { setSending(false); }
  }, [to, cc, bcc, subject, body, sending, onSend, replyTo]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <label htmlFor="email-to" className={LC}>To</label>
        <input id="email-to" type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" className={IC} required />
        <button type="button" onClick={() => setShowCc((v) => !v)} className="shrink-0 text-xs text-blue-600 hover:underline dark:text-blue-400">
          CC/BCC <ChevronIcon open={showCc} />
        </button>
      </div>
      {showCc && (<>
        <div className="flex items-center gap-2">
          <label htmlFor="email-cc" className={LC}>CC</label>
          <input id="email-cc" type="text" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@example.com" className={IC} />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="email-bcc" className={LC}>BCC</label>
          <input id="email-bcc" type="text" value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="bcc@example.com" className={IC} />
        </div>
      </>)}
      <div className="flex items-center gap-2">
        <label htmlFor="email-subject" className={LC}>Subj</label>
        <input id="email-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className={IC} />
      </div>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." rows={6} className={`${IC} resize-y`} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          <svg className="mr-1 inline" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path d="M15.621 4.379a3.5 3.5 0 0 0-4.95 0l-7 7a2.25 2.25 0 1 0 3.182 3.182l5.25-5.25a1 1 0 0 0-1.414-1.414l-5.25 5.25a.25.25 0 1 1-.354-.354l7-7a1.5 1.5 0 1 1 2.121 2.121l-7 7a2.25 2.25 0 0 1-3.182-3.182l7-7a3.5 3.5 0 0 1 4.95 4.95l-7 7a4.25 4.25 0 0 1-6.01-6.01l7-7a.75.75 0 0 1 1.06 1.06Z" />
          </svg>
          Attachments coming soon
        </span>
        <button type="submit" disabled={sending || !to.trim()} className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
          {sending ? 'Sending...' : <><SendIcon className="shrink-0" /> Send</>}
        </button>
      </div>
    </form>
  );
};
