/**
 * @trinity369/use chatbot-context
 *
 * Dynamic context assembly engine with pluggable modules and token budgeting.
 * Builds the system prompt dynamically from live data sources at request time.
 * See build-prompt.ts for the orchestrator and modules/ for examples.
 *
 * @module chatbot-context
 */

// Orchestrator
export { buildSystemPrompt } from './build-prompt';

// Budget utilities
export { estimateTokens, createBudget, fitsInBudget, prioritizeModules } from './budget';

// Context modules
export { createDomainCatalogModule } from './modules/domain-catalog';
export { createUserContextModule } from './modules/user-context';
export { createFAQModule } from './modules/faq';
export { createEventsModule } from './modules/events';

// Types
export type {
  ContextModule,
  ContextBudget,
  ContextAssemblyResult,
  IdentityConfig,
} from './types';

export type { PrioritizationResult } from './budget';
