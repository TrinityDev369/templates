/**
 * CRM Email Integration — Type Definitions
 *
 * Core types for email compose, threading, and attachment handling
 * within a CRM context (linked to contacts and deals).
 */

// ---------------------------------------------------------------------------
// Email Attachment
// ---------------------------------------------------------------------------

/** A file attached to an email message. */
export interface EmailAttachment {
  /** Unique identifier for the attachment. */
  id: string;
  /** Original file name (e.g. "proposal.pdf"). */
  name: string;
  /** File size in bytes. */
  size: number;
  /** MIME type (e.g. "application/pdf", "image/png"). */
  mimeType: string;
  /** URL where the attachment can be downloaded. */
  url: string;
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

/** A single email message. */
export interface Email {
  /** Unique identifier for the email. */
  id: string;
  /** Sender email address. */
  from: string;
  /** Primary recipient email addresses. */
  to: string[];
  /** Carbon-copy recipient email addresses. */
  cc: string[];
  /** Blind carbon-copy recipient email addresses. */
  bcc: string[];
  /** Email subject line. */
  subject: string;
  /** Email body as an HTML string. */
  body: string;
  /** ISO-8601 timestamp when the email was sent. */
  sentAt: string;
  /** ISO-8601 timestamp when the email was first read (null if unread). */
  readAt: string | null;
  /** File attachments included with the email. */
  attachments: EmailAttachment[];
}

// ---------------------------------------------------------------------------
// Email Thread
// ---------------------------------------------------------------------------

/** A chronological thread of emails linked to a CRM contact/deal. */
export interface EmailThread {
  /** Unique identifier for the thread. */
  id: string;
  /** Thread subject (typically the subject of the first email). */
  subject: string;
  /** Emails in this thread, ordered chronologically. */
  emails: Email[];
  /** CRM contact ID this thread is associated with. */
  contactId: string;
  /** CRM deal ID this thread is associated with (optional). */
  dealId?: string;
  /** ISO-8601 timestamp of the most recent message in the thread. */
  lastMessageAt: string;
}

// ---------------------------------------------------------------------------
// Compose Props
// ---------------------------------------------------------------------------

/** Props for the EmailCompose component. */
export interface ComposeProps {
  /** Callback invoked when the user sends an email. Implement your API call here. */
  onSend: (email: Omit<Email, 'id' | 'sentAt' | 'readAt'>) => Promise<void>;
  /** Pre-filled "To" address(es). */
  defaultTo?: string[];
  /** CRM contact ID to associate with sent emails. */
  contactId?: string;
  /** CRM deal ID to associate with sent emails. */
  dealId?: string;
  /** When replying, the original email to quote. */
  replyTo?: Email;
}
