/* ------------------------------------------------------------------ */
/*  Algolia Search — Client Wrapper (no React dependency)             */
/* ------------------------------------------------------------------ */

import { algoliasearch } from "algoliasearch";
import type { AlgoliaConfig, SearchHit, SearchOptions } from "./types";

/**
 * Typed response returned by {@link AlgoliaClient.search}.
 */
export interface AlgoliaSearchResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  hits: SearchHit<T>[];
  query: string;
  page: number;
  nbHits: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
}

/**
 * Facet value returned by {@link AlgoliaClient.searchForFacetValues}.
 */
export interface FacetValueHit {
  value: string;
  highlighted: string;
  count: number;
}

/**
 * Lightweight Algolia client wrapper.
 *
 * Instantiates the official `algoliasearch` v5 client and exposes
 * search, facet-search, and single-object retrieval on a specific index.
 *
 * This module has **zero React dependencies** and can be used in any
 * JavaScript/TypeScript environment.
 */
export class AlgoliaClient<T extends Record<string, unknown> = Record<string, unknown>> {
  private readonly client: ReturnType<typeof algoliasearch>;
  private readonly indexName: string;

  constructor(config: AlgoliaConfig) {
    this.client = algoliasearch(config.appId, config.searchApiKey);
    this.indexName = config.indexName;
  }

  /* ---------------------------------------------------------------- */
  /*  Search                                                          */
  /* ---------------------------------------------------------------- */

  /**
   * Execute a search query against the configured index.
   *
   * @param query  - Search query string.
   * @param options - Optional search parameters.
   * @returns Typed search response with hits, pagination, etc.
   */
  async search(query: string, options: SearchOptions = {}): Promise<AlgoliaSearchResponse<T>> {
    try {
      const response = await this.client.searchSingleIndex<T>({
        indexName: this.indexName,
        searchParams: {
          query,
          hitsPerPage: options.hitsPerPage ?? 20,
          page: options.page ?? 0,
          ...(options.filters != null && { filters: options.filters }),
          ...(options.facets != null && { facets: options.facets }),
          ...(options.attributesToRetrieve != null && {
            attributesToRetrieve: options.attributesToRetrieve,
          }),
          ...(options.attributesToHighlight != null && {
            attributesToHighlight: options.attributesToHighlight,
          }),
        },
      });

      return {
        hits: response.hits as SearchHit<T>[],
        query: response.query ?? query,
        page: response.page ?? 0,
        nbHits: response.nbHits ?? 0,
        nbPages: response.nbPages ?? 0,
        hitsPerPage: response.hitsPerPage ?? 20,
        processingTimeMS: response.processingTimeMS ?? 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Algolia search failed";
      throw new Error(`[AlgoliaClient] search error: ${message}`);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Facet Search                                                    */
  /* ---------------------------------------------------------------- */

  /**
   * Search for values of a specific facet attribute.
   *
   * The facet must be declared as `searchable` in the Algolia index settings.
   *
   * @param facet - Facet attribute name.
   * @param query - Partial value to search for.
   * @returns Array of matching facet value hits.
   */
  async searchForFacetValues(facet: string, query: string): Promise<FacetValueHit[]> {
    try {
      const response = await this.client.searchForFacetValues({
        indexName: this.indexName,
        facetName: facet,
        searchForFacetValuesRequest: {
          facetQuery: query,
        },
      });

      return response.facetHits.map((hit) => ({
        value: hit.value,
        highlighted: hit.highlighted,
        count: hit.count,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Facet search failed";
      throw new Error(`[AlgoliaClient] searchForFacetValues error: ${message}`);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Single Object                                                   */
  /* ---------------------------------------------------------------- */

  /**
   * Retrieve a single record by its `objectID`.
   *
   * @param objectID - The unique record identifier.
   * @returns The record (typed as `T & { objectID: string }`).
   */
  async getObject(objectID: string): Promise<T & { objectID: string }> {
    try {
      const response = await this.client.getObject({
        indexName: this.indexName,
        objectID,
      });

      return response as T & { objectID: string };
    } catch (err) {
      const message = err instanceof Error ? err.message : "getObject failed";
      throw new Error(`[AlgoliaClient] getObject error: ${message}`);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Direct Access                                                   */
  /* ---------------------------------------------------------------- */

  /**
   * Expose the underlying `algoliasearch` client instance for advanced use
   * cases not covered by this wrapper (e.g. browse, multi-index queries).
   */
  get rawClient(): ReturnType<typeof algoliasearch> {
    return this.client;
  }

  /** The name of the configured index. */
  get index(): string {
    return this.indexName;
  }
}

/**
 * Factory helper — creates a new {@link AlgoliaClient} instance.
 *
 * @example
 * ```ts
 * const client = createAlgoliaClient({
 *   appId: "ABCDEF1234",
 *   searchApiKey: "xxxx",
 *   indexName: "products",
 * });
 * const { hits } = await client.search("shoes", { hitsPerPage: 10 });
 * ```
 */
export function createAlgoliaClient<T extends Record<string, unknown> = Record<string, unknown>>(
  config: AlgoliaConfig,
): AlgoliaClient<T> {
  return new AlgoliaClient<T>(config);
}
