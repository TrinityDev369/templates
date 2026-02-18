/**
 * Type definitions for the two-factor authentication setup flow.
 *
 * Covers all steps of the multi-step 2FA enrollment process:
 * intro -> scan -> recovery -> verify -> success
 */

/* -- Step state ------------------------------------------------- */

/**
 * Discriminated step identifier for the 2FA setup flow.
 *
 * - `intro`    - Explanation screen with "Enable 2FA" button
 * - `scan`     - QR code display + manual secret key
 * - `recovery` - Recovery codes display with download/copy
 * - `verify`   - 6-digit OTP confirmation
 * - `success`  - Setup complete confirmation
 */
export type TwoFactorStep =
  | "intro"
  | "scan"
  | "recovery"
  | "verify"
  | "success";

/* -- Callback return types -------------------------------------- */

/**
 * Payload returned by the `onEnable` callback after the server
 * generates 2FA credentials for the user.
 */
export interface TwoFactorEnableResult {
  /** Data URI or URL for the QR code image (rendered as `<img src>`). */
  qrCodeUrl: string;
  /** Base32-encoded TOTP secret for manual entry. */
  secret: string;
  /** One-time recovery codes (typically 8). */
  recoveryCodes: string[];
}

/* -- Component props -------------------------------------------- */

/**
 * Props for the top-level TwoFactorSetup component.
 */
export interface TwoFactorSetupProps {
  /**
   * Called when the user clicks "Enable 2FA".
   * The implementation should generate TOTP credentials server-side
   * and return the QR code URL, secret, and recovery codes.
   */
  onEnable: () => Promise<TwoFactorEnableResult>;

  /**
   * Called when the user submits a 6-digit TOTP code to verify setup.
   * Returns `true` if the code is valid, `false` otherwise.
   */
  onVerify: (code: string) => Promise<boolean>;

  /**
   * Called after the user acknowledges successful 2FA setup.
   * Typically used to redirect or close the setup dialog.
   */
  onComplete: () => void;
}

/* -- Recovery codes props --------------------------------------- */

/**
 * Props for the standalone RecoveryCodes component.
 */
export interface RecoveryCodesProps {
  /** Array of one-time recovery codes to display. */
  codes: string[];
}
