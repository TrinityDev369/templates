import { requirePermission } from "@/lib/require-permission";
import { UserForm } from "@/components/user-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewUserPage() {
  await requirePermission("users:create");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/users"
          aria-label="Back to users"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
          <p className="text-muted-foreground">Add a new user to the system.</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <UserForm mode="create" />
      </div>
    </div>
  );
}
