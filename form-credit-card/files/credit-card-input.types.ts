/** Card brand identifiers */
export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

/** Raw card data emitted via onChange */
export interface CardData {
  /** Card number with spaces stripped */
  number: string;
  /** Formatted card number (e.g. "4242 4242 4242 4242") */
  formattedNumber: string;
  /** Cardholder name */
  name: string;
  /** Expiry month (01-12) */
  expiryMonth: string;
  /** Expiry year (2-digit, e.g. "26") */
  expiryYear: string;
  /** Formatted expiry (MM/YY) */
  formattedExpiry: string;
  /** CVV/CVC code */
  cvv: string;
  /** Detected card brand */
  brand: CardBrand;
  /** Whether the full card passes all validation checks */
  isValid: boolean;
}

/** Validation state per field */
export interface CardValidation {
  number: { valid: boolean; error?: string };
  name: { valid: boolean; error?: string };
  expiry: { valid: boolean; error?: string };
  cvv: { valid: boolean; error?: string };
}

/** Props for the main CreditCardInput component */
export interface CreditCardInputProps {
  /** Callback fired on every field change with the full card data */
  onChange?: (data: CardData) => void;
  /** Callback fired when all fields pass validation */
  onValid?: (data: CardData) => void;
  /** Whether to show the visual card preview above the form */
  showPreview?: boolean;
  /** Additional class names for the root container */
  className?: string;
  /** Whether all inputs are disabled */
  disabled?: boolean;
  /** Initial card data (for controlled usage) */
  initialData?: Partial<Pick<CardData, "number" | "name" | "expiryMonth" | "expiryYear" | "cvv">>;
}

/** Props for the CardPreview component */
export interface CardPreviewProps {
  number: string;
  name: string;
  expiry: string;
  brand: CardBrand;
  cvvFocused: boolean;
}
