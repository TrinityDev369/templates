/**
 * Subscriber Registration
 *
 * Idempotent registration of all eventbus subscribers.
 */

import type { Sql } from 'postgres';
import { taskEventBus } from '../eventbus.js';
import { registerPersistenceSubscriber } from './persistence.js';

let registered = false;
const unsubscribers: Array<() => void> = [];

/**
 * Register all event subscribers. Idempotent -- safe to call multiple times.
 */
export function registerAllSubscribers(sql: Sql): void {
  if (registered) return;
  registered = true;
  unsubscribers.push(registerPersistenceSubscriber(sql));
}

/**
 * Tear down all subscribers and reset state (for testing).
 */
export function resetSubscribers(): void {
  for (const unsub of unsubscribers) unsub();
  unsubscribers.length = 0;
  taskEventBus.clear();
  registered = false;
}
