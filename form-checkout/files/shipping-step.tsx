"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingSchema } from "./types";
import type { ShippingData, ShippingStepProps } from "./types";

/**
 * Step 1 -- Shipping information.
 * Collects name, email, phone, and full address with Zod validation.
 */
export function ShippingStep({ defaultValues, onNext }: ShippingStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <h2 className="text-lg font-semibold text-slate-900">
        Shipping Information
      </h2>

      {/* Name row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          error={errors.firstName?.message}
          {...register("firstName")}
          autoComplete="given-name"
        />
        <Field
          label="Last name"
          error={errors.lastName?.message}
          {...register("lastName")}
          autoComplete="family-name"
        />
      </div>

      {/* Contact row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
          autoComplete="email"
        />
        <Field
          label="Phone (optional)"
          type="tel"
          error={errors.phone?.message}
          {...register("phone")}
          autoComplete="tel"
        />
      </div>

      {/* Address */}
      <Field
        label="Street address"
        error={errors.address?.message}
        {...register("address")}
        autoComplete="address-line1"
      />
      <Field
        label="Apartment, suite, etc. (optional)"
        error={errors.apartment?.message}
        {...register("apartment")}
        autoComplete="address-line2"
      />

      {/* City / State / Zip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field
          label="City"
          error={errors.city?.message}
          {...register("city")}
          autoComplete="address-level2"
        />
        <Field
          label="State / Province"
          error={errors.state?.message}
          {...register("state")}
          autoComplete="address-level1"
        />
        <Field
          label="ZIP / Postal code"
          error={errors.zipCode?.message}
          {...register("zipCode")}
          autoComplete="postal-code"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Country */}
      <Field
        label="Country"
        error={errors.country?.message}
        {...register("country")}
        autoComplete="country-name"
      />

      {/* Navigation */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Continue to Payment
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Internal Field helper (keeps the step file self-contained)
// ---------------------------------------------------------------------------

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, className = "", ...rest }, ref) => {
    const id = rest.name ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={className}>
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            block w-full rounded-lg border px-3 py-2 text-sm text-slate-900
            placeholder:text-slate-400 transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-300"
                : "border-slate-300 focus:border-slate-500 focus:ring-slate-300"
            }
          `}
          {...rest}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Field.displayName = "Field";
