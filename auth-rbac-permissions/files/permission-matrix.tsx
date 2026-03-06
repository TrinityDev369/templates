"use client";

import { type FC, useCallback, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { Permission, Role } from "./rbac-permissions.types";

/* -- Icons ---------------------------------------------------------------- */

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* -- Types ---------------------------------------------------------------- */

interface PermissionMatrixProps {
  permissions: Permission[];
  roles: Role[];
  onToggle: (
    roleId: string,
    permissionId: string,
    granted: boolean
  ) => Promise<void>;
}

/* -- Component ------------------------------------------------------------ */

/**
 * Interactive permission matrix grid.
 *
 * Rows are permissions (grouped by category), columns are roles.
 * Each cell is a checkbox toggling whether that role has that permission.
 */
const PermissionMatrix: FC<PermissionMatrixProps> = ({
  permissions,
  roles,
  onToggle,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  // Group permissions by their group field
  const groups = permissions.reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      if (!acc[perm.group]) acc[perm.group] = [];
      acc[perm.group].push(perm);
      return acc;
    },
    {}
  );

  const handleToggle = useCallback(
    async (roleId: string, permId: string, currentlyGranted: boolean) => {
      const key = `${roleId}:${permId}`;
      setLoading(key);
      try {
        await onToggle(roleId, permId, !currentlyGranted);
      } finally {
        setLoading(null);
      }
    },
    [onToggle]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 z-10 bg-background px-4 py-3 text-left font-medium text-muted-foreground">
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="px-4 py-3 text-center font-medium"
                >
                  <div className="flex items-center justify-center gap-1">
                    {role.name}
                    {role.readonly && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-muted-foreground">
                            <LockIcon />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Built-in role (cannot be modified)
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {role.description && (
                    <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.entries(groups).map(([groupName, groupPerms]) => (
              <React.Fragment key={groupName}>
                {/* Group header row */}
                <tr>
                  <td
                    colSpan={roles.length + 1}
                    className="sticky left-0 bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {groupName}
                  </td>
                </tr>

                {/* Permission rows */}
                {groupPerms.map((perm) => (
                  <tr key={perm.id} className="border-b last:border-b-0">
                    <td className="sticky left-0 z-10 bg-background px-4 py-2.5">
                      {perm.description ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help border-b border-dotted border-muted-foreground/40">
                              {perm.label}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            {perm.description}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        perm.label
                      )}
                    </td>

                    {roles.map((role) => {
                      const granted = role.permissions.includes(perm.id);
                      const key = `${role.id}:${perm.id}`;
                      const isLoading = loading === key;

                      return (
                        <td key={role.id} className="px-4 py-2.5 text-center">
                          <Checkbox
                            checked={granted}
                            disabled={role.readonly || isLoading}
                            onCheckedChange={() =>
                              handleToggle(role.id, perm.id, granted)
                            }
                            className={isLoading ? "opacity-50" : ""}
                            aria-label={`${perm.label} for ${role.name}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
};

// Need React import for JSX.Fragment usage
import React from "react";

export { PermissionMatrix };
export type { PermissionMatrixProps };
