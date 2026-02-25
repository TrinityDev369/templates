"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { AuditLog } from "@/types";

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: "Time",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleString(),
  },
  {
    accessorKey: "user_email",
    header: "User",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.user_name ?? "System"}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.user_email ?? "\u2014"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
        {row.getValue("action")}
      </span>
    ),
  },
  {
    accessorKey: "entity_type",
    header: "Entity",
    cell: ({ row }) => {
      const type = row.original.entity_type;
      const id = row.original.entity_id;
      if (!type) return <span className="text-muted-foreground">{"\u2014"}</span>;
      return (
        <span className="text-sm">
          {type}
          {id ? ` #${id}` : ""}
        </span>
      );
    },
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.getValue("ip_address") ?? "\u2014"}
      </span>
    ),
  },
  {
    accessorKey: "metadata",
    header: "Metadata",
    cell: ({ row }) => {
      const meta = row.getValue("metadata") as Record<string, unknown>;
      if (!meta || Object.keys(meta).length === 0) {
        return <span className="text-muted-foreground">{"\u2014"}</span>;
      }
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {JSON.stringify(meta)}
        </code>
      );
    },
  },
];

const actionOptions = [
  "user.login",
  "user.logout",
  "user.create",
  "user.update",
  "settings.update",
];
const entityOptions = ["session", "user", "settings"];

export function AuditLogViewer({ initialLogs }: { initialLogs: AuditLog[] }) {
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const filtered = initialLogs
    .filter((l) => !actionFilter || l.action === actionFilter)
    .filter((l) => !entityFilter || l.entity_type === entityFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Actions</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Entities</option>
          {entityOptions.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
