import * as fs from "fs";
import * as path from "path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: npx tsx scripts/generate-entity.ts <entity-name>");
  process.exit(1);
}

const singular = name.toLowerCase();
const plural = singular.endsWith("s") ? singular : singular + "s";
const Singular = singular[0].toUpperCase() + singular.slice(1);
const Plural = plural[0].toUpperCase() + plural.slice(1);

const root = process.cwd();

function writeFile(relPath: string, content: string) {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
  console.log(`  created ${relPath}`);
}

function appendToFile(relPath: string, content: string) {
  const full = path.join(root, relPath);
  fs.appendFileSync(full, "\n" + content, "utf-8");
  console.log(`  updated ${relPath}`);
}

console.log(`\nScaffolding entity: ${singular}\n`);

// 1. List page
writeFile(
  `app/(dashboard)/${plural}/page.tsx`,
  `"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Authorized } from "@/components/authorized";
import { mock${Plural} } from "@/lib/mock-data";
import type { ColumnDef } from "@tanstack/react-table";
import type { ${Singular} } from "@/types";
import { ArrowUpDown, Plus } from "lucide-react";

const columns: ColumnDef<${Singular}>[] = [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold \${
            status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }\`}
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
      <Link
        href={\`/dashboard/${plural}/\${row.original.id}\`}
        className="inline-flex h-8 items-center rounded-md border px-3 text-xs hover:bg-accent"
      >
        Edit
      </Link>
    ),
  },
];

export default function ${Plural}Page() {
  const [filter, setFilter] = useState("");
  const filtered = mock${Plural}.filter((item) =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">${Plural}</h1>
          <p className="text-muted-foreground">Manage ${plural}.</p>
        </div>
        <Authorized permission={"${plural}:create" as any}>
          <Link
            href="/dashboard/${plural}/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add ${Singular}
          </Link>
        </Authorized>
      </div>

      <div className="flex items-center gap-4">
        <input
          placeholder="Filter by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
`
);

// 2. New page
writeFile(
  `app/(dashboard)/${plural}/new/page.tsx`,
  `import { requirePermission } from "@/lib/require-permission";
import { ${Singular}Form } from "@/components/${singular}-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function New${Singular}Page() {
  await requirePermission("${plural}:create" as any);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/${plural}"
          aria-label="Back to ${plural}"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create ${Singular}</h1>
          <p className="text-muted-foreground">Add a new ${singular}.</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <${Singular}Form mode="create" />
      </div>
    </div>
  );
}
`
);

// 3. Edit page
writeFile(
  `app/(dashboard)/${plural}/[id]/page.tsx`,
  `import { requirePermission } from "@/lib/require-permission";
import { ${Singular}Form } from "@/components/${singular}-form";
import { mock${Plural}ById } from "@/lib/mock-data";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function Edit${Singular}Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("${plural}:edit" as any);
  const { id } = await params;
  const item = mock${Plural}ById[id];

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold">${Singular} not found</h1>
        <Link href="/dashboard/${plural}" className="mt-4 text-sm text-primary hover:underline">
          Back to ${plural}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/${plural}"
          aria-label="Back to ${plural}"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit ${Singular}</h1>
          <p className="text-muted-foreground">Update ${singular} details.</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <${Singular}Form mode="edit" defaultValues={item} />
      </div>
    </div>
  );
}
`
);

// 4. Form component
writeFile(
  `components/${singular}-form.tsx`,
  `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ${Singular} } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive"]),
});

type FormData = z.infer<typeof schema>;

export function ${Singular}Form({
  mode,
  defaultValues,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<${Singular}>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      status: defaultValues?.status ?? "active",
    },
  });

  async function onSubmit(data: FormData) {
    setSaving(true);
    // TODO: Replace with API call
    console.log(mode === "create" ? "Creating" : "Updating", data);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/dashboard/${plural}");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          {...register("name")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          {...register("status")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create ${Singular}" : "Update ${Singular}"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/${plural}")}
          className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
`
);

// 5. Append type definition
appendToFile(
  "types/index.ts",
  `export interface ${Singular} {
  id: string;
  name: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}
`
);

// 6. Append mock data
appendToFile(
  "lib/mock-data.ts",
  `import type { ${Singular} } from "@/types";

export const mock${Plural}: ${Singular}[] = [
  { id: "1", name: "Sample ${Singular} 1", status: "active", created_at: "2024-01-10T10:00:00Z", updated_at: "2024-01-10T10:00:00Z" },
  { id: "2", name: "Sample ${Singular} 2", status: "active", created_at: "2024-02-15T14:30:00Z", updated_at: "2024-02-15T14:30:00Z" },
  { id: "3", name: "Sample ${Singular} 3", status: "inactive", created_at: "2024-03-20T09:15:00Z", updated_at: "2024-03-20T09:15:00Z" },
];

export const mock${Plural}ById: Record<string, ${Singular}> = Object.fromEntries(
  mock${Plural}.map((item) => [item.id, item])
);
`
);

console.log(`\n\u2705 Entity "${singular}" scaffolded successfully!\n`);
console.log(`Next steps:`);
console.log(`  1. Add navigation item to components/dashboard-shell.tsx`);
console.log(`  2. Add permissions to lib/rbac.ts:`);
console.log(`     "${plural}:read", "${plural}:create", "${plural}:edit", "${plural}:delete"`);
console.log(`  3. Add database table to lib/schema.sql`);
console.log(`  4. Replace mock data with real API calls\n`);
