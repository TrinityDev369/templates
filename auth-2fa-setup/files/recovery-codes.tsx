"use client";

import { type FC, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { RecoveryCodesProps } from "./two-factor-setup.types";

/* -- Icons ------------------------------------------------------ */

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

function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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

/* -- Component -------------------------------------------------- */

/**
 * Displays a grid of one-time recovery codes with copy and download actions.
 *
 * Recovery codes are shown in a 2-column grid with monospace font.
 * Users can copy all codes to clipboard or download as a plain text file.
 *
 * @example
 * ```tsx
 * <RecoveryCodes codes={["ABCD-1234", "EFGH-5678", ...]} />
 * ```
 */
const RecoveryCodes: FC<RecoveryCodesProps> = ({ codes }) => {
  const [copied, setCopied] = useState(false);

  const codesText = codes.join("\n");

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = codesText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [codesText]);

  const handleDownload = useCallback(() => {
    const header = "# Two-Factor Authentication Recovery Codes\n";
    const warning =
      "# Store these codes in a safe place.\n# Each code can only be used once.\n\n";
    const content = header + warning + codesText;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "2fa-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  }, [codesText]);

  return (
    <div className="space-y-4">
      {/* Recovery codes grid */}
      <div
        className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4"
        role="list"
        aria-label="Recovery codes"
      >
        {codes.map((code, index) => (
          <div
            key={index}
            role="listitem"
            className={cn(
              "rounded-md bg-background px-3 py-2 text-center",
              "font-mono text-sm tracking-wider",
              "border border-border/50"
            )}
          >
            {code}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => void handleCopyAll()}
          aria-label={copied ? "Codes copied to clipboard" : "Copy all recovery codes"}
        >
          {copied ? (
            <>
              <CheckIcon className="mr-2 text-emerald-600" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="mr-2" />
              Copy all
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleDownload}
          aria-label="Download recovery codes as text file"
        >
          <DownloadIcon className="mr-2" />
          Download .txt
        </Button>
      </div>
    </div>
  );
};

export { RecoveryCodes };
