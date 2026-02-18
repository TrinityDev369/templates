import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export type OAuthProvider = "google" | "github" | "apple";

export interface LoginFormProps {
  /** Called when the form is submitted with validated data. */
  onSubmit: (data: LoginFormData) => Promise<void>;

  /**
   * Called when an OAuth provider button is clicked.
   * If not provided, OAuth buttons are still rendered but will be disabled.
   */
  onOAuthClick?: (provider: OAuthProvider) => void;

  /** Pre-fill the email field (e.g. from a magic-link or invite flow). */
  defaultEmail?: string;
}
