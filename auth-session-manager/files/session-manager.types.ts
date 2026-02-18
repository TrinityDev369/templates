export type DeviceType = "desktop" | "mobile" | "tablet";

export interface Session {
  /** Unique session identifier. */
  id: string;

  /** The type of device used to create this session. */
  deviceType: DeviceType;

  /** Human-readable device name, e.g. "MacBook Pro", "iPhone 15". */
  deviceName: string;

  /** Browser name and version, e.g. "Chrome 121", "Safari 17.2". */
  browser: string;

  /** The IP address from which the session was created. */
  ipAddress: string;

  /** Optional location string, e.g. "Berlin, Germany". */
  location?: string;

  /** ISO timestamp or Date of the last activity on this session. */
  lastActive: string | Date;

  /** Whether this session is the one making the current request. */
  isCurrent: boolean;
}

export interface SessionManagerProps {
  /** List of active sessions to display. */
  sessions: Session[];

  /** The ID of the session that belongs to the current browser tab. */
  currentSessionId: string;

  /**
   * Called when the user confirms revoking a single session.
   * Should resolve when the server has acknowledged the revocation.
   */
  onRevoke: (sessionId: string) => Promise<void>;

  /**
   * Called when the user confirms revoking all sessions except the current one.
   * Should resolve when the server has acknowledged the revocation.
   */
  onRevokeAll: () => Promise<void>;
}
