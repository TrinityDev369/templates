/**
 * Type definitions for the OAuth buttons component.
 */

/** Supported OAuth providers. */
export type OAuthProvider = "google" | "github" | "apple" | "microsoft";

/** Visual variant for button rendering. */
export type OAuthButtonVariant = "default" | "outline" | "icon-only";

/** Props for the OAuthButtons component. */
export interface OAuthButtonsProps {
  /**
   * Called when a provider button is clicked.
   * The consumer is responsible for initiating the OAuth redirect.
   */
  onProviderClick: (provider: OAuthProvider) => void;

  /** Which providers to show. Defaults to all four. */
  providers?: OAuthProvider[];

  /** Visual style of the buttons. Defaults to "default". */
  variant?: OAuthButtonVariant;

  /** Show a loading spinner on a specific provider (e.g. after click). */
  loadingProvider?: OAuthProvider | null;

  /** Disable all buttons (e.g. while a form is submitting). */
  disabled?: boolean;

  /** Text prefix before provider name. Defaults to "Continue with". */
  label?: string;
}
