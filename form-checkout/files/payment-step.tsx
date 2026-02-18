"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema } from "./types";
import type { PaymentData, PaymentStepProps } from "./types";

/**
 * Step 2 -- Payment details.
 * Collects cardholder name, card number, expiry, and CVV.
 * Visual-only -- no real payment processing.
 */
export function PaymentStep({ defaultValues, onNext, onBack }: PaymentStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <h2 className="text-lg font-semibold text-slate-900">
        Payment Details
      </h2>

      {/* Card visual */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5">
        {/* Card icon */}
        <div className="mb-4 flex items-center gap-2 text-slate-400">
          <svg
            className="h-8 w-12"
            viewBox="0 0 48 32"
            fill="none"
            aria-hidden="true"
          >
            <rect width="48" height="32" rx="4" fill="currentColor" opacity="0.15" />
            <rect x="4" y="10" width="12" height="9" rx="1.5" fill="currentColor" opacity="0.4" />
            <rect x="4" y="24" width="20" height="2" rx="1" fill="currentColor" opacity="0.25" />
            <rect x="28" y="24" width="8" height="2" rx="1" fill="currentColor" opacity="0.25" />
          </svg>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Secure payment
          </span>
        </div>

        {/* Cardholder name */}
        <Field
          label="Cardholder name"
          error={errors.cardholderName?.message}
          placeholder="Name on card"
          {...register("cardholderName")}
          autoComplete="cc-name"
        />

        {/* Card number */}
        <div className="mt-4">
          <Field
            label="Card number"
            error={errors.cardNumber?.message}
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            {...register("cardNumber")}
            autoComplete="cc-number"
          />
        </div>

        {/* Expiry + CVV */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field
            label="Expiry date"
            error={errors.expiryDate?.message}
            placeholder="MM/YY"
            {...register("expiryDate")}
            autoComplete="cc-exp"
          />
          <Field
            label="CVV"
            error={errors.cvv?.message}
            placeholder="123"
            inputMode="numeric"
            maxLength={4}
            {...register("cvv")}
            autoComplete="cc-csc"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Review Order
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
// Internal Field helper
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
