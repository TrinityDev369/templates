import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import type { Permission } from "@/types";

export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (!can(session.role, permission)) {
    redirect("/dashboard");
  }
  return session;
}

export async function requireApiPermission(permission: Permission) {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!can(session.role, permission)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}
