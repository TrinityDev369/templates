"use client";

import React from "react";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";
import type { WizardStepConfig } from "./types";

/* ------------------------------------------------------------------ */
/*  Shared Field Components                                            */
/* ------------------------------------------------------------------ */

/**
 * Generic text input field wired to react-hook-form.
 * Displays validation errors inline.
 */
function Field({
  form,
  name,
  label,
  type = "text",
  placeholder,
}: {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  const error = form.formState.errors[name];

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...form.register(name)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-zinc-800
          text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-zinc-300 dark:border-zinc-600"
          }
        `}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="text-xs text-red-500 dark:text-red-400"
          role="alert"
        >
          {error.message as string}
        </p>
      )}
    </div>
  );
}

/**
 * Select dropdown field wired to react-hook-form.
 */
function SelectField({
  form,
  name,
  label,
  options,
}: {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  const error = form.formState.errors[name];

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <select
        id={name}
        {...form.register(name)}
        aria-invalid={!!error}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-zinc-800
          text-zinc-900 dark:text-zinc-100
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-zinc-300 dark:border-zinc-600"
          }
        `}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`${name}-error`}
          className="text-xs text-red-500 dark:text-red-400"
          role="alert"
        >
          {error.message as string}
        </p>
      )}
    </div>
  );
}

/**
 * Checkbox field wired to react-hook-form.
 */
function CheckboxField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<any>;
  name: string;
  label: string;
}) {
  const error = form.formState.errors[name];

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...form.register(name)}
          aria-invalid={!!error}
          className="
            h-4 w-4 rounded border-zinc-300 dark:border-zinc-600
            text-blue-600 focus:ring-blue-500
          "
        />
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      </label>
      {error && (
        <p
          id={`${name}-error`}
          className="text-xs text-red-500 dark:text-red-400"
          role="alert"
        >
          {error.message as string}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Example Step Definitions                                           */
/* ================================================================== */

/* ---- Step 1: Personal Info ---- */

const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const personalInfoStep: WizardStepConfig<typeof personalInfoSchema> = {
  id: "personal-info",
  label: "Personal Info",
  description: "Tell us a bit about yourself.",
  schema: personalInfoSchema,
  defaultValues: { firstName: "", lastName: "", email: "" },
  render: (form) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          form={form}
          name="firstName"
          label="First Name"
          placeholder="Jane"
        />
        <Field
          form={form}
          name="lastName"
          label="Last Name"
          placeholder="Doe"
        />
      </div>
      <Field
        form={form}
        name="email"
        label="Email"
        type="email"
        placeholder="jane@example.com"
      />
    </>
  ),
};

/* ---- Step 2: Preferences ---- */

const preferencesSchema = z.object({
  role: z.string().min(1, "Please select a role"),
  experience: z.string().min(1, "Please select your experience level"),
  newsletter: z.boolean().optional(),
});

export const preferencesStep: WizardStepConfig<typeof preferencesSchema> = {
  id: "preferences",
  label: "Preferences",
  description: "Customize your experience.",
  schema: preferencesSchema,
  optional: true,
  defaultValues: { role: "", experience: "", newsletter: false },
  render: (form) => (
    <>
      <SelectField
        form={form}
        name="role"
        label="Role"
        options={[
          { value: "developer", label: "Developer" },
          { value: "designer", label: "Designer" },
          { value: "manager", label: "Product Manager" },
          { value: "other", label: "Other" },
        ]}
      />
      <SelectField
        form={form}
        name="experience"
        label="Experience Level"
        options={[
          { value: "junior", label: "Junior (0-2 years)" },
          { value: "mid", label: "Mid-Level (3-5 years)" },
          { value: "senior", label: "Senior (6+ years)" },
        ]}
      />
      <CheckboxField
        form={form}
        name="newsletter"
        label="Subscribe to our newsletter"
      />
    </>
  ),
};

/* ---- Step 3: Confirmation ---- */

const confirmationSchema = z.object({
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms to continue" }),
  }),
});

export const confirmationStep: WizardStepConfig<typeof confirmationSchema> = {
  id: "confirmation",
  label: "Confirm",
  description: "Review and accept the terms.",
  schema: confirmationSchema,
  defaultValues: { termsAccepted: false as unknown as true },
  render: (form) => (
    <div className="space-y-4">
      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        <p>
          By submitting this form you confirm that the information provided is
          accurate. We will process your data in accordance with our privacy
          policy.
        </p>
      </div>
      <CheckboxField
        form={form}
        name="termsAccepted"
        label="I accept the terms and conditions"
      />
    </div>
  ),
};

/* ------------------------------------------------------------------ */
/*  Assembled example steps array                                      */
/* ------------------------------------------------------------------ */

/**
 * Ready-to-use example steps array.
 *
 * @example
 * ```tsx
 * import { Wizard } from "./wizard";
 * import { exampleSteps } from "./example-steps";
 *
 * function App() {
 *   return (
 *     <Wizard
 *       steps={exampleSteps}
 *       onComplete={(data) => console.log("Wizard complete:", data)}
 *     />
 *   );
 * }
 * ```
 */
export const exampleSteps: WizardStepConfig[] = [
  personalInfoStep,
  preferencesStep,
  confirmationStep,
];
