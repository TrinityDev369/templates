export { CheckoutForm } from "./checkout-form";
export { ShippingStep } from "./shipping-step";
export { PaymentStep } from "./payment-step";
export { ReviewStep } from "./review-step";
export { StepIndicator } from "./step-indicator";

export type {
  CheckoutFormProps,
  CheckoutData,
  ShippingData,
  PaymentData,
  ShippingStepProps,
  PaymentStepProps,
  ReviewStepProps,
  StepIndicatorProps,
  CheckoutStep,
} from "./types";

export {
  checkoutSchema,
  shippingSchema,
  paymentSchema,
  CHECKOUT_STEPS,
} from "./types";
