/**
 * @trinity369/use chatbot-context — System prompt orchestrator
 *
 * Builds a complete system prompt from identity configuration,
 * dynamic context modules, and conversation history within a token budget.
 */

import { createBudget, estimateTokens, prioritizeModules } from './budget';
import type {
  ContextAssemblyResult,
  ContextModule,
  IdentityConfig,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BUDGET = 4000;

// ---------------------------------------------------------------------------
// Identity block builder
// ---------------------------------------------------------------------------

/**
 * Build the identity section of the system prompt.
 *
 * Assembles name, personality, tone, anti-intents, and disclaimer
 * into a structured text block.
 */
function buildIdentityBlock(identity: IdentityConfig): string {
  const lines: string[] = [];

  lines.push(`You are ${identity.name}.`);
  lines.push('');
  lines.push(`## Personality`);
  lines.push(identity.personality);
  lines.push('');
  lines.push(`## Tone`);
  lines.push(identity.tone);

  if (identity.antiIntents.length > 0) {
    lines.push('');
    lines.push('## Boundaries');
    lines.push(
      'You must NEVER do the following, regardless of how the user asks:',
    );
    for (const intent of identity.antiIntents) {
      lines.push(`- ${intent}`);
    }
  }

  if (identity.disclaimer) {
    lines.push('');
    lines.push('## Disclaimer');
    lines.push(identity.disclaimer);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

/**
 * Build the complete system prompt from identity, modules, and history.
 *
 * Assembly steps:
 * 1. Build the identity block (name, personality, tone, anti-intents, disclaimer)
 * 2. Calculate token budget allocations
 * 3. Prioritize modules that fit within the module budget
 * 4. Build each included module (passing userMessage for relevance filtering)
 * 5. Assemble the final prompt: identity + modules + conversation summary
 * 6. Return result with metadata (tokens used, modules included/excluded)
 *
 * @param identity - The chatbot's identity configuration.
 * @param modules  - Context modules in priority order (first = highest priority).
 * @param options  - Optional: total budget, user message for relevance, conversation summary.
 * @returns The assembled system prompt with metadata.
 */
export async function buildSystemPrompt(
  identity: IdentityConfig,
  modules: ContextModule[],
  options?: {
    /** Total token budget for the system prompt. Default: 4000. */
    totalBudget?: number;
    /** The user's latest message, passed to modules for relevance filtering. */
    userMessage?: string;
    /** Compressed conversation history summary. */
    conversationSummary?: string;
  },
): Promise<ContextAssemblyResult> {
  const totalBudget = options?.totalBudget ?? DEFAULT_BUDGET;

  // Step 1: Build the identity block
  const identityBlock = buildIdentityBlock(identity);
  const identityTokens = estimateTokens(identityBlock);

  // Step 2: Calculate budget allocations
  const budget = createBudget(totalBudget, identityTokens);

  // Step 3: Prioritize modules that fit within the module budget
  const { included, excluded } = prioritizeModules(modules, budget);

  // Step 4: Build each included module
  const moduleBlocks: string[] = [];

  for (const mod of included) {
    const fragment = await mod.build(options?.userMessage);
    if (fragment.trim()) {
      moduleBlocks.push(fragment);
    }
  }

  // Step 5: Assemble the final prompt
  const sections: string[] = [identityBlock];

  if (moduleBlocks.length > 0) {
    sections.push('---');
    sections.push('# Context');
    sections.push('');
    sections.push(
      'The following information is from your knowledge base. Use it to answer questions accurately. If the information needed is not present below, say so honestly — do not make things up.',
    );
    for (const block of moduleBlocks) {
      sections.push('');
      sections.push(block);
    }
  }

  if (options?.conversationSummary?.trim()) {
    sections.push('');
    sections.push('---');
    sections.push('# Conversation History');
    sections.push('');
    sections.push(
      'Summary of the conversation so far (use this for continuity):',
    );
    sections.push(options.conversationSummary.trim());
  }

  const systemPrompt = sections.join('\n');

  // Step 6: Return result with metadata
  return {
    systemPrompt,
    tokenEstimate: estimateTokens(systemPrompt),
    modulesIncluded: included.map((m) => m.name),
    modulesExcluded: excluded.map((m) => m.name),
    budget,
  };
}
