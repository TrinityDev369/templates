/**
 * Type definitions for the RBAC permissions UI.
 */

/** A single permission action. */
export interface Permission {
  /** Unique identifier for the permission (e.g. "users.create"). */
  id: string;
  /** Human-readable label (e.g. "Create users"). */
  label: string;
  /** Optional description shown on hover. */
  description?: string;
  /** Group/category for organizing in the matrix (e.g. "Users"). */
  group: string;
}

/** A role with its assigned permission IDs. */
export interface Role {
  /** Unique identifier for the role. */
  id: string;
  /** Display name (e.g. "Admin", "Editor"). */
  name: string;
  /** Optional description of the role. */
  description?: string;
  /** Set of permission IDs granted to this role. */
  permissions: string[];
  /** If true, the role cannot be modified (e.g. built-in super admin). */
  readonly?: boolean;
}

/** Props for the RbacPermissions component. */
export interface RbacPermissionsProps {
  /** All available permissions. */
  permissions: Permission[];
  /** All roles with their current permission assignments. */
  roles: Role[];
  /**
   * Called when a permission is toggled for a role.
   * The implementation should persist the change and update the roles array.
   */
  onTogglePermission: (
    roleId: string,
    permissionId: string,
    granted: boolean
  ) => Promise<void>;
  /**
   * Called when a new role is created.
   * If not provided, the "Add role" button is hidden.
   */
  onCreateRole?: (name: string, description: string) => Promise<void>;
  /**
   * Called when a role is deleted.
   * If not provided, the delete button is hidden on non-readonly roles.
   */
  onDeleteRole?: (roleId: string) => Promise<void>;
}
