/**
 * Trinity Mail — message-contract headers.
 *
 * These headers are the FACTS the relay records in the central Lex Causalis log
 * for routing and per-tenant analytics. They never contain subject or body — those
 * are content (doctrine §4). Header names must match across all mail-* templates.
 */
import type { MailConfig } from '../config';
import type { NormalizedMessage } from './types';

export const HEADER = {
  project: 'X-Trinity-Project',
  category: 'X-Trinity-Category',
  stream: 'X-Trinity-Stream',
  entity: 'X-Trinity-Entity',
  idempotency: 'X-Trinity-Idempotency-Key',
} as const;

/**
 * Build the outgoing header set. For the marketing stream this adds RFC 8058
 * one-click unsubscribe, which is mandatory for Gmail/Yahoo bulk senders.
 */
export function buildHeaders(
  message: NormalizedMessage,
  config: MailConfig,
  unsubscribeUrl?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    [HEADER.project]: config.project,
    [HEADER.category]: message.category,
    [HEADER.stream]: message.stream,
    [HEADER.idempotency]: message.idempotencyKey,
    ...message.headers,
  };
  if (message.entityRef) headers[HEADER.entity] = message.entityRef;

  if (message.stream === 'marketing') {
    if (!unsubscribeUrl) {
      throw new Error(
        `Marketing mail (category='${message.category}') requires an unsubscribeUrl ` +
          '(RFC 8058 one-click is mandatory for bulk senders).',
      );
    }
    headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  return headers;
}
