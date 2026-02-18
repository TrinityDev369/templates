import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const shippingSchema = z.object({
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
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]{7,20}$/.test(val),
      "Please enter a valid phone number"
    ),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must be 200 characters or less"),
  apartment: z.string().optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be 100 characters or less"),
  state: z
    .string()
    .min(1, "State / Province is required")
    .max(100, "State must be 100 characters or less"),
  zipCode: z
    .string()
    .min(1, "ZIP / Postal code is required")
    .max(20, "ZIP code must be 20 characters or less"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be 100 characters or less"),
});

export const paymentSchema = z.object({
  cardholderName: z
    .string()
    .min(1, "Cardholder name is required")
    .max(100, "Cardholder name must be 100 characters or less"),
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(
      /^[\d\s]{13,19}$/,
      "Card number must be between 13 and 19 digits"
    ),
  expiryDate: z
    .string()
    .min(1, "Expiry date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvv: z
    .string()
    .min(1, "CVV is required")
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export const checkoutSchema = z.object({
  shipping: shippingSchema,
  payment: paymentSchema,
});

// ---------------------------------------------------------------------------
// Inferred Types (derived from Zod — single source of truth)
// ---------------------------------------------------------------------------

export type ShippingData = z.infer<typeof shippingSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type CheckoutData = z.infer<typeof checkoutSchema>;

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

export interface CheckoutFormProps {
  /** Called with the complete validated checkout data when the user confirms. */
  onSubmit: (data: CheckoutData) => void | Promise<void>;
  /** Optional CSS class applied to the outermost wrapper. */
  className?: string;
  /** Override the default step labels shown in the progress indicator. */
  stepLabels?: [string, string, string];
}

export interface ShippingStepProps {
  defaultValues: Partial<ShippingData>;
  onNext: (data: ShippingData) => void;
}

export interface PaymentStepProps {
  defaultValues: Partial<PaymentData>;
  onNext: (data: PaymentData) => void;
  onBack: () => void;
}

export interface ReviewStepProps {
  shipping: ShippingData;
  payment: PaymentData;
  onConfirm: () => void;
  onEditShipping: () => void;
  onEditPayment: () => void;
  isSubmitting: boolean;
}

export interface StepIndicatorProps {
  currentStep: number;
  labels: [string, string, string];
}

// ---------------------------------------------------------------------------
// Step enum for clarity
// ---------------------------------------------------------------------------

export const CHECKOUT_STEPS = {
  SHIPPING: 0,
  PAYMENT: 1,
  REVIEW: 2,
} as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[keyof typeof CHECKOUT_STEPS];
