"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface PasswordStrengthProps {
  /** The current password value to evaluate. */
  password: string;
}

type StrengthLevel = "weak" | "fair" | "good" | "strong";

interface StrengthInfo {
  score: number;
  level: StrengthLevel;
  label: string;
  color: string;
  bgColor: string;
}

/* -------------------------------------------------------------------------- */
/*  Strength calculation                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Calculate password strength on five criteria (0-5 points):
 *  - Length >= 8 characters
 *  - Contains at least one uppercase letter
 *  - Contains at least one lowercase letter
 *  - Contains at least one digit
 *  - Contains at least one special character
 *
 * Score mapping:
 *  0-1 = Weak, 2 = Fair, 3 = Good, 4-5 = Strong
 */
function calculateStrength(password: string): StrengthInfo {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return {
      score,
      level: "weak",
      label: "Weak",
      color: "bg-red-500",
      bgColor: "bg-red-500/20",
    };
  }
  if (score === 2) {
    return {
      score,
      level: "fair",
      label: "Fair",
      color: "bg-orange-500",
      bgColor: "bg-orange-500/20",
    };
  }
  if (score === 3) {
    return {
      score,
      level: "good",
      label: "Good",
      color: "bg-yellow-500",
      bgColor: "bg-yellow-500/20",
    };
  }
  return {
    score,
    level: "strong",
    label: "Strong",
    color: "bg-green-500",
    bgColor: "bg-green-500/20",
  };
}

/** Number of segments displayed in the strength bar. */
const SEGMENT_COUNT = 4;

/**
 * Map strength levels to how many segments should be filled.
 *  weak=1, fair=2, good=3, strong=4
 */
const FILLED_SEGMENTS: Record<StrengthLevel, number> = {
  weak: 1,
  fair: 2,
  good: 3,
  strong: 4,
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * PasswordStrength renders a 4-segment colour-coded bar with a text label
 * indicating password strength. Pure presentational -- no form logic.
 *
 * @example
 * ```tsx
 * <PasswordStrength password={watchedPassword} />
 * ```
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const filledCount = FILLED_SEGMENTS[strength.level];

  if (!password) return null;

  return (
    <div className="space-y-1.5" aria-label="Password strength indicator">
      {/* Segmented bar */}
      <div className="flex gap-1" role="meter" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={5} aria-label={`Password strength: ${strength.label}`}>
        {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < filledCount ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Text label */}
      <p
        className={cn(
          "text-xs font-medium transition-colors duration-300",
          strength.level === "weak" && "text-red-500",
          strength.level === "fair" && "text-orange-500",
          strength.level === "good" && "text-yellow-500",
          strength.level === "strong" && "text-green-500"
        )}
      >
        {strength.label}
      </p>
    </div>
  );
}

export { calculateStrength };
export type { PasswordStrengthProps, StrengthLevel, StrengthInfo };
