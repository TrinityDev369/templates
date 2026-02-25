export type Permission =
  | "dashboard:view"
  | "users:read"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "settings:view"
  | "settings:edit"
  | "audit:view";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface KpiCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  data: { value: number }[];
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email?: string;
  user_name?: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}
