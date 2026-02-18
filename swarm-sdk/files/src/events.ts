/**
 * Task Event Types
 *
 * Typed events emitted by the field lifecycle operations.
 * Matches the task_event_type enum in PostgreSQL.
 */

import type { FieldNodeType } from './types.js';

// =============================================================================
// Event Type Union
// =============================================================================

export type TaskEventType =
  | 'DEPOSITED'
  | 'CLAIMED'
  | 'RESOLVED'
  | 'RELEASED'
  | 'BOOSTED'
  | 'APPROVED'
  | 'CHECKPOINT'
  | 'AGENT_TERMINATED';

// =============================================================================
// Base Event Interface
// =============================================================================

export interface TaskEventBase {
  id: string;
  type: TaskEventType;
  timestamp: Date;
  node_id: string;
  node_type: FieldNodeType;
  title: string;
  agent_id: string;
  context_bundle_id?: string | null;
  payload: Record<string, unknown>;
}

// =============================================================================
// Specific Event Interfaces
// =============================================================================

export interface DepositedEvent extends TaskEventBase {
  type: 'DEPOSITED';
  payload: {
    affinity: string[];
    parent_id?: string | null;
    sequence_order?: number | null;
    content?: Record<string, unknown>;
  };
}

export interface ClaimedEvent extends TaskEventBase {
  type: 'CLAIMED';
  payload: Record<string, unknown>;
}

export interface ResolvedEvent extends TaskEventBase {
  type: 'RESOLVED';
  payload: {
    artifact?: Record<string, unknown>;
  };
}

export interface ReleasedEvent extends TaskEventBase {
  type: 'RELEASED';
  payload: {
    reason: string;
  };
}

export interface BoostedEvent extends TaskEventBase {
  type: 'BOOSTED';
  payload: {
    error_message: string;
  };
}

export interface ApprovedEvent extends TaskEventBase {
  type: 'APPROVED';
  payload: Record<string, unknown>;
}

export interface CheckpointEvent extends TaskEventBase {
  type: 'CHECKPOINT';
  payload: {
    progress_summary?: string;
    work_remaining?: string[];
  };
}

export interface AgentTerminatedEvent extends TaskEventBase {
  type: 'AGENT_TERMINATED';
  payload: {
    reason: 'goal_resolved' | 'goal_failed' | 'context_exhausted' | 'error';
    output_layer_id?: string;
    zones_completed: number;
    turns_used: number;
  };
}

// =============================================================================
// Discriminated Union
// =============================================================================

export type TaskEvent =
  | DepositedEvent
  | ClaimedEvent
  | ResolvedEvent
  | ReleasedEvent
  | BoostedEvent
  | ApprovedEvent
  | CheckpointEvent
  | AgentTerminatedEvent;
