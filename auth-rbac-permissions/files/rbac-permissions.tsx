"use client";

import { type FC, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { PermissionMatrix } from "./permission-matrix";
import type { RbacPermissionsProps } from "./rbac-permissions.types";

/* -- Icons ---------------------------------------------------------------- */

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* -- Component ------------------------------------------------------------ */

/**
 * Role and permission management with interactive matrix editor.
 *
 * Features:
 * - Permission matrix grid (rows = permissions, columns = roles)
 * - Group permissions by category
 * - Create new roles via dialog
 * - Delete non-readonly roles
 * - Readonly roles are visually locked
 * - Tooltip descriptions on permissions and roles
 *
 * @example
 * ```tsx
 * <RbacPermissions
 *   permissions={[
 *     { id: "users.create", label: "Create users", group: "Users" },
 *     { id: "users.delete", label: "Delete users", group: "Users" },
 *   ]}
 *   roles={[
 *     { id: "admin", name: "Admin", permissions: ["users.create", "users.delete"], readonly: true },
 *     { id: "editor", name: "Editor", permissions: ["users.create"] },
 *   ]}
 *   onTogglePermission={async (roleId, permId, granted) => { /* persist */ }}
 *   onCreateRole={async (name, desc) => { /* create */ }}
 *   onDeleteRole={async (roleId) => { /* delete */ }}
 * />
 * ```
 */
const RbacPermissions: FC<RbacPermissionsProps> = ({
  permissions,
  roles,
  onTogglePermission,
  onCreateRole,
  onDeleteRole,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRole = useCallback(async () => {
    if (!onCreateRole || !newRoleName.trim()) return;
    setError(null);
    setIsCreating(true);
    try {
      await onCreateRole(newRoleName.trim(), newRoleDesc.trim());
      setNewRoleName("");
      setNewRoleDesc("");
      setDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create role"
      );
    } finally {
      setIsCreating(false);
    }
  }, [onCreateRole, newRoleName, newRoleDesc]);

  const handleDeleteRole = useCallback(
    async (roleId: string) => {
      if (!onDeleteRole) return;
      setError(null);
      try {
        await onDeleteRole(roleId);
        setDeleteConfirm(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete role"
        );
      }
    },
    [onDeleteRole]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldIcon />
            </div>
            <div>
              <CardTitle className="text-lg">Roles & Permissions</CardTitle>
              <CardDescription>
                {roles.length} role{roles.length !== 1 ? "s" : ""} &middot;{" "}
                {permissions.length} permission
                {permissions.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>

          {onCreateRole && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusIcon />
                  <span className="ml-1.5">Add role</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new role</DialogTitle>
                  <DialogDescription>
                    New roles start with no permissions. Use the matrix to assign
                    them.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role name</Label>
                    <Input
                      id="role-name"
                      placeholder="e.g. Viewer"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-desc">Description (optional)</Label>
                    <Input
                      id="role-desc"
                      placeholder="What can this role do?"
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateRole}
                    disabled={isCreating || !newRoleName.trim()}
                  >
                    {isCreating ? "Creating..." : "Create role"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && !dialogOpen && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Role chips with delete */}
        {onDeleteRole && (
          <div className="flex flex-wrap gap-2">
            {roles
              .filter((r) => !r.readonly)
              .map((role) => (
                <div
                  key={role.id}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
                >
                  <span>{role.name}</span>
                  {deleteConfirm === role.id ? (
                    <>
                      <button
                        type="button"
                        className="ml-1 text-xs text-destructive hover:underline"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:underline"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="ml-1 text-muted-foreground transition-colors hover:text-destructive"
                      onClick={() => setDeleteConfirm(role.id)}
                      aria-label={`Delete ${role.name} role`}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Permission matrix */}
        <PermissionMatrix
          permissions={permissions}
          roles={roles}
          onToggle={onTogglePermission}
        />
      </CardContent>
    </Card>
  );
};

export { RbacPermissions };
