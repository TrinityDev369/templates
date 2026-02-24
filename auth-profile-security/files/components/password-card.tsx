"use client";

import { Key, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PasswordStrength = "Weak" | "Fair" | "Strong";

interface PasswordStatus {
  lastChanged: string;
  strength: PasswordStrength;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STRENGTH_CONFIG: Record<
  PasswordStrength,
  { color: string; bg: string; width: string; label: string }
> = {
  Weak: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500",
    width: "w-1/3",
    label: "Weak",
  },
  Fair: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500",
    width: "w-2/3",
    label: "Fair",
  },
  Strong: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    width: "w-full",
    label: "Strong",
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_PASSWORD: PasswordStatus = {
  lastChanged: "2026-01-15T10:30:00Z",
  strength: "Strong",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PasswordCardProps {
  password?: PasswordStatus;
  onChangePassword?: () => void;
}

export function PasswordCard({
  password = SAMPLE_PASSWORD,
  onChangePassword,
}: PasswordCardProps) {
  const config = STRENGTH_CONFIG[password.strength];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Key className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Password
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account password
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 space-y-4">
        {/* Last changed */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last changed</span>
          <span className="font-medium">{formatDate(password.lastChanged)}</span>
        </div>

        {/* Strength indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Password strength</span>
            <span className={cn("font-medium", config.color)}>
              {config.label}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                config.bg,
                config.width
              )}
              role="progressbar"
              aria-valuenow={
                password.strength === "Weak"
                  ? 33
                  : password.strength === "Fair"
                    ? 66
                    : 100
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Password strength: ${config.label}`}
            />
          </div>
        </div>

        {/* Change password button */}
        <button
          type="button"
          onClick={onChangePassword}
          className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Change Password
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
