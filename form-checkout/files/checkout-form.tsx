"use client";

import React, { useCallback, useState } from "react";
import { StepIndicator } from "./step-indicator";
import { ShippingStep } from "./shipping-step";
import { PaymentStep } from "./payment-step";
import { ReviewStep } from "./review-step";
import { CHECKOUT_STEPS } from "./types";
import type {
  CheckoutFormProps,
  CheckoutStep,
  ShippingData,
  PaymentData,
} from "./types";

/**
 * Multi-step checkout form.
 *
 * Manages step navigation and aggregated form state across three steps:
 * 1. Shipping  2. Payment  3. Review & Confirm
 *
 * @example
 * ```tsx
 * <CheckoutForm onSubmit={(data) => console.log(data)} />
 * ```
 */
export function CheckoutForm({
  onSubmit,
  className = "",
  stepLabels = ["Shipping", "Payment", "Review"],
}: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(
    CHECKOUT_STEPS.SHIPPING
  );
  const [shippingData, setShippingData] = useState<Partial<ShippingData>>({});
  const [paymentData, setPaymentData] = useState<Partial<PaymentData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Step handlers ----

  const handleShippingNext = useCallback((data: ShippingData) => {
    setShippingData(data);
    setCurrentStep(CHECKOUT_STEPS.PAYMENT);
  }, []);

  const handlePaymentNext = useCallback((data: PaymentData) => {
    setPaymentData(data);
    setCurrentStep(CHECKOUT_STEPS.REVIEW);
  }, []);

  const handlePaymentBack = useCallback(() => {
    setCurrentStep(CHECKOUT_STEPS.SHIPPING);
  }, []);

  const handleEditShipping = useCallback(() => {
    setCurrentStep(CHECKOUT_STEPS.SHIPPING);
  }, []);

  const handleEditPayment = useCallback(() => {
    setCurrentStep(CHECKOUT_STEPS.PAYMENT);
  }, []);

  const handleConfirm = useCallback(async () => {
    // At review stage both data sets are guaranteed complete.
    const fullData = {
      shipping: shippingData as ShippingData,
      payment: paymentData as PaymentData,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(fullData);
    } finally {
      setIsSubmitting(false);
    }
  }, [shippingData, paymentData, onSubmit]);

  // ---- Render ----

  return (
    <div
      className={`mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      <StepIndicator currentStep={currentStep} labels={stepLabels} />

      {currentStep === CHECKOUT_STEPS.SHIPPING && (
        <ShippingStep
          defaultValues={shippingData}
          onNext={handleShippingNext}
        />
      )}

      {currentStep === CHECKOUT_STEPS.PAYMENT && (
        <PaymentStep
          defaultValues={paymentData}
          onNext={handlePaymentNext}
          onBack={handlePaymentBack}
        />
      )}

      {currentStep === CHECKOUT_STEPS.REVIEW && (
        <ReviewStep
          shipping={shippingData as ShippingData}
          payment={paymentData as PaymentData}
          onConfirm={handleConfirm}
          onEditShipping={handleEditShipping}
          onEditPayment={handleEditPayment}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
