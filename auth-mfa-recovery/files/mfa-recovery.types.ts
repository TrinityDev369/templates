/**
 * Type definitions for the MFA recovery codes component.
 *
 * Covers the recovery codes display shown after two-factor authentication
 * setup, with actions for copying, downloading, printing, and regenerating.
 */

/* -- Component props -------------------------------------------- */

/**
 * Props for the MfaRecovery component.
 */
export interface MfaRecoveryProps {
  /** Array of one-time recovery codes to display. */
  codes: string[];

  /**
   * Called when the user confirms regeneration of recovery codes.
   * Should invalidate old codes server-side and return a fresh set.
   * If not provided, the regenerate button is hidden.
   */
  onRegenerate?: () => Promise<string[]>;

  /**
   * Called when the user clicks the "Done" button.
   * Typically used to close the dialog or navigate away.
   */
  onDone?: () => void;

  /**
   * Whether to show the regeneration warning banner explaining
   * that old codes will be invalidated. Defaults to `true`.
   */
  showRegenerateWarning?: boolean;
}
