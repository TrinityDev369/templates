"use client";

import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import {
  emailSchema,
  type EmailFormData,
  type MagicLinkProps,
  type MagicLinkStep,
} from "./magic-link.types";

/* -- Icons (inline SVG, zero deps) ---------------------------------------- */

function MailIcon({ className }: { className?: string }) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
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
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* -- Main component ------------------------------------------------------- */

/**
 * Passwordless magic link authentication flow.
 *
 * Three steps:
 * 1. **Email entry** - User types their email, we send a magic link
 * 2. **Check email** - Confirmation screen with resend + countdown
 * 3. **Expired** - Link expired, prompt to request a new one
 *
 * @example
 * ```tsx
 * <MagicLink
 *   onSendLink={async (email) => {
 *     await fetch("/api/auth/magic-link", {
 *       method: "POST",
 *       body: JSON.stringify({ email }),
 *     });
 *   }}
 * />
 * ```
 */
const MagicLink: FC<MagicLinkProps> = ({
  onSendLink,
  onResend,
  onBackToSignIn,
  defaultEmail = "",
  resendCooldown = 60,
  initialExpired = false,
}) => {
  const [step, setStep] = useState<MagicLinkStep>(
    initialExpired ? "expired" : "email-entry"
  );
  const [submittedEmail, setSubmittedEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: defaultEmail },
  });

  /* -- Countdown timer ---------------------------------------------------- */

  const startCountdown = useCallback(() => {
    setCountdown(resendCooldown);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resendCooldown]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* -- Handlers ----------------------------------------------------------- */

  const handleSendLink = useCallback(
    async (data: EmailFormData) => {
      setError(null);
      setIsSubmitting(true);
      try {
        await onSendLink(data.email);
        setSubmittedEmail(data.email);
        setStep("check-email");
        startCountdown();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send magic link"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSendLink, startCountdown]
  );

  const handleResend = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const resendFn = onResend ?? onSendLink;
      await resendFn(submittedEmail);
      startCountdown();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend magic link"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [onResend, onSendLink, submittedEmail, startCountdown]);

  const handleTryAgain = useCallback(() => {
    setError(null);
    setStep("email-entry");
  }, []);

  /* -- Email entry step --------------------------------------------------- */

  if (step === "email-entry") {
    return (
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SparklesIcon />
          </div>
          <CardTitle className="text-xl">Sign in with magic link</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a sign-in link
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(handleSendLink)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-email">Email address</Label>
              <Input
                id="magic-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send magic link"}
            </Button>

            {onBackToSignIn && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={onBackToSignIn}
              >
                Back to sign in
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    );
  }

  /* -- Check email step --------------------------------------------------- */

  if (step === "check-email") {
    return (
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center text-primary">
            <MailIcon />
          </div>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">
              {submittedEmail}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in. If you don&apos;t see it,
            check your spam folder.
          </p>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting || countdown > 0}
            onClick={handleResend}
          >
            {isSubmitting
              ? "Sending..."
              : countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend magic link"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={handleTryAgain}
          >
            Use a different email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  /* -- Expired step ------------------------------------------------------- */

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center text-destructive">
          <AlertIcon />
        </div>
        <CardTitle className="text-xl">Link expired</CardTitle>
        <CardDescription>
          This magic link has expired or has already been used
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="button"
          className="w-full"
          onClick={handleTryAgain}
        >
          Request a new link
        </Button>

        {onBackToSignIn && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={onBackToSignIn}
          >
            Back to sign in
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export { MagicLink };
