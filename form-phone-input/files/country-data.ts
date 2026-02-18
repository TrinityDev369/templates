import type { Country } from "./phone-input.types";

/**
 * Popular countries shown at the top of the dropdown.
 * Order: US, UK, Germany, France, Canada, Australia, then rest alphabetically.
 */
export const POPULAR_COUNTRY_CODES = [
  "US",
  "GB",
  "DE",
  "FR",
  "CA",
  "AU",
] as const;

/**
 * Complete list of supported countries with dial codes,
 * flag emojis, format patterns, and validation lengths.
 *
 * Format uses '#' as a digit placeholder.
 * Min/max lengths refer to the national number (without dial code).
 */
export const COUNTRIES: Country[] = [
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "\u{1F1FA}\u{1F1F8}",
    format: "(###) ###-####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "\u{1F1EC}\u{1F1E7}",
    format: "#### ######",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "\u{1F1E9}\u{1F1EA}",
    format: "#### #######",
    minLength: 10,
    maxLength: 11,
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "\u{1F1EB}\u{1F1F7}",
    format: "# ## ## ## ##",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "\u{1F1E8}\u{1F1E6}",
    format: "(###) ###-####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "\u{1F1E6}\u{1F1FA}",
    format: "#### ### ###",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "AT",
    name: "Austria",
    dialCode: "+43",
    flag: "\u{1F1E6}\u{1F1F9}",
    format: "#### ######",
    minLength: 10,
    maxLength: 11,
  },
  {
    code: "BE",
    name: "Belgium",
    dialCode: "+32",
    flag: "\u{1F1E7}\u{1F1EA}",
    format: "### ## ## ##",
    minLength: 8,
    maxLength: 9,
  },
  {
    code: "BR",
    name: "Brazil",
    dialCode: "+55",
    flag: "\u{1F1E7}\u{1F1F7}",
    format: "(##) #####-####",
    minLength: 10,
    maxLength: 11,
  },
  {
    code: "CH",
    name: "Switzerland",
    dialCode: "+41",
    flag: "\u{1F1E8}\u{1F1ED}",
    format: "## ### ## ##",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "CN",
    name: "China",
    dialCode: "+86",
    flag: "\u{1F1E8}\u{1F1F3}",
    format: "### #### ####",
    minLength: 11,
    maxLength: 11,
  },
  {
    code: "DK",
    name: "Denmark",
    dialCode: "+45",
    flag: "\u{1F1E9}\u{1F1F0}",
    format: "## ## ## ##",
    minLength: 8,
    maxLength: 8,
  },
  {
    code: "ES",
    name: "Spain",
    dialCode: "+34",
    flag: "\u{1F1EA}\u{1F1F8}",
    format: "### ### ###",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "\u{1F1EE}\u{1F1F3}",
    format: "##### #####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    flag: "\u{1F1EE}\u{1F1F9}",
    format: "### ### ####",
    minLength: 9,
    maxLength: 10,
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    flag: "\u{1F1EF}\u{1F1F5}",
    format: "##-####-####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "KR",
    name: "South Korea",
    dialCode: "+82",
    flag: "\u{1F1F0}\u{1F1F7}",
    format: "##-####-####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "MX",
    name: "Mexico",
    dialCode: "+52",
    flag: "\u{1F1F2}\u{1F1FD}",
    format: "## #### ####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    flag: "\u{1F1F3}\u{1F1F1}",
    format: "# ## ## ## ##",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "NO",
    name: "Norway",
    dialCode: "+47",
    flag: "\u{1F1F3}\u{1F1F4}",
    format: "### ## ###",
    minLength: 8,
    maxLength: 8,
  },
  {
    code: "NZ",
    name: "New Zealand",
    dialCode: "+64",
    flag: "\u{1F1F3}\u{1F1FF}",
    format: "## ### ####",
    minLength: 8,
    maxLength: 9,
  },
  {
    code: "PL",
    name: "Poland",
    dialCode: "+48",
    flag: "\u{1F1F5}\u{1F1F1}",
    format: "### ### ###",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "PT",
    name: "Portugal",
    dialCode: "+351",
    flag: "\u{1F1F5}\u{1F1F9}",
    format: "### ### ###",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "RU",
    name: "Russia",
    dialCode: "+7",
    flag: "\u{1F1F7}\u{1F1FA}",
    format: "(###) ###-##-##",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "SE",
    name: "Sweden",
    dialCode: "+46",
    flag: "\u{1F1F8}\u{1F1EA}",
    format: "##-### ## ##",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "\u{1F1F8}\u{1F1EC}",
    format: "#### ####",
    minLength: 8,
    maxLength: 8,
  },
  {
    code: "ZA",
    name: "South Africa",
    dialCode: "+27",
    flag: "\u{1F1FF}\u{1F1E6}",
    format: "## ### ####",
    minLength: 9,
    maxLength: 9,
  },
];

/**
 * Find a country by its ISO code.
 * Returns undefined if not found.
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
}

/**
 * Returns countries sorted with popular countries first,
 * followed by the rest in alphabetical order.
 */
export function getSortedCountries(): Country[] {
  const popular: Country[] = [];
  const rest: Country[] = [];

  for (const country of COUNTRIES) {
    if (
      (POPULAR_COUNTRY_CODES as readonly string[]).includes(country.code)
    ) {
      popular.push(country);
    } else {
      rest.push(country);
    }
  }

  // Sort popular in the defined order
  popular.sort(
    (a, b) =>
      (POPULAR_COUNTRY_CODES as readonly string[]).indexOf(a.code) -
      (POPULAR_COUNTRY_CODES as readonly string[]).indexOf(b.code)
  );

  // Sort rest alphabetically by name
  rest.sort((a, b) => a.name.localeCompare(b.name));

  return [...popular, ...rest];
}

/**
 * Filter countries by a search query.
 * Matches against country name, dial code, and ISO code.
 */
export function filterCountries(
  countries: Country[],
  query: string
): Country[] {
  const q = query.toLowerCase().trim();
  if (!q) return countries;

  return countries.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
  );
}

/**
 * Format a raw digit string according to a country's format pattern.
 * Uses '#' in the pattern as digit placeholders.
 *
 * Example: formatPhoneNumber("5551234567", "(###) ###-####") => "(555) 123-4567"
 */
export function formatPhoneNumber(
  digits: string,
  format: string
): string {
  let result = "";
  let digitIndex = 0;

  for (let i = 0; i < format.length; i++) {
    if (digitIndex >= digits.length) break;

    if (format[i] === "#") {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += format[i];
    }
  }

  // Append remaining digits beyond the format pattern
  if (digitIndex < digits.length) {
    result += digits.slice(digitIndex);
  }

  return result;
}

/**
 * Strip all non-digit characters from a string.
 */
export function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validate phone number length against country rules.
 */
export function validatePhoneLength(
  digits: string,
  country: Country
): boolean {
  const len = digits.length;
  return len >= country.minLength && len <= country.maxLength;
}
