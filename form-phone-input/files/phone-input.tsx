"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { PhoneInputProps, PhoneValue } from "./phone-input.types";
import {
  getSortedCountries,
  filterCountries,
  getCountryByCode,
  formatPhoneNumber,
  extractDigits,
  validatePhoneLength,
} from "./country-data";

/**
 * International phone input with country code picker and auto-formatting.
 *
 * Features:
 * - Country dropdown with flag emoji, name, and dial code
 * - Popular countries (US, UK, DE, FR, CA, AU) listed first
 * - Search/filter countries by name, code, or dial code
 * - Auto-formats phone number as user types
 * - Basic length validation per country
 * - Fully controlled via value/onChange
 * - Keyboard accessible (arrow keys, escape, enter)
 *
 * @example
 * ```tsx
 * const [phone, setPhone] = useState<PhoneValue | null>(null);
 *
 * <PhoneInput
 *   value={phone?.raw}
 *   onChange={setPhone}
 *   defaultCountry="US"
 *   placeholder="Enter phone number"
 * />
 * ```
 */
export function PhoneInput({
  value = "",
  onChange,
  defaultCountry = "US",
  placeholder,
  disabled = false,
  showValidation = false,
  error,
  className = "",
  name,
  id,
  "aria-label": ariaLabel,
}: PhoneInputProps) {
  const allCountries = useMemo(() => getSortedCountries(), []);

  const [selectedCountry, setSelectedCountry] = useState(() => {
    return (
      getCountryByCode(defaultCountry) ??
      allCountries[0]
    );
  });

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Filtered countries based on search
  const filteredCountries = useMemo(
    () => filterCountries(allCountries, search),
    [allCountries, search]
  );

  // Build the phone value object
  const buildPhoneValue = useCallback(
    (rawDigits: string, country: typeof selectedCountry): PhoneValue => {
      const formatted = formatPhoneNumber(rawDigits, country.format);
      const isValid =
        rawDigits.length > 0 && validatePhoneLength(rawDigits, country);

      return {
        raw: rawDigits,
        formatted,
        full: rawDigits
          ? `${country.dialCode}${rawDigits}`
          : "",
        countryCode: country.code,
        isValid,
      };
    },
    []
  );

  // Handle phone input changes
  const handlePhoneChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const digits = extractDigits(e.target.value);
      // Limit to maxLength digits
      const trimmed = digits.slice(0, selectedCountry.maxLength);
      const phoneValue = buildPhoneValue(trimmed, selectedCountry);
      onChange?.(phoneValue);
    },
    [selectedCountry, onChange, buildPhoneValue]
  );

  // Handle country selection
  const handleCountrySelect = useCallback(
    (countryCode: string) => {
      const country = getCountryByCode(countryCode);
      if (!country) return;

      setSelectedCountry(country);
      setIsOpen(false);
      setSearch("");
      setHighlightedIndex(0);

      // Re-validate with new country rules
      const digits = extractDigits(value);
      const trimmed = digits.slice(0, country.maxLength);
      const phoneValue = buildPhoneValue(trimmed, country);
      onChange?.(phoneValue);

      // Focus the phone input after selection
      requestAnimationFrame(() => {
        phoneInputRef.current?.focus();
      });
    },
    [value, onChange, buildPhoneValue]
  );

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setSearch("");
        setHighlightedIndex(0);
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
      return next;
    });
  }, [disabled]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation for dropdown
  const handleDropdownKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredCountries.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCountries.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCountries[highlightedIndex]) {
            handleCountrySelect(
              filteredCountries[highlightedIndex].code
            );
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearch("");
          phoneInputRef.current?.focus();
          break;
      }
    },
    [filteredCountries, highlightedIndex, handleCountrySelect]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;
    const items = dropdownRef.current.querySelectorAll("[data-country]");
    const highlighted = items[highlightedIndex];
    if (highlighted) {
      highlighted.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  // Compute formatted display value
  const digits = extractDigits(value);
  const displayValue = digits
    ? formatPhoneNumber(digits, selectedCountry.format)
    : "";
  const isValid =
    digits.length > 0 && validatePhoneLength(digits, selectedCountry);

  // Determine border color
  const borderColor = error
    ? "border-red-500 focus-within:ring-red-500/20"
    : showValidation && digits.length > 0
      ? isValid
        ? "border-green-500 focus-within:ring-green-500/20"
        : "border-red-500 focus-within:ring-red-500/20"
      : "border-gray-300 focus-within:ring-blue-500/20 focus-within:border-blue-500";

  // Divider between popular and rest
  const popularCount = allCountries.filter((c) =>
    ["US", "GB", "DE", "FR", "CA", "AU"].includes(c.code)
  ).length;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-center rounded-lg border bg-white transition-all focus-within:ring-2 ${borderColor} ${
          disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
        }`}
      >
        {/* Country selector button */}
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-2.5 border-r border-gray-200 hover:bg-gray-50 transition-colors rounded-l-lg shrink-0 focus:outline-none focus:bg-gray-50"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`Selected country: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span className="text-lg leading-none" aria-hidden="true">
            {selectedCountry.flag}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {selectedCountry.dialCode}
          </span>
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Phone number input */}
        <input
          ref={phoneInputRef}
          type="tel"
          inputMode="numeric"
          id={id}
          name={name}
          value={displayValue}
          onChange={handlePhoneChange}
          placeholder={
            placeholder ?? formatPhoneNumber("", selectedCountry.format).trim() || "Enter phone number"
          }
          disabled={disabled}
          className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none rounded-r-lg"
          aria-label={ariaLabel ?? "Phone number"}
          aria-invalid={
            error || (showValidation && digits.length > 0 && !isValid)
              ? "true"
              : undefined
          }
        />

        {/* Validation indicator */}
        {showValidation && digits.length > 0 && (
          <div className="pr-3 shrink-0" aria-hidden="true">
            {isValid ? (
              <svg
                className="w-4.5 h-4.5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4.5 h-4.5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 3h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Validation hint */}
      {showValidation &&
        !error &&
        digits.length > 0 &&
        !isValid && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            Phone number should be {selectedCountry.minLength === selectedCountry.maxLength
              ? `${selectedCountry.minLength} digits`
              : `${selectedCountry.minLength}-${selectedCountry.maxLength} digits`}
          </p>
        )}

      {/* Country dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          role="listbox"
          aria-label="Select country"
          onKeyDown={handleDropdownKeyDown}
        >
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleDropdownKeyDown}
              placeholder="Search countries..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              aria-label="Search countries"
              aria-controls="phone-input-country-list"
            />
          </div>

          {/* Country list */}
          <div
            ref={dropdownRef}
            id="phone-input-country-list"
            className="max-h-60 overflow-y-auto"
            role="group"
          >
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country, index) => {
                const isSelected =
                  country.code === selectedCountry.code;
                const isHighlighted = index === highlightedIndex;

                // Insert separator after popular countries (only when not searching)
                const showSeparator =
                  !search && index === popularCount;

                return (
                  <div key={country.code}>
                    {showSeparator && (
                      <div className="border-t border-gray-100 my-1" />
                    )}
                    <button
                      type="button"
                      data-country={country.code}
                      onClick={() =>
                        handleCountrySelect(country.code)
                      }
                      onMouseEnter={() =>
                        setHighlightedIndex(index)
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
                        isHighlighted
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      } ${isSelected ? "font-medium" : ""}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span
                        className="text-lg leading-none shrink-0"
                        aria-hidden="true"
                      >
                        {country.flag}
                      </span>
                      <span className="flex-1 truncate text-gray-900">
                        {country.name}
                      </span>
                      <span className="text-gray-500 shrink-0">
                        {country.dialCode}
                      </span>
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-blue-600 shrink-0"
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
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
