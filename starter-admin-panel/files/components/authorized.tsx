"use client";

import { useSession } from "@/lib/session-context";
import { can } from "@/lib/rbac";
import type { Permission } from "@/types";

export function Authorized({
  permission,
  fallback = null,
  children,
}: {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const session = useSession();
  return can(session.role, permission) ? <>{children}</> : <>{fallback}</>;
}
