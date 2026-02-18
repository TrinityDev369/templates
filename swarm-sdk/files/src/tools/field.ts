/**
 * Field Operation Tools
 *
 * MCP tools for thermodynamic field coordination.
 * These tools allow SDK agents to autonomously sense, claim, and resolve work.
 */

import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import postgres from 'postgres';
import { DATABASE_URL } from '../config.js';
import type {
  FieldNode,
  FieldNodeType,
  FieldSenseResult,
  FieldClaimResult,
  FieldResolveResult,
  FieldDepositResult,
} from '../types.js';
import { taskEventBus } from '../eventbus.js';
import type { TaskEvent, TaskEventType } from '../events.js';
import {
  claimedNodeId,
  hasResolved,
  setClaimedNodeId,
  setHasResolved,
} from '../agent-state.js';

// Database connection
const sql = postgres(DATABASE_URL!);

// Current agent ID (set by worker)
let currentAgentId = '';

export function setAgentId(agentId: string): void {
  currentAgentId = agentId;
}

// =============================================================================
// Event Helpers
// =============================================================================

async function getNodeMeta(nodeId: string): Promise<{ node_type: FieldNodeType; title: string }> {
  const [row] = await sql`SELECT node_type, title FROM field_nodes WHERE id = ${nodeId}::uuid`;
  if (!row) return { node_type: 'task', title: 'Unknown' };
  return { node_type: row.node_type, title: row.title };
}

/**
 * Best-effort event emission: looks up node metadata, builds the event,
 * and emits it. If the meta lookup or emit fails, the error is silently
 * swallowed -- field operations must never fail due to event plumbing.
 */
async function emitNodeEvent(
  type: TaskEventType,
  nodeId: string,
  payload: Record<string, unknown>,
  metaOverride?: { node_type: FieldNodeType; title: string },
): Promise<void> {
  try {
    const meta = metaOverride ?? await getNodeMeta(nodeId);
    taskEventBus.emit({
      id: crypto.randomUUID(),
      type,
      timestamp: new Date(),
      node_id: nodeId,
      node_type: meta.node_type,
      title: meta.title,
      agent_id: currentAgentId,
      payload,
    // The discriminated union requires a cast here because we construct events
    // generically. The caller is responsible for matching type + payload shape.
    } as TaskEvent);
  } catch {
    // Event emission is best-effort; field operations must not fail from it
  }
}

// =============================================================================
// Field Tools
// =============================================================================

/**
 * Sense the field for matching work nodes
 */
const fieldSense = tool(
  'field_sense',
  'Sense the thermodynamic field for work nodes matching your affinities. Returns nodes sorted by effective potential.',
  {
    affinities: z.array(z.string()).describe('Your agent affinities to match against'),
    threshold: z.number().min(0).max(1).default(0.5).describe('Minimum potential threshold'),
    node_types: z
      .array(z.enum(['goal', 'spec', 'task', 'artifact', 'error']))
      .default(['task', 'spec'])
      .describe('Node types to search for'),
    limit: z.number().min(1).max(20).default(5).describe('Maximum nodes to return'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    // SINGLE-GOAL: block sensing after resolve
    if (hasResolved) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              nodes: [],
              total_count: 0,
              reason: 'SESSION_COMPLETE: Goal resolved. No further sensing allowed.',
            }),
          },
        ],
      };
    }

    try {
      const rows = await sql`
        SELECT * FROM field_sense_fresh(
          ${args.affinities}::text[],
          ${args.threshold},
          ${args.node_types}::field_node_type[],
          2
        )
        LIMIT ${args.limit}
      `;

      const result: FieldSenseResult = {
        nodes: rows.map((row) => mapFieldNode(row as Record<string, unknown>)),
        total_count: rows.length,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error sensing field: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

/**
 * Claim a field node for work
 */
const fieldClaim = tool(
  'field_claim',
  'Atomically claim a field node for work. Returns whether claim was successful.',
  {
    node_id: z.string().uuid().describe('UUID of the node to claim'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    // SINGLE-GOAL GUARD: reject if already claimed
    if (claimedNodeId !== null) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              claimed: false,
              reason: 'SINGLE_GOAL_VIOLATION: This agent already holds node ' + claimedNodeId,
              node_id: args.node_id,
            }),
          },
        ],
      };
    }
    if (hasResolved) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              claimed: false,
              reason: 'SESSION_COMPLETE: This agent already resolved its goal. Terminate.',
              node_id: args.node_id,
            }),
          },
        ],
      };
    }

    try {
      const [result] = await sql`
        SELECT * FROM field_claim_safe(${args.node_id}::uuid, ${currentAgentId})
      `;

      const claimResult: FieldClaimResult = {
        claimed: result.claimed,
        previous_claimer: result.previous_claimer,
        node_id: args.node_id,
      };

      if (result.claimed) {
        setClaimedNodeId(args.node_id);
        await emitNodeEvent('CLAIMED', args.node_id, {});
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(claimResult, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error claiming node: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

/**
 * Resolve a field node (mark as complete)
 */
const fieldResolve = tool(
  'field_resolve',
  'Mark a field node as resolved/complete. Include an artifact with details of work done.',
  {
    node_id: z.string().uuid().describe('UUID of the node to resolve'),
    artifact: z
      .record(z.unknown())
      .optional()
      .describe('Artifact documenting work completed (files modified, commit hash, etc.)'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    try {
      const [result] = await sql`
        SELECT field_resolve(
          ${args.node_id}::uuid,
          ${currentAgentId},
          ${args.artifact ? JSON.stringify(args.artifact) : null}::jsonb
        ) as resolved
      `;

      const resolveResult: FieldResolveResult = {
        resolved: result.resolved,
        node_id: args.node_id,
        children_unblocked: 0, // Would need to query this separately
      };

      if (result.resolved) {
        setHasResolved(true);
        await emitNodeEvent('RESOLVED', args.node_id, { artifact: args.artifact });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(resolveResult, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error resolving node: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

/**
 * Release a field node (give up claim)
 */
const fieldRelease = tool(
  'field_release',
  'Release a claimed field node back to the field. Use when blocked or unable to complete.',
  {
    node_id: z.string().uuid().describe('UUID of the node to release'),
    reason: z.string().describe('Reason for releasing the node'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    try {
      await sql`SELECT field_release(${args.node_id}::uuid, ${currentAgentId}, ${args.reason})`;

      await emitNodeEvent('RELEASED', args.node_id, { reason: args.reason });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ released: true, node_id: args.node_id, reason: args.reason }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error releasing node: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

/**
 * Boost a field node (signal error/need for help)
 */
const fieldBoost = tool(
  'field_boost',
  'Boost a field node after encountering an error. Increases temperature to attract specialist agents.',
  {
    node_id: z.string().uuid().describe('UUID of the node to boost'),
    error_message: z.string().describe('Description of the error encountered'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    try {
      await sql`SELECT field_boost(${args.node_id}::uuid, ${currentAgentId}, ${args.error_message})`;

      await emitNodeEvent('BOOSTED', args.node_id, { error_message: args.error_message });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              boosted: true,
              node_id: args.node_id,
              error_message: args.error_message,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error boosting node: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

/**
 * Deposit a new field node
 */
const fieldDeposit = tool(
  'field_deposit',
  'Create a new field node. Use to deposit specs, tasks, or artifacts into the field.',
  {
    node_type: z.enum(['goal', 'spec', 'task', 'artifact', 'error']).describe('Type of node to create'),
    title: z.string().describe('Title of the node'),
    content: z.record(z.unknown()).describe('Content/details of the node'),
    affinity: z.array(z.string()).describe('Affinities for the node (what agents should work on it)'),
    parent_id: z.string().uuid().optional().describe('Parent node ID if this is a child'),
    sequence_order: z.number().optional().describe('Order in sequence if part of ordered work'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    try {
      const [result] = await sql`
        SELECT field_deposit(
          ${args.node_type}::field_node_type,
          ${args.title},
          ${JSON.stringify(args.content)}::jsonb,
          ${args.affinity}::text[],
          ${args.parent_id ?? null}::uuid,
          ${args.sequence_order ?? null}
        ) as node_id
      `;

      const depositResult: FieldDepositResult = {
        node_id: result.node_id,
        created: true,
      };

      await emitNodeEvent(
        'DEPOSITED',
        result.node_id,
        {
          affinity: args.affinity,
          parent_id: args.parent_id ?? null,
          sequence_order: args.sequence_order ?? null,
          content: args.content,
        },
        { node_type: args.node_type as FieldNodeType, title: args.title },
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(depositResult, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error depositing node: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
);

// =============================================================================
// Helper Functions
// =============================================================================

function mapFieldNode(row: Record<string, unknown>): FieldNode {
  return {
    id: String(row.id),
    node_type: String(row.node_type) as FieldNodeType,
    title: String(row.title),
    content: (row.content as Record<string, unknown>) || {},
    potential: Number(row.potential),
    effective_potential: Number(row.effective_potential ?? row.potential),
    affinity: (row.affinity as string[]) || [],
    state: String(row.state) as FieldNode['state'],
    claimed_by: row.claimed_by as string | null,
    temperature: Number(row.temperature ?? 0),
    parent_id: row.parent_id as string | null,
    sequence_order: row.sequence_order as number | null,
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  };
}

// =============================================================================
// Create MCP Server with Field Tools
// =============================================================================

export const fieldToolServer = createSdkMcpServer({
  name: 'swarm-field',
  version: '1.0.0',
  tools: [fieldSense, fieldClaim, fieldResolve, fieldRelease, fieldBoost, fieldDeposit],
});

// Export individual tools for testing
export const fieldTools = {
  fieldSense,
  fieldClaim,
  fieldResolve,
  fieldRelease,
  fieldBoost,
  fieldDeposit,
};

// Cleanup function
export async function closeFieldConnection(): Promise<void> {
  await sql.end();
}
