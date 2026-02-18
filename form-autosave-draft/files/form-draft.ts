"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Envelope stored in localStorage wrapping the user's form data. */
interface DraftEnvelope<T> {
  /** The serialized form data. */
  data: T;
  /** ISO-8601 timestamp of when the draft was last saved. */
  savedAt: string;
}

/** Options accepted by {@link useFormDraft}. */
export interface UseFormDraftOptions<T> {
  /**
   * Debounce interval in milliseconds for autosave writes.
   * @default 1000
   */
  debounceMs?: number;

  /**
   * Custom localStorage key. Defaults to `form-draft-{formId}`.
   * Useful when you need multiple drafts per form (e.g. per-record editing).
   */
  storageKey?: string;

  /**
   * ISO-8601 timestamp (or epoch ms) of the most recently committed version
   * of this form's data on the server. When provided, the hook compares it
   * against the draft's `savedAt` — if the server copy is newer the draft is
   * considered **stale** and `isStale` will be `true`.
   */
  lastModified?: string | number;

  /**
   * Called whenever an autosave write succeeds.
   * Useful for showing a subtle "Draft saved" indicator in the UI.
   */
  onSave?: (data: T) => void;

  /**
   * Called when a deserialization or storage error occurs.
   * Defaults to `console.error`.
   */
  onError?: (error: unknown) => void;

  /**
   * Initial / default value to return when no draft exists.
   * If omitted, `draft` will be `null` when there is no saved draft.
   */
  defaultValue?: T;
}

/** Return value of {@link useFormDraft}. */
export interface UseFormDraftReturn<T> {
  /**
   * The most recent draft data read from storage, or `null` if no draft
   * exists (and no `defaultValue` was provided).
   */
  draft: T | null;

  /**
   * Whether a draft currently exists in storage for this form.
   */
  hasDraft: boolean;

  /**
   * Whether the saved draft is older than the server's `lastModified`
   * timestamp, indicating potential conflicts. Always `false` when
   * `lastModified` is not supplied.
   */
  isStale: boolean;

  /**
   * ISO-8601 timestamp of when the draft was last saved, or `null` if no
   * draft exists.
   */
  savedAt: string | null;

  /**
   * Persist `data` to localStorage. This is called automatically when you
   * pass data through the debounced autosave, but you can also call it
   * manually for an immediate write (e.g. on form blur).
   */
  saveDraft: (data: T) => void;

  /**
   * Schedule a debounced write. Calling this repeatedly within the debounce
   * window will reset the timer — only the last value wins.
   */
  autosave: (data: T) => void;

  /**
   * Remove the draft from localStorage and reset local state.
   */
  clearDraft: () => void;
}

// ---------------------------------------------------------------------------
// Pure utility functions (no React dependency at runtime)
// ---------------------------------------------------------------------------

/**
 * Returns `true` when `localStorage` is available and functional.
 * Handles SSR environments, sandboxed iframes, and disabled storage.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__form_draft_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Build the default storage key for a given form identifier.
 *
 * @param formId - Unique identifier for the form.
 * @returns A namespaced localStorage key.
 */
export function buildStorageKey(formId: string): string {
  return `form-draft-${formId}`;
}

/**
 * Safely read and deserialize a draft envelope from localStorage.
 *
 * @returns The parsed envelope, or `null` if nothing is stored or parsing
 *          fails.
 */
export function readDraft<T>(key: string): DraftEnvelope<T> | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "data" in parsed &&
      "savedAt" in parsed
    ) {
      return parsed as DraftEnvelope<T>;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Serialize and write a draft envelope to localStorage.
 *
 * @returns `true` on success, `false` on failure (quota exceeded, etc.).
 */
export function writeDraft<T>(key: string, data: T): boolean {
  if (!isStorageAvailable()) return false;
  try {
    const envelope: DraftEnvelope<T> = {
      data,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove a draft from localStorage.
 */
export function removeDraft(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Silently ignore — storage may be unavailable.
  }
}

/**
 * Compare a draft's `savedAt` timestamp against a reference `lastModified`
 * value to determine whether the draft is stale (i.e. the server data has
 * been updated since the draft was saved).
 *
 * @param savedAt     - ISO-8601 string from the draft envelope.
 * @param lastModified - ISO-8601 string or epoch-ms number from the server.
 * @returns `true` if the draft is older than `lastModified`.
 */
export function isDraftStale(
  savedAt: string,
  lastModified: string | number,
): boolean {
  try {
    const draftTime = new Date(savedAt).getTime();
    const serverTime =
      typeof lastModified === "number"
        ? lastModified
        : new Date(lastModified).getTime();
    if (Number.isNaN(draftTime) || Number.isNaN(serverTime)) return false;
    return draftTime < serverTime;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// React Hook
// ---------------------------------------------------------------------------

/**
 * Wraps any form state with automatic localStorage persistence, draft
 * recovery on mount, and conflict detection against a server timestamp.
 *
 * @typeParam T - The shape of your form data. Inferred from usage.
 *
 * @param formId  - Stable identifier for this form (e.g. `"contact"`,
 *                  `"invoice-${id}"`). Used to derive the storage key.
 * @param options - Optional configuration — debounce interval, custom key,
 *                  conflict detection timestamp, callbacks, etc.
 *
 * @example
 * ```tsx
 * const {
 *   draft,
 *   hasDraft,
 *   isStale,
 *   saveDraft,
 *   autosave,
 *   clearDraft,
 * } = useFormDraft<ContactForm>("contact-form", {
 *   debounceMs: 800,
 *   lastModified: serverRecord.updatedAt,
 * });
 *
 * // On mount, restore draft if available:
 * useEffect(() => {
 *   if (hasDraft && !isStale && draft) {
 *     setFormData(draft);
 *   }
 * }, []);
 *
 * // On every keystroke, schedule a debounced save:
 * const handleChange = (next: ContactForm) => {
 *   setFormData(next);
 *   autosave(next);
 * };
 * ```
 */
export function useFormDraft<T>(
  formId: string,
  options: UseFormDraftOptions<T> = {},
): UseFormDraftReturn<T> {
  const {
    debounceMs = 1000,
    storageKey,
    lastModified,
    onSave,
    onError = console.error,
    defaultValue,
  } = options;

  const key = storageKey ?? buildStorageKey(formId);

  // ---- Internal state ----
  const [envelope, setEnvelope] = useState<DraftEnvelope<T> | null>(null);
  const [initialized, setInitialized] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback refs stable across renders to avoid re-creating closures.
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // ---- Hydrate from storage on mount (SSR-safe) ----
  useEffect(() => {
    try {
      const existing = readDraft<T>(key);
      if (existing) {
        setEnvelope(existing);
      }
    } catch (err) {
      onErrorRef.current?.(err);
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ---- Cleanup debounce timer on unmount ----
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // ---- Immediate save ----
  const saveDraft = useCallback(
    (data: T) => {
      try {
        const success = writeDraft(key, data);
        if (success) {
          const updated = readDraft<T>(key);
          setEnvelope(updated);
          onSaveRef.current?.(data);
        }
      } catch (err) {
        onErrorRef.current?.(err);
      }
    },
    [key],
  );

  // ---- Debounced autosave ----
  const autosave = useCallback(
    (data: T) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        saveDraft(data);
        timerRef.current = null;
      }, debounceMs);
    },
    [debounceMs, saveDraft],
  );

  // ---- Clear draft ----
  const clearDraft = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    removeDraft(key);
    setEnvelope(null);
  }, [key]);

  // ---- Derived values ----
  const hasDraft = envelope !== null;
  const draft = envelope?.data ?? defaultValue ?? null;
  const savedAt = envelope?.savedAt ?? null;

  const isStale =
    hasDraft && savedAt !== null && lastModified !== undefined
      ? isDraftStale(savedAt, lastModified)
      : false;

  // During SSR or before hydration, return inert defaults.
  if (!initialized) {
    return {
      draft: defaultValue ?? null,
      hasDraft: false,
      isStale: false,
      savedAt: null,
      saveDraft,
      autosave,
      clearDraft,
    };
  }

  return {
    draft,
    hasDraft,
    isStale,
    savedAt,
    saveDraft,
    autosave,
    clearDraft,
  };
}
