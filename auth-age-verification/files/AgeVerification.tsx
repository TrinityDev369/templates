"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgeVerificationProps {
  /** Minimum age required to pass verification (default: 18) */
  minimumAge?: number;
  /** Called when the user meets the minimum age requirement */
  onVerified: () => void;
  /** Called when the user does NOT meet the minimum age requirement */
  onDenied: () => void;
  /** Heading displayed at the top of the card (default: "Age Verification") */
  title?: string;
  /** Explanatory message shown below the title */
  message?: string;
  /** Additional CSS classes applied to the outermost wrapper */
  className?: string;
  /**
   * Number of days to remember a successful verification in localStorage.
   * Set to 0 to disable persistence. (default: 30)
   */
  rememberDays?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "age-verification";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const MIN_YEAR = 1900;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the number of days in a given month (1-indexed) for a given year. */
function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/** Calculates exact completed years between `birthDate` and today. */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

/** Reads stored verification from localStorage. Returns `true` if still valid. */
function isAlreadyVerified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data: { expiresAt: string } = JSON.parse(raw);
    return new Date(data.expiresAt).getTime() > Date.now();
  } catch {
    return false;
  }
}

/** Persists a successful verification for `days` days. */
function rememberVerification(days: number): void {
  if (typeof window === "undefined" || days <= 0) return;
  try {
    const expiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiresAt }));
  } catch {
    // localStorage may be unavailable (private browsing, quota, etc.)
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type VerificationStatus = "idle" | "verified" | "denied";

export function AgeVerification({
  minimumAge = 18,
  onVerified,
  onDenied,
  title = "Age Verification",
  message,
  className,
  rememberDays = 30,
}: AgeVerificationProps) {
  // ---- state ----
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<VerificationStatus>("idle");

  // ---- refs for auto-focus ----
  const dayRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // ---- check localStorage on mount ----
  useEffect(() => {
    if (rememberDays > 0 && isAlreadyVerified()) {
      setStatus("verified");
      onVerified();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- derived values ----
  const currentYear = new Date().getFullYear();
  const parsedYear = year ? parseInt(year, 10) : currentYear;
  const parsedMonth = month ? parseInt(month, 10) : 1;
  const maxDays = daysInMonth(parsedMonth, parsedYear);

  // Build day options (1..maxDays)
  const dayOptions: number[] = [];
  for (let d = 1; d <= maxDays; d++) {
    dayOptions.push(d);
  }

  // ---- handlers ----
  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMonth(e.target.value);
      setError("");
      if (e.target.value) {
        dayRef.current?.focus();
      }
    },
    [],
  );

  const handleDayChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setDay(e.target.value);
      setError("");
      if (e.target.value) {
        yearRef.current?.focus();
      }
    },
    [],
  );

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only digits, max 4 chars
      const value = e.target.value.replace(/\D/g, "").slice(0, 4);
      setYear(value);
      setError("");
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // ---- validation ----
      if (!month || !day || !year) {
        setError("Please fill in all fields.");
        return;
      }

      const m = parseInt(month, 10);
      const d = parseInt(day, 10);
      const y = parseInt(year, 10);

      if (y < MIN_YEAR || y > currentYear) {
        setError(`Please enter a year between ${MIN_YEAR} and ${currentYear}.`);
        return;
      }

      const maxD = daysInMonth(m, y);
      if (d < 1 || d > maxD) {
        setError("The selected day is not valid for the chosen month/year.");
        return;
      }

      const birthDate = new Date(y, m - 1, d);

      // Guard against future dates
      if (birthDate.getTime() > Date.now()) {
        setError("Date of birth cannot be in the future.");
        return;
      }

      const age = calculateAge(birthDate);

      if (age >= minimumAge) {
        setStatus("verified");
        rememberVerification(rememberDays);
        onVerified();
      } else {
        setStatus("denied");
        onDenied();
      }
    },
    [month, day, year, currentYear, minimumAge, rememberDays, onVerified, onDenied],
  );

  // ---- shared input classes ----
  const selectClasses =
    "w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

  const inputClasses =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

  // ---- render ----

  // If already verified (from localStorage), render nothing
  if (status === "verified") {
    return null;
  }

  return (
    <div
      className={[
        "flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg
              className="h-7 w-7 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {message ??
              `You must be at least ${minimumAge} years old to continue.`}
          </p>
        </div>

        {/* Denied state */}
        {status === "denied" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Sorry, you do not meet the minimum age requirement of{" "}
              {minimumAge} years.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Date of Birth
              </legend>

              <div className="grid grid-cols-3 gap-3">
                {/* Month */}
                <div>
                  <label
                    htmlFor="av-month"
                    className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Month
                  </label>
                  <select
                    id="av-month"
                    value={month}
                    onChange={handleMonthChange}
                    className={selectClasses}
                    aria-label="Month"
                  >
                    <option value="" disabled>
                      MM
                    </option>
                    {MONTHS.map((name, idx) => (
                      <option key={name} value={String(idx + 1)}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day */}
                <div>
                  <label
                    htmlFor="av-day"
                    className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Day
                  </label>
                  <select
                    id="av-day"
                    ref={dayRef}
                    value={day}
                    onChange={handleDayChange}
                    className={selectClasses}
                    aria-label="Day"
                  >
                    <option value="" disabled>
                      DD
                    </option>
                    {dayOptions.map((d) => (
                      <option key={d} value={String(d)}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label
                    htmlFor="av-year"
                    className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Year
                  </label>
                  <input
                    id="av-year"
                    ref={yearRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="YYYY"
                    maxLength={4}
                    value={year}
                    onChange={handleYearChange}
                    className={inputClasses}
                    aria-label="Year"
                  />
                </div>
              </div>
            </fieldset>

            {/* Error message */}
            {error && (
              <p
                className="mt-3 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-neutral-900"
            >
              Verify Age
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AgeVerification;
