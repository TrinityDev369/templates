"use client";

import { useState, useCallback } from "react";
import { InlineEditField } from "./inline-edit-field";
import type { InlineEditProps, SelectOption } from "./inline-edit.types";

/* ---------------------------------------------------------------------------
 * Re-exports for convenience
 * --------------------------------------------------------------------------- */

export { InlineEditField } from "./inline-edit-field";
export type {
  InlineEditProps,
  InlineEditBaseProps,
  InlineEditFieldType,
  InlineEditTextProps,
  InlineEditNumberProps,
  InlineEditTextareaProps,
  InlineEditSelectProps,
  SelectOption,
  ValidationResult,
} from "./inline-edit.types";

/* ---------------------------------------------------------------------------
 * InlineEdit — main wrapper, same API as InlineEditField.
 * This is the primary import for consumers.
 * --------------------------------------------------------------------------- */

export function InlineEdit(props: InlineEditProps) {
  return <InlineEditField {...props} />;
}

/* ---------------------------------------------------------------------------
 * InlineEditDemo — example usage showing editable profile fields.
 * Drop this into any page to see the component in action.
 * --------------------------------------------------------------------------- */

const ROLE_OPTIONS: SelectOption[] = [
  { label: "Developer", value: "developer" },
  { label: "Designer", value: "designer" },
  { label: "Product Manager", value: "pm" },
  { label: "Engineering Manager", value: "em" },
  { label: "CEO", value: "ceo" },
];

/** Simulate an async save with a 600ms delay. */
function fakeSave(field: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a random server error 10% of the time for demo purposes
      if (Math.random() < 0.1) {
        reject(new Error(`Failed to save ${field}. Please try again.`));
        return;
      }
      // eslint-disable-next-line no-console
      console.log(`[InlineEditDemo] Saved ${field}:`, value);
      resolve();
    }, 600);
  });
}

export function InlineEditDemo() {
  const [profile, setProfile] = useState({
    name: "Jane Doe",
    email: "jane@example.com",
    salary: "95000",
    bio: "Full-stack developer with a passion for clean architecture and developer tooling.",
    role: "developer",
  });

  const handleSave = useCallback(
    (field: keyof typeof profile) => async (nextValue: string) => {
      await fakeSave(field, nextValue);
      setProfile((prev) => ({ ...prev, [field]: nextValue }));
    },
    [],
  );

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Profile</h2>
        <p className="text-sm text-neutral-500">
          Click any field to edit. Changes save automatically.
        </p>
      </div>

      <div className="divide-y divide-neutral-100">
        {/* Text field */}
        <div className="py-3">
          <InlineEdit
            label="Full Name"
            value={profile.name}
            onSave={handleSave("name")}
            validate={(v) => {
              if (!v.trim()) return "Name is required";
              if (v.trim().length < 2) return "Name must be at least 2 characters";
              return true;
            }}
            placeholder="Enter your name"
          />
        </div>

        {/* Email with display formatter */}
        <div className="py-3">
          <InlineEdit
            label="Email"
            value={profile.email}
            onSave={handleSave("email")}
            validate={(v) => {
              if (!v.trim()) return "Email is required";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email address";
              return true;
            }}
            placeholder="Enter your email"
          />
        </div>

        {/* Number field with currency formatter */}
        <div className="py-3">
          <InlineEdit
            label="Salary"
            fieldType="number"
            value={profile.salary}
            onSave={handleSave("salary")}
            min={0}
            step={1000}
            formatDisplay={(v) => {
              const n = Number(v);
              if (isNaN(n)) return v;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(n);
            }}
            validate={(v) => {
              const n = Number(v);
              if (isNaN(n)) return "Must be a number";
              if (n < 0) return "Salary cannot be negative";
              return true;
            }}
          />
        </div>

        {/* Textarea field */}
        <div className="py-3">
          <InlineEdit
            label="Bio"
            fieldType="textarea"
            value={profile.bio}
            onSave={handleSave("bio")}
            rows={3}
            validate={(v) => {
              if (v.length > 280) return `Bio too long (${v.length}/280 characters)`;
              return true;
            }}
            placeholder="Tell us about yourself"
          />
        </div>

        {/* Select field */}
        <div className="py-3">
          <InlineEdit
            label="Role"
            fieldType="select"
            value={profile.role}
            onSave={handleSave("role")}
            options={ROLE_OPTIONS}
            formatDisplay={(v) => {
              const opt = ROLE_OPTIONS.find((o) => o.value === v);
              return opt?.label ?? v;
            }}
          />
        </div>
      </div>

      {/* Current state display */}
      <details className="rounded-lg bg-neutral-50 p-3">
        <summary className="cursor-pointer text-xs font-medium text-neutral-500">
          Current State (debug)
        </summary>
        <pre className="mt-2 overflow-x-auto text-xs text-neutral-700">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </details>
    </div>
  );
}
