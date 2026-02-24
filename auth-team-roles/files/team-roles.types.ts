/**
 * Type definitions for the team roles management component.
 *
 * Covers team member display, role assignment, member removal,
 * pending invitations, and filtering/search capabilities.
 */

/* -- Role types ------------------------------------------------- */

/**
 * Available team member roles, ordered by permission level (descending).
 *
 * - `owner`  - Full control, cannot be removed or demoted
 * - `admin`  - Can manage members and settings
 * - `member` - Standard access to team resources
 * - `viewer` - Read-only access
 */
export type TeamRole = "owner" | "admin" | "member" | "viewer";

/** Human-readable labels for each role. */
export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

/** All roles available for filtering (including the "all" option). */
export type RoleFilter = TeamRole | "all";

/* -- Member types ----------------------------------------------- */

/**
 * A team member with profile info and assigned role.
 */
export interface TeamMember {
  /** Unique member identifier. */
  id: string;

  /** Full display name. */
  name: string;

  /** Email address. */
  email: string;

  /** Assigned team role. */
  role: TeamRole;

  /** Optional avatar URL. Falls back to initials when absent. */
  avatarUrl?: string;

  /** ISO timestamp or Date when the member joined the team. */
  joinedAt: string | Date;
}

/* -- Invite types ----------------------------------------------- */

/**
 * A pending invitation that has been sent but not yet accepted.
 */
export interface PendingInvite {
  /** Unique invite identifier. */
  id: string;

  /** Email address the invitation was sent to. */
  email: string;

  /** The role the invitee will be assigned upon acceptance. */
  role: TeamRole;

  /** ISO timestamp or Date when the invitation was sent. */
  sentAt: string | Date;
}

/* -- Component props -------------------------------------------- */

/**
 * Props for the top-level TeamRoles component.
 */
export interface TeamRolesProps {
  /** List of current team members. */
  members?: TeamMember[];

  /** List of pending invitations. */
  pendingInvites?: PendingInvite[];

  /**
   * ID of the currently authenticated user.
   * Used to prevent self-removal and self-role-change.
   */
  currentUserId?: string;

  /**
   * Called when an admin changes a member's role.
   * Should resolve when the server has acknowledged the change.
   */
  onRoleChange?: (memberId: string, newRole: TeamRole) => Promise<void>;

  /**
   * Called when an admin removes a member from the team.
   * Should resolve when the server has acknowledged the removal.
   */
  onRemoveMember?: (memberId: string) => Promise<void>;

  /**
   * Called when the "Invite Member" button is clicked.
   * Typically navigates to an invite flow or opens a modal.
   */
  onInvite?: () => void;

  /**
   * Called when a pending invite is resent.
   * Should resolve when the server has re-sent the email.
   */
  onResendInvite?: (inviteId: string) => Promise<void>;

  /**
   * Called when a pending invite is cancelled.
   * Should resolve when the server has cancelled the invitation.
   */
  onCancelInvite?: (inviteId: string) => Promise<void>;
}
