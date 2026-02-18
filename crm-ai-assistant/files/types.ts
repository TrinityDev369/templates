/**
 * CRM AI Assistant — Type Definitions
 *
 * Core types for the AI-powered CRM assistant module including
 * deal entities, AI insights, chat messages, and configuration.
 */

// ---------------------------------------------------------------------------
// Deal Entity
// ---------------------------------------------------------------------------

/** Represents a sales deal in the CRM pipeline. */
export interface Deal {
  /** Unique identifier for the deal. */
  id: string;
  /** Human-readable deal name. */
  name: string;
  /** Monetary value of the deal. */
  value: number;
  /** Current pipeline stage (e.g. "lead", "negotiation", "closed-won"). */
  stage: string;
  /** Win probability from 0 (unlikely) to 100 (certain). */
  probability: number;
  /** Company / account name associated with the deal. */
  company: string;
  /** Primary contact person for the deal. */
  contact: string;
  /** ISO-8601 timestamp when the deal was created. */
  createdAt: string;
  /** ISO-8601 date when the deal is expected to close. */
  expectedClose: string;
  /** Free-form notes attached to the deal. */
  notes: string;
}

// ---------------------------------------------------------------------------
// AI Insights
// ---------------------------------------------------------------------------

/** Classification of an insight produced by deal analysis. */
export type DealInsightType = 'risk' | 'opportunity' | 'action' | 'forecast';

/** An AI-generated insight about a specific deal or the pipeline. */
export interface DealInsight {
  /** Category of insight. */
  type: DealInsightType;
  /** Short, human-readable title for the insight. */
  title: string;
  /** Detailed explanation of the insight. */
  description: string;
  /** Confidence score from 0 (low) to 100 (high). */
  confidence: number;
  /** The deal this insight relates to (may be empty for pipeline-level insights). */
  dealId: string;
}

// ---------------------------------------------------------------------------
// Chat Messages
// ---------------------------------------------------------------------------

/** Role of a participant in the assistant conversation. */
export type ChatRole = 'user' | 'assistant' | 'system';

/** A single message in the assistant chat history. */
export interface ChatMessage {
  /** Unique message identifier. */
  id: string;
  /** Who sent this message. */
  role: ChatRole;
  /** Text content of the message (may contain markdown). */
  content: string;
  /** ISO-8601 timestamp when the message was created. */
  timestamp: string;
  /** Optional insights embedded in an assistant response. */
  insights?: DealInsight[];
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration for the AI assistant backend. */
export interface AssistantConfig {
  /** URL of the assistant API endpoint. */
  apiEndpoint: string;
  /** Model identifier to use (e.g. "gpt-4", "gpt-4o"). */
  model: string;
  /** System prompt prepended to every conversation. */
  systemPrompt: string;
  /** Maximum tokens for the AI response. */
  maxTokens: number;
}

/** Default assistant configuration values. */
export const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  apiEndpoint: '/api/assistant',
  model: 'gpt-4',
  systemPrompt:
    'You are an expert CRM assistant. Analyze deals, identify risks and opportunities, and provide actionable insights to help close more deals.',
  maxTokens: 2048,
};

// ---------------------------------------------------------------------------
// CRM Context (aggregate pipeline stats)
// ---------------------------------------------------------------------------

/** Aggregated CRM pipeline statistics passed as context to the AI. */
export interface CRMContext {
  /** All deals currently in the pipeline. */
  deals: Deal[];
  /** Sum of all deal values. */
  totalPipeline: number;
  /** Average deal monetary value. */
  avgDealSize: number;
  /** Historical win rate as a percentage (0-100). */
  winRate: number;
}
