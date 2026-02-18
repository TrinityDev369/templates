/**
 * Swarm SDK Worker
 *
 * SDK-based worker agent for thermodynamic field coordination.
 * Uses the Claude Agent SDK to run autonomous agents that sense,
 * claim, execute, and resolve work from the field.
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';

// Load .env from project root
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(__dirname, '../.env');
loadEnv({ path: rootEnvPath });

import { query } from '@anthropic-ai/claude-agent-sdk';
import type { Options, SDKAssistantMessage, SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';
import { fieldToolServer, setAgentId, closeFieldConnection } from './tools/field.js';
import {
  prdIntakeToolServer,
  setPrdIntakeAgentId,
  closePrdIntakeConnection,
} from './tools/prd-intake.js';
import { registerAllSubscribers } from './subscribers/index.js';
import { getEnvConfig, matchAgentType, getFullModelId, getWorkerEnv, DATABASE_URL } from './config.js';
import type { AgentConfig, WorkerResult } from './types.js';
import postgres from 'postgres';

// =============================================================================
// Logging
// =============================================================================

function log(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Worker] ${message}`);
}

function logError(message: string, error?: unknown): void {
  const timestamp = new Date().toISOString();
  const errorDetail = error instanceof Error ? error.message : String(error);
  console.error(`[${timestamp}] [Worker] ERROR: ${message}`, errorDetail);
}

// =============================================================================
// Worker Implementation
// =============================================================================

export class SwarmWorker {
  private config: AgentConfig;
  private isRunning = false;

  constructor(config?: Partial<AgentConfig>) {
    const envConfig = getEnvConfig();
    this.config = { ...envConfig, ...config };

    // Initialize tools with agent ID
    setAgentId(this.config.id);
    setPrdIntakeAgentId(this.config.id);

    // Register event subscribers
    const sql = postgres(DATABASE_URL!);
    registerAllSubscribers(sql);

    // Set system prompt based on agent type if not provided
    if (!this.config.systemPrompt) {
      const agentType = matchAgentType(this.config.affinities);
      if (agentType) {
        this.config.systemPrompt = agentType.systemPrompt;
        this.config.model = agentType.model;
        log(`Matched agent type: ${agentType.name}`);
      }
    }
  }

  /**
   * Build the system prompt for the worker
   */
  private buildSystemPrompt(): string {
    const basePrompt = this.config.systemPrompt || `You are a swarm worker agent.

Your job is to autonomously sense, claim, execute, and resolve work from the thermodynamic field.

## CRITICAL: Single-Goal Discipline (1 Agent = 1 Problem = 1 Goal)

You are a single-purpose agent. You have ONE goal. Your lifecycle is:

1. Sense the field (field_sense) -- find your one task
2. Claim it (field_claim) -- you get exactly ONE claim per session
3. Execute the work
4. Resolve (field_resolve with artifact)
5. STOP. Your session is over.

**GUARDS:**
- If field_claim returns SINGLE_GOAL_VIOLATION, you already claimed -- proceed to execute
- If field_sense returns SESSION_COMPLETE, you already resolved -- stop working
- Never call field_sense after field_resolve -- your work is done

## Available Tools

### Field Tools
- field_sense: Find work nodes matching your affinities
- field_claim: Atomically claim a node for work
- field_resolve: Mark work complete with artifact
- field_release: Release a claim (if blocked)
- field_boost: Signal error for help
- field_deposit: Create new nodes

### PRD Intake Tools
- prd_deposit_tree: Deposit a full PRD decomposition as a field node tree
- prd_suggest_affinities: Suggest agent affinities for a task
- prd_check_duplicates: Check for existing nodes to prevent duplicates

### Standard Tools
- Read, Write, Edit: File operations
- Glob, Grep: Search operations
- Bash: Shell commands`;

    return basePrompt;
  }

  /**
   * Build the initial user prompt for the worker
   */
  private async buildPrompt(): Promise<string> {
    const header = `Agent ID: ${this.config.id}
Affinities: ${this.config.affinities.join(', ')}
Threshold: ${this.config.threshold}`;

    // Pre-sense the field to find the top matching task
    let preContext = '';
    try {
      const sql = postgres(DATABASE_URL!);
      try {
        const rows = await sql`
          SELECT * FROM field_sense_fresh(
            ${this.config.affinities}::text[],
            ${this.config.threshold},
            ARRAY['goal', 'spec', 'task']::field_node_type[],
            2
          )
          LIMIT 3
        `;

        if (rows.length > 0) {
          const taskList = rows.map((r, i) =>
            `  ${i + 1}. [${Number(r.effective_potential ?? r.potential).toFixed(2)}] ${r.title}`
          ).join('\n');

          preContext = `\n\n## Pre-Sensed Field (${rows.length} matching tasks)
${taskList}

Top task node ID: ${rows[0].id}`;
        }
      } finally {
        await sql.end();
      }
    } catch (err) {
      log(`Pre-sense failed (non-fatal): ${(err as Error).message}`);
    }

    return `${header}${preContext}

Begin your work cycle:
1. Use field_sense to find work matching your affinities
2. Use field_claim to claim the top task
3. Execute the work
4. Use field_resolve with an artifact documenting what you did`;
  }

  /**
   * Run the worker
   */
  async run(): Promise<WorkerResult> {
    if (this.isRunning) {
      throw new Error('Worker is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();
    log(`Starting worker ${this.config.id}`);
    log(`Affinities: ${this.config.affinities.join(', ')}`);
    log(`Model: ${this.config.model}`);

    try {
      log(`Billing mode: ${this.config.billingMode}`);
      const options: Options = {
        model: getFullModelId(this.config.model),
        systemPrompt: this.buildSystemPrompt(),
        cwd: this.config.workspace,
        maxTurns: this.config.maxTurns,
        permissionMode: 'acceptEdits',
        env: getWorkerEnv(this.config.billingMode),
        mcpServers: {
          'swarm-field': fieldToolServer,
          'swarm-prd-intake': prdIntakeToolServer,
        },
        allowedTools: [
          // Field tools
          'mcp__swarm-field__field_sense',
          'mcp__swarm-field__field_claim',
          'mcp__swarm-field__field_resolve',
          'mcp__swarm-field__field_release',
          'mcp__swarm-field__field_boost',
          'mcp__swarm-field__field_deposit',
          // PRD intake tools
          'mcp__swarm-prd-intake__prd_deposit_tree',
          'mcp__swarm-prd-intake__prd_suggest_affinities',
          'mcp__swarm-prd-intake__prd_check_duplicates',
          // Standard tools
          'Read',
          'Write',
          'Edit',
          'Glob',
          'Grep',
          'Bash',
        ],
      };

      log('Pre-sensing field...');
      const prompt = await this.buildPrompt();
      log(`Prompt assembled: ${prompt.length} chars`);
      let output = '';

      log('Executing SDK query...');

      for await (const message of query({ prompt, options })) {
        // Process messages
        if (message.type === 'assistant') {
          const assistantMsg = message as SDKAssistantMessage;
          for (const block of assistantMsg.message.content) {
            if (block.type === 'text') {
              output += block.text + '\n';
              // Log progress
              if (block.text.length > 100) {
                log(`Assistant: ${block.text.substring(0, 100)}...`);
              } else {
                log(`Assistant: ${block.text}`);
              }
            } else if (block.type === 'tool_use') {
              log(`Tool call: ${block.name}`);
            }
          }
        } else if (message.type === 'result') {
          const resultMsg = message as SDKResultMessage;
          log(`Result: ${resultMsg.subtype}`);
          if (resultMsg.subtype !== 'success') {
            logError('Query ended with error', resultMsg.subtype);
          }
        }
      }

      const duration = Date.now() - startTime;
      log(`Worker completed in ${duration}ms`);

      return {
        success: true,
        output,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logError('Worker failed', error);

      return {
        success: false,
        output: '',
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    log('Cleaning up worker resources...');
    await Promise.all([
      closeFieldConnection(),
      closePrdIntakeConnection(),
    ]);
    log('Cleanup complete');
  }
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  const worker = new SwarmWorker();

  // Handle graceful shutdown
  const shutdown = async (): Promise<void> => {
    log('Received shutdown signal');
    await worker.cleanup();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    const result = await worker.run();

    if (result.success) {
      log('Worker completed successfully');
    } else {
      logError('Worker failed', result.error);
      process.exit(1);
    }
  } catch (error) {
    logError('Fatal error', error);
    process.exit(1);
  } finally {
    await worker.cleanup();
  }
}

// Run if this is the main module
// Uses import.meta.url check for Node.js; Bun supports import.meta.main natively
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain || (import.meta as unknown as Record<string, unknown>).main) {
  main();
}

export { main };
