"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Key,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Loader2,
  AlertTriangle,
  Clock,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  createKeySchema,
  type ApiKey,
  type ApiKeyManagerProps,
  type CreateKeyFormData,
  type Permission,
} from "./api-key-manager.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_PERMISSIONS: Permission[] = ["read", "write", "delete", "admin"];

const PERMISSION_COLORS: Record<Permission, string> = {
  read: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  write: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  delete: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  admin: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const PERMISSION_LABELS: Record<Permission, string> = {
  read: "Read",
  write: "Write",
  delete: "Delete",
  admin: "Admin",
};

const STATUS_STYLES: Record<ApiKey["status"], string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  revoked: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  expired: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const EXPIRATION_OPTIONS = [
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "never", label: "Never" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a Date or ISO string into a human-readable relative time string.
 * Falls back to `toLocaleDateString` for anything older than 4 weeks.
 */
function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = date instanceof Date ? date.getTime() : new Date(date).getTime();

  if (Number.isNaN(then)) {
    return "Unknown";
  }

  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  if (diffWeek <= 4) return `${diffWeek} week${diffWeek === 1 ? "" : "s"} ago`;

  return new Date(then).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

// ---------------------------------------------------------------------------
// CopyButton — reusable copy-with-feedback button
// ---------------------------------------------------------------------------

function CopyButton({
  text,
  label = "Copy",
  size = "sm",
}: {
  text: string;
  label?: string;
  size?: "sm" | "icon";
}) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={() => void handleCopy()}
      aria-label={copied ? "Copied!" : label}
      className="shrink-0"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          {size !== "icon" && <span className="ml-1.5 text-emerald-600">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {size !== "icon" && <span className="ml-1.5">{label}</span>}
        </>
      )}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <Key className="mb-3 h-10 w-10 opacity-50" aria-hidden="true" />
      <p className="text-sm font-medium">No API keys</p>
      <p className="mt-1 text-xs">
        Create your first API key to get started.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NewKeyDisplay — shown once after creation/rotation
// ---------------------------------------------------------------------------

interface NewKeyDisplayProps {
  fullKey: string;
  onDone: () => void;
}

function NewKeyDisplay({ fullKey, onDone }: NewKeyDisplayProps) {
  return (
    <div className="space-y-4">
      <div
        role="alert"
        className="rounded-md border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-200"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <strong>This key will only be shown once.</strong> Copy it now and
            store it in a secure location.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-md border bg-muted/50 px-3 py-2 font-mono text-sm break-all select-all">
          {fullKey}
        </code>
        <CopyButton text={fullKey} label="Copy key" />
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CreateKeyDialog
// ---------------------------------------------------------------------------

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePermissions: Permission[];
  onCreateKey: (data: CreateKeyFormData) => Promise<string>;
}

function CreateKeyDialog({
  open,
  onOpenChange,
  availablePermissions,
  onCreateKey,
}: CreateKeyDialogProps) {
  const [newKey, setNewKey] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<CreateKeyFormData>({
    resolver: zodResolver(createKeySchema),
    defaultValues: {
      name: "",
      permissions: [],
      expiresIn: "90d",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  function handleClose() {
    setNewKey(null);
    setFormError(null);
    form.reset();
    onOpenChange(false);
  }

  async function handleSubmit(data: CreateKeyFormData) {
    setFormError(null);
    try {
      const key = await onCreateKey(data);
      setNewKey(key);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create API key. Please try again.";
      setFormError(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) handleClose(); else onOpenChange(value); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {newKey ? "API Key Created" : "Create API Key"}
          </DialogTitle>
          <DialogDescription>
            {newKey
              ? "Your new API key has been generated."
              : "Give your key a name and select the permissions it needs."}
          </DialogDescription>
        </DialogHeader>

        {newKey ? (
          <NewKeyDisplay fullKey={newKey} onDone={handleClose} />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Form-level error */}
              {formError && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {formError}
                </div>
              )}

              {/* Key name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Production Backend"
                        autoComplete="off"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permissions checkboxes */}
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {availablePermissions.map((perm) => (
                        <FormField
                          key={perm}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(perm)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    if (checked) {
                                      field.onChange([...current, perm]);
                                    } else {
                                      field.onChange(
                                        current.filter((p) => p !== perm)
                                      );
                                    }
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <Label className="text-sm font-normal cursor-pointer select-none">
                                {PERMISSION_LABELS[perm]}
                              </Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration select */}
              <FormField
                control={form.control}
                name="expiresIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value ?? "90d"}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        {EXPIRATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  aria-disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span className="ml-1.5">Creating...</span>
                    </>
                  ) : (
                    "Create Key"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// RevokeDialog
// ---------------------------------------------------------------------------

interface RevokeDialogProps {
  apiKey: ApiKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

function RevokeDialog({
  apiKey,
  open,
  onOpenChange,
  onConfirm,
}: RevokeDialogProps) {
  const [isRevoking, setIsRevoking] = React.useState(false);

  async function handleConfirm() {
    setIsRevoking(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            Revoke API Key
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke this key? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {apiKey && (
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-sm font-medium">{apiKey.name}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {apiKey.keyPrefix}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRevoking}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={isRevoking}
            aria-disabled={isRevoking}
          >
            {isRevoking ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                <span className="ml-1.5">Revoking...</span>
              </>
            ) : (
              "Revoke Key"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// RotateKeyDisplay — shown after rotation
// ---------------------------------------------------------------------------

interface RotateKeyDisplayProps {
  fullKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RotateKeyDisplay({
  fullKey,
  open,
  onOpenChange,
}: RotateKeyDisplayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Key Rotated</DialogTitle>
          <DialogDescription>
            Your API key has been rotated. The old key is no longer valid.
          </DialogDescription>
        </DialogHeader>
        <NewKeyDisplay fullKey={fullKey} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// KeyRow — single API key entry
// ---------------------------------------------------------------------------

interface KeyRowProps {
  apiKey: ApiKey;
  onRevoke: (key: ApiKey) => void;
  onRotate?: (key: ApiKey) => void;
  isRotating: boolean;
}

function KeyRow({ apiKey, onRevoke, onRotate, isRotating }: KeyRowProps) {
  const isActive = apiKey.status === "active";

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4">
      {/* Key icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Key className="h-5 w-5" aria-hidden="true" />
      </div>

      {/* Key details */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium leading-none">{apiKey.name}</p>
          <Badge
            variant="secondary"
            className={STATUS_STYLES[apiKey.status]}
          >
            {apiKey.status}
          </Badge>
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          {apiKey.keyPrefix}
        </p>

        {/* Permission badges */}
        <div className="flex flex-wrap gap-1">
          {apiKey.permissions.map((perm) => (
            <span
              key={perm}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${PERMISSION_COLORS[perm]}`}
            >
              {PERMISSION_LABELS[perm]}
            </span>
          ))}
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Created{" "}
            <time dateTime={apiKey.createdAt}>
              {formatRelativeTime(apiKey.createdAt)}
            </time>
          </span>
          {apiKey.lastUsedAt && (
            <span>
              Last used{" "}
              <time dateTime={apiKey.lastUsedAt}>
                {formatRelativeTime(apiKey.lastUsedAt)}
              </time>
            </span>
          )}
          {apiKey.expiresAt && (
            <span>
              Expires{" "}
              <time dateTime={apiKey.expiresAt}>
                {formatRelativeTime(apiKey.expiresAt)}
              </time>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 sm:ml-auto">
        <CopyButton text={apiKey.keyPrefix} label="Copy key prefix" size="icon" />

        {isActive && onRotate && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRotate(apiKey)}
            disabled={isRotating}
            aria-label={`Rotate key ${apiKey.name}`}
          >
            {isRotating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        )}

        {isActive && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRevoke(apiKey)}
            aria-label={`Revoke key ${apiKey.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ApiKeyManager({
  apiKeys,
  onCreateKey,
  onRevokeKey,
  onRotateKey,
  availablePermissions = ALL_PERMISSIONS,
}: ApiKeyManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [revokeTarget, setRevokeTarget] = React.useState<ApiKey | null>(null);
  const [rotatingKeyId, setRotatingKeyId] = React.useState<string | null>(null);
  const [rotatedKey, setRotatedKey] = React.useState<string | null>(null);

  // Sort keys: active first, then by createdAt descending
  const sortedKeys = React.useMemo(() => {
    return [...apiKeys].sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [apiKeys]);

  async function handleRevokeConfirm() {
    if (!revokeTarget) return;
    await onRevokeKey(revokeTarget.id);
    setRevokeTarget(null);
  }

  async function handleRotate(apiKey: ApiKey) {
    if (!onRotateKey) return;
    setRotatingKeyId(apiKey.id);
    try {
      const newKey = await onRotateKey(apiKey.id);
      setRotatedKey(newKey);
    } finally {
      setRotatingKeyId(null);
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-5 w-5" aria-hidden="true" />
                API Keys
              </CardTitle>
              <CardDescription className="mt-1">
                Manage your API keys for programmatic access.{" "}
                {apiKeys.length > 0 && (
                  <span className="text-muted-foreground">
                    {apiKeys.filter((k) => k.status === "active").length} active{" "}
                    {apiKeys.filter((k) => k.status === "active").length === 1
                      ? "key"
                      : "keys"}
                  </span>
                )}
              </CardDescription>
            </div>

            <Button
              size="sm"
              className="shrink-0"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Create Key
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {apiKeys.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2" role="list" aria-label="API keys">
              {sortedKeys.map((key) => (
                <div key={key.id} role="listitem">
                  <KeyRow
                    apiKey={key}
                    onRevoke={setRevokeTarget}
                    onRotate={onRotateKey ? (k) => void handleRotate(k) : undefined}
                    isRotating={rotatingKeyId === key.id}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create key dialog */}
      <CreateKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        availablePermissions={availablePermissions}
        onCreateKey={onCreateKey}
      />

      {/* Revoke confirmation dialog */}
      <RevokeDialog
        apiKey={revokeTarget}
        open={revokeTarget !== null}
        onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}
        onConfirm={handleRevokeConfirm}
      />

      {/* Rotated key display dialog */}
      <RotateKeyDisplay
        fullKey={rotatedKey ?? ""}
        open={rotatedKey !== null}
        onOpenChange={(open) => { if (!open) setRotatedKey(null); }}
      />
    </>
  );
}

// Re-export types for consumer convenience
export { createKeySchema } from "./api-key-manager.types";
export type {
  ApiKey,
  ApiKeyManagerProps,
  CreateKeyFormData,
  Permission,
} from "./api-key-manager.types";
