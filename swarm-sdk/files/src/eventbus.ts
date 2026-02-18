/**
 * Task EventBus
 *
 * Typed, fire-and-forget eventbus for the swarm field system.
 * Events are dispatched to handlers asynchronously — a failing handler
 * never blocks other handlers or the emitter.
 */

import type {
  TaskEvent,
  TaskEventType,
  DepositedEvent,
  ClaimedEvent,
  ResolvedEvent,
  ReleasedEvent,
  BoostedEvent,
  ApprovedEvent,
  CheckpointEvent,
} from './events.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Maps each TaskEventType to its corresponding narrowed event interface.
 * Used by on/off overloads so handlers receive the correct type automatically.
 */
export interface TaskEventMap {
  DEPOSITED: DepositedEvent;
  CLAIMED: ClaimedEvent;
  RESOLVED: ResolvedEvent;
  RELEASED: ReleasedEvent;
  BOOSTED: BoostedEvent;
  APPROVED: ApprovedEvent;
  CHECKPOINT: CheckpointEvent;
  '*': TaskEvent;
}

export type TaskEventHandler<T extends TaskEvent = TaskEvent> = (event: T) => void | Promise<void>;

const DEBUG = () => process.env.SWARM_DEBUG === 'true';

// =============================================================================
// EventBus Class
// =============================================================================

export class TaskEventBus {
  private handlers = new Map<TaskEventType | '*', Set<TaskEventHandler>>();

  /**
   * Subscribe to events of a specific type, or '*' for all events.
   * Returns an unsubscribe function.
   *
   * When subscribing to a specific type, the handler receives the narrowed
   * event interface (e.g., `ResolvedEvent` for `'RESOLVED'`).
   */
  on<K extends keyof TaskEventMap>(type: K, handler: TaskEventHandler<TaskEventMap[K]>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    // Internal storage uses the base handler type
    this.handlers.get(type)!.add(handler as TaskEventHandler);

    return () => this.off(type, handler);
  }

  /**
   * Remove a specific handler for a given event type.
   */
  off<K extends keyof TaskEventMap>(type: K, handler: TaskEventHandler<TaskEventMap[K]>): void {
    const set = this.handlers.get(type);
    if (set) {
      set.delete(handler as TaskEventHandler);
      if (set.size === 0) {
        this.handlers.delete(type);
      }
    }
  }

  /**
   * Fire-and-forget: dispatch event to all matching handlers.
   * Each handler runs in its own try-catch — a failing handler
   * never prevents other handlers from executing.
   */
  emit(event: TaskEvent): void {
    if (DEBUG()) {
      console.log(`[eventbus] ${event.type} node=${event.node_id} agent=${event.agent_id}`);
    }

    // Specific-type handlers
    const specific = this.handlers.get(event.type);
    if (specific) {
      for (const handler of specific) {
        this.safeCall(handler, event);
      }
    }

    // Wildcard handlers
    const wildcard = this.handlers.get('*');
    if (wildcard) {
      for (const handler of wildcard) {
        this.safeCall(handler, event);
      }
    }
  }

  /**
   * Remove all handlers (useful for testing).
   */
  clear(): void {
    this.handlers.clear();
  }

  private safeCall(handler: TaskEventHandler, event: TaskEvent): void {
    try {
      const result = handler(event);
      // Catch async rejections
      if (result && typeof result.catch === 'function') {
        result.catch((err) => {
          if (DEBUG()) {
            console.error(`[eventbus] Async handler error for ${event.type}:`, err);
          }
        });
      }
    } catch (err) {
      if (DEBUG()) {
        console.error(`[eventbus] Sync handler error for ${event.type}:`, err);
      }
    }
  }
}

// =============================================================================
// Singleton
// =============================================================================

export const taskEventBus = new TaskEventBus();
