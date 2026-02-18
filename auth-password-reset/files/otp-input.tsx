"use client";

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type FC,
  useCallback,
  useEffect,
  useRef,
} from "react";

/* ── Types ───────────────────────────────────────────────── */

interface OtpInputProps {
  /** Current OTP value (up to 6 digits). */
  value: string;
  /** Called whenever the OTP value changes. */
  onChange: (value: string) => void;
  /** Number of digit boxes. Defaults to 6. */
  length?: number;
  /** Whether the entire input group is disabled. */
  disabled?: boolean;
  /** Auto-focus the first box on mount. Defaults to true. */
  autoFocus?: boolean;
}

/* ── Helpers ─────────────────────────────────────────────── */

/** Keep only digit characters and trim to max length. */
function sanitize(raw: string, maxLength: number): string {
  return raw.replace(/\D/g, "").slice(0, maxLength);
}

/* ── Component ───────────────────────────────────────────── */

/**
 * A row of individual digit input boxes for OTP / verification code entry.
 *
 * Features:
 * - Auto-advance on digit entry
 * - Backspace returns to previous box
 * - Full paste support (paste 6 digits fills all boxes)
 * - Keyboard accessible with arrow-key navigation
 */
const OtpInput: FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Auto-focus first box on mount ──────────────────── */

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  /* ── Derive per-box values from the string ─────────── */

  const digits = value.split("");

  /* ── Handlers ──────────────────────────────────────── */

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

      // Build new value array
      const next = value.split("");
      next[index] = digit;
      // Fill gaps with empty strings so .join works predictably
      for (let i = 0; i < length; i++) {
        if (next[i] === undefined) next[i] = "";
      }
      onChange(next.join(""));

      // Advance to next box
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
            // Clear current box
            next[index] = "";
            onChange(next.join(""));
          } else if (index > 0) {
            // Move to previous box and clear it
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

      // Focus the box after the last pasted digit (or the last box)
      const target = Math.min(pasted.length, length - 1);
      focusBox(target);
    },
    [onChange, length, focusBox]
  );

  /* ── Render ────────────────────────────────────────── */

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
          className={[
            "w-12 h-12 text-center text-lg font-mono",
            "border rounded-md bg-background",
            "outline-none transition-all duration-150",
            "focus:ring-2 focus:ring-ring focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        />
      ))}
    </div>
  );
};

export { OtpInput };
export type { OtpInputProps };
