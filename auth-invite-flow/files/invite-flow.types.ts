import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for a single team member invitation. */
export const inviteSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["admin", "member", "viewer"], {
    required_error: "Please select a role",
  }),
});

/** Schema for a bulk invitation payload (1-10 invitations). */
export const bulkInviteSchema = z.object({
  invites: z
    .array(inviteSchema)
    .min(1, "At least one invitation is required")
    .max(10, "You can send a maximum of 10 invitations at once"),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

/** Form data for the bulk invite form. */
export type InviteFormData = z.infer<typeof bulkInviteSchema>;

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/** Represents a sent invitation and its current status. */
export interface Invitation {
  /** Unique invitation identifier. */
  id: string;

  /** Email address the invitation was sent to. */
  email: string;

  /** The role assigned to this invitation. */
  role: "admin" | "member" | "viewer";

  /** Current status of the invitation. */
  status: "pending" | "accepted" | "expired";

  /** ISO timestamp of when the invitation was sent. */
  invitedAt: string;

  /** ISO timestamp of when the invitation expires. */
  expiresAt?: string;
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

/** Custom role option for the role selector dropdown. */
export interface RoleOption {
  /** The role value (used in form data). */
  value: string;
  /** Human-readable label displayed in the dropdown. */
  label: string;
}

/** Props for the InviteFlow component. */
export interface InviteFlowProps {
  /**
   * Called when the user submits the invite form with validated data.
   * The implementation should send the invitations server-side.
   */
  onInvite: (data: InviteFormData) => Promise<void>;

  /**
   * Custom role options for the role selector.
   * If not provided, defaults to Admin, Member, and Viewer.
   */
  roles?: RoleOption[];

  /**
   * Maximum number of invitations that can be sent at once.
   * @default 10
   */
  maxInvites?: number;
}

/** Props for the InviteList component. */
export interface InviteListProps {
  /** Array of invitations to display. */
  invitations: Invitation[];

  /**
   * Called when the user clicks the resend button for an invitation.
   * If not provided, the resend button will not be shown.
   */
  onResend?: (invitationId: string) => Promise<void>;

  /**
   * Called when the user clicks the revoke button for an invitation.
   * If not provided, the revoke button will not be shown.
   */
  onRevoke?: (invitationId: string) => Promise<void>;
}
