'use client';
/**
 * CRM Email Integration — Thread Component
 *
 * Displays a chronological thread of emails with collapsible messages
 * (latest expanded by default). Includes a reply button that triggers
 * compose in reply mode.
 *
 * NOTE: Email bodies are rendered via dangerouslySetInnerHTML.
 * Sanitize HTML with DOMPurify before passing to this component.
 */
import React, { useState, type FC } from 'react';
import type { Email, EmailThread as EmailThreadType, ComposeProps } from './types';
import { EmailCompose } from './email-compose';

const ReplyIcon: FC = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className="shrink-0">
    <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z" clipRule="evenodd" />
  </svg>
);

const Chevron: FC<{ open: boolean }> = ({ open }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className="shrink-0 text-gray-400"
    style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
  </svg>
);

const EmailMessage: FC<{ email: Email; defaultOpen: boolean }> = ({ email, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{email.from}</span>
          {!open && <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{email.body.replace(/<[^>]*>/g, '').slice(0, 80)}</span>}
        </div>
        <span className="shrink-0 text-xs text-gray-400">{new Date(email.sentAt).toLocaleString()}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            To: {email.to.join(', ')}{email.cc.length > 0 && <span className="ml-3">CC: {email.cc.join(', ')}</span>}
          </div>
          {/* Sanitize HTML in production with DOMPurify */}
          <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: email.body }} />
          {email.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {email.attachments.map((att) => (
                <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {att.name} <span className="text-gray-400">({(att.size / 1024).toFixed(0)}KB)</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export interface EmailThreadProps {
  thread: EmailThreadType;
  onSend: ComposeProps['onSend'];
}

export const EmailThread: FC<EmailThreadProps> = ({ thread, onSend }) => {
  const [replying, setReplying] = useState(false);
  const last = thread.emails[thread.emails.length - 1] ?? null;

  if (thread.emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">No emails in this thread yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{thread.subject}</h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{thread.emails.length} message{thread.emails.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1">
        {thread.emails.map((email, idx) => (
          <EmailMessage key={email.id} email={email} defaultOpen={idx === thread.emails.length - 1} />
        ))}
      </div>
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        {replying && last ? (
          <EmailCompose onSend={async (e) => { await onSend(e); setReplying(false); }} defaultTo={[last.from]} contactId={thread.contactId} dealId={thread.dealId} replyTo={last} />
        ) : (
          <button type="button" onClick={() => setReplying(true)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <ReplyIcon /> Reply
          </button>
        )}
      </div>
    </div>
  );
};
