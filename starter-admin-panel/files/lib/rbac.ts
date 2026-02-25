import type { Permission } from "@/types";

const permissionMap: Record<string, Permission[]> = {
  admin: [
    "dashboard:view",
    "users:read",
    "users:create",
    "users:edit",
    "users:delete",
    "settings:view",
    "settings:edit",
    "audit:view",
  ],
  editor: [
    "dashboard:view",
    "users:read",
    "users:create",
    "users:edit",
    "settings:view",
  ],
  viewer: [
    "dashboard:view",
    "users:read",
    "settings:view",
  ],
};

export function can(role: string, permission: Permission): boolean {
  return permissionMap[role]?.includes(permission) ?? false;
}

export function canAll(role: string, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p));
}

export function canAny(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

export function getPermissions(role: string): Permission[] {
  return permissionMap[role] ?? [];
}
