"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type {
  CardBrand,
  CardData,
  CardValidation,
  CreditCardInputProps,
} from "./credit-card-input.types";
import { CardPreview } from "./card-preview";
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  getCvvLength,
  getMaxDigits,
  parseExpiry,
  stripNonDigits,
  validateCvv,
  validateExpiry,
  validateName,
  validateNumber,
} from "./card-utils";

// ---------------------------------------------------------------------------
// Inline SVG icons for card brands (small, input-adornment sized)
// ---------------------------------------------------------------------------

function VisaSmall() {
  return (
    <svg viewBox="0 0 32 20" fill="none" className="h-5 w-8" aria-label="Visa">
      <rect width="32" height="20" rx="2" fill="#1A1F71" />
      <text x="4" y="14" fill="white" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="bold" fontStyle="italic">
        VISA
      </text>
    </svg>
  );
}

function MastercardSmall() {
  return (
    <svg viewBox="0 0 32 20" fill="none" className="h-5 w-8" aria-label="Mastercard">
      <rect width="32" height="20" rx="2" fill="#252525" />
      <circle cx="12" cy="10" r="5" fill="#EB001B" />
      <circle cx="20" cy="10" r="5" fill="#F79E1B" />
      <path d="M16 6.34a5 5 0 0 1 0 7.32 5 5 0 0 1 0-7.32z" fill="#FF5F00" />
    </svg>
  );
}

function AmexSmall() {
  return (
    <svg viewBox="0 0 32 20" fill="none" className="h-5 w-8" aria-label="Amex">
      <rect width="32" height="20" rx="2" fill="#2E77BC" />
      <text x="3" y="13" fill="white" fontFamily="Arial,sans-serif" fontSize="6" fontWeight="bold">
        AMEX
      </text>
    </svg>
  );
}

function DiscoverSmall() {
  return (
    <svg viewBox="0 0 32 20" fill="none" className="h-5 w-8" aria-label="Discover">
      <rect width="32" height="20" rx="2" fill="#fff" />
      <rect x="0.5" y="0.5" width="31" height="19" rx="1.5" stroke="#E5E7EB" />
      <circle cx="20" cy="9" r="4" fill="#F48120" />
      <text x="2" y="13" fill="#000" fontFamily="Arial,sans-serif" fontSize="5" fontWeight="bold">
        DISCOVER
      </text>
    </svg>
  );
}

function BrandAdornment({ brand }: { brand: CardBrand }) {
  switch (brand) {
    case "visa":
      return <VisaSmall />;
    case "mastercard":
      return <MastercardSmall />;
    case "amex":
      return <AmexSmall />;
    case "discover":
      return <DiscoverSmall />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Field wrapper with label + error
// ---------------------------------------------------------------------------

function Field({
  label,
  error,
  touched,
  children,
  className,
}: {
  label: string;
  error?: string;
  touched: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const showError = touched && error;
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      <div className="mt-1 min-h-[1.25rem]">
        {showError && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Input styling helpers
// ---------------------------------------------------------------------------

const BASE_INPUT =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

function inputClassName(hasError: boolean, touched: boolean): string {
  if (touched && hasError) {
    return `${BASE_INPUT} border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`;
  }
  return `${BASE_INPUT} border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`;
}

// ---------------------------------------------------------------------------
// Main CreditCardInput component
// ---------------------------------------------------------------------------

export function CreditCardInput({
  onChange,
  onValid,
  showPreview = true,
  className = "",
  disabled = false,
  initialData,
}: CreditCardInputProps) {
  // ---- State ----
  const [rawNumber, setRawNumber] = useState(initialData?.number ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [rawExpiry, setRawExpiry] = useState(() => {
    if (initialData?.expiryMonth && initialData?.expiryYear) {
      return `${initialData.expiryMonth}/${initialData.expiryYear}`;
    }
    return "";
  });
  const [cvv, setCvv] = useState(initialData?.cvv ?? "");
  const [cvvFocused, setCvvFocused] = useState(false);

  // Track which fields have been interacted with (for error display)
  const [touched, setTouched] = useState({
    number: false,
    name: false,
    expiry: false,
    cvv: false,
  });

  // Refs for auto-advancing focus
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // ---- Derived ----
  const brand = useMemo(() => detectCardBrand(rawNumber), [rawNumber]);
  const formattedNumber = useMemo(() => formatCardNumber(rawNumber, brand), [rawNumber, brand]);
  const formattedExpiry = useMemo(() => formatExpiry(rawExpiry), [rawExpiry]);
  const { month: expiryMonth, year: expiryYear } = useMemo(() => parseExpiry(formattedExpiry), [formattedExpiry]);
  const maxCvv = getCvvLength(brand);
  const maxDigits = getMaxDigits(brand);

  // ---- Validation ----
  const validation: CardValidation = useMemo(() => {
    return {
      number: validateNumber(rawNumber, brand),
      name: validateName(name),
      expiry: validateExpiry(expiryMonth, expiryYear),
      cvv: validateCvv(cvv, brand),
    };
  }, [rawNumber, brand, name, expiryMonth, expiryYear, cvv]);

  const isValid = validation.number.valid && validation.name.valid && validation.expiry.valid && validation.cvv.valid;

  // ---- Build card data and fire callbacks ----
  const fireChange = useCallback(
    (overrides: Partial<{ rawNumber: string; name: string; rawExpiry: string; cvv: string }>) => {
      const num = overrides.rawNumber ?? rawNumber;
      const n = overrides.name ?? name;
      const exp = formatExpiry(overrides.rawExpiry ?? rawExpiry);
      const c = overrides.cvv ?? cvv;
      const b = detectCardBrand(num);
      const fmtNum = formatCardNumber(num, b);
      const { month: m, year: y } = parseExpiry(exp);

      const v: CardValidation = {
        number: validateNumber(num, b),
        name: validateName(n),
        expiry: validateExpiry(m, y),
        cvv: validateCvv(c, b),
      };
      const allValid = v.number.valid && v.name.valid && v.expiry.valid && v.cvv.valid;

      const data: CardData = {
        number: stripNonDigits(num),
        formattedNumber: fmtNum,
        name: n,
        expiryMonth: m,
        expiryYear: y,
        formattedExpiry: exp,
        cvv: c,
        brand: b,
        isValid: allValid,
      };

      onChange?.(data);
      if (allValid) onValid?.(data);
    },
    [rawNumber, name, rawExpiry, cvv, onChange, onValid],
  );

  // ---- Handlers ----
  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const digits = stripNonDigits(input);
      const currentBrand = detectCardBrand(digits);
      const max = getMaxDigits(currentBrand);
      const trimmed = digits.slice(0, max);
      setRawNumber(trimmed);
      fireChange({ rawNumber: trimmed });

      // Auto-advance to expiry when number is complete
      if (trimmed.length === max) {
        expiryRef.current?.focus();
      }
    },
    [fireChange],
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      // Allow user to delete the slash naturally
      const digits = stripNonDigits(input);
      if (digits.length <= 4) {
        setRawExpiry(digits);
        fireChange({ rawExpiry: digits });
      }

      // Auto-advance to CVV when expiry is complete (4 digits -> MM/YY)
      if (digits.length === 4) {
        cvvRef.current?.focus();
      }
    },
    [fireChange],
  );

  const handleCvvChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = stripNonDigits(e.target.value).slice(0, maxCvv);
      setCvv(digits);
      fireChange({ cvv: digits });

      // Auto-advance to name when CVV is complete
      if (digits.length === maxCvv) {
        nameRef.current?.focus();
      }
    },
    [maxCvv, fireChange],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setName(val);
      fireChange({ name: val });
    },
    [fireChange],
  );

  const markTouched = useCallback((field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Visual card preview */}
      {showPreview && (
        <div className="mb-6">
          <CardPreview
            number={formattedNumber}
            name={name}
            expiry={formattedExpiry}
            brand={brand}
            cvvFocused={cvvFocused}
          />
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-1">
        {/* Card Number */}
        <Field
          label="Card Number"
          error={validation.number.error}
          touched={touched.number}
        >
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={formattedNumber}
              onChange={handleNumberChange}
              onBlur={() => markTouched("number")}
              disabled={disabled}
              maxLength={brand === "amex" ? 17 : 19}
              className={`${inputClassName(!!validation.number.error, touched.number)} pr-12`}
              aria-label="Card number"
              aria-invalid={touched.number && !validation.number.valid}
            />
            {brand !== "unknown" && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <BrandAdornment brand={brand} />
              </div>
            )}
          </div>
        </Field>

        {/* Expiry + CVV row */}
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Expiry Date"
            error={validation.expiry.error}
            touched={touched.expiry}
          >
            <input
              ref={expiryRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={formattedExpiry}
              onChange={handleExpiryChange}
              onBlur={() => markTouched("expiry")}
              disabled={disabled}
              maxLength={5}
              className={inputClassName(!!validation.expiry.error, touched.expiry)}
              aria-label="Expiry date"
              aria-invalid={touched.expiry && !validation.expiry.valid}
            />
          </Field>

          <Field
            label={brand === "amex" ? "CID (4 digits)" : "CVV"}
            error={validation.cvv.error}
            touched={touched.cvv}
          >
            <input
              ref={cvvRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder={brand === "amex" ? "1234" : "123"}
              value={cvv}
              onChange={handleCvvChange}
              onFocus={() => setCvvFocused(true)}
              onBlur={() => {
                setCvvFocused(false);
                markTouched("cvv");
              }}
              disabled={disabled}
              maxLength={maxCvv}
              className={inputClassName(!!validation.cvv.error, touched.cvv)}
              aria-label="Security code"
              aria-invalid={touched.cvv && !validation.cvv.valid}
            />
          </Field>
        </div>

        {/* Cardholder Name */}
        <Field
          label="Cardholder Name"
          error={validation.name.error}
          touched={touched.name}
        >
          <input
            ref={nameRef}
            type="text"
            autoComplete="cc-name"
            placeholder="John Doe"
            value={name}
            onChange={handleNameChange}
            onBlur={() => markTouched("name")}
            disabled={disabled}
            className={inputClassName(!!validation.name.error, touched.name)}
            aria-label="Cardholder name"
            aria-invalid={touched.name && !validation.name.valid}
          />
        </Field>
      </div>
    </div>
  );
}
