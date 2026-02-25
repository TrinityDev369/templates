"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types";
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react";

const mockUsers: User[] = [
  { id: "1", email: "admin@example.com", name: "Admin User", role: "admin", status: "active", created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "2", email: "editor@example.com", name: "Editor User", role: "editor", status: "active", created_at: "2024-02-20T14:30:00Z", updated_at: "2024-02-20T14:30:00Z" },
  { id: "3", email: "viewer@example.com", name: "Viewer User", role: "viewer", status: "active", created_at: "2024-03-10T09:15:00Z", updated_at: "2024-03-10T09:15:00Z" },
  { id: "4", email: "jane@example.com", name: "Jane Cooper", role: "editor", status: "active", created_at: "2024-04-05T16:45:00Z", updated_at: "2024-04-05T16:45:00Z" },
  { id: "5", email: "bob@example.com", name: "Bob Wilson", role: "viewer", status: "inactive", created_at: "2024-05-12T11:20:00Z", updated_at: "2024-05-12T11:20:00Z" },
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
        {row.getValue("role")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/users/${row.original.id}`}
          className="inline-flex h-8 items-center rounded-md border px-3 text-xs hover:bg-accent"
        >
          Edit
        </Link>
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];

export default function UsersPage() {
  const [filter, setFilter] = useState("");

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions.</p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <input
          placeholder="Filter by name or email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
