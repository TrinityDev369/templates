"use client";

import {
  type ChangeEvent,
  type ClipboardEvent,
  type FC,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
import { cn } from "@/lib/utils";

import { RecoveryCodes } from "./recovery-codes";
import type {
  TwoFactorEnableResult,
  TwoFactorSetupProps,
  TwoFactorStep,
} from "./two-factor-setup.types";

/* -- Icons ------------------------------------------------------ */

function ShieldIcon({ className }: { className?: string }) {
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function QrCodeIcon({ className }: { className?: string }) {
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
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
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
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckSmallIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <polyline points="20 6 9 17 4 12" />
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

/* -- OTP Input (inline) ----------------------------------------- */

/** Keep only digit characters and trim to max length. */
function sanitize(raw: string, maxLength: number): string {
  return raw.replace(/\D/g, "").slice(0, maxLength);
}

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

const OtpInput: FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const digits = value.split("");

  const focusBox = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1));
      inputRefs.current[clamped]?.focus();
    },
    [length]
  );

  const handleChange = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const digit = sanitize(raw, 1);
      if (!digit) return;

      const next = value.split("");
      next[index] = digit;
      for (let i = 0; i < length; i++) {
        if (next[i] === undefined) next[i] = "";
      }
      onChange(next.join(""));

      if (index < length - 1) {
        focusBox(index + 1);
      }
    },
    [value, onChange, length, focusBox]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Backspace": {
          e.preventDefault();
          const next = value.split("");
          if (next[index]) {
            next[index] = "";
            onChange(next.join(""));
          } else if (index > 0) {
            next[index - 1] = "";
            onChange(next.join(""));
            focusBox(index - 1);
          }
          break;
        }
        case "ArrowLeft":
          e.preventDefault();
          focusBox(index - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          focusBox(index + 1);
          break;
        case "Delete": {
          e.preventDefault();
          const next = value.split("");
          next[index] = "";
          onChange(next.join(""));
          break;
        }
        default:
          break;
      }
    },
    [value, onChange, focusBox]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = sanitize(e.clipboardData.getData("text/plain"), length);
      if (!pasted) return;
      onChange(pasted);
      const target = Math.min(pasted.length, length - 1);
      focusBox(target);
    },
    [onChange, length, focusBox]
  );

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Verification code"
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]"
          maxLength={1}
          aria-label={`Digit ${i + 1} of ${length}`}
          value={digits[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-12 h-12 text-center text-lg font-mono",
            "border rounded-md bg-background",
            "outline-none transition-all duration-150",
            "focus:ring-2 focus:ring-ring focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
};

/* -- Main component --------------------------------------------- */

/**
 * Multi-step two-factor authentication setup flow.
 *
 * Steps:
 * 1. **Intro** - Explanation of 2FA with "Enable" button
 * 2. **Scan** - QR code display + manual secret key with copy button
 * 3. **Recovery** - 8 recovery codes with download/copy, confirmation checkbox
 * 4. **Verify** - 6-digit OTP input to confirm setup works
 * 5. **Success** - Setup complete confirmation
 *
 * All async operations are delegated to parent callbacks so the component
 * remains agnostic of the backend implementation.
 *
 * @example
 * ```tsx
 * <TwoFactorSetup
 *   onEnable={async () => {
 *     const res = await api.enable2FA();
 *     return { qrCodeUrl: res.qr, secret: res.secret, recoveryCodes: res.codes };
 *   }}
 *   onVerify={async (code) => api.verify2FA(code)}
 *   onComplete={() => router.push('/settings')}
 * />
 * ```
 */
const TwoFactorSetup: FC<TwoFactorSetupProps> = ({
  onEnable,
  onVerify,
  onComplete,
}) => {
  /* -- State ---------------------------------------------------- */

  const [step, setStep] = useState<TwoFactorStep>("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA data from onEnable callback
  const [twoFactorData, setTwoFactorData] =
    useState<TwoFactorEnableResult | null>(null);

  // Secret key copy state
  const [secretCopied, setSecretCopied] = useState(false);

  // Recovery codes confirmation
  const [codesConfirmed, setCodesConfirmed] = useState(false);

  // OTP verification
  const [otpCode, setOtpCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  /* -- Refs for focus management -------------------------------- */

  const cardRef = useRef<HTMLDivElement>(null);

  /** Focus the card heading when switching steps for screen reader announcement. */
  const focusHeading = useCallback(() => {
    requestAnimationFrame(() => {
      const heading = cardRef.current?.querySelector("h2, [role='heading']");
      if (heading instanceof HTMLElement) {
        heading.focus();
      }
    });
  }, []);

  /* -- Step 1: Enable 2FA --------------------------------------- */

  const handleEnable = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onEnable();
      setTwoFactorData(result);
      setStep("scan");
      focusHeading();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enable two-factor authentication"
      );
    } finally {
      setIsLoading(false);
    }
  }, [onEnable, focusHeading]);

  /* -- Step 2: Copy secret key ---------------------------------- */

  const handleCopySecret = useCallback(async () => {
    if (!twoFactorData?.secret) return;
    try {
      await navigator.clipboard.writeText(twoFactorData.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = twoFactorData.secret;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  }, [twoFactorData?.secret]);

  /* -- Step 4: Verify OTP --------------------------------------- */

  const handleVerify = useCallback(async () => {
    if (otpCode.length !== 6) return;
    setIsLoading(true);
    setVerifyError(null);
    try {
      const valid = await onVerify(otpCode);
      if (valid) {
        setStep("success");
        focusHeading();
      } else {
        setVerifyError("Invalid verification code. Please try again.");
        setOtpCode("");
      }
    } catch (err) {
      setVerifyError(
        err instanceof Error ? err.message : "Verification failed. Please try again."
      );
      setOtpCode("");
    } finally {
      setIsLoading(false);
    }
  }, [otpCode, onVerify, focusHeading]);

  /* -- Step progress indicator ---------------------------------- */

  const steps: { key: TwoFactorStep; label: string }[] = [
    { key: "intro", label: "Start" },
    { key: "scan", label: "Scan" },
    { key: "recovery", label: "Backup" },
    { key: "verify", label: "Verify" },
    { key: "success", label: "Done" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const StepIndicator = (
    <div
      className="flex items-center justify-center gap-1 mb-6"
      role="progressbar"
      aria-valuenow={currentStepIndex + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Step ${currentStepIndex + 1} of ${steps.length}: ${steps[currentStepIndex]?.label}`}
    >
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
              i < currentStepIndex && "bg-primary text-primary-foreground",
              i === currentStepIndex && "bg-primary text-primary-foreground ring-2 ring-primary/30",
              i > currentStepIndex && "bg-muted text-muted-foreground"
            )}
          >
            {i < currentStepIndex ? (
              <CheckSmallIcon className="h-3.5 w-3.5" />
            ) : (
              i + 1
            )}
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-1 h-0.5 w-6 sm:w-8 transition-colors",
                i < currentStepIndex ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  /* -- Error alert helper --------------------------------------- */

  const ErrorAlert = ({ message }: { message: string }) => (
    <div
      role="alert"
      className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
    >
      {message}
    </div>
  );

  /* -- Step 1: Intro -------------------------------------------- */

  if (step === "intro") {
    return (
      <Card ref={cardRef} className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          {StepIndicator}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldIcon className="text-muted-foreground" />
          </div>
          <CardTitle tabIndex={-1} className="text-2xl outline-none">
            Enable two-factor authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a
            verification code in addition to your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && <ErrorAlert message={error} />}

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                1
              </div>
              <p>Scan a QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                2
              </div>
              <p>Save your recovery codes in a safe place in case you lose access to your authenticator</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                3
              </div>
              <p>Enter a verification code from your authenticator app to confirm setup</p>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="button"
            className="w-full"
            disabled={isLoading}
            onClick={() => void handleEnable()}
          >
            {isLoading && <LoaderIcon className="mr-2 animate-spin" />}
            Enable two-factor authentication
          </Button>
        </CardFooter>
      </Card>
    );
  }

  /* -- Step 2: Scan QR code ------------------------------------- */

  if (step === "scan") {
    return (
      <Card ref={cardRef} className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          {StepIndicator}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <QrCodeIcon className="text-muted-foreground" />
          </div>
          <CardTitle tabIndex={-1} className="text-2xl outline-none">
            Scan QR code
          </CardTitle>
          <CardDescription>
            Open your authenticator app and scan the QR code below to add your
            account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-lg border bg-white p-4">
              <img
                src={twoFactorData?.qrCodeUrl}
                alt="Two-factor authentication QR code"
                width={200}
                height={200}
                className="h-[200px] w-[200px]"
              />
            </div>
          </div>

          {/* Manual entry */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Or enter this key manually:
            </Label>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex-1 rounded-md border bg-muted/50 px-3 py-2",
                  "font-mono text-sm tracking-wider text-center",
                  "select-all break-all"
                )}
                aria-label="Secret key for manual entry"
              >
                {twoFactorData?.secret}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => void handleCopySecret()}
                aria-label={secretCopied ? "Secret key copied" : "Copy secret key"}
              >
                {secretCopied ? (
                  <CheckSmallIcon className="h-4 w-4 text-emerald-600" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setStep("recovery");
              focusHeading();
            }}
          >
            Continue
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("intro");
              setTwoFactorData(null);
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

  /* -- Step 3: Recovery codes ----------------------------------- */

  if (step === "recovery") {
    return (
      <Card ref={cardRef} className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          {StepIndicator}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <KeyIcon className="text-muted-foreground" />
          </div>
          <CardTitle tabIndex={-1} className="text-2xl outline-none">
            Save your recovery codes
          </CardTitle>
          <CardDescription>
            If you lose access to your authenticator app, you can use one of
            these codes to sign in. Each code can only be used once.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Warning banner */}
          <div
            role="alert"
            className="rounded-md border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-200"
          >
            <strong>Important:</strong> Store these codes in a safe place. You
            will not be able to view them again after leaving this page.
          </div>

          {/* Recovery codes component */}
          <RecoveryCodes codes={twoFactorData?.recoveryCodes ?? []} />

          {/* Confirmation checkbox */}
          <label
            className="flex items-start gap-3 cursor-pointer select-none"
            htmlFor="codes-confirmed"
          >
            <input
              id="codes-confirmed"
              type="checkbox"
              checked={codesConfirmed}
              onChange={(e) => setCodesConfirmed(e.target.checked)}
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 rounded border border-input",
                "accent-primary focus:ring-2 focus:ring-ring"
              )}
              aria-describedby="codes-confirmed-description"
            />
            <span
              id="codes-confirmed-description"
              className="text-sm text-muted-foreground"
            >
              I have saved my recovery codes in a secure location
            </span>
          </label>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="button"
            className="w-full"
            disabled={!codesConfirmed}
            onClick={() => {
              setStep("verify");
              focusHeading();
            }}
          >
            Continue to verification
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("scan");
              setCodesConfirmed(false);
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

  /* -- Step 4: Verify ------------------------------------------- */

  if (step === "verify") {
    return (
      <Card ref={cardRef} className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          {StepIndicator}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldIcon className="text-muted-foreground" />
          </div>
          <CardTitle tabIndex={-1} className="text-2xl outline-none">
            Verify your setup
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to confirm
            everything is working correctly.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {verifyError && <ErrorAlert message={verifyError} />}

          <div className="flex justify-center">
            <OtpInput
              value={otpCode}
              onChange={setOtpCode}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={isLoading || otpCode.length !== 6}
            onClick={() => void handleVerify()}
          >
            {isLoading && <LoaderIcon className="mr-2 animate-spin" />}
            Verify and activate
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <button
            type="button"
            onClick={() => {
              setStep("recovery");
              setOtpCode("");
              setVerifyError(null);
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

  /* -- Step 5: Success ------------------------------------------ */

  return (
    <Card ref={cardRef} className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        {StepIndicator}
        <div className="mx-auto mb-3 text-emerald-600">
          <CheckCircleIcon />
        </div>
        <CardTitle tabIndex={-1} className="text-2xl outline-none">
          Two-factor authentication enabled
        </CardTitle>
        <CardDescription>
          Your account is now protected with two-factor authentication. You will
          be asked for a verification code each time you sign in.
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          onClick={onComplete}
        >
          Done
        </Button>
      </CardFooter>
    </Card>
  );
};

export { TwoFactorSetup };
