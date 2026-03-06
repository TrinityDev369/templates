import { z } from "zod";

/**
 * Type definitions for the magic link authentication flow.
 *
 * Steps: email-entry -> check-email -> expired (optional)
 */

/* -- Validation schemas --------------------------------------------------- */

export const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type EmailFormData = z.infer<typeof emailSchema>;

/* -- Step state ----------------------------------------------------------- */

export type MagicLinkStep = "email-entry" | "check-email" | "expired";

/* -- Component props ------------------------------------------------------ */

export interface MagicLinkProps {
  /**
   * Called when the user submits their email.
   * The implementation should send the magic link email.
   */
  onSendLink: (email: string) => Promise<void>;

  /**
   * Called when the user requests a resend from the check-email step.
   * Falls back to `onSendLink` if not provided.
   */
  onResend?: (email: string) => Promise<void>;

  /** Navigate back to a traditional sign-in page. */
  onBackToSignIn?: () => void;

  /** Pre-fill the email field (e.g. from an invite). */
  defaultEmail?: string;

  /**
   * Countdown in seconds before the resend button becomes active.
   * Defaults to 60.
   */
  resendCooldown?: number;

  /**
   * If true, show the expired state with a prompt to request a new link.
   * Useful when the user lands on a page with an expired token.
   */
  initialExpired?: boolean;
}
