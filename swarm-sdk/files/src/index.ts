/**
 * Swarm SDK
 *
 * SDK-based swarm worker agents for thermodynamic field coordination.
 *
 * @packageDocumentation
 */

// =============================================================================
// Worker
// =============================================================================

export { SwarmWorker, main } from './worker.js';

// =============================================================================
// Tools
// =============================================================================

export { fieldToolServer, fieldTools, setAgentId, closeFieldConnection } from './tools/field.js';

export {
  prdIntakeToolServer,
  prdIntakeTools,
  setPrdIntakeAgentId,
  closePrdIntakeConnection,
} from './tools/prd-intake.js';

// =============================================================================
// EventBus
// =============================================================================

export { TaskEventBus, taskEventBus } from './eventbus.js';
export type { TaskEventHandler, TaskEventMap } from './eventbus.js';

// =============================================================================
// Subscribers
// =============================================================================

export { registerAllSubscribers, resetSubscribers } from './subscribers/index.js';

// =============================================================================
// Configuration
// =============================================================================

export {
  getEnvConfig,
  getFullModelId,
  getWorkerEnv,
  DATABASE_URL,
  AGENT_SOCIETY,
  matchAgentType,
  getAgentType,
  MODEL_ID_MAP,
} from './config.js';

// =============================================================================
// Types
// =============================================================================

export type {
  // Field types
  FieldNodeType,
  FieldNodeState,
  FieldNode,
  FieldSenseResult,
  FieldClaimResult,
  FieldResolveResult,
  FieldDepositResult,

  // Lifecycle types
  LifecycleState,
  CheckpointData,
  HandoffData,

  // Agent types
  AgentModel,
  BillingMode,
  AgentType,
  AgentConfig,

  // Worker types
  WorkerResult,
  WorkArtifact,

  // Tool input types
  FieldSenseInput,
  FieldClaimInput,
  FieldResolveInput,
  FieldReleaseInput,
  FieldBoostInput,
  FieldDepositInput,
  LifecycleTickInput,
  LifecycleCheckpointInput,

  // Event types
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
} from './types.js';
