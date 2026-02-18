"use client";

import * as React from "react";

import type {
  AddressAutocompleteProps,
  AddressData,
  AddressErrors,
  AddressSuggestion,
  CountryOption,
  FetchSuggestionsFn,
} from "./address-autocomplete.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "NL", name: "Netherlands" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
];

const EMPTY_ADDRESS: AddressData = {
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
};

// ---------------------------------------------------------------------------
// Built-in mock suggestions (no external API needed out of the box)
// ---------------------------------------------------------------------------

const MOCK_ADDRESSES: AddressSuggestion[] = [
  {
    id: "mock-1",
    label: "123 Main Street, Springfield, IL 62701, US",
    address: { street: "123 Main Street", city: "Springfield", state: "IL", zip: "62701", country: "US" },
  },
  {
    id: "mock-2",
    label: "456 Oak Avenue, Portland, OR 97201, US",
    address: { street: "456 Oak Avenue", city: "Portland", state: "OR", zip: "97201", country: "US" },
  },
  {
    id: "mock-3",
    label: "789 Maple Drive, Austin, TX 73301, US",
    address: { street: "789 Maple Drive", city: "Austin", state: "TX", zip: "73301", country: "US" },
  },
  {
    id: "mock-4",
    label: "1010 Pine Road, Denver, CO 80201, US",
    address: { street: "1010 Pine Road", city: "Denver", state: "CO", zip: "80201", country: "US" },
  },
  {
    id: "mock-5",
    label: "222 Elm Street, Seattle, WA 98101, US",
    address: { street: "222 Elm Street", city: "Seattle", state: "WA", zip: "98101", country: "US" },
  },
  {
    id: "mock-6",
    label: "55 Baker Street, London, England, W1U 8EW, GB",
    address: { street: "55 Baker Street", city: "London", state: "England", zip: "W1U 8EW", country: "GB" },
  },
  {
    id: "mock-7",
    label: "10 Alexanderplatz, Berlin, BE, 10178, DE",
    address: { street: "10 Alexanderplatz", city: "Berlin", state: "BE", zip: "10178", country: "DE" },
  },
  {
    id: "mock-8",
    label: "42 Rue de Rivoli, Paris, IDF, 75001, FR",
    address: { street: "42 Rue de Rivoli", city: "Paris", state: "IDF", zip: "75001", country: "FR" },
  },
  {
    id: "mock-9",
    label: "100 Queen Street, Toronto, ON, M5H 2N2, CA",
    address: { street: "100 Queen Street", city: "Toronto", state: "ON", zip: "M5H 2N2", country: "CA" },
  },
  {
    id: "mock-10",
    label: "8 George Street, Sydney, NSW, 2000, AU",
    address: { street: "8 George Street", city: "Sydney", state: "NSW", zip: "2000", country: "AU" },
  },
];

const defaultFetchSuggestions: FetchSuggestionsFn = async (query) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  if (!query || query.length < 2) return [];

  const lower = query.toLowerCase();
  return MOCK_ADDRESSES.filter((s) => s.label.toLowerCase().includes(lower));
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Debounced value hook. */
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

// ---------------------------------------------------------------------------
// Inline SVG Icons (zero-dep — no icon library required)
// ---------------------------------------------------------------------------

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LoaderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(address: AddressData): AddressErrors {
  const errors: AddressErrors = {};

  if (!address.street.trim()) {
    errors.street = "Street address is required";
  }
  if (!address.city.trim()) {
    errors.city = "City is required";
  }
  if (!address.state.trim()) {
    errors.state = "State / Province is required";
  }
  if (!address.zip.trim()) {
    errors.zip = "ZIP / Postal code is required";
  }
  if (!address.country) {
    errors.country = "Country is required";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FieldWrapper({ label, htmlFor, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Map Preview Placeholder
// ---------------------------------------------------------------------------

interface MapPreviewProps {
  address: AddressData;
}

function MapPreview({ address }: MapPreviewProps) {
  const formatted = [address.street, address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ");

  const countryName =
    COUNTRIES.find((c) => c.code === address.country)?.name ?? address.country;

  const hasContent = address.street || address.city;

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50">
      {/* Grid pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-3 px-4 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <MapPinIcon className="h-6 w-6" />
        </div>

        {hasContent ? (
          <div className="max-w-xs space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatted}
            </p>
            {countryName && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {countryName}
              </p>
            )}
          </div>
        ) : (
          <div className="max-w-xs space-y-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Map Preview Area
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Replace this placeholder with a map component (Google Maps, Mapbox GL, Leaflet, etc.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddressAutocomplete Component
// ---------------------------------------------------------------------------

export function AddressAutocomplete({
  onAddressChange,
  onSubmit,
  defaultAddress,
  fetchSuggestions,
  debounceMs = 300,
  label = "Address",
  submitLabel = "Save Address",
  hideMapPreview = false,
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  // Form state
  const [address, setAddress] = React.useState<AddressData>({
    ...EMPTY_ADDRESS,
    ...defaultAddress,
  });
  const [errors, setErrors] = React.useState<AddressErrors>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof AddressData, boolean>>>({});

  // Autocomplete state
  const [searchQuery, setSearchQuery] = React.useState(defaultAddress?.street ?? "");
  const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  // Refs
  const suggestionsRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const resolver = fetchSuggestions ?? defaultFetchSuggestions;
  const debouncedQuery = useDebounce(searchQuery, debounceMs);

  // ---- Fetch suggestions on debounced query change ----
  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setIsLoading(true);
      try {
        const results = await resolver(debouncedQuery);
        if (!cancelled) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // ---- Close suggestions on outside click ----
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- Notify parent on address change ----
  React.useEffect(() => {
    onAddressChange?.(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // ---- Helpers ----

  function updateField(field: keyof AddressData, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));

    // Clear field error on edit
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleBlur(field: keyof AddressData) {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate single field on blur
    const fieldErrors = validate(address);
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }

  function selectSuggestion(suggestion: AddressSuggestion) {
    const addr = suggestion.address ?? {};
    const merged: AddressData = {
      street: addr.street ?? address.street,
      city: addr.city ?? address.city,
      state: addr.state ?? address.state,
      zip: addr.zip ?? address.zip,
      country: addr.country ?? address.country,
    };

    setAddress(merged);
    setSearchQuery(addr.street ?? suggestion.label);
    setShowSuggestions(false);
    setSuggestions([]);
    setErrors({});
  }

  function handleStreetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchQuery(value);
    updateField("street", value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  }

  // Scroll active suggestion into view
  React.useEffect(() => {
    if (activeIndex < 0 || !suggestionsRef.current) return;
    const items = suggestionsRef.current.querySelectorAll("li");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fieldErrors = validate(address);
    const hasErrors = Object.keys(fieldErrors).length > 0;

    if (hasErrors) {
      setErrors(fieldErrors);
      // Mark all as touched
      setTouched({ street: true, city: true, state: true, zip: true, country: true });
      return;
    }

    setErrors({});
    onSubmit?.(address);
  }

  // ---- Shared input class ----
  const inputClass = (field: keyof AddressData) =>
    [
      "block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors",
      "bg-white dark:bg-gray-900",
      "text-gray-900 dark:text-gray-100",
      "placeholder:text-gray-400 dark:placeholder:text-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800",
      errors[field] && touched[field]
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-600",
    ]
      .filter(Boolean)
      .join(" ");

  const selectClass = (field: keyof AddressData) =>
    [
      "block w-full appearance-none rounded-md border px-3 py-2 pr-8 text-sm shadow-sm transition-colors",
      "bg-white dark:bg-gray-900",
      "text-gray-900 dark:text-gray-100",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800",
      errors[field] && touched[field]
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-600",
    ]
      .filter(Boolean)
      .join(" ");

  // ---- Render ----

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      {/* Form header */}
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {label}
      </h3>

      <form onSubmit={handleFormSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* ---- Street (full width, with autocomplete) ---- */}
          <div className="sm:col-span-2" ref={containerRef}>
            <FieldWrapper
              label="Street Address"
              htmlFor="addr-street"
              error={touched.street ? errors.street : undefined}
              required
            >
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <SearchIcon />
                </div>
                <input
                  ref={inputRef}
                  id="addr-street"
                  type="text"
                  value={searchQuery}
                  onChange={handleStreetChange}
                  onBlur={() => handleBlur("street")}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Start typing an address..."
                  autoComplete="off"
                  disabled={disabled}
                  role="combobox"
                  aria-expanded={showSuggestions}
                  aria-autocomplete="list"
                  aria-controls="addr-suggestions"
                  aria-activedescendant={
                    activeIndex >= 0
                      ? `addr-suggestion-${activeIndex}`
                      : undefined
                  }
                  className={[
                    inputClass("street"),
                    "pl-9",
                    isLoading ? "pr-9" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
                {isLoading && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  </div>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    id="addr-suggestions"
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-600 dark:bg-gray-900"
                  >
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={suggestion.id}
                        id={`addr-suggestion-${index}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        className={[
                          "flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors",
                          index === activeIndex
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
                        ].join(" ")}
                        onMouseDown={(e) => {
                          // Use mousedown to fire before input blur
                          e.preventDefault();
                          selectSuggestion(suggestion);
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <MapPinIcon className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="truncate">{suggestion.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </FieldWrapper>
          </div>

          {/* ---- City ---- */}
          <FieldWrapper
            label="City"
            htmlFor="addr-city"
            error={touched.city ? errors.city : undefined}
            required
          >
            <input
              id="addr-city"
              type="text"
              value={address.city}
              onChange={(e) => updateField("city", e.target.value)}
              onBlur={() => handleBlur("city")}
              placeholder="City"
              autoComplete="address-level2"
              disabled={disabled}
              className={inputClass("city")}
            />
          </FieldWrapper>

          {/* ---- State / Province ---- */}
          <FieldWrapper
            label="State / Province"
            htmlFor="addr-state"
            error={touched.state ? errors.state : undefined}
            required
          >
            <input
              id="addr-state"
              type="text"
              value={address.state}
              onChange={(e) => updateField("state", e.target.value)}
              onBlur={() => handleBlur("state")}
              placeholder="State or Province"
              autoComplete="address-level1"
              disabled={disabled}
              className={inputClass("state")}
            />
          </FieldWrapper>

          {/* ---- ZIP / Postal Code ---- */}
          <FieldWrapper
            label="ZIP / Postal Code"
            htmlFor="addr-zip"
            error={touched.zip ? errors.zip : undefined}
            hint="e.g. 90210, M5H 2N2, SW1A 1AA"
            required
          >
            <input
              id="addr-zip"
              type="text"
              value={address.zip}
              onChange={(e) => updateField("zip", e.target.value)}
              onBlur={() => handleBlur("zip")}
              placeholder="ZIP / Postal Code"
              autoComplete="postal-code"
              disabled={disabled}
              className={inputClass("zip")}
            />
          </FieldWrapper>

          {/* ---- Country ---- */}
          <FieldWrapper
            label="Country"
            htmlFor="addr-country"
            error={touched.country ? errors.country : undefined}
            required
          >
            <div className="relative">
              <select
                id="addr-country"
                value={address.country}
                onChange={(e) => updateField("country", e.target.value)}
                onBlur={() => handleBlur("country")}
                disabled={disabled}
                autoComplete="country"
                className={selectClass("country")}
              >
                <option value="" disabled>
                  Select a country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                <ChevronDownIcon />
              </div>
            </div>
          </FieldWrapper>
        </div>

        {/* ---- Map Preview ---- */}
        {!hideMapPreview && (
          <div className="mt-4">
            <MapPreview address={address} />
          </div>
        )}

        {/* ---- Submit ---- */}
        {onSubmit && (
          <div className="mt-6">
            <button
              type="submit"
              disabled={disabled}
              className={[
                "inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto",
                "bg-blue-600 text-white shadow-sm",
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-900",
              ].join(" ")}
            >
              {submitLabel}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Re-exports for convenience
// ---------------------------------------------------------------------------

export type {
  AddressAutocompleteProps,
  AddressData,
  AddressSuggestion,
  CountryOption,
  FetchSuggestionsFn,
} from "./address-autocomplete.types";
