// ---------------------------------------------------------------------------
// Filter types & placeholder data for shop-search-filters
// ---------------------------------------------------------------------------

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating";

export interface FilterState {
  search: string;
  sort: SortOption;
  priceRange: [number, number];
  categories: string[];
  colors: string[];
}

export interface ColorOption {
  name: string;
  /** Hex color value, e.g. "#000000" */
  value: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// Placeholder colors
// ---------------------------------------------------------------------------

export const PLACEHOLDER_COLORS: ColorOption[] = [
  { name: "Black", value: "#000000", slug: "black" },
  { name: "White", value: "#FFFFFF", slug: "white" },
  { name: "Red", value: "#EF4444", slug: "red" },
  { name: "Blue", value: "#3B82F6", slug: "blue" },
  { name: "Green", value: "#22C55E", slug: "green" },
  { name: "Yellow", value: "#EAB308", slug: "yellow" },
  { name: "Purple", value: "#A855F7", slug: "purple" },
  { name: "Pink", value: "#EC4899", slug: "pink" },
];

// ---------------------------------------------------------------------------
// Default / initial filter state
// ---------------------------------------------------------------------------

export const DEFAULT_FILTER_STATE: FilterState = {
  search: "",
  sort: "relevance",
  priceRange: [0, 500],
  categories: [],
  colors: [],
};
