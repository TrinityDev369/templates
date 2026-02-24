"use client";

import { useState } from "react";
import { Mail, MessageSquare, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface UnlockOptionsProps {
  /** Called when the user requests an unlock email. */
  onSendUnlockEmail?: () => Promise<void> | void;
  /** URL or handler for the "Contact support" link. */
  supportHref?: string;
  /** Optional extra class names for the wrapper. */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Alternative unlock methods shown below the lockout timer.
 *
 * Provides two options:
 * 1. **Send unlock email** -- fires `onSendUnlockEmail` and shows a
 *    confirmation state once complete.
 * 2. **Contact support** -- navigates to a support page or mailto link.
 */
export function UnlockOptions({
  onSendUnlockEmail,
  supportHref = "mailto:support@example.com",
  className,
}: UnlockOptionsProps) {
  const [emailState, setEmailState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  async function handleSendEmail() {
    if (!onSendUnlockEmail || emailState === "sending" || emailState === "sent") {
      return;
    }

    setEmailState("sending");
    try {
      await onSendUnlockEmail();
      setEmailState("sent");
    } catch {
      setEmailState("error");
    }
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
        Unlock your account
      </p>

      {/* Send unlock email */}
      <button
        type="button"
        onClick={() => void handleSendEmail()}
        disabled={emailState === "sending" || emailState === "sent" || !onSendUnlockEmail}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          emailState === "sent"
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800",
          (emailState === "sending" || !onSendUnlockEmail) && "opacity-60 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            emailState === "sent"
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
              : "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
          )}
        >
          {emailState === "sent" ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Mail className="h-4 w-4" aria-hidden="true" />
          )}
        </span>

        <span className="flex flex-col min-w-0">
          <span
            className={cn(
              "font-medium",
              emailState === "sent"
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-gray-900 dark:text-gray-100"
            )}
          >
            {emailState === "idle" && "Send unlock email"}
            {emailState === "sending" && "Sending..."}
            {emailState === "sent" && "Unlock email sent"}
            {emailState === "error" && "Failed to send -- try again"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {emailState === "sent"
              ? "Check your inbox for an unlock link"
              : "We'll send a link to unlock your account"}
          </span>
        </span>
      </button>

      {/* Contact support */}
      <a
        href={supportHref}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
          "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
          "dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "no-underline"
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="flex flex-col min-w-0">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Contact support
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Get help from our team to unlock your account
          </span>
        </span>
      </a>
    </div>
  );
}
