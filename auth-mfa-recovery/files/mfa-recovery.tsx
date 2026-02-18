"use client";

import * as React from "react";
import {
  Copy,
  Download,
  Printer,
  RefreshCw,
  Check,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { MfaRecoveryProps } from "./mfa-recovery.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Copies text to the clipboard with a fallback for older environments.
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

/**
 * Creates a downloadable text file containing the recovery codes.
 */
function downloadCodesAsFile(codes: string[]): void {
  const header = "# MFA Recovery Codes\n";
  const warning =
    "# Store these codes in a safe place.\n# Each code can only be used once.\n\n";
  const content = header + warning + codes.join("\n") + "\n";

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mfa-recovery-codes.txt";
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Opens the browser print dialog with only the recovery codes visible.
 */
function printCodes(codes: string[]): void {
  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>MFA Recovery Codes</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 2rem;
            color: #111;
          }
          h1 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
          }
          p {
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 1.5rem;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
          }
          .code {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
            font-size: 0.875rem;
            text-align: center;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 0.375rem;
            letter-spacing: 0.05em;
          }
        </style>
      </head>
      <body>
        <h1>MFA Recovery Codes</h1>
        <p>Store these codes in a safe place. Each code can only be used once.</p>
        <div class="grid">
          ${codes.map((code) => `<div class="code">${code}</div>`).join("")}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.addEventListener("afterprint", () => printWindow.close());
  printWindow.print();
}

// ---------------------------------------------------------------------------
// RegenerateDialog
// ---------------------------------------------------------------------------

interface RegenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isRegenerating: boolean;
}

function RegenerateDialog({
  open,
  onOpenChange,
  onConfirm,
  isRegenerating,
}: RegenerateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            Regenerate Recovery Codes
          </DialogTitle>
          <DialogDescription>
            This will invalidate all existing recovery codes. Any codes you have
            saved will no longer work. Are you sure you want to continue?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRegenerating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={isRegenerating}
            aria-disabled={isRegenerating}
          >
            {isRegenerating ? (
              <>
                <RefreshCw
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                <span className="ml-1.5">Regenerating...</span>
              </>
            ) : (
              "Regenerate Codes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// CodesGrid — recovery code display grid
// ---------------------------------------------------------------------------

interface CodesGridProps {
  codes: string[];
}

function CodesGrid({ codes }: CodesGridProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      role="list"
      aria-label="Recovery codes"
    >
      {codes.map((code, index) => (
        <div
          key={index}
          role="listitem"
          className="rounded-md border border-border/50 bg-muted/50 px-3 py-2 text-center font-mono text-sm tracking-wider"
        >
          {code}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Displays MFA recovery codes in a grid with actions for copying, downloading,
 * printing, and regenerating codes.
 *
 * Typically shown after completing two-factor authentication setup. The user
 * should save these one-time codes in a secure location as a backup method
 * for account recovery.
 *
 * @example
 * ```tsx
 * <MfaRecovery
 *   codes={["ABCD-1234", "EFGH-5678", "IJKL-9012", ...]}
 *   onRegenerate={async () => {
 *     const res = await fetch("/api/mfa/regenerate", { method: "POST" });
 *     return res.json();
 *   }}
 *   onDone={() => router.push("/settings")}
 * />
 * ```
 */
export function MfaRecovery({
  codes: initialCodes,
  onRegenerate,
  onDone,
  showRegenerateWarning = true,
}: MfaRecoveryProps) {
  const [codes, setCodes] = React.useState<string[]>(initialCodes);
  const [copied, setCopied] = React.useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [regenerated, setRegenerated] = React.useState(false);

  // Sync codes when prop changes externally
  React.useEffect(() => {
    setCodes(initialCodes);
  }, [initialCodes]);

  const codesText = codes.join("\n");

  const handleCopyAll = React.useCallback(async () => {
    await copyToClipboard(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codesText]);

  const handleDownload = React.useCallback(() => {
    downloadCodesAsFile(codes);
  }, [codes]);

  const handlePrint = React.useCallback(() => {
    printCodes(codes);
  }, [codes]);

  async function handleRegenerateConfirm() {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      const newCodes = await onRegenerate();
      setCodes(newCodes);
      setRegenerated(true);
      setRegenerateDialogOpen(false);
      // Reset the success message after a few seconds
      setTimeout(() => setRegenerated(false), 4000);
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recovery Codes
          </CardTitle>
          <CardDescription>
            Use these codes to access your account if you lose your
            authenticator device.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Warning banner */}
          <div
            role="alert"
            className="rounded-md border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-200"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                <strong>Save these codes in a safe place.</strong> Each code can
                only be used once. If you lose access to your authenticator, you
                can use one of these codes to sign in.
              </p>
            </div>
          </div>

          {/* Regeneration success message */}
          {regenerated && (
            <div
              role="status"
              className="rounded-md border border-emerald-500/50 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <Check
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <p>
                  Recovery codes regenerated successfully. Your old codes are no
                  longer valid.
                </p>
              </div>
            </div>
          )}

          {/* Codes grid */}
          <CodesGrid codes={codes} />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopyAll()}
              aria-label={
                copied
                  ? "Codes copied to clipboard"
                  : "Copy all recovery codes"
              }
            >
              {copied ? (
                <>
                  <Check
                    className="mr-1.5 h-3.5 w-3.5 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Copy All
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              aria-label="Download recovery codes as text file"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Download
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              aria-label="Print recovery codes"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Print
            </Button>

            {onRegenerate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRegenerateDialogOpen(true)}
                aria-label="Regenerate recovery codes"
              >
                <RefreshCw
                  className="mr-1.5 h-3.5 w-3.5"
                  aria-hidden="true"
                />
                Regenerate
              </Button>
            )}
          </div>
        </CardContent>

        {onDone && (
          <CardFooter className="justify-end border-t pt-4">
            <Button type="button" onClick={onDone}>
              Done
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Regenerate confirmation dialog */}
      {onRegenerate && (
        <RegenerateDialog
          open={regenerateDialogOpen}
          onOpenChange={setRegenerateDialogOpen}
          onConfirm={handleRegenerateConfirm}
          isRegenerating={isRegenerating}
        />
      )}
    </>
  );
}

// Re-export types for consumer convenience
export type { MfaRecoveryProps } from "./mfa-recovery.types";
