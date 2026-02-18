/**
 * Swarm SDK Types
 *
 * Type definitions for thermodynamic field coordination
 */

// =============================================================================
// Field Node Types
// =============================================================================

export type FieldNodeType = 'goal' | 'spec' | 'task' | 'artifact' | 'error';
export type FieldNodeState = 'open' | 'claimed' | 'resolved' | 'failed' | 'approved';

export interface FieldNode {
  id: string;
  node_type: FieldNodeType;
  title: string;
  content: Record<string, unknown>;
  potential: number;
  effective_potential: number;
  affinity: string[];
  state: FieldNodeState;
  claimed_by: string | null;
  temperature: number;
  parent_id: string | null;
  graph_node_id?: string | null;
  sequence_order: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface FieldSenseResult {
  nodes: FieldNode[];
  total_count: number;
}

export interface FieldClaimResult {
  claimed: boolean;
  previous_claimer: string | null;
  node_id: string;
}

export interface FieldResolveResult {
  resolved: boolean;
  node_id: string;
  children_unblocked: number;
}

export interface FieldDepositResult {
  node_id: string;
  created: boolean;
}

// =============================================================================
// Lifecycle Types
// =============================================================================

export interface LifecycleState {
  turn_count: number;
  max_turns: number;
  lifecycle_state: 'active' | 'checkpointing' | 'terminated';
  should_checkpoint: boolean;
  should_terminate: boolean;
  turns_remaining: number;
  context_tokens_est: number;
}

export interface CheckpointData {
  checkpoint_id: string;
  zone_id: string;
  progress_summary: string;
  work_completed: string[];
  work_remaining: string[];
  context_bundle: Record<string, unknown>;
  files_created: string[];
  files_modified: string[];
}

export interface HandoffData {
  success: boolean;
  zone_id: string | null;
  zone_title: string | null;
  progress_summary: string | null;
  work_remaining: unknown[];
  context_bundle: Record<string, unknown>;
  files_created: string[];
  files_modified: string[];
}

// =============================================================================
// Agent Types
// =============================================================================

export type AgentModel = 'opus' | 'sonnet' | 'haiku';
export type BillingMode = 'subscription' | 'api';

export interface AgentType {
  id: string;
  name: string;
  description: string;
  affinities: string[];
  model: AgentModel;
  color: string;
  systemPrompt: string;
}

export interface AgentConfig {
  id: string;
  affinities: string[];
  threshold: number;
  model: AgentModel;
  billingMode: BillingMode;
  workspace: string;
  systemPrompt: string;
  timeout: number;
  maxTurns: number;
  checkpointAt: number;
  tokensPerTurn: number;
}

// =============================================================================
// Worker Types
// =============================================================================

export interface WorkerResult {
  success: boolean;
  output: string;
  duration: number;
  error?: string;
  artifact?: WorkArtifact;
}

export interface WorkArtifact {
  agent_id: string;
  zone_id: string;
  branch: string;
  commit: string | null;
  files_created: string[];
  files_modified: string[];
  work_completed: string[];
  duration_ms: number;
}

// =============================================================================
// Tool Input/Output Types (for MCP tools)
// =============================================================================

export interface FieldSenseInput {
  affinities: string[];
  threshold?: number;
  node_types?: FieldNodeType[];
  limit?: number;
}

export interface FieldClaimInput {
  node_id: string;
}

export interface FieldResolveInput {
  node_id: string;
  artifact?: Record<string, unknown>;
}

export interface FieldReleaseInput {
  node_id: string;
  reason: string;
}

export interface FieldBoostInput {
  node_id: string;
  error_message: string;
}

export interface FieldDepositInput {
  node_type: FieldNodeType;
  title: string;
  content: Record<string, unknown>;
  affinity: string[];
  parent_id?: string;
  sequence_order?: number;
}

export interface LifecycleTickInput {
  tokens_used?: number;
}

export interface LifecycleCheckpointInput {
  zone_id: string;
  progress_summary: string;
  work_completed: string[];
  work_remaining: string[];
  context_bundle: Record<string, unknown>;
  files_created: string[];
  files_modified: string[];
}

// =============================================================================
// Event Types (re-exported from events.ts)
// =============================================================================

export type {
  TaskEventType,
  TaskEventBase,
  TaskEvent,
  DepositedEvent,
  ClaimedEvent,
  ResolvedEvent,
  ReleasedEvent,
  BoostedEvent,
  ApprovedEvent,
  CheckpointEvent,
  AgentTerminatedEvent,
} from './events.js';
