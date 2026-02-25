import { UserForm } from "@/components/user-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { User } from "@/types";

const mockUsers: Record<string, User> = {
  "1": { id: "1", email: "admin@example.com", name: "Admin User", role: "admin", status: "active", created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  "2": { id: "2", email: "editor@example.com", name: "Editor User", role: "editor", status: "active", created_at: "2024-02-20T14:30:00Z", updated_at: "2024-02-20T14:30:00Z" },
  "3": { id: "3", email: "viewer@example.com", name: "Viewer User", role: "viewer", status: "active", created_at: "2024-03-10T09:15:00Z", updated_at: "2024-03-10T09:15:00Z" },
  "4": { id: "4", email: "jane@example.com", name: "Jane Cooper", role: "editor", status: "active", created_at: "2024-04-05T16:45:00Z", updated_at: "2024-04-05T16:45:00Z" },
  "5": { id: "5", email: "bob@example.com", name: "Bob Wilson", role: "viewer", status: "inactive", created_at: "2024-05-12T11:20:00Z", updated_at: "2024-05-12T11:20:00Z" },
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = mockUsers[id];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold">User not found</h1>
        <Link href="/dashboard/users" className="mt-4 text-sm text-primary hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/users"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">Update {user.name}&apos;s account details.</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <UserForm mode="edit" defaultValues={user} />
      </div>
    </div>
  );
}
