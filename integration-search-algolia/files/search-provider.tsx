"use client";

/* ------------------------------------------------------------------ */
/*  Algolia Search — React Context Provider                           */
/* ------------------------------------------------------------------ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlgoliaClient, type AlgoliaSearchResponse } from "./client";
import type { AlgoliaConfig, SearchHit, SearchOptions, SearchState } from "./types";

/* ---------------------------------------------------------------- */
/*  Context Shape                                                    */
/* ---------------------------------------------------------------- */

export interface SearchActions<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Update the search query (triggers debounced search). */
  setQuery: (query: string) => void;
  /** Execute a search immediately (bypasses debounce). */
  searchImmediate: (query?: string, options?: SearchOptions) => Promise<void>;
  /** Navigate to a specific results page. */
  setPage: (page: number) => void;
  /** Clear the search state entirely. */
  clear: () => void;
  /** Access the underlying Algolia client for advanced operations. */
  client: AlgoliaClient<T>;
}

export interface SearchContextValue<T extends Record<string, unknown> = Record<string, unknown>> {
  state: SearchState<T>;
  actions: SearchActions<T>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

/* ---------------------------------------------------------------- */
/*  Provider Props                                                   */
/* ---------------------------------------------------------------- */

export interface SearchProviderProps extends AlgoliaConfig {
  children: ReactNode;
  /** Debounce delay in milliseconds (default: 300). */
  debounceMs?: number;
  /** Default number of hits per page (default: 20). */
  hitsPerPage?: number;
  /** Additional search options applied to every query. */
  defaultOptions?: SearchOptions;
}

/* ---------------------------------------------------------------- */
/*  Initial State                                                    */
/* ---------------------------------------------------------------- */

function createInitialState<T extends Record<string, unknown>>(): SearchState<T> {
  return {
    query: "",
    hits: [],
    page: 0,
    totalHits: 0,
    totalPages: 0,
    isSearching: false,
    error: null,
  };
}

/* ---------------------------------------------------------------- */
/*  Provider Component                                               */
/* ---------------------------------------------------------------- */

export function SearchProvider<T extends Record<string, unknown> = Record<string, unknown>>({
  appId,
  searchApiKey,
  indexName,
  debounceMs = 300,
  hitsPerPage = 20,
  defaultOptions,
  children,
}: SearchProviderProps) {
  /* --- client (stable across renders) --- */
  const clientRef = useRef<AlgoliaClient<T> | null>(null);
  if (clientRef.current === null) {
    clientRef.current = new AlgoliaClient<T>({ appId, searchApiKey, indexName });
  }
  const client = clientRef.current;

  /* --- state --- */
  const [state, setState] = useState<SearchState<T>>(createInitialState<T>);

  /* --- debounce timer ref --- */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* --- latest query ref (avoids stale closures) --- */
  const queryRef = useRef(state.query);
  queryRef.current = state.query;

  /* ---------------------------------------------------------------- */
  /*  Core search execution                                           */
  /* ---------------------------------------------------------------- */

  const executeSearch = useCallback(
    async (query: string, page: number, options?: SearchOptions) => {
      if (query.trim() === "") {
        setState((prev) => ({
          ...prev,
          hits: [],
          page: 0,
          totalHits: 0,
          totalPages: 0,
          isSearching: false,
          error: null,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isSearching: true, error: null }));

      try {
        const response: AlgoliaSearchResponse<T> = await client.search(query, {
          hitsPerPage,
          page,
          ...defaultOptions,
          ...options,
        });

        setState((prev) => ({
          ...prev,
          hits: response.hits as SearchHit<T>[],
          page: response.page,
          totalHits: response.nbHits,
          totalPages: response.nbPages,
          isSearching: false,
          error: null,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Search failed";
        setState((prev) => ({
          ...prev,
          isSearching: false,
          error: message,
        }));
      }
    },
    [client, hitsPerPage, defaultOptions],
  );

  /* ---------------------------------------------------------------- */
  /*  Debounced query watcher                                         */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      void executeSearch(state.query, 0);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.query, debounceMs]);

  /* ---------------------------------------------------------------- */
  /*  Actions                                                         */
  /* ---------------------------------------------------------------- */

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query, page: 0 }));
  }, []);

  const searchImmediate = useCallback(
    async (query?: string, options?: SearchOptions) => {
      const q = query ?? queryRef.current;
      setState((prev) => ({ ...prev, query: q }));
      if (timerRef.current) clearTimeout(timerRef.current);
      await executeSearch(q, 0, options);
    },
    [executeSearch],
  );

  const setPage = useCallback(
    (page: number) => {
      setState((prev) => ({ ...prev, page }));
      void executeSearch(queryRef.current, page);
    },
    [executeSearch],
  );

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(createInitialState<T>);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Memoized context value                                          */
  /* ---------------------------------------------------------------- */

  const value = useMemo<SearchContextValue<T>>(
    () => ({
      state,
      actions: { setQuery, searchImmediate, setPage, clear, client },
    }),
    [state, setQuery, searchImmediate, setPage, clear, client],
  );

  return (
    <SearchContext.Provider value={value as SearchContextValue}>
      {children}
    </SearchContext.Provider>
  );
}

/* ---------------------------------------------------------------- */
/*  Hook                                                             */
/* ---------------------------------------------------------------- */

/**
 * Access Algolia search state and actions from any child of `<SearchProvider>`.
 *
 * @example
 * ```tsx
 * const { state, actions } = useSearch<Product>();
 * actions.setQuery("running shoes");
 * ```
 */
export function useSearch<
  T extends Record<string, unknown> = Record<string, unknown>,
>(): SearchContextValue<T> {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within a <SearchProvider>.");
  }
  return ctx as SearchContextValue<T>;
}
