import { z } from "zod";

// ---------------------------------------------------------------------------
// Permission enum
// ---------------------------------------------------------------------------

export const permissionEnum = z.enum(["read", "write", "delete", "admin"]);

export type Permission = z.infer<typeof permissionEnum>;

// ---------------------------------------------------------------------------
// Create key schema
// ---------------------------------------------------------------------------

export const createKeySchema = z.object({
  name: z
    .string()
    .min(1, "Key name is required")
    .max(50, "Key name must be 50 characters or fewer"),
  permissions: z
    .array(permissionEnum)
    .min(1, "Select at least one permission"),
  expiresIn: z
    .enum(["30d", "90d", "1y", "never"])
    .optional(),
});

export type CreateKeyFormData = z.infer<typeof createKeySchema>;

// ---------------------------------------------------------------------------
// API key interface
// ---------------------------------------------------------------------------

export interface ApiKey {
  /** Unique identifier for the API key. */
  id: string;

  /** Human-readable name for this key. */
  name: string;

  /** Masked key prefix shown in the UI, e.g. "sk_live_...a3f2". */
  keyPrefix: string;

  /** Scoped permissions assigned to this key. */
  permissions: Permission[];

  /** ISO timestamp of when the key was created. */
  createdAt: string;

  /** ISO timestamp of when the key expires, or null for non-expiring keys. */
  expiresAt: string | null;

  /** ISO timestamp of when the key was last used, or null if never used. */
  lastUsedAt: string | null;

  /** Current status of the key. */
  status: "active" | "revoked" | "expired";
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface ApiKeyManagerProps {
  /** List of API keys to display. */
  apiKeys: ApiKey[];

  /**
   * Called when the user creates a new API key.
   * Should return the full key string (shown once to the user).
   */
  onCreateKey: (data: CreateKeyFormData) => Promise<string>;

  /**
   * Called when the user confirms revoking a key.
   * Should resolve when the server has acknowledged the revocation.
   */
  onRevokeKey: (keyId: string) => Promise<void>;

  /**
   * Called when the user rotates a key.
   * Should return the new full key string (shown once to the user).
   * If not provided, the rotate button is hidden.
   */
  onRotateKey?: (keyId: string) => Promise<string>;

  /**
   * Available permissions for new keys.
   * Defaults to all four: read, write, delete, admin.
   */
  availablePermissions?: Permission[];
}
