"use client";

import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { OtpInput } from "./otp-input";
import { PasswordRequirements } from "./password-requirements";
import type {
  NewPasswordData,
  PasswordResetProps,
  PasswordResetStep,
  RequestResetData,
} from "./password-reset.types";

/* ── Validation schemas ──────────────────────────────────── */

const requestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/\d/, "Password must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ── Icons ───────────────────────────────────────────────── */

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
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

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.3 9.3" />
      <path d="M18 5 21 2" />
      <path d="m21 2-3 1" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
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
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
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

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ── Resend countdown hook ───────────────────────────────── */

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setRemaining(seconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { remaining, isActive: remaining > 0, start };
}

/* ── Main component ──────────────────────────────────────── */

/**
 * Multi-step password reset flow.
 *
 * Steps:
 * 1. **Request** - User enters email to receive a 6-digit reset code
 * 2. **Verify** - User enters the 6-digit code
 * 3. **New Password** - User sets a new password with strength requirements
 * 4. **Success** - Confirmation screen
 *
 * All async operations are delegated to parent callbacks so the component
 * remains agnostic of the backend implementation.
 *
 * @example
 * ```tsx
 * <PasswordReset
 *   onRequestReset={async (email) => api.sendResetCode(email)}
 *   onVerifyCode={async (email, code) => api.verifyCode(email, code)}
 *   onResetPassword={async (email, code, pw) => api.resetPassword(email, code, pw)}
 *   onBackToSignIn={() => router.push('/sign-in')}
 * />
 * ```
 */
const PasswordReset: FC<PasswordResetProps> = ({
  onRequestReset,
  onVerifyCode,
  onResetPassword,
  onBackToSignIn,
}) => {
  /* ── State ──────────────────────────────────────────── */

  const [step, setStep] = useState<PasswordResetStep>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const countdown = useCountdown(60);

  /* ── Refs for focus management ─────────────────────── */

  const cardRef = useRef<HTMLDivElement>(null);

  /** Focus the card heading when switching steps for screen reader announcement. */
  const focusHeading = useCallback(() => {
    // Small delay to allow DOM update
    requestAnimationFrame(() => {
      const heading = cardRef.current?.querySelector("h2, [role='heading']");
      if (heading instanceof HTMLElement) {
        heading.focus();
      }
    });
  }, []);

  /* ── Step 1: Request reset ─────────────────────────── */

  const requestForm = useForm<RequestResetData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const handleRequestReset = useCallback(
    async (data: RequestResetData) => {
      setIsLoading(true);
      setError(null);
      try {
        await onRequestReset(data.email);
        setEmail(data.email);
        setStep("verify");
        countdown.start();
        focusHeading();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send reset code"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onRequestReset, countdown, focusHeading]
  );

  /* ── Step 2: Verify code ───────────────────────────── */

  const handleVerifyCode = useCallback(async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      await onVerifyCode(email, code);
      setStep("new-password");
      focusHeading();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid verification code"
      );
    } finally {
      setIsLoading(false);
    }
  }, [code, email, onVerifyCode, focusHeading]);

  const handleResend = useCallback(async () => {
    if (countdown.isActive) return;
    setIsLoading(true);
    setError(null);
    try {
      await onRequestReset(email);
      countdown.start();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend code"
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, onRequestReset, countdown]);

  /* ── Step 3: New password ──────────────────────────── */

  const passwordForm = useForm<NewPasswordData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const watchPassword = passwordForm.watch("password");

  const handleResetPassword = useCallback(
    async (data: NewPasswordData) => {
      setIsLoading(true);
      setError(null);
      try {
        await onResetPassword(email, code, data.password);
        setStep("success");
        focusHeading();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reset password"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, code, onResetPassword, focusHeading]
  );

  /* ── Render helpers ────────────────────────────────── */

  const backToSignIn = (
    <button
      type="button"
      onClick={onBackToSignIn}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeftIcon />
      Back to sign in
    </button>
  );

  /* ── Step 1: Request ───────────────────────────────── */

  if (step === "request") {
    return (
      <Card ref={cardRef} className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MailIcon className="text-muted-foreground" />
          </div>
          <CardTitle tabIndex={-1} className="text-2xl outline-none">
            Reset your password
          </CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset code
          </CardDescription>
        </CardHeader>

        <form onSubmit={requestForm.handleSubmit(handleRequestReset)}>
          <CardContent className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                aria-invalid={!!requestForm.formState.errors.email}
                aria-describedby={
                  requestForm.formState.errors.email
                    ? "reset-email-error"
                    : undefined
                }
                {...requestForm.register("email")}
              />
              {requestForm.formState.errors.email && (
                <p id="reset-email-error" className="text-sm text-destructive">
                  {requestForm.formState.errors.email.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && (
                <LoaderIcon className="mr-2 animate-spin" />
              )}
              Send reset code
            </Button>
            {onBackToSignIn && backToSignIn}
          </CardFooter>
        </form>
      </Card>
    );
  }

  /* ── Step 2: Verify ────────────────────────────────── */

  if (step === "verify") {
    return (
      <Card ref={cardRef} className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <KeyIcon className="text-muted-foreground" />
          </div>
          <CardTitle tabIndex={-1} className="text-2xl outline-none">
            Check your email
          </CardTitle>
          <CardDescription>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <OtpInput
              value={code}
              onChange={setCode}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={isLoading || code.length !== 6}
            onClick={() => void handleVerifyCode()}
          >
            {isLoading && (
              <LoaderIcon className="mr-2 animate-spin" />
            )}
            Verify code
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            {countdown.isActive ? (
              <span>
                Resend in {countdown.remaining}s
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={isLoading}
                className="font-medium text-primary hover:underline disabled:opacity-50"
              >
                Resend
              </button>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setCode("");
              setError(null);
              focusHeading();
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon />
            Back
          </button>
        </CardFooter>
      </Card>
    );
  }

  /* ── Step 3: New password ──────────────────────────── */

  if (step === "new-password") {
    return (
      <Card ref={cardRef} className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <KeyIcon className="text-muted-foreground" />
          </div>
          <CardTitle tabIndex={-1} className="text-2xl outline-none">
            Set new password
          </CardTitle>
          <CardDescription>
            Choose a strong password for your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={passwordForm.handleSubmit(handleResetPassword)}>
          <CardContent className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  autoFocus
                  aria-invalid={!!passwordForm.formState.errors.password}
                  aria-describedby="password-requirements"
                  className="pr-10"
                  {...passwordForm.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Password requirements checklist */}
            <div id="password-requirements">
              <PasswordRequirements password={watchPassword ?? ""} />
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={
                    !!passwordForm.formState.errors.confirmPassword
                  }
                  aria-describedby={
                    passwordForm.formState.errors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  className="pr-10"
                  {...passwordForm.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="text-sm text-destructive"
                >
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && (
                <LoaderIcon className="mr-2 animate-spin" />
              )}
              Reset password
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  /* ── Step 4: Success ───────────────────────────────── */

  return (
    <Card ref={cardRef} className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 text-emerald-600">
          <CheckCircleIcon />
        </div>
        <CardTitle tabIndex={-1} className="text-2xl outline-none">
          Password reset successful
        </CardTitle>
        <CardDescription>
          Your password has been updated. You can now sign in with your new
          password.
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-col gap-3">
        {onBackToSignIn ? (
          <Button
            type="button"
            className="w-full"
            onClick={onBackToSignIn}
          >
            Back to sign in
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            You may now close this page.
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export { PasswordReset };
