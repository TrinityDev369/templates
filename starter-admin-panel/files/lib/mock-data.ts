import type { User } from "@/types";

export const mockUsers: User[] = [
  { id: "1", email: "admin@example.com", name: "Admin User", role: "admin", status: "active", created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "2", email: "editor@example.com", name: "Editor User", role: "editor", status: "active", created_at: "2024-02-20T14:30:00Z", updated_at: "2024-02-20T14:30:00Z" },
  { id: "3", email: "viewer@example.com", name: "Viewer User", role: "viewer", status: "active", created_at: "2024-03-10T09:15:00Z", updated_at: "2024-03-10T09:15:00Z" },
  { id: "4", email: "jane@example.com", name: "Jane Cooper", role: "editor", status: "active", created_at: "2024-04-05T16:45:00Z", updated_at: "2024-04-05T16:45:00Z" },
  { id: "5", email: "bob@example.com", name: "Bob Wilson", role: "viewer", status: "inactive", created_at: "2024-05-12T11:20:00Z", updated_at: "2024-05-12T11:20:00Z" },
];

export const mockUsersById: Record<string, User> = Object.fromEntries(
  mockUsers.map((u) => [u.id, u])
);
