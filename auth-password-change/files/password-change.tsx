"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import type {
  PasswordChangeFormData,
  PasswordChangeFormProps,
} from "./password-change.types";

/* -------------------------------------------------------------------------- */
/*  Password strength                                                          */
/* -------------------------------------------------------------------------- */

type StrengthLevel = "weak" | "fair" | "good" | "strong";

interface StrengthInfo {
  score: number;
  level: StrengthLevel;
  label: string;
  color: string;
}

/**
 * Calculate password strength on five criteria (0-5 points):
 *  - Length >= 12 characters
 *  - Contains at least one uppercase letter
 *  - Contains at least one lowercase letter
 *  - Contains at least one digit
 *  - Contains at least one special character
 *
 * Score mapping:
 *  0-1 = Weak, 2 = Fair, 3 = Good, 4-5 = Strong
 */
function calculateStrength(password: string): StrengthInfo {
  let score = 0;

  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { score, level: "weak", label: "Weak", color: "bg-red-500" };
  }
  if (score === 2) {
    return { score, level: "fair", label: "Fair", color: "bg-orange-500" };
  }
  if (score === 3) {
    return { score, level: "good", label: "Good", color: "bg-yellow-500" };
  }
  return { score, level: "strong", label: "Strong", color: "bg-green-500" };
}

/** Number of segments displayed in the strength bar. */
const SEGMENT_COUNT = 4;

/** Map strength levels to how many segments should be filled. */
const FILLED_SEGMENTS: Record<StrengthLevel, number> = {
  weak: 1,
  fair: 2,
  good: 3,
  strong: 4,
};

/** Text color class per strength level. */
const STRENGTH_TEXT_COLOR: Record<StrengthLevel, string> = {
  weak: "text-red-500",
  fair: "text-orange-500",
  good: "text-yellow-500",
  strong: "text-green-500",
};

/* -------------------------------------------------------------------------- */
/*  Zod schema                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for the password change form.
 *
 * Rules:
 * - Current password is required (non-empty).
 * - New password must be >= 8 characters and contain uppercase, lowercase,
 *   and a digit (special characters are encouraged but not required).
 * - Confirm password must match the new password field.
 */
const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * PasswordChangeForm provides an in-app password change form for
 * authenticated users with:
 * - Current password field (with show/hide toggle)
 * - New password field (with show/hide toggle + inline strength meter)
 * - Confirm password field (with show/hide toggle)
 * - Inline Zod validation via React Hook Form
 * - Loading state on submit
 * - Success state with confirmation
 * - Wrapped in a shadcn Card
 *
 * @example
 * ```tsx
 * import { PasswordChangeForm } from "@/components/auth-password-change/password-change";
 *
 * export default function SettingsPage() {
 *   return (
 *     <PasswordChangeForm
 *       onSubmit={async (data) => {
 *         await changePassword(data.currentPassword, data.newPassword);
 *       }}
 *       onCancel={() => router.back()}
 *     />
 *   );
 * }
 * ```
 */
export function PasswordChangeForm({
  onSubmit,
  onCancel,
}: PasswordChangeFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedNewPassword = watch("newPassword");
  const strength = useMemo(
    () => calculateStrength(watchedNewPassword),
    [watchedNewPassword],
  );
  const filledCount = FILLED_SEGMENTS[strength.level];

  async function handleFormSubmit(data: PasswordChangeFormData) {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit(data);
      setIsSuccess(true);
      reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setIsLoading(false);
    }
  }

  /* ── Success state ─────────────────────────────────────── */

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Password changed
          </CardTitle>
          <CardDescription>
            Your password has been updated successfully.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              onCancel?.();
            }}
          >
            Done
          </Button>
        </CardFooter>
      </Card>
    );
  }

  /* ── Form state ────────────────────────────────────────── */

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Change password
        </CardTitle>
        <CardDescription>
          Enter your current password and choose a new one
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* ── Error banner ────────────────────────────────── */}
          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {/* ── Current password ────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                autoComplete="current-password"
                className="pr-10"
                aria-invalid={!!errors.currentPassword}
                aria-describedby={
                  errors.currentPassword
                    ? "currentPassword-error"
                    : undefined
                }
                {...register("currentPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p
                id="currentPassword-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* ── New password ─────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter a new password"
                autoComplete="new-password"
                className="pr-10"
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  [
                    errors.newPassword ? "newPassword-error" : "",
                    "newPassword-strength",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                {...register("newPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={
                  showNewPassword ? "Hide new password" : "Show new password"
                }
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password strength meter */}
            {watchedNewPassword && (
              <div
                id="newPassword-strength"
                className="space-y-1.5"
                aria-label="Password strength indicator"
              >
                <div
                  className="flex gap-1"
                  role="meter"
                  aria-valuenow={strength.score}
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-label={`Password strength: ${strength.label}`}
                >
                  {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
                    <div
                      key={i}
                      className={[
                        "h-1.5 flex-1 rounded-full transition-colors duration-300",
                        i < filledCount ? strength.color : "bg-muted",
                      ].join(" ")}
                    />
                  ))}
                </div>
                <p
                  className={[
                    "text-xs font-medium transition-colors duration-300",
                    STRENGTH_TEXT_COLOR[strength.level],
                  ].join(" ")}
                >
                  {strength.label}
                </p>
              </div>
            )}

            {errors.newPassword && (
              <p
                id="newPassword-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* ── Confirm password ─────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                className="pr-10"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* ── Actions ──────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className={onCancel ? "flex-1" : "w-full"}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLoading ? "Saving..." : "Save new password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export { type PasswordChangeFormData, type PasswordChangeFormProps } from "./password-change.types";
