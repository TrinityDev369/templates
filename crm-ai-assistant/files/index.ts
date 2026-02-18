/**
 * CRM AI Assistant — Module Barrel Export
 *
 * Re-exports all public types, components, utilities, and server handlers.
 */

// Types
export type {
  Deal,
  DealInsight,
  DealInsightType,
  ChatMessage,
  ChatRole,
  AssistantConfig,
  CRMContext,
} from './types';

export { DEFAULT_ASSISTANT_CONFIG } from './types';

// React component
export { AssistantChat } from './AssistantChat';
export type { AssistantChatProps } from './AssistantChat';

// Deal analysis utilities
export {
  analyzeDealRisks,
  findOpportunities,
  generateForecast,
  suggestActions,
  summarizePipeline,
} from './deal-analyzer';

// Server-side API handler
export { createAssistantHandler, checkRateLimit } from './api-handler';
