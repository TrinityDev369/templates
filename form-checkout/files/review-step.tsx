"use client";

import React from "react";
import type { ReviewStepProps } from "./types";

/**
 * Step 3 -- Review & Confirm.
 * Displays a summary of shipping and payment info with edit links.
 */
export function ReviewStep({
  shipping,
  payment,
  onConfirm,
  onEditShipping,
  onEditPayment,
  isSubmitting,
}: ReviewStepProps) {
  /** Mask card number showing only last 4 digits. */
  const maskedCard = shipping
    ? `**** **** **** ${payment.cardNumber.replace(/\s/g, "").slice(-4)}`
    : "";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Review Your Order
      </h2>

      {/* Shipping summary */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Shipping
          </h3>
          <button
            type="button"
            onClick={onEditShipping}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 focus:outline-none focus:underline"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
          <DetailRow label="Name" value={`${shipping.firstName} ${shipping.lastName}`} />
          <DetailRow label="Email" value={shipping.email} />
          {shipping.phone && <DetailRow label="Phone" value={shipping.phone} />}
          <DetailRow
            label="Address"
            value={[
              shipping.address,
              shipping.apartment,
              `${shipping.city}, ${shipping.state} ${shipping.zipCode}`,
              shipping.country,
            ]
              .filter(Boolean)
              .join(", ")}
            className="sm:col-span-2"
          />
        </dl>
      </section>

      {/* Payment summary */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Payment
          </h3>
          <button
            type="button"
            onClick={onEditPayment}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 focus:outline-none focus:underline"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
          <DetailRow label="Cardholder" value={payment.cardholderName} />
          <DetailRow label="Card" value={maskedCard} />
          <DetailRow label="Expires" value={payment.expiryDate} />
        </dl>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onEditPayment}
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
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              Confirm Order
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal detail row helper
// ---------------------------------------------------------------------------

function DetailRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
