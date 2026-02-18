export type AuditEventType =
  | "login_success"
  | "login_failed"
  | "logout"
  | "password_changed"
  | "password_reset_requested"
  | "mfa_enabled"
  | "mfa_disabled"
  | "api_key_created"
  | "api_key_revoked"
  | "role_changed"
  | "invite_sent"
  | "invite_accepted"
  | "account_locked"
  | "account_unlocked";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AuditEvent {
  /** Unique event identifier. */
  id: string;

  /** The type of authentication event. */
  type: AuditEventType;

  /** ISO 8601 timestamp of when the event occurred. */
  timestamp: string;

  /** Unique identifier of the user who triggered the event. */
  userId: string;

  /** Email address of the user who triggered the event. */
  userEmail: string;

  /** Optional display name of the user. */
  userName?: string;

  /** IP address from which the event originated. */
  ipAddress?: string;

  /** User-Agent string of the client that triggered the event. */
  userAgent?: string;

  /** Human-readable location string, e.g. "Berlin, Germany". */
  location?: string;

  /** Assessed risk level for this event. */
  riskLevel: RiskLevel;

  /** Arbitrary key-value metadata attached to the event. */
  metadata?: Record<string, string>;

  /** Whether the action completed successfully. */
  success: boolean;
}

export interface AuditLogFilters {
  /** Filter by event type. */
  eventType?: AuditEventType;

  /** Filter by risk level. */
  riskLevel?: RiskLevel;

  /** Free-text search across email, name, and IP. */
  search?: string;

  /** ISO date string for the start of the date range. */
  dateFrom?: string;

  /** ISO date string for the end of the date range. */
  dateTo?: string;
}

export interface AuditLogProps {
  /** List of audit events to display. */
  events: AuditEvent[];

  /** Called when user scrolls to load more events. */
  onLoadMore?: () => Promise<void>;

  /** Whether more events are available to load. */
  hasMore?: boolean;

  /** Show loading skeleton. */
  isLoading?: boolean;

  /** Called when a filter changes. */
  onFilterChange?: (filters: AuditLogFilters) => void;

  /** Custom className for the root element. */
  className?: string;
}
