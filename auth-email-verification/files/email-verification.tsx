"use client";

import { type FC, useCallback, useEffect, useRef, useState } from "react";

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

import type { EmailVerificationProps } from "./email-verification.types";

/* -- Icons (inline SVG) --------------------------------------------------- */

function MailCheckIcon({ className }: { className?: string }) {
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
      <path d="M22 13V6.5C22 5.12 20.88 4 19.5 4h-15C3.12 4 2 5.12 2 6.5V17c0 1.38 1.12 2.5 2.5 2.5H12" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <path d="m16 19 2 2 4-4" />
    </svg>
  );
}

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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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

/* -- Helpers -------------------------------------------------------------- */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* -- Component ------------------------------------------------------------ */

/**
 * Email verification flow with resend countdown, optional code input, and expiry timer.
 *
 * Supports two modes:
 * - **Link mode** (default): User clicks a link in their email
 * - **Code mode**: User enters a 6-digit code (when `onVerifyCode` is provided)
 *
 * @example
 * ```tsx
 * <EmailVerification
 *   email="user@example.com"
 *   status="pending"
 *   onResend={async (email) => { /* send new email */ }}
 *   onVerifyCode={async (code) => { /* validate code */ }}
 *   onContinue={() => router.push('/dashboard')}
 *   expiresInSeconds={600}
 * />
 * ```
 */
const EmailVerification: FC<EmailVerificationProps> = ({
  email,
  status,
  onResend,
  onVerifyCode,
  onContinue,
  onChangeEmail,
  resendCooldown = 60,
  expiresInSeconds,
}) => {
  const [resendCountdown, setResendCountdown] = useState(resendCooldown);
  const [expiryCountdown, setExpiryCountdown] = useState(
    expiresInSeconds ?? 0
  );
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* -- Resend countdown --------------------------------------------------- */

  useEffect(() => {
    if (status !== "pending") return;
    resendTimerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) clearInterval(resendTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, [status]);

  /* -- Expiry countdown --------------------------------------------------- */

  useEffect(() => {
    if (!expiresInSeconds || status !== "pending") return;
    setExpiryCountdown(expiresInSeconds);
    expiryTimerRef.current = setInterval(() => {
      setExpiryCountdown((prev) => {
        if (prev <= 1) {
          if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    };
  }, [expiresInSeconds, status]);

  /* -- Handlers ----------------------------------------------------------- */

  const handleResend = useCallback(async () => {
    setError(null);
    setIsResending(true);
    try {
      await onResend(email);
      setResendCountdown(resendCooldown);
      // Restart countdown
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      resendTimerRef.current = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            if (resendTimerRef.current) clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend verification email"
      );
    } finally {
      setIsResending(false);
    }
  }, [email, onResend, resendCooldown]);

  const handleVerifyCode = useCallback(async () => {
    if (!onVerifyCode || !code.trim()) return;
    setError(null);
    setIsVerifying(true);
    try {
      await onVerifyCode(code.trim());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid verification code"
      );
    } finally {
      setIsVerifying(false);
    }
  }, [onVerifyCode, code]);

  /* -- Success state ------------------------------------------------------ */

  if (status === "success") {
    return (
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-emerald-600">
            <CheckCircleIcon />
          </div>
          <CardTitle className="text-xl">Email verified</CardTitle>
          <CardDescription>
            <span className="font-medium text-foreground">{email}</span> has
            been successfully verified
          </CardDescription>
        </CardHeader>

        {onContinue && (
          <CardFooter>
            <Button className="w-full" onClick={onContinue}>
              Continue
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  /* -- Expired state ------------------------------------------------------ */

  if (status === "expired") {
    return (
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-destructive">
            <AlertIcon />
          </div>
          <CardTitle className="text-xl">Link expired</CardTitle>
          <CardDescription>
            The verification link for{" "}
            <span className="font-medium text-foreground">{email}</span> has
            expired
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {error && (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={isResending}
            onClick={handleResend}
          >
            {isResending ? "Sending..." : "Send new verification email"}
          </Button>
          {onChangeEmail && (
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={onChangeEmail}
            >
              Use a different email
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  /* -- Pending state ------------------------------------------------------ */

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 text-primary">
          {onVerifyCode ? <MailCheckIcon /> : <MailIcon />}
        </div>
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a verification{" "}
          {onVerifyCode ? "code" : "link"} to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Expiry timer */}
        {expiresInSeconds != null && expiryCountdown > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Expires in{" "}
              <span className="font-mono font-medium text-foreground">
                {formatTime(expiryCountdown)}
              </span>
            </p>
          </div>
        )}

        {/* Code input (only if onVerifyCode provided) */}
        {onVerifyCode && (
          <div className="space-y-2">
            <Label htmlFor="verify-code">Verification code</Label>
            <div className="flex gap-2">
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="text-center font-mono text-lg tracking-widest"
                autoFocus
              />
              <Button
                onClick={handleVerifyCode}
                disabled={isVerifying || code.length < 6}
              >
                {isVerifying ? "..." : "Verify"}
              </Button>
            </div>
          </div>
        )}

        {!onVerifyCode && (
          <p className="text-center text-sm text-muted-foreground">
            Click the link in the email to verify your account. Check your spam
            folder if you don&apos;t see it.
          </p>
        )}

        {error && (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full"
          disabled={isResending || resendCountdown > 0}
          onClick={handleResend}
        >
          {isResending
            ? "Sending..."
            : resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : "Resend verification email"}
        </Button>

        {onChangeEmail && (
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={onChangeEmail}
          >
            Use a different email
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export { EmailVerification };
