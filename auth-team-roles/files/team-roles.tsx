"use client";

import * as React from "react";
import {
  Search,
  UserPlus,
  ChevronDown,
  Trash2,
  Mail,
  Shield,
  Check,
  X,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

import type {
  TeamMember,
  TeamRole,
  RoleFilter,
  PendingInvite,
  TeamRolesProps,
} from "./team-roles.types";
import { ROLE_LABELS } from "./team-roles.types";

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_MEMBERS: TeamMember[] = [
  {
    id: "m-1",
    name: "Sergej Goetz",
    email: "sergej@trinity.agency",
    role: "owner",
    joinedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "m-2",
    name: "Lena Richter",
    email: "lena@trinity.agency",
    role: "admin",
    avatarUrl: "https://i.pravatar.cc/80?u=lena",
    joinedAt: "2024-03-22T14:30:00Z",
  },
  {
    id: "m-3",
    name: "Marcus Weber",
    email: "marcus@trinity.agency",
    role: "member",
    joinedAt: "2024-06-10T09:15:00Z",
  },
  {
    id: "m-4",
    name: "Anna Becker",
    email: "anna@trinity.agency",
    role: "member",
    avatarUrl: "https://i.pravatar.cc/80?u=anna",
    joinedAt: "2024-08-05T16:45:00Z",
  },
  {
    id: "m-5",
    name: "Felix Braun",
    email: "felix@trinity.agency",
    role: "viewer",
    joinedAt: "2025-01-18T11:20:00Z",
  },
  {
    id: "m-6",
    name: "Clara Hoffmann",
    email: "clara@trinity.agency",
    role: "viewer",
    avatarUrl: "https://i.pravatar.cc/80?u=clara",
    joinedAt: "2025-02-01T08:00:00Z",
  },
];

const SAMPLE_INVITES: PendingInvite[] = [
  {
    id: "inv-1",
    email: "jan@external.dev",
    role: "member",
    sentAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "inv-2",
    email: "sofia@design.studio",
    role: "viewer",
    sentAt: "2026-02-22T15:30:00Z",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLE_BADGE_STYLES: Record<TeamRole, string> = {
  owner: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  member: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const ASSIGNABLE_ROLES: TeamRole[] = ["admin", "member", "viewer"];

const FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract up to two initials from a full name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Format a date for display in the member list. */
function formatDate(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  className?: string;
}

function Avatar({ name, avatarUrl, className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const initials = getInitials(name);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={cn(
          "h-9 w-9 shrink-0 rounded-full object-cover",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground",
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight",
        ROLE_BADGE_STYLES[role]
      )}
    >
      {role === "owner" && <Shield className="h-3 w-3" aria-hidden="true" />}
      {ROLE_LABELS[role]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Role dropdown
// ---------------------------------------------------------------------------

interface RoleDropdownProps {
  currentRole: TeamRole;
  onSelect: (role: TeamRole) => void;
  disabled?: boolean;
}

function RoleDropdown({ currentRole, onSelect, disabled }: RoleDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change role, currently ${ROLE_LABELS[currentRole]}`}
      >
        {ROLE_LABELS[currentRole]}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1 w-36 rounded-md border bg-popover p-1 shadow-md"
          role="listbox"
          aria-label="Select role"
        >
          {ASSIGNABLE_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              role="option"
              aria-selected={role === currentRole}
              onClick={() => {
                if (role !== currentRole) onSelect(role);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                role === currentRole && "bg-accent/50"
              )}
            >
              {ROLE_LABELS[role]}
              {role === currentRole && (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline remove confirmation
// ---------------------------------------------------------------------------

interface RemoveConfirmationProps {
  memberName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function RemoveConfirmation({
  memberName,
  onConfirm,
  onCancel,
  isLoading,
}: RemoveConfirmationProps) {
  return (
    <div
      className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 p-3"
      role="alertdialog"
      aria-label={`Confirm removal of ${memberName}`}
    >
      <p className="text-sm font-medium text-destructive">Are you sure?</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {memberName} will lose access to the team immediately.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-1 rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground transition-colors",
            "hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {isLoading ? "Removing..." : "Confirm"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            "hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Member row
// ---------------------------------------------------------------------------

interface MemberRowProps {
  member: TeamMember;
  isSelf: boolean;
  isConfirming: boolean;
  isRemoving: boolean;
  isChangingRole: boolean;
  onRoleChange: (role: TeamRole) => void;
  onRemoveClick: () => void;
  onRemoveConfirm: () => void;
  onRemoveCancel: () => void;
}

function MemberRow({
  member,
  isSelf,
  isConfirming,
  isRemoving,
  isChangingRole,
  onRoleChange,
  onRemoveClick,
  onRemoveConfirm,
  onRemoveCancel,
}: MemberRowProps) {
  const isOwner = member.role === "owner";
  const canModify = !isOwner && !isSelf;

  return (
    <div className="space-y-0">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4",
          isConfirming && "border-destructive/20 bg-destructive/[0.02]"
        )}
      >
        {/* Avatar */}
        <Avatar name={member.name} avatarUrl={member.avatarUrl} />

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium leading-none">{member.name}</p>
            <RoleBadge role={member.role} />
            {isSelf && (
              <span className="text-[10px] font-medium text-muted-foreground">(you)</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{member.email}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            Joined {formatDate(member.joinedAt)}
          </p>
        </div>

        {/* Actions */}
        {canModify && (
          <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
            <RoleDropdown
              currentRole={member.role}
              onSelect={onRoleChange}
              disabled={isChangingRole || isConfirming}
            />
            <button
              type="button"
              onClick={onRemoveClick}
              disabled={isRemoving || isConfirming}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
              aria-label={`Remove ${member.name} from team`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Inline confirmation */}
      {isConfirming && (
        <RemoveConfirmation
          memberName={member.name}
          onConfirm={onRemoveConfirm}
          onCancel={onRemoveCancel}
          isLoading={isRemoving}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pending invite row
// ---------------------------------------------------------------------------

interface InviteRowProps {
  invite: PendingInvite;
  isResending: boolean;
  isCancelling: boolean;
  onResend: () => void;
  onCancel: () => void;
}

function InviteRow({
  invite,
  isResending,
  isCancelling,
  onResend,
  onCancel,
}: InviteRowProps) {
  const isLoading = isResending || isCancelling;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:gap-4">
      {/* Mail icon placeholder */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Mail className="h-4 w-4" aria-hidden="true" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium leading-none">{invite.email}</p>
          <RoleBadge role={invite.role} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/70">
          <Clock className="h-3 w-3" aria-hidden="true" />
          Sent {formatDate(invite.sentAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
            "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          aria-label={`Resend invite to ${invite.email}`}
        >
          <Mail className="h-3 w-3" aria-hidden="true" />
          {isResending ? "Sending..." : "Resend"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
            "text-destructive hover:bg-destructive/10 hover:text-destructive",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          aria-label={`Cancel invite to ${invite.email}`}
        >
          <X className="h-3 w-3" aria-hidden="true" />
          {isCancelling ? "Cancelling..." : "Cancel"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Team member management panel with role assignment, search/filter,
 * member removal, and pending invitations.
 *
 * @example
 * ```tsx
 * <TeamRoles
 *   members={teamMembers}
 *   pendingInvites={invites}
 *   currentUserId="user-1"
 *   onRoleChange={async (id, role) => api.updateMemberRole(id, role)}
 *   onRemoveMember={async (id) => api.removeMember(id)}
 *   onInvite={() => router.push('/team/invite')}
 *   onResendInvite={async (id) => api.resendInvite(id)}
 *   onCancelInvite={async (id) => api.cancelInvite(id)}
 * />
 * ```
 */
export function TeamRoles({
  members = SAMPLE_MEMBERS,
  pendingInvites = SAMPLE_INVITES,
  currentUserId = "m-1",
  onRoleChange,
  onRemoveMember,
  onInvite,
  onResendInvite,
  onCancelInvite,
}: TeamRolesProps) {
  // -- Search & filter state ---
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");

  // -- Member action state ---
  const [confirmingRemoveId, setConfirmingRemoveId] = React.useState<string | null>(null);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = React.useState<string | null>(null);

  // -- Invite action state ---
  const [resendingInviteId, setResendingInviteId] = React.useState<string | null>(null);
  const [cancellingInviteId, setCancellingInviteId] = React.useState<string | null>(null);

  // -- Filtered members ---
  const filteredMembers = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return members.filter((m) => {
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  // -- Handlers ---

  async function handleRoleChange(memberId: string, newRole: TeamRole) {
    if (!onRoleChange) return;
    setChangingRoleId(memberId);
    try {
      await onRoleChange(memberId, newRole);
    } finally {
      setChangingRoleId(null);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!onRemoveMember) return;
    setRemovingId(memberId);
    try {
      await onRemoveMember(memberId);
    } finally {
      setRemovingId(null);
      setConfirmingRemoveId(null);
    }
  }

  async function handleResendInvite(inviteId: string) {
    if (!onResendInvite) return;
    setResendingInviteId(inviteId);
    try {
      await onResendInvite(inviteId);
    } finally {
      setResendingInviteId(null);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    if (!onCancelInvite) return;
    setCancellingInviteId(inviteId);
    try {
      await onCancelInvite(inviteId);
    } finally {
      setCancellingInviteId(null);
    }
  }

  // -- Member count ---
  const totalCount = members.length;
  const filteredCount = filteredMembers.length;
  const showingSubset = filteredCount !== totalCount;

  return (
    <div className="w-full space-y-6">
      {/* ---------------------------------------------------------- */}
      {/* Header                                                     */}
      {/* ---------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Team Members
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {showingSubset
              ? `Showing ${filteredCount} of ${totalCount} member${totalCount === 1 ? "" : "s"}`
              : `${totalCount} member${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onInvite}
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
            "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Invite Member
        </button>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Search & filter bar                                        */}
      {/* ---------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Search team members"
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className={cn(
              "h-9 appearance-none rounded-md border bg-background pl-3 pr-8 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Filter by role"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Member list                                                */}
      {/* ---------------------------------------------------------- */}
      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Search className="mb-3 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">
            No members found
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-2" role="list" aria-label="Team members">
          {filteredMembers.map((member) => (
            <div key={member.id} role="listitem">
              <MemberRow
                member={member}
                isSelf={member.id === currentUserId}
                isConfirming={confirmingRemoveId === member.id}
                isRemoving={removingId === member.id}
                isChangingRole={changingRoleId === member.id}
                onRoleChange={(role) => void handleRoleChange(member.id, role)}
                onRemoveClick={() => setConfirmingRemoveId(member.id)}
                onRemoveConfirm={() => void handleRemoveMember(member.id)}
                onRemoveCancel={() => setConfirmingRemoveId(null)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Pending invites                                            */}
      {/* ---------------------------------------------------------- */}
      {pendingInvites.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold leading-none">
              Pending Invites
            </h3>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
              {pendingInvites.length}
            </span>
          </div>

          <div className="space-y-2" role="list" aria-label="Pending invitations">
            {pendingInvites.map((invite) => (
              <div key={invite.id} role="listitem">
                <InviteRow
                  invite={invite}
                  isResending={resendingInviteId === invite.id}
                  isCancelling={cancellingInviteId === invite.id}
                  onResend={() => void handleResendInvite(invite.id)}
                  onCancel={() => void handleCancelInvite(invite.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export types for consumer convenience
export type {
  TeamMember,
  TeamRole,
  RoleFilter,
  PendingInvite,
  TeamRolesProps,
} from "./team-roles.types";
