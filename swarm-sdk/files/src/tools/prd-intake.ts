/**
 * PRD Intake Tools
 *
 * MCP tools for decomposing PRDs into field node trees.
 * Handles atomic tree deposit (goal -> specs -> tasks), affinity suggestion,
 * and context bundle auto-matching.
 */

import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import postgres from 'postgres';
import { DATABASE_URL } from '../config.js';
import { taskEventBus } from '../eventbus.js';
import type { TaskEvent } from '../events.js';
import type { FieldNodeType } from '../types.js';

// Lazy database connection
let _sql: ReturnType<typeof postgres> | null = null;
function getSql() {
  if (!_sql) _sql = postgres(DATABASE_URL!);
  return _sql;
}

// Agent ID set by worker
let currentAgentId = '';
export function setPrdIntakeAgentId(agentId: string): void {
  currentAgentId = agentId;
}

// =============================================================================
// Affinity Keyword Map
// =============================================================================

const AFFINITY_KEYWORDS: Record<string, string[]> = {
  'implementer,backend': [
    'api', 'endpoint', 'server', 'trpc', 'rest', 'graphql', 'webhook',
    'cron', 'queue', 'worker', 'service', 'middleware',
  ],
  'implementer,frontend': [
    'component', 'page', 'ui', 'responsive', 'css', 'layout', 'tailwind',
    'react', 'nextjs', 'navigation', 'form', 'modal', 'seo', 'analytics',
  ],
  'implementer,database': [
    'schema', 'migration', 'table', 'postgresql', 'query', 'index',
    'constraint', 'seed', 'sql', 'data model',
  ],
  'implementer,auth': [
    'auth', 'login', 'logout', 'jwt', 'session', 'password', 'registration',
    'signup', 'oauth', 'mfa', 'permission', 'role',
  ],
  'implementer,backend,payments': [
    'stripe', 'payment', 'billing', 'subscription', 'invoice', 'refund',
    'checkout', 'pricing', 'commission', 'payout',
  ],
  'devops': [
    'deploy', 'docker', 'ci/cd', 'dns', 'monitoring', 'nginx', 'ssl',
    'environment', 'infrastructure', 'staging', 'production',
  ],
  'implementer,devops': [
    'migrate', 'import', 'export', 'legacy', 'cutover', 'data migration',
  ],
  'tester': [
    'test', 'e2e', 'validation', 'qa', 'smoke test', 'playwright',
    'vitest', 'coverage',
  ],
  'reviewer': [
    'review', 'audit', 'security audit', 'code review', 'compliance check',
  ],
  'implementer,frontend,design': [
    'design', 'branding', 'logo', 'typography', 'color', 'theme',
    'icon', 'illustration',
  ],
  'implementer,legal': [
    'legal', 'gdpr', 'privacy', 'terms', 'impressum', 'cookie', 'consent',
    'withdrawal', 'agb', 'datenschutz',
  ],
  'documenter': [
    'documentation', 'readme', 'spec', 'guide', 'onboarding',
  ],
  'implementer,backend,email': [
    'email', 'notification', 'transactional', 'resend', 'template',
    'newsletter', 'smtp',
  ],
};

// =============================================================================
// Bundle Matching
// =============================================================================

interface BundleRow {
  id: string;
  slug: string;
  domain: string;
  keywords: string[];
  affinities: string[];
  priority: number;
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  auth: ['auth', 'login', 'logout', 'session', 'jwt', 'token', 'mfa', 'password', 'user'],
  crm: ['client', 'contract', 'contact', 'milestone', 'deliverable', 'revenue'],
  documents: ['document', 'note', 'prd', 'file', 'upload', 'attachment'],
  knowledge: ['knowledge', 'graph', 'entity', 'relationship', 'kg'],
  swarm: ['swarm', 'field', 'agent', 'worker', 'spawn', 'claim'],
  blog: ['blog', 'post', 'article', 'publish', 'draft'],
  legal: ['template', 'rule', 'clause', 'legal', 'terms'],
};

function detectDomains(text: string): string[] {
  const lower = text.toLowerCase();
  const detected: string[] = [];
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(domain);
    }
  }
  return detected;
}

function scoreBundle(
  bundle: BundleRow,
  taskText: string,
  taskAffinities: string[],
  detectedDomains: string[],
): number {
  const lower = taskText.toLowerCase();
  const domainScore = detectedDomains.includes(bundle.domain) ? 3.0 : 0;
  let kwHits = 0;
  for (const kw of bundle.keywords) {
    if (lower.includes(kw.toLowerCase())) {
      kwHits++;
      if (kwHits >= 3) break;
    }
  }
  const affSet = new Set(taskAffinities.map((a) => a.toLowerCase()));
  let affOverlap = 0;
  for (const aff of bundle.affinities) {
    if (affSet.has(aff.toLowerCase())) {
      affOverlap++;
      if (affOverlap >= 2) break;
    }
  }
  return domainScore + kwHits * 2.0 + affOverlap * 1.5;
}

async function attachBundles(
  nodeId: string,
  title: string,
  description: string,
  affinity: string[],
): Promise<Array<{ slug: string; score: number }>> {
  const sql = getSql();
  const bundles = await sql<BundleRow[]>`
    SELECT id, slug, domain, keywords, affinities, priority
    FROM context_bundles WHERE is_active = true
  `;
  if (bundles.length === 0) return [];

  const taskText = `${title} ${description}`;
  const domains = detectDomains(taskText);

  const scored: Array<{ bundle_id: string; slug: string; match_score: number; priority: number }> = [];
  for (const b of bundles) {
    const score = scoreBundle(b, taskText, affinity, domains);
    if (score >= 1.0) {
      scored.push({ bundle_id: b.id, slug: b.slug, match_score: score, priority: b.priority });
    }
  }
  scored.sort((a, b) => b.match_score - a.match_score || b.priority - a.priority);
  const top = scored.slice(0, 4);

  if (top.length > 0) {
    const values = top.map((m) => ({
      node_id: nodeId,
      bundle_id: m.bundle_id,
      match_score: m.match_score,
      attached_by: `system:prd-intake:${currentAgentId || 'interactive'}`,
    }));
    await sql`
      INSERT INTO field_node_bundles ${sql(values, 'node_id', 'bundle_id', 'match_score', 'attached_by')}
      ON CONFLICT (node_id, bundle_id) DO NOTHING
    `;
  }

  return top.map((m) => ({ slug: m.slug, score: m.match_score }));
}

// =============================================================================
// Event Helper
// =============================================================================

function emitDeposit(nodeId: string, nodeType: FieldNodeType, title: string, affinity: string[]): void {
  try {
    taskEventBus.emit({
      id: crypto.randomUUID(),
      type: 'DEPOSITED',
      timestamp: new Date(),
      node_id: nodeId,
      node_type: nodeType,
      title,
      agent_id: currentAgentId,
      payload: { affinity },
    } as TaskEvent);
  } catch {
    // best-effort
  }
}

// =============================================================================
// MCP Tools
// =============================================================================

/**
 * Suggest affinities for a task based on its title and description.
 */
const prdSuggestAffinities = tool(
  'prd_suggest_affinities',
  'Suggest agent affinities for a task based on its title and description. Returns ranked affinity suggestions.',
  {
    title: z.string().describe('Task title'),
    description: z.string().default('').describe('Task description'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    const text = `${args.title} ${args.description}`.toLowerCase();

    const matches: Array<{ affinities: string; score: number }> = [];
    for (const [affinityStr, keywords] of Object.entries(AFFINITY_KEYWORDS)) {
      let hits = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) hits++;
      }
      if (hits > 0) {
        matches.push({ affinities: affinityStr, score: hits });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    // Merge top matches into a deduplicated affinity list
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const m of matches.slice(0, 3)) {
      for (const a of m.affinities.split(',')) {
        if (!seen.has(a)) {
          seen.add(a);
          merged.push(a);
        }
      }
    }

    if (merged.length === 0) merged.push('implementer');

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          suggested_affinities: merged,
          matches: matches.slice(0, 5),
        }, null, 2),
      }],
    };
  },
);

/**
 * Deposit a full PRD tree atomically: goal -> specs -> tasks.
 * All nodes are inserted in a single transaction.
 */
const prdDepositTree = tool(
  'prd_deposit_tree',
  'Deposit a full PRD decomposition as a field node tree (goal -> specs -> tasks). Atomically creates all nodes in one transaction with parent-child relationships, affinities, and context bundle matching.',
  {
    goal: z.object({
      title: z.string().describe('Goal title (project name + one-line summary)'),
      description: z.string().describe('Executive summary from the PRD'),
      affinities: z.array(z.string()).default(['architect', 'planner']),
    }),
    specs: z.array(z.object({
      title: z.string().describe('Spec/phase title'),
      description: z.string().describe('Phase scope summary'),
      affinities: z.array(z.string()).default(['architect', 'planner']),
      tasks: z.array(z.object({
        title: z.string().describe('Atomic task title'),
        description: z.string().describe('Task description with acceptance criteria'),
        affinities: z.array(z.string()).describe('Agent affinities for routing'),
        potential: z.number().min(0).max(1).default(0.8).describe('Task potential (0.9=critical, 0.8=standard, 0.7=nice-to-have)'),
        sequence_order: z.number().optional().describe('Order within the spec for dependent tasks'),
      })),
    })),
    source_prd: z.string().optional().describe('File path to the source PRD (stored in goal metadata)'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    const sql = getSql();

    try {
      const result = await sql.begin(async (_tx) => {
        // Cast: TransactionSql tagged-template works at runtime but lacks call signatures in types
        const tx = _tx as unknown as ReturnType<typeof postgres>;
        // 1. Create goal node
        const goalContent = JSON.stringify({ description: args.goal.description });
        const goalMeta = JSON.stringify({
          source_prd: args.source_prd || null,
          deposited_by: currentAgentId || 'interactive',
          deposited_at: new Date().toISOString(),
        });
        const [goalRow] = await tx`
          INSERT INTO field_nodes (node_type, title, content, potential, affinity, state, metadata)
          VALUES (
            'goal'::field_node_type,
            ${args.goal.title},
            ${goalContent}::jsonb,
            0.9,
            ${args.goal.affinities}::text[],
            'open',
            ${goalMeta}::jsonb
          )
          RETURNING id::text
        `;
        const goalId = goalRow.id;

        const specs: Array<{
          id: string;
          title: string;
          task_count: number;
          task_ids: string[];
        }> = [];

        let totalTasks = 0;

        // 2. Create spec + task nodes
        for (const spec of args.specs) {
          const specContent = JSON.stringify({ description: spec.description });
          const [specRow] = await tx`
            INSERT INTO field_nodes (node_type, title, content, potential, affinity, state, parent_id)
            VALUES (
              'spec'::field_node_type,
              ${spec.title},
              ${specContent}::jsonb,
              0.85,
              ${spec.affinities}::text[],
              'open',
              ${goalId}::uuid
            )
            RETURNING id::text
          `;
          const specId = specRow.id;
          const taskIds: string[] = [];

          for (const task of spec.tasks) {
            const taskContent = JSON.stringify({ description: task.description });
            const [taskRow] = await tx`
              INSERT INTO field_nodes (
                node_type, title, content, potential, affinity, state,
                parent_id, sequence_order
              )
              VALUES (
                'task'::field_node_type,
                ${task.title},
                ${taskContent}::jsonb,
                ${task.potential},
                ${task.affinities}::text[],
                'open',
                ${specId}::uuid,
                ${task.sequence_order ?? null}
              )
              RETURNING id::text
            `;
            taskIds.push(taskRow.id);
            totalTasks++;
          }

          specs.push({
            id: specId,
            title: spec.title,
            task_count: spec.tasks.length,
            task_ids: taskIds,
          });
        }

        return { goalId, specs, totalTasks };
      });

      // 3. Attach bundles outside transaction (best-effort, non-blocking)
      let totalBundles = 0;
      const bundleResults: Record<string, Array<{ slug: string; score: number }>> = {};

      // Bundle matching for all task nodes
      for (const spec of args.specs) {
        const specResult = result.specs.find((s) => s.title === spec.title);
        if (!specResult) continue;

        for (let i = 0; i < spec.tasks.length; i++) {
          const task = spec.tasks[i];
          const taskId = specResult.task_ids[i];
          try {
            const bundles = await attachBundles(
              taskId,
              task.title,
              task.description,
              task.affinities,
            );
            if (bundles.length > 0) {
              bundleResults[taskId] = bundles;
              totalBundles += bundles.length;
            }
          } catch {
            // bundle matching is best-effort
          }
        }
      }

      // 4. Emit events for all nodes
      emitDeposit(result.goalId, 'goal', args.goal.title, args.goal.affinities);
      for (const spec of result.specs) {
        const specData = args.specs.find((s) => s.title === spec.title);
        emitDeposit(spec.id, 'spec', spec.title, specData?.affinities || ['architect']);
        for (const taskId of spec.task_ids) {
          const taskData = specData?.tasks[spec.task_ids.indexOf(taskId)];
          if (taskData) {
            emitDeposit(taskId, 'task', taskData.title, taskData.affinities);
          }
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            goal_id: result.goalId,
            goal_title: args.goal.title,
            specs: result.specs.map((s) => ({
              id: s.id,
              title: s.title,
              task_count: s.task_count,
              task_ids: s.task_ids,
            })),
            total_specs: result.specs.length,
            total_tasks: result.totalTasks,
            total_bundles_attached: totalBundles,
            bundle_details: bundleResults,
            source_prd: args.source_prd || null,
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }),
        }],
      };
    }
  },
);

/**
 * Check for existing field nodes matching a PRD title to prevent duplicates.
 */
const prdCheckDuplicates = tool(
  'prd_check_duplicates',
  'Check if field nodes already exist for a PRD to prevent duplicate deposits. Searches by keyword in open/claimed nodes.',
  {
    keywords: z.array(z.string()).describe('Keywords to search for in existing node titles'),
  },
  async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
    const sql = getSql();

    try {
      const conditions = args.keywords.map((kw) => `title ILIKE '%' || '${kw.replace(/'/g, "''")}' || '%'`);
      const whereClause = conditions.join(' OR ');

      const rows = await sql.unsafe(`
        SELECT id::text, node_type, title, state, parent_id::text
        FROM field_nodes
        WHERE state IN ('open', 'claimed')
        AND (${whereClause})
        ORDER BY created_at DESC
        LIMIT 20
      `);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            found: rows.length,
            nodes: rows.map((r) => ({
              id: r.id,
              node_type: r.node_type,
              title: r.title,
              state: r.state,
              parent_id: r.parent_id,
            })),
            warning: rows.length > 0
              ? `Found ${rows.length} existing nodes matching keywords. Review before depositing to avoid duplicates.`
              : null,
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error checking duplicates: ${error instanceof Error ? error.message : String(error)}`,
        }],
      };
    }
  },
);

// =============================================================================
// Export
// =============================================================================

export const prdIntakeToolServer = createSdkMcpServer({
  name: 'swarm-prd-intake',
  version: '1.0.0',
  tools: [prdDepositTree, prdSuggestAffinities, prdCheckDuplicates],
});

export const prdIntakeTools = {
  prdDepositTree,
  prdSuggestAffinities,
  prdCheckDuplicates,
};

export async function closePrdIntakeConnection(): Promise<void> {
  if (_sql) {
    await _sql.end();
    _sql = null;
  }
}
