/**
 * Trinity Mail — console & sink drivers (local dev).
 *
 * `console` logs what WOULD be sent; `sink` drops silently. Neither opens a network
 * connection, so local development never burns the shared sending reputation. Default
 * driver is 'console' (see config) — opt into 'relay' explicitly.
 */
import type { DeliveryResult, MailDriver, NormalizedMessage } from '../lib/types';

let counter = 0;

export function createConsoleDriver(silent = false): MailDriver {
  return {
    name: silent ? 'sink' : 'console',
    async deliver(message: NormalizedMessage): Promise<DeliveryResult> {
      const id = `dev-${++counter}`;
      if (!silent) {
        // eslint-disable-next-line no-console
        console.log(
          [
            '── [trinity-mail dev] would send ───────────────',
            `  to:       ${message.to.map((a) => a.email).join(', ')}`,
            `  from:     ${message.from.email}`,
            `  subject:  ${message.subject}`,
            `  category: ${message.category} (${message.stream})`,
            message.entityRef ? `  entity:   ${message.entityRef}` : '',
            `  idem:     ${message.idempotencyKey}`,
            '────────────────────────────────────────────────',
          ]
            .filter(Boolean)
            .join('\n'),
        );
      }
      return { ok: true, providerMessageId: id };
    },
  };
}
