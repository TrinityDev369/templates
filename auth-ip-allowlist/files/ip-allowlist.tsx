"use client";

import * as React from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import type { IpAllowlistEntry, IpAllowlistProps } from "./ip-allowlist.types";

// ---------------------------------------------------------------------------
// Inline SVG icons (zero icon-library dependencies)
// ---------------------------------------------------------------------------

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Zod schema — IPv4 or CIDR v4 (Zod v3 compatible)
// ---------------------------------------------------------------------------

const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const CIDR_V4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/([0-9]|[1-2][0-9]|3[0-2])$/;

/**
 * Validate that each octet is in the 0-255 range.
 */
function isValidOctets(octets: string[]): boolean {
  return octets.every((o) => {
    const n = Number(o);
    return n >= 0 && n <= 255;
  });
}

const ipOrCidrSchema = z.string().refine(
  (val) => {
    const trimmed = val.trim();

    // Try CIDR first (it also has 4 octets + prefix)
    const cidrMatch = trimmed.match(CIDR_V4_REGEX);
    if (cidrMatch) {
      return isValidOctets([cidrMatch[1], cidrMatch[2], cidrMatch[3], cidrMatch[4]]);
    }

    // Try plain IPv4
    const ipMatch = trimmed.match(IPV4_REGEX);
    if (ipMatch) {
      return isValidOctets([ipMatch[1], ipMatch[2], ipMatch[3], ipMatch[4]]);
    }

    return false;
  },
  { message: "Enter a valid IPv4 address or CIDR (e.g. 10.0.0.1 or 10.0.0.0/24)" },
);

// ---------------------------------------------------------------------------
// Entry row
// ---------------------------------------------------------------------------

interface EntryRowProps {
  entry: IpAllowlistEntry;
  enforced: boolean;
  onToggle: (id: string, enabled: boolean) => void;
  onRemove: (id: string) => void;
}

function EntryRow({ entry, enforced, onToggle, onRemove }: EntryRowProps) {
  const isCidr = entry.value.includes("/");

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        entry.enabled && enforced
          ? "border-border bg-background"
          : "border-dashed border-muted-foreground/25 bg-muted/30",
      )}
    >
      <Switch
        checked={entry.enabled}
        onCheckedChange={(checked) => onToggle(entry.id, checked)}
        aria-label={`${entry.enabled ? "Disable" : "Enable"} ${entry.value}`}
        className="shrink-0"
      />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <GlobeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <code
          className={cn(
            "truncate text-sm font-medium",
            !entry.enabled && "text-muted-foreground line-through",
          )}
        >
          {entry.value}
        </code>
        {isCidr && (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            CIDR
          </Badge>
        )}
      </div>

      {entry.note && (
        <span className="hidden truncate text-xs text-muted-foreground sm:block">
          {entry.note}
        </span>
      )}

      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        className={cn(
          "shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors",
          "hover:bg-destructive/10 hover:text-destructive",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        )}
        aria-label={`Remove ${entry.value}`}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add-entry form
// ---------------------------------------------------------------------------

interface AddEntryFormProps {
  onAdd: (value: string, note: string) => void;
}

function AddEntryForm({ onAdd }: AddEntryFormProps) {
  const [ipValue, setIpValue] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = ipValue.trim();

    const result = ipOrCidrSchema.safeParse(trimmed);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid IP address");
      inputRef.current?.focus();
      return;
    }

    onAdd(trimmed, note.trim());
    setIpValue("");
    setNote("");
    setError(null);
    inputRef.current?.focus();
  }

  function handleIpChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIpValue(e.target.value);
    if (error) setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 space-y-1">
          <Label htmlFor="ip-input" className="sr-only">
            IP address or CIDR
          </Label>
          <Input
            ref={inputRef}
            id="ip-input"
            type="text"
            placeholder="e.g. 192.168.1.0/24 or 10.0.0.1"
            value={ipValue}
            onChange={handleIpChange}
            aria-invalid={!!error}
            aria-describedby={error ? "ip-input-error" : undefined}
            className={cn(error && "border-destructive focus-visible:ring-destructive")}
          />
        </div>
        <div className="flex-1 space-y-1 sm:max-w-[200px]">
          <Label htmlFor="note-input" className="sr-only">
            Note
          </Label>
          <Input
            id="note-input"
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <Button type="submit" size="default" className="shrink-0">
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add
        </Button>
      </div>
      {error && (
        <p id="ip-input-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function IpAllowlist({
  entries,
  onAdd,
  onRemove,
  onToggleEntry,
  onToggleEnforcement,
  enforced,
  className,
}: IpAllowlistProps) {
  const activeCount = entries.filter((e) => e.enabled).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShieldIcon
              className={cn(
                "h-5 w-5",
                enforced ? "text-emerald-500" : "text-muted-foreground",
              )}
            />
            IP Allowlist
          </CardTitle>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="enforcement-toggle"
              className="text-sm text-muted-foreground"
            >
              {enforced ? "Enforced" : "Disabled"}
            </Label>
            <Switch
              id="enforcement-toggle"
              checked={enforced}
              onCheckedChange={onToggleEnforcement}
              aria-label={`${enforced ? "Disable" : "Enable"} IP allowlist enforcement`}
            />
          </div>
        </div>

        {enforced && (
          <p className="text-sm text-muted-foreground">
            {activeCount === 0
              ? "No active entries. All traffic is currently blocked."
              : `${activeCount} active ${activeCount === 1 ? "entry" : "entries"}. Only matching IPs are allowed.`}
          </p>
        )}

        {!enforced && (
          <p className="text-sm text-muted-foreground">
            Enforcement is disabled. All traffic is allowed regardless of this list.
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add entry form */}
        <AddEntryForm onAdd={onAdd} />

        {/* Entry list */}
        {entries.length > 0 ? (
          <div className="space-y-2" role="list" aria-label="IP allowlist entries">
            {entries.map((entry) => (
              <div key={entry.id} role="listitem">
                <EntryRow
                  entry={entry}
                  enforced={enforced}
                  onToggle={onToggleEntry}
                  onRemove={onRemove}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <GlobeIcon className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No IP entries yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Add an IPv4 address or CIDR range above
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Re-export types for consumer convenience
export type { IpAllowlistEntry, IpAllowlistProps } from "./ip-allowlist.types";
