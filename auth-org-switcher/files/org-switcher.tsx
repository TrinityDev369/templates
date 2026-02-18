"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  Check,
  Plus,
  Building2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { Organization, OrgSwitcherProps } from "./org-switcher.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derives 1-2 character initials from an organization name.
 * Uses the first letter of the first two words, or the first two letters
 * of a single-word name.
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Deterministically generates a hue from a string so each org gets a
 * consistent avatar background color.
 */
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

/** Plan badge styling map. */
const PLAN_STYLES: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  enterprise:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

// ---------------------------------------------------------------------------
// PlanBadge
// ---------------------------------------------------------------------------

function PlanBadge({ plan }: { plan: string }) {
  const style = PLAN_STYLES[plan] ?? PLAN_STYLES.free;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none capitalize",
        style
      )}
    >
      {plan}
    </span>
  );
}

// ---------------------------------------------------------------------------
// OrgAvatar
// ---------------------------------------------------------------------------

function OrgAvatar({
  org,
  size = "sm",
}: {
  org: Organization;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[10px]";

  return (
    <Avatar className={cn(sizeClass, "shrink-0")}>
      {org.avatarUrl && <AvatarImage src={org.avatarUrl} alt={org.name} />}
      <AvatarFallback
        className="font-semibold text-white"
        style={{ backgroundColor: getAvatarColor(org.name) }}
      >
        {getInitials(org.name)}
      </AvatarFallback>
    </Avatar>
  );
}

// ---------------------------------------------------------------------------
// OrgSwitcher component
// ---------------------------------------------------------------------------

export function OrgSwitcher({
  organizations,
  currentOrgId,
  onOrgChange,
  onCreateOrg,
  showPlan = true,
  className,
}: OrgSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  const currentOrg = React.useMemo(
    () => organizations.find((org) => org.id === currentOrgId),
    [organizations, currentOrgId]
  );

  function handleSelect(orgId: string) {
    if (orgId !== currentOrgId) {
      onOrgChange(orgId);
    }
    setOpen(false);
  }

  function handleCreateOrg() {
    setOpen(false);
    onCreateOrg?.();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organization"
          className={cn(
            "w-full justify-between gap-2 px-3 font-normal",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {currentOrg ? (
              <>
                <OrgAvatar org={currentOrg} size="sm" />
                <span className="truncate text-sm font-medium">
                  {currentOrg.name}
                </span>
              </>
            ) : (
              <>
                <Building2
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-sm text-muted-foreground">
                  Select organization
                </span>
              </>
            )}
          </div>
          <ChevronsUpDown
            className="ml-auto h-4 w-4 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organizations..." />

          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center py-4 text-center">
                <Building2
                  className="mb-2 h-8 w-8 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  No organizations found
                </p>
              </div>
            </CommandEmpty>

            <CommandGroup heading="Organizations">
              {organizations.map((org) => {
                const isSelected = org.id === currentOrgId;

                return (
                  <CommandItem
                    key={org.id}
                    value={org.name}
                    onSelect={() => handleSelect(org.id)}
                    className="flex items-center gap-2 px-2 py-2"
                  >
                    {/* Avatar */}
                    <OrgAvatar org={org} size="md" />

                    {/* Org details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {org.name}
                        </span>
                        {showPlan && org.plan && <PlanBadge plan={org.plan} />}
                      </div>

                      {org.memberCount != null && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" aria-hidden="true" />
                          <span>
                            {org.memberCount}{" "}
                            {org.memberCount === 1 ? "member" : "members"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Selected check */}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {onCreateOrg && (
              <>
                <CommandSeparator />

                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateOrg}
                    className="flex items-center gap-2 px-2 py-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-muted-foreground/30">
                      <Plus
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      Create Organization
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Re-export types for consumer convenience
export type { Organization, OrgSwitcherProps } from "./org-switcher.types";
