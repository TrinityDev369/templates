/**
 * Persistence Subscriber
 * Stores field node events to the database for history/audit.
 */
import type { Sql } from 'postgres';
import { taskEventBus } from '../eventbus.js';

export function registerPersistenceSubscriber(sql: Sql): () => void {
  return taskEventBus.on('*', async (event) => {
    try {
      await sql`
        INSERT INTO field_node_events (node_id, event_type, agent_id, payload, created_at)
        VALUES (${event.node_id}::uuid, ${event.type}, ${event.agent_id}, ${JSON.stringify(event.payload)}::jsonb, NOW())
      `;
    } catch {
      // persistence is best-effort
    }
  });
}
