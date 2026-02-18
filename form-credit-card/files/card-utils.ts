import type { CardBrand } from "./credit-card-input.types";

// ---------------------------------------------------------------------------
// Card brand detection
// ---------------------------------------------------------------------------

/** BIN range rules for each card brand, ordered by specificity */
const BRAND_PATTERNS: { brand: CardBrand; pattern: RegExp }[] = [
  // Amex: starts with 34 or 37
  { brand: "amex", pattern: /^3[47]/ },
  // Discover: starts with 6011, 622126-622925, 644-649, 65
  { brand: "discover", pattern: /^(6011|65|64[4-9]|622(1[2-9][6-9]|[2-8]\d{2}|9[01]\d|92[0-5]))/ },
  // Mastercard: starts with 51-55 or 2221-2720
  { brand: "mastercard", pattern: /^(5[1-5]|2(2[2-9]\d|[3-6]\d{2}|7[01]\d|720))/ },
  // Visa: starts with 4
  { brand: "visa", pattern: /^4/ },
];

/**
 * Detect the card brand from the first digits of the card number.
 * Returns "unknown" if no match.
 */
export function detectCardBrand(number: string): CardBrand {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 0) return "unknown";

  for (const { brand, pattern } of BRAND_PATTERNS) {
    if (pattern.test(digits)) return brand;
  }
  return "unknown";
}

// ---------------------------------------------------------------------------
// Card number formatting
// ---------------------------------------------------------------------------

/**
 * Maximum card number length per brand (digits only).
 * Amex: 15 digits; all others: 16 digits.
 */
export function getMaxDigits(brand: CardBrand): number {
  return brand === "amex" ? 15 : 16;
}

/**
 * Format a card number string with spaces.
 * - Amex: 4-6-5 grouping (e.g. "3782 822463 10005")
 * - Others: 4-4-4-4 grouping (e.g. "4242 4242 4242 4242")
 */
export function formatCardNumber(raw: string, brand: CardBrand): string {
  const digits = raw.replace(/\D/g, "").slice(0, getMaxDigits(brand));

  if (brand === "amex") {
    const parts: string[] = [];
    if (digits.length > 0) parts.push(digits.slice(0, 4));
    if (digits.length > 4) parts.push(digits.slice(4, 10));
    if (digits.length > 10) parts.push(digits.slice(10, 15));
    return parts.join(" ");
  }

  // Default: groups of 4
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(" ");
}

/**
 * Strip all non-digit characters from a string.
 */
export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// ---------------------------------------------------------------------------
// Expiry formatting
// ---------------------------------------------------------------------------

/**
 * Format an expiry input value to MM/YY.
 * Handles auto-insertion of the "/" separator.
 */
export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);

  if (digits.length === 0) return "";

  // If the first digit is > 1, prefix with 0 (e.g. "5" => "05")
  let month = digits.slice(0, 2);
  if (digits.length === 1 && parseInt(digits, 10) > 1) {
    month = "0" + digits;
  }

  if (month.length === 2 && digits.length >= 2) {
    const year = digits.slice(2);
    return year.length > 0 ? `${month}/${year}` : month;
  }

  return month;
}

/**
 * Parse formatted expiry "MM/YY" into month and year parts.
 */
export function parseExpiry(formatted: string): { month: string; year: string } {
  const parts = formatted.split("/");
  return {
    month: parts[0]?.trim() ?? "",
    year: parts[1]?.trim() ?? "",
  };
}

// ---------------------------------------------------------------------------
// Luhn algorithm
// ---------------------------------------------------------------------------

/**
 * Validate a card number using the Luhn algorithm (mod 10 check).
 * Returns true if the number passes the check.
 */
export function luhnCheck(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 0) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * CVV length per brand. Amex uses 4 digits; all others use 3.
 */
export function getCvvLength(brand: CardBrand): number {
  return brand === "amex" ? 4 : 3;
}

/**
 * Validate the card number: correct length + Luhn check.
 */
export function validateNumber(number: string, brand: CardBrand): { valid: boolean; error?: string } {
  const digits = stripNonDigits(number);
  const maxLen = getMaxDigits(brand);

  if (digits.length === 0) {
    return { valid: false, error: "Card number is required" };
  }
  if (digits.length < maxLen) {
    return { valid: false, error: "Card number is incomplete" };
  }
  if (!luhnCheck(digits)) {
    return { valid: false, error: "Invalid card number" };
  }
  return { valid: true };
}

/**
 * Validate the expiry date: must be MM/YY format, valid month, not expired.
 */
export function validateExpiry(month: string, year: string): { valid: boolean; error?: string } {
  if (!month || !year || year.length < 2) {
    return { valid: false, error: "Expiry date is required" };
  }

  const m = parseInt(month, 10);
  if (m < 1 || m > 12) {
    return { valid: false, error: "Invalid month" };
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100; // 2-digit year
  const currentMonth = now.getMonth() + 1;
  const y = parseInt(year, 10);

  if (y < currentYear || (y === currentYear && m < currentMonth)) {
    return { valid: false, error: "Card has expired" };
  }

  return { valid: true };
}

/**
 * Validate the CVV: must be the correct length for the brand.
 */
export function validateCvv(cvv: string, brand: CardBrand): { valid: boolean; error?: string } {
  const digits = stripNonDigits(cvv);
  const expected = getCvvLength(brand);

  if (digits.length === 0) {
    return { valid: false, error: "CVV is required" };
  }
  if (digits.length < expected) {
    return { valid: false, error: `CVV must be ${expected} digits` };
  }

  return { valid: true };
}

/**
 * Validate the cardholder name: must not be empty.
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Cardholder name is required" };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: "Name is too short" };
  }
  return { valid: true };
}
