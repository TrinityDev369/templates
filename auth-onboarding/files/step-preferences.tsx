"use client";

import { type FC, useCallback } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type {
  StepPreferencesProps,
  ThemePreference,
} from "./onboarding-wizard.types";

/* -- Icons --------------------------------------------------------- */

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

/* -- Theme option card --------------------------------------------- */

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "system", label: "System", icon: <MonitorIcon /> },
];

/* -- StepPreferences ----------------------------------------------- */

/**
 * Preferences step for choosing theme and notification settings.
 *
 * Theme selection is presented as a segmented button group.
 * Notification toggles use shadcn Switch components.
 */
const StepPreferences: FC<StepPreferencesProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const setTheme = useCallback(
    (theme: ThemePreference) => {
      onChange({ ...data, theme });
    },
    [data, onChange]
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">
          Your preferences
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Customize your experience. You can change these later.
        </p>
      </div>

      {/* Theme selector */}
      <div className="space-y-3">
        <Label>Theme</Label>
        <div
          className="grid grid-cols-3 gap-2"
          role="radiogroup"
          aria-label="Theme preference"
        >
          {THEME_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={data.theme === value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                data.theme === value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification toggles */}
      <div className="space-y-4">
        <Label>Notifications</Label>

        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <MailIcon className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Email notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
          </div>
          <Switch
            checked={data.emailNotifications}
            onCheckedChange={(checked) =>
              onChange({ ...data, emailNotifications: checked })
            }
            aria-label="Toggle email notifications"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <BellIcon className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Push notifications</p>
              <p className="text-xs text-muted-foreground">Get notified in your browser</p>
            </div>
          </div>
          <Switch
            checked={data.pushNotifications}
            onCheckedChange={(checked) =>
              onChange({ ...data, pushNotifications: checked })
            }
            aria-label="Toggle push notifications"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
        >
          <ArrowLeftIcon />
          <span className="ml-1.5">Back</span>
        </Button>
        <Button type="button" className="flex-1" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export { StepPreferences };
