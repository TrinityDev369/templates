"use client";

import * as React from "react";
import { Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface WaitlistFormProps {
  onSubmit: (email: string) => Promise<void>;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Email validation                                                          */
/* -------------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required";
  if (!EMAIL_RE.test(value)) return "Please enter a valid email address";
  return null;
}

/* -------------------------------------------------------------------------- */
/*  WaitlistForm                                                              */
/* -------------------------------------------------------------------------- */

export function WaitlistForm({ onSubmit, className }: WaitlistFormProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email.trim());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("mx-auto w-full max-w-md", className)}
      noValidate
    >
      <div className="relative flex items-center">
        <Mail
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/40"
          aria-hidden="true"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          aria-label="Email address"
          aria-invalid={!!error}
          aria-describedby={error ? "waitlist-email-error" : undefined}
          className={cn(
            "h-12 w-full rounded-lg border bg-white/5 pl-10 pr-28 text-sm text-white placeholder:text-white/40",
            "outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error
              ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/30"
              : "border-white/10"
          )}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "absolute right-1.5 flex h-9 items-center gap-1.5 rounded-md bg-indigo-500 px-4 text-sm font-medium text-white",
            "transition-all hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Joining...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Join
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </button>
      </div>

      {error && (
        <p
          id="waitlist-email-error"
          role="alert"
          className="mt-2 text-center text-sm text-red-400"
        >
          {error}
        </p>
      )}

      <p className="mt-3 text-center text-xs text-white/40">
        No spam, ever. Unsubscribe anytime.
      </p>
    </form>
  );
}
