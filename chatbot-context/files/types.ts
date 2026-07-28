/**
 * @trinity369/use chatbot-context — Type definitions
 *
 * Core interfaces for the context assembly engine: modules, budgets,
 * assembly results, and identity configuration.
 */

// ---------------------------------------------------------------------------
// Context Modules
// ---------------------------------------------------------------------------

/**
 * A context module returns a string fragment to inject into the system prompt.
 *
 * Modules are the building blocks of dynamic context assembly. Each module
 * encapsulates a single data source (catalog, user info, FAQ, events, etc.)
 * and knows how to format its data for prompt injection.
 *
 * Modules are prioritized by array order — first module gets budget first.
 */
export interface ContextModule {
  /** Unique identifier for this module (e.g. 'domain-catalog', 'user-context') */
  name: string;

  /** Human-readable description of what this module provides */
  description: string;

  /**
   * Estimated token count for budget calculation.
   * Called before build() to determine if the module fits in the remaining budget.
   * Does not need to be exact — a rough upper-bound is fine.
   */
  estimateTokens(): number;

  /**
   * Build the context fragment.
   *
   * @param userMessage - The user's latest message, used for relevance filtering.
   *   Modules can use this to only include relevant entries (e.g. FAQ keyword matching).
   * @returns The formatted context string to inject into the system prompt.
   *   Return an empty string to indicate no context is available.
   */
  build(userMessage?: string): Promise<string>;
}

// ---------------------------------------------------------------------------
// Token Budget
// ---------------------------------------------------------------------------

/**
 * Token budget allocation for the system prompt.
 *
 * The total budget is divided into three segments:
 * - identity: reserved for the bot's name, personality, tone, and anti-intents
 * - history: reserved for conversation history summary
 * - modules: remaining budget allocated to dynamic context modules
 */
export interface ContextBudget {
  /** Total tokens available for the system prompt */
  total: number;

  /** Reserved for identity (name, personality, anti-intents) */
  identity: number;

  /** Reserved for conversation history summary */
  history: number;

  /** Remaining for dynamic context modules */
  modules: number;
}

// ---------------------------------------------------------------------------
// Assembly Result
// ---------------------------------------------------------------------------

/**
 * Result of the context assembly process.
 *
 * Contains the final system prompt along with metadata about budget usage
 * and which modules were included or excluded.
 */
export interface ContextAssemblyResult {
  /** The fully assembled system prompt ready for the LLM */
  systemPrompt: string;

  /** Estimated total tokens used by the assembled prompt */
  tokenEstimate: number;

  /** Names of modules that were included (fit within budget) */
  modulesIncluded: string[];

  /** Names of modules that were excluded (did not fit within budget) */
  modulesExcluded: string[];

  /** The budget allocation used for this assembly */
  budget: ContextBudget;
}

// ---------------------------------------------------------------------------
// Identity Configuration
// ---------------------------------------------------------------------------

/**
 * Identity configuration for the chatbot.
 *
 * This defines the bot's personality and behavioral boundaries.
 * Corresponds to Phase 2 (Identity) of the chatbot growth phases.
 */
export interface IdentityConfig {
  /** Display name of the chatbot (e.g. "Luna", "Support Bot") */
  name: string;

  /** Personality description injected into the system prompt */
  personality: string;

  /** Tone of voice guidance (e.g. "warm and approachable", "professional and concise") */
  tone: string;

  /**
   * Things the bot must NOT do — injected as explicit constraints.
   * Anti-intents are as important as intents for maintaining trust.
   * @example ["never give medical advice", "never discuss competitors", "never share pricing without verification"]
   */
  antiIntents: string[];

  /** Optional disclaimer appended to the identity block (legal, medical, financial, etc.) */
  disclaimer?: string;
}
