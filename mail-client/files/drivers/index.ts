/**
 * Trinity Mail — driver selection.
 *
 * Provider-agnostic by design (the OL "pluggable driver" shape): the rest of the
 * package talks to a `MailDriver`, never to nodemailer directly. Swapping transports
 * is a one-line config change.
 */
import type { MailConfig } from '../config';
import type { MailDriver } from '../lib/types';
import { createConsoleDriver } from './console';
import { createRelayDriver } from './relay';

export function selectDriver(config: MailConfig): MailDriver {
  switch (config.driver) {
    case 'relay':
      if (!config.relay) throw new Error('MAIL_DRIVER=relay but relay config is missing.');
      return createRelayDriver(config.relay, config);
    case 'sink':
      return createConsoleDriver(true);
    case 'console':
    default:
      return createConsoleDriver(false);
  }
}

export { createRelayDriver } from './relay';
export { createConsoleDriver } from './console';
