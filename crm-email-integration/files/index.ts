/**
 * CRM Email Integration — Module Barrel Export
 *
 * Re-exports all public types and components for the email integration module.
 */

// Types
export type {
  Email,
  EmailThread,
  EmailAttachment,
  ComposeProps,
} from './types';

// Components
export { EmailCompose } from './email-compose';
export { EmailThread as EmailThreadView } from './email-thread';
export type { EmailThreadProps } from './email-thread';
