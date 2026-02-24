"use client";

import { useState, useCallback } from "react";
import { Mail, Send, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailCaptureProps {
  className?: string;
  onSubscribe?: (email: string) => Promise<void>;
}

type FormState = "idle" | "submitting" | "success" | "error";

export function EmailCapture({ className, onSubscribe }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isValidEmail) {
        setFormState("error");
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      setFormState("submitting");
      setErrorMessage("");

      try {
        if (onSubscribe) {
          await onSubscribe(email);
        } else {
          // Default: simulate a network request
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
        setFormState("success");
      } catch {
        setFormState("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    },
    [email, isValidEmail, onSubscribe]
  );

  if (formState === "success") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl px-6 py-8",
          "bg-white/5 backdrop-blur-sm border border-white/10",
          className
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-6 w-6 text-emerald-400" />
        </div>
        <p className="text-lg font-semibold text-white">You are on the list!</p>
        <p className="text-sm text-white/60">
          We will notify you at{" "}
          <span className="font-medium text-white/80">{email}</span> when we
          launch.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-md", className)}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Mail className="h-4 w-4 text-white/40" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formState === "error") {
                setFormState("idle");
                setErrorMessage("");
              }
            }}
            placeholder="Enter your email"
            required
            disabled={formState === "submitting"}
            className={cn(
              "w-full rounded-xl border bg-white/5 py-3 pl-11 pr-4",
              "text-sm text-white placeholder:text-white/40",
              "backdrop-blur-sm transition-all duration-200",
              "focus:outline-none focus:ring-2",
              formState === "error"
                ? "border-red-500/50 focus:ring-red-500/30"
                : "border-white/10 focus:border-white/20 focus:ring-white/10",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
            aria-label="Email address"
            aria-invalid={formState === "error"}
          />
        </div>

        <button
          type="submit"
          disabled={formState === "submitting" || !email.trim()}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3",
            "bg-white text-sm font-semibold text-neutral-900",
            "transition-all duration-200",
            "hover:bg-white/90 hover:shadow-lg hover:shadow-white/10",
            "active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "sm:w-auto"
          )}
        >
          {formState === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Subscribing</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Notify Me</span>
            </>
          )}
        </button>
      </form>

      {errorMessage && (
        <p className="mt-2 text-center text-xs text-red-400 sm:text-left">
          {errorMessage}
        </p>
      )}

      <p className="mt-3 text-center text-xs text-white/30 sm:text-left">
        No spam. Unsubscribe at any time.
      </p>
    </div>
  );
}
