"use client";

/* ------------------------------------------------------------------ */
/*  Algolia Search — Search Box Component                             */
/* ------------------------------------------------------------------ */

import { useCallback, useRef, type KeyboardEvent } from "react";
import { useSearch } from "./search-provider";

/* ---------------------------------------------------------------- */
/*  Props                                                            */
/* ---------------------------------------------------------------- */

export interface SearchBoxProps {
  /** Placeholder text for the input (default: "Search..."). */
  placeholder?: string;
  /** Additional CSS classes applied to the outer wrapper. */
  className?: string;
  /** Autofocus the input on mount. */
  autoFocus?: boolean;
  /** Callback invoked when the user presses Enter. */
  onSubmit?: (query: string) => void;
}

/* ---------------------------------------------------------------- */
/*  Icons (inline SVG — no external icon library)                    */
/* ---------------------------------------------------------------- */

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon() {
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
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */

/**
 * Accessible search input wired to `<SearchProvider>`.
 *
 * Features:
 * - Inline search icon and loading spinner
 * - Clear button when query is non-empty
 * - Keyboard shortcuts: Escape to clear, Enter to submit
 * - Fully accessible with `role="searchbox"` and `aria-label`
 * - Styled with Tailwind CSS
 */
export function SearchBox({
  placeholder = "Search...",
  className = "",
  autoFocus = false,
  onSubmit,
}: SearchBoxProps) {
  const { state, actions } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    actions.clear();
    inputRef.current?.focus();
  }, [actions]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit?.(state.query);
        void actions.searchImmediate();
      }
    },
    [handleClear, onSubmit, state.query, actions],
  );

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Search icon / loading spinner */}
      <span className="pointer-events-none absolute left-3 text-gray-400">
        {state.isSearching ? <SpinnerIcon /> : <SearchIcon />}
      </span>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label="Search"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={state.query}
        onChange={(e) => actions.setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className={
          "w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 " +
          "text-sm text-gray-900 placeholder-gray-400 " +
          "outline-none transition-colors " +
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 " +
          "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 " +
          "dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        }
      />

      {/* Clear button */}
      {state.query.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className={
            "absolute right-3 rounded p-0.5 text-gray-400 " +
            "hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 " +
            "dark:hover:text-gray-300"
          }
          aria-label="Clear search"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}
