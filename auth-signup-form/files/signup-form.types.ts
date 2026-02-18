/**
 * Type definitions for the SignupForm component.
 *
 * Kept in a separate file so consumers can import types without pulling
 * in React / component code.
 */

/** Shape of the validated signup form data passed to `onSubmit`. */
export interface SignupFormData {
  /** Full name of the user. */
  fullName: string;
  /** Email address (validated format). */
  email: string;
  /** Password (min 8 chars, must contain uppercase + lowercase + number). */
  password: string;
  /** Must match `password`. */
  confirmPassword: string;
  /** Whether the user accepted Terms of Service & Privacy Policy. Must be `true`. */
  terms: true;
}

/** Supported OAuth provider identifiers. */
export type OAuthProvider = "google" | "github";

/** Props accepted by the `SignupForm` component. */
export interface SignupFormProps {
  /**
   * Called with validated form data when the user submits the form.
   * Return a promise -- the form shows a loading state until it resolves.
   */
  onSubmit: (data: SignupFormData) => Promise<void>;

  /**
   * Optional callback when the user clicks an OAuth button.
   * Receives the provider name ("google" | "github").
   */
  onOAuthClick?: (provider: OAuthProvider) => void;
}
