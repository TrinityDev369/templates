// ---------------------------------------------------------------------------
// Address Autocomplete — Type Definitions
// ---------------------------------------------------------------------------

/** A single address suggestion returned by the autocomplete provider. */
export interface AddressSuggestion {
  /** Unique identifier for the suggestion (used as React key). */
  id: string;
  /** Primary display text (e.g. "123 Main St, Springfield, IL 62701"). */
  label: string;
  /** Structured address fields. Partial — only populate what the API returns. */
  address?: Partial<AddressData>;
}

/** Structured address data emitted by the component. */
export interface AddressData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/** Validation errors keyed by field name. */
export type AddressErrors = Partial<Record<keyof AddressData, string>>;

/**
 * Async function that fetches address suggestions for a given query string.
 * Return an empty array if no results are found.
 *
 * @example
 * // Google Places integration
 * const fetchFromGoogle: FetchSuggestionsFn = async (query) => {
 *   const res = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
 *   const data = await res.json();
 *   return data.predictions.map((p) => ({
 *     id: p.place_id,
 *     label: p.description,
 *     address: parseGoogleAddress(p),
 *   }));
 * };
 */
export type FetchSuggestionsFn = (
  query: string,
) => Promise<AddressSuggestion[]>;

/** Props for the AddressAutocomplete component. */
export interface AddressAutocompleteProps {
  /**
   * Called whenever the address fields change (on every keystroke and
   * when a suggestion is selected). Receives the current address state.
   */
  onAddressChange?: (address: AddressData) => void;

  /**
   * Called when the user explicitly submits the form (clicks Save / presses Enter).
   * Only fires if validation passes.
   */
  onSubmit?: (address: AddressData) => void;

  /** Pre-populate the form with existing address data. */
  defaultAddress?: Partial<AddressData>;

  /**
   * Custom suggestion fetcher. When provided, replaces the built-in mock
   * suggestions. Use this to integrate Google Places, Mapbox Geocoding,
   * HERE, or any other address API.
   */
  fetchSuggestions?: FetchSuggestionsFn;

  /** Debounce delay in milliseconds for the autocomplete search. @default 300 */
  debounceMs?: number;

  /** Label displayed above the form. @default "Address" */
  label?: string;

  /** Text for the submit button. @default "Save Address" */
  submitLabel?: string;

  /** Hide the map preview placeholder. @default false */
  hideMapPreview?: boolean;

  /** Additional CSS classes applied to the root container. */
  className?: string;

  /** Mark all fields as disabled (e.g. while a parent form is submitting). */
  disabled?: boolean;
}

/** Country entry for the country selector dropdown. */
export interface CountryOption {
  code: string;
  name: string;
}
