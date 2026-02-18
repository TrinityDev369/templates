/**
 * Type definitions for the password reset flow.
 *
 * Covers all steps of the multi-step reset process:
 * request -> verify -> new-password -> success
 */

/* ── Step state ──────────────────────────────────────────── */

/**
 * Discriminated step identifier for the password reset flow.
 */
export type PasswordResetStep =
  | "request"
  | "verify"
  | "new-password"
  | "success";

/* ── Form data types ─────────────────────────────────────── */

/**
 * Data collected in the "request" step.
 */
export interface RequestResetData {
  email: string;
}

/**
 * Data collected in the "verify" step.
 */
export interface VerifyCodeData {
  code: string;
}

/**
 * Data collected in the "new-password" step.
 */
export interface NewPasswordData {
  password: string;
  confirmPassword: string;
}

/* ── Component props ─────────────────────────────────────── */

/**
 * Props for the top-level PasswordReset component.
 */
export interface PasswordResetProps {
  /**
   * Called when the user submits their email to request a reset code.
   * The implementation should send the code via email.
   */
  onRequestReset: (email: string) => Promise<void>;

  /**
   * Called when the user submits the 6-digit verification code.
   * The implementation should validate the code server-side.
   */
  onVerifyCode: (email: string, code: string) => Promise<void>;

  /**
   * Called when the user submits a new password after successful verification.
   * The implementation should persist the new password.
   */
  onResetPassword: (
    email: string,
    code: string,
    password: string
  ) => Promise<void>;

  /**
   * Optional callback to navigate back to the sign-in page.
   * When omitted, "Back to sign in" links are still rendered but do nothing.
   */
  onBackToSignIn?: () => void;
}
