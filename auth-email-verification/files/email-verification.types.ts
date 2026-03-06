/**
 * Type definitions for the email verification flow.
 *
 * Steps: pending -> success | expired
 */

/** Current step in the verification flow. */
export type VerificationStep = "pending" | "success" | "expired";

/** Props for the EmailVerification component. */
export interface EmailVerificationProps {
  /** The email address being verified. */
  email: string;

  /**
   * Current verification status.
   * - "pending" — waiting for user to click email link or enter code
   * - "success" — verification completed
   * - "expired" — verification link/code has expired
   */
  status: VerificationStep;

  /**
   * Called when the user requests a new verification email.
   * The implementation should send a fresh verification email.
   */
  onResend: (email: string) => Promise<void>;

  /**
   * Called when the user submits a verification code (if using code-based flow).
   * If not provided, the code input is hidden (link-only mode).
   */
  onVerifyCode?: (code: string) => Promise<void>;

  /** Navigate to a different page after success (e.g. dashboard). */
  onContinue?: () => void;

  /** Navigate back to change the email address. */
  onChangeEmail?: () => void;

  /**
   * Countdown in seconds before the resend button becomes active.
   * Defaults to 60.
   */
  resendCooldown?: number;

  /**
   * Expiry time for the current code/link, in seconds from now.
   * Shown as a countdown. When it reaches 0, status should change to "expired".
   */
  expiresInSeconds?: number;
}
