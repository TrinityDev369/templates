/**
 * Type definitions for the PasswordChangeForm component.
 *
 * Kept in a separate file so consumers can import types without pulling
 * in React / component code.
 */

/** Shape of the validated password change form data passed to `onSubmit`. */
export interface PasswordChangeFormData {
  /** The user's current password for verification. */
  currentPassword: string;
  /** New password (min 8 chars, must contain uppercase + lowercase + number). */
  newPassword: string;
  /** Must match `newPassword`. */
  confirmPassword: string;
}

/** Props accepted by the `PasswordChangeForm` component. */
export interface PasswordChangeFormProps {
  /**
   * Called with validated form data when the user submits the form.
   * Return a promise -- the form shows a loading state until it resolves.
   * Throw an error to display it inline (e.g. "Current password is incorrect").
   */
  onSubmit: (data: PasswordChangeFormData) => Promise<void>;

  /**
   * Optional callback when the user clicks the Cancel button.
   * When omitted, the Cancel button is not rendered.
   */
  onCancel?: () => void;
}
