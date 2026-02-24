"use client";

import { type FC, useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { StepProfileProps } from "./onboarding-wizard.types";

/* -- Icons --------------------------------------------------------- */

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
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

/* -- StepProfile --------------------------------------------------- */

/**
 * Profile setup step for collecting display name and optional avatar.
 *
 * The avatar is stored as a `File` object in state and previewed via
 * `URL.createObjectURL`. The parent component is responsible for
 * uploading the file to the server.
 */
const StepProfile: FC<StepProfileProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      onChange({ ...data, avatarFile: file });
      if (file) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      } else {
        setPreview(null);
      }
    },
    [data, onChange]
  );

  const handleNext = useCallback(() => {
    const trimmed = data.displayName.trim();
    if (trimmed.length === 0) {
      setNameError("Display name is required");
      return;
    }
    if (trimmed.length < 2) {
      setNameError("Display name must be at least 2 characters");
      return;
    }
    setNameError(null);
    onNext();
  }, [data.displayName, onNext]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">
          Set up your profile
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Tell us a bit about yourself.
        </p>
      </div>

      {/* Avatar upload */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/50 transition-colors",
            "hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Upload avatar"
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <UserIcon className="text-muted-foreground/50" />
          )}
          <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <CameraIcon />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Display name */}
      <div className="space-y-2">
        <Label htmlFor="onboarding-display-name">Display name</Label>
        <Input
          id="onboarding-display-name"
          type="text"
          placeholder="How should we call you?"
          autoComplete="name"
          value={data.displayName}
          onChange={(e) => {
            onChange({ ...data, displayName: e.target.value });
            if (nameError) setNameError(null);
          }}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "display-name-error" : undefined}
        />
        {nameError && (
          <p id="display-name-error" className="text-sm text-destructive" role="alert">
            {nameError}
          </p>
        )}
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
        <Button type="button" className="flex-1" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export { StepProfile };
