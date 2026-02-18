/** The current rate-limit posture derived from remaining attempts. */
export type RateLimitState = "ok" | "warning" | "locked";

export interface RateLimitUIProps {
  /** Total number of allowed attempts before lockout. */
  maxAttempts: number;

  /**
   * How many attempts the user has left.
   * Set to `0` when the account is locked.
   */
  remainingAttempts: number;

  /**
   * When the lockout period ends. While this timestamp is in the future the
   * component renders a countdown timer. Pass `null` / `undefined` when there
   * is no active lockout.
   */
  lockoutEndTime?: Date | string | null;

  /** Called when the user clicks the "Try again" button after a lockout expires. */
  onRetry?: () => void;

  /** Called when the user clicks the "Contact Support" link while locked out. */
  onContactSupport?: () => void;

  /** Optional class name forwarded to the root element. */
  className?: string;
}
