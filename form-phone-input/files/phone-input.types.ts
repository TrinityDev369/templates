/** Country data for the phone input dropdown */
export interface Country {
  /** ISO 3166-1 alpha-2 code (e.g., "US", "DE") */
  code: string;
  /** Display name (e.g., "United States") */
  name: string;
  /** International dial code (e.g., "+1", "+49") */
  dialCode: string;
  /** Flag emoji (e.g., "🇺🇸") */
  flag: string;
  /** Phone number format pattern using # as digit placeholder (e.g., "(###) ###-####") */
  format: string;
  /** Minimum valid phone digit length (excluding dial code) */
  minLength: number;
  /** Maximum valid phone digit length (excluding dial code) */
  maxLength: number;
}

/** Parsed phone value returned by onChange */
export interface PhoneValue {
  /** Raw digits only, without dial code (e.g., "5551234567") */
  raw: string;
  /** Formatted display string (e.g., "(555) 123-4567") */
  formatted: string;
  /** Full international number with dial code (e.g., "+15551234567") */
  full: string;
  /** Selected country ISO code */
  countryCode: string;
  /** Whether the phone number passes length validation */
  isValid: boolean;
}

/** Props for the PhoneInput component */
export interface PhoneInputProps {
  /** Current phone value (raw digits without dial code) */
  value?: string;
  /** Callback when phone value changes */
  onChange?: (value: PhoneValue) => void;
  /** Default country ISO code (defaults to "US") */
  defaultCountry?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to show validation state */
  showValidation?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional CSS class for the root container */
  className?: string;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  /** Accessible label (uses aria-label if no visible label) */
  "aria-label"?: string;
}
