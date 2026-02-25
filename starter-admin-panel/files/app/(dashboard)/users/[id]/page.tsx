import { requirePermission } from "@/lib/require-permission";
import { UserForm } from "@/components/user-form";
import { mockUsersById } from "@/lib/mock-data";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("users:edit");
  const { id } = await params;
  const user = mockUsersById[id];

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
          aria-label="Back to users"
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
