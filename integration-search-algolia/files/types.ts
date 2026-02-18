/* ------------------------------------------------------------------ */
/*  Algolia Search — Type Definitions                                 */
/* ------------------------------------------------------------------ */

/** Configuration required to initialize the Algolia client. */
export interface AlgoliaConfig {
  /** Algolia Application ID. */
  appId: string;
  /** Algolia Search-Only API Key (safe for client-side use). */
  searchApiKey: string;
  /** Default index to query. */
  indexName: string;
}

/** Highlight annotation returned by Algolia for a single attribute. */
export interface HighlightResult {
  /** Highlighted value with surrounding <mark> tags. */
  value: string;
  /** How well the attribute matched the query. */
  matchLevel: "none" | "partial" | "full";
  /** Words from the query that were matched. */
  matchedWords: string[];
  /** Whether the entire attribute value is highlighted. */
  fullyHighlighted?: boolean;
}

/**
 * A single search hit.
 *
 * `T` represents the shape of the record stored in the index.
 * Algolia augments each record with `objectID` and optional
 * `_highlightResult` / `_snippetResult` maps.
 */
export type SearchHit<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  /** Unique record identifier (always present). */
  objectID: string;
  /** Per-attribute highlight annotations keyed by attribute name. */
  _highlightResult?: Record<string, HighlightResult>;
};

/** The current state of the search UI. */
export interface SearchState<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Current search query string. */
  query: string;
  /** Array of hits returned for the current query. */
  hits: SearchHit<T>[];
  /** Current zero-based page index. */
  page: number;
  /** Total number of matching hits across all pages. */
  totalHits: number;
  /** Total number of result pages. */
  totalPages: number;
  /** Whether a search request is currently in flight. */
  isSearching: boolean;
  /** Last error message, if any. */
  error: string | null;
}

/** Filters that can be applied to narrow search results. */
export interface SearchFilters {
  /**
   * Facet filters — e.g. `["category:Books", "author:Twain"]`.
   * Nested arrays are OR-combined: `[["color:red","color:blue"], "size:M"]`.
   */
  facets?: string | string[] | string[][];
  /** Numeric filters — e.g. `["price > 10", "price < 50"]`. */
  numericFilters?: string | string[] | string[][];
  /** Tag filters — e.g. `["featured", "sale"]`. */
  tagFilters?: string | string[] | string[][];
}

/** Options passed when executing a search query. */
export interface SearchOptions {
  /** Number of hits per page (default: 20). */
  hitsPerPage?: number;
  /** Zero-based page to retrieve. */
  page?: number;
  /**
   * Raw filter string using Algolia filter syntax.
   * Example: `"category:Books AND price > 10"`
   */
  filters?: string;
  /** Facets to retrieve counts for. Use `["*"]` for all facets. */
  facets?: string[];
  /** Attributes to include in the response (reduces payload size). */
  attributesToRetrieve?: string[];
  /** Attributes for which to return highlight annotations. */
  attributesToHighlight?: string[];
}

/** A single autocomplete suggestion item. */
export interface AutocompleteItem {
  /** Unique identifier for the suggestion. */
  objectID: string;
  /** Plain-text label. */
  label: string;
  /** HTML-highlighted label (with <mark> tags). */
  highlighted: string;
}
