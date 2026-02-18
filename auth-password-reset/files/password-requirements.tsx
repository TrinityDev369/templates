"use client";

import { type FC, useMemo } from "react";

/* ── Types ───────────────────────────────────────────────── */

interface PasswordRequirementsProps {
  /** The current password value to validate in real-time. */
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

/* ── Icons ───────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────── */

/**
 * Displays a real-time checklist of password strength requirements.
 *
 * Each requirement shows a green check when met or a gray X when unmet.
 * Updates immediately as the user types.
 */
const PasswordRequirements: FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements: Requirement[] = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /\d/.test(password) },
    ],
    [password]
  );

  return (
    <ul className="space-y-1.5 text-sm" aria-label="Password requirements">
      {requirements.map((req) => (
        <li
          key={req.label}
          className={[
            "flex items-center gap-2 transition-colors duration-200",
            req.met ? "text-emerald-600" : "text-muted-foreground",
          ].join(" ")}
          aria-label={`${req.label}: ${req.met ? "met" : "not met"}`}
        >
          <span className="flex-shrink-0">
            {req.met ? <CheckIcon /> : <XIcon />}
          </span>
          <span>{req.label}</span>
        </li>
      ))}
    </ul>
  );
};

export { PasswordRequirements };
export type { PasswordRequirementsProps };
