"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { JsonValue, JsonViewerProps, JsonNodeProps } from "./json-viewer.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isObject(v: JsonValue): v is { [key: string]: JsonValue } {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function isArray(v: JsonValue): v is JsonValue[] {
  return Array.isArray(v);
}

function isExpandable(v: JsonValue): boolean {
  return isObject(v) || isArray(v);
}

function childCount(v: JsonValue): number {
  if (isArray(v)) return v.length;
  if (isObject(v)) return Object.keys(v).length;
  return 0;
}

/** Collect every path that should be expanded to reveal a search match. */
function collectMatchingPaths(
  value: JsonValue,
  term: string,
  currentPath: string
): Set<string> {
  const result = new Set<string>();
  const lower = term.toLowerCase();

  function walk(v: JsonValue, path: string, parentPaths: string[]) {
    if (isObject(v)) {
      const keys = Object.keys(v);
      for (const k of keys) {
        const childPath = path ? `${path}.${k}` : k;
        const keyMatches = k.toLowerCase().includes(lower);
        const childVal = v[k];
        const valMatches = !isExpandable(childVal) && String(childVal).toLowerCase().includes(lower);

        if (keyMatches || valMatches) {
          // expand all ancestors + this node itself if expandable
          for (const p of parentPaths) result.add(p);
          result.add(path);
          if (isExpandable(childVal)) result.add(childPath);
        }

        if (isExpandable(childVal)) {
          walk(childVal, childPath, [...parentPaths, path]);
        }
      }
    } else if (isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const childPath = `${path}[${i}]`;
        const childVal = v[i];
        const valMatches = !isExpandable(childVal) && String(childVal).toLowerCase().includes(lower);

        if (valMatches) {
          for (const p of parentPaths) result.add(p);
          result.add(path);
        }

        if (isExpandable(childVal)) {
          walk(childVal, childPath, [...parentPaths, path]);
        }
      }
    }
  }

  walk(value, currentPath, []);
  return result;
}

/** Build the set of paths that should be expanded at the given depth. */
function buildInitialExpanded(
  value: JsonValue,
  rootPath: string,
  maxDepth: number
): Set<string> {
  const result = new Set<string>();

  function walk(v: JsonValue, path: string, depth: number) {
    if (depth >= maxDepth) return;
    if (!isExpandable(v)) return;
    result.add(path);

    if (isObject(v)) {
      for (const k of Object.keys(v)) {
        walk(v[k], path ? `${path}.${k}` : k, depth + 1);
      }
    } else if (isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        walk(v[i], `${path}[${i}]`, depth + 1);
      }
    }
  }

  walk(value, rootPath, 0);
  return result;
}

/** Collect every expandable path in the tree. */
function collectAllPaths(value: JsonValue, rootPath: string): Set<string> {
  const result = new Set<string>();

  function walk(v: JsonValue, path: string) {
    if (!isExpandable(v)) return;
    result.add(path);
    if (isObject(v)) {
      for (const k of Object.keys(v)) {
        walk(v[k], path ? `${path}.${k}` : k);
      }
    } else if (isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        walk(v[i], `${path}[${i}]`);
      }
    }
  }

  walk(value, rootPath);
  return result;
}

// ---------------------------------------------------------------------------
// Highlight component for search matches
// ---------------------------------------------------------------------------

function HighlightText({ text, term }: { text: string; term: string }) {
  if (!term) return <>{text}</>;
  const lower = text.toLowerCase();
  const tLower = term.toLowerCase();
  const idx = lower.indexOf(tLower);
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">
        {text.slice(idx, idx + term.length)}
      </span>
      {text.slice(idx + term.length)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ value }: { value: JsonValue }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = JSON.stringify(value, null, 2);
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 1500);
      });
    },
    [value]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 opacity-0 group-hover/node:opacity-100 transition-opacity text-xs
        px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer select-none"
      title="Copy to clipboard"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Chevron icon
// ---------------------------------------------------------------------------

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={`inline-block transition-transform duration-150 mr-1 flex-shrink-0 ${
        expanded ? "rotate-90" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4,2 8,6 4,10" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Primitive value renderer
// ---------------------------------------------------------------------------

function PrimitiveValue({
  value,
  searchTerm,
}: {
  value: string | number | boolean | null;
  searchTerm: string;
}) {
  if (value === null) {
    return <span className="text-gray-400 dark:text-gray-500 italic">null</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className="text-purple-600 dark:text-purple-400">
        {String(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return (
      <span className="text-blue-600 dark:text-blue-400">
        <HighlightText text={String(value)} term={searchTerm} />
      </span>
    );
  }
  // string
  return (
    <span className="text-green-600 dark:text-green-400">
      &quot;
      <HighlightText text={value} term={searchTerm} />
      &quot;
    </span>
  );
}

// ---------------------------------------------------------------------------
// JsonNode (recursive)
// ---------------------------------------------------------------------------

function JsonNode({
  keyName,
  value,
  depth,
  isLast,
  initialExpandDepth,
  enableCopy,
  sortKeys,
  quotesOnKeys,
  indentWidth,
  searchTerm,
  expandedPaths,
  onToggle,
  path,
}: JsonNodeProps) {
  const expanded = expandedPaths.has(path);
  const expandable = isExpandable(value);
  const count = childCount(value);
  const isArr = isArray(value);
  const openBracket = isArr ? "[" : "{";
  const closeBracket = isArr ? "]" : "}";
  const comma = isLast ? "" : ",";

  const paddingLeft = depth * indentWidth;

  const formattedKey = useMemo(() => {
    if (keyName === null) return null;
    return quotesOnKeys ? `"${keyName}"` : keyName;
  }, [keyName, quotesOnKeys]);

  const entries = useMemo(() => {
    if (!expandable || !expanded) return [];
    if (isArr) {
      return (value as JsonValue[]).map((v, i) => ({
        key: String(i),
        value: v,
        childPath: `${path}[${i}]`,
      }));
    }
    const obj = value as { [key: string]: JsonValue };
    let keys = Object.keys(obj);
    if (sortKeys) keys = keys.sort();
    return keys.map((k) => ({
      key: k,
      value: obj[k],
      childPath: path ? `${path}.${k}` : k,
    }));
  }, [expandable, expanded, value, path, sortKeys, isArr]);

  const handleToggle = useCallback(() => {
    if (expandable) onToggle(path);
  }, [expandable, onToggle, path]);

  // --- Primitive values ---
  if (!expandable) {
    return (
      <div
        className="group/node flex items-center leading-6 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        style={{ paddingLeft: `${paddingLeft}ch` }}
      >
        {formattedKey !== null && (
          <>
            <span className="text-gray-800 dark:text-gray-200">
              <HighlightText text={formattedKey} term={searchTerm} />
            </span>
            <span className="text-gray-500 dark:text-gray-400">:&nbsp;</span>
          </>
        )}
        <PrimitiveValue
          value={value as string | number | boolean | null}
          searchTerm={searchTerm}
        />
        <span className="text-gray-500 dark:text-gray-400">{comma}</span>
        {enableCopy && <CopyButton value={value} />}
      </div>
    );
  }

  // --- Collapsed expandable ---
  if (!expanded) {
    return (
      <div
        className="group/node flex items-center leading-6 cursor-pointer
          hover:bg-gray-50 dark:hover:bg-gray-800/50 select-none"
        style={{ paddingLeft: `${paddingLeft}ch` }}
        onClick={handleToggle}
      >
        <Chevron expanded={false} />
        {formattedKey !== null && (
          <>
            <span className="text-gray-800 dark:text-gray-200">
              <HighlightText text={formattedKey} term={searchTerm} />
            </span>
            <span className="text-gray-500 dark:text-gray-400">:&nbsp;</span>
          </>
        )}
        <span className="text-gray-500 dark:text-gray-400">{openBracket}</span>
        <span className="text-gray-400 dark:text-gray-500 mx-0.5">...</span>
        <span className="text-gray-500 dark:text-gray-400">{closeBracket}</span>
        <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">
          {count} {count === 1 ? "item" : "items"}
        </span>
        <span className="text-gray-500 dark:text-gray-400">{comma}</span>
        {enableCopy && <CopyButton value={value} />}
      </div>
    );
  }

  // --- Expanded expandable ---
  return (
    <div className="group/node">
      <div
        className="flex items-center leading-6 cursor-pointer
          hover:bg-gray-50 dark:hover:bg-gray-800/50 select-none"
        style={{ paddingLeft: `${paddingLeft}ch` }}
        onClick={handleToggle}
      >
        <Chevron expanded={true} />
        {formattedKey !== null && (
          <>
            <span className="text-gray-800 dark:text-gray-200">
              <HighlightText text={formattedKey} term={searchTerm} />
            </span>
            <span className="text-gray-500 dark:text-gray-400">:&nbsp;</span>
          </>
        )}
        <span className="text-gray-500 dark:text-gray-400">{openBracket}</span>
        {enableCopy && <CopyButton value={value} />}
      </div>

      {entries.map((entry, i) => (
        <JsonNode
          key={entry.childPath}
          keyName={isArr ? null : entry.key}
          value={entry.value}
          depth={depth + 1}
          isLast={i === entries.length - 1}
          initialExpandDepth={initialExpandDepth}
          enableCopy={enableCopy}
          sortKeys={sortKeys}
          quotesOnKeys={quotesOnKeys}
          indentWidth={indentWidth}
          searchTerm={searchTerm}
          expandedPaths={expandedPaths}
          onToggle={onToggle}
          path={entry.childPath}
        />
      ))}

      <div
        className="leading-6"
        style={{ paddingLeft: `${paddingLeft}ch` }}
      >
        <span className="text-gray-500 dark:text-gray-400">
          {closeBracket}
          {comma}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function Toolbar({
  enableSearch,
  searchTerm,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
}: {
  enableSearch: boolean;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {enableSearch && (
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search keys or values..."
          className="flex-1 min-w-0 text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-blue-600"
        />
      )}
      <div className="flex items-center gap-1 ml-auto">
        <button
          type="button"
          onClick={onExpandAll}
          className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer select-none"
        >
          Expand All
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer select-none"
        >
          Collapse All
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// JsonViewer (main export)
// ---------------------------------------------------------------------------

function JsonViewer({
  data,
  initialExpandDepth = 1,
  enableSearch = false,
  enableCopy = false,
  rootName = "root",
  theme = "light",
  className = "",
  sortKeys = false,
  quotesOnKeys = true,
  indentWidth = 2,
}: JsonViewerProps) {
  const rootPath = "$";

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() =>
    buildInitialExpanded(data, rootPath, initialExpandDepth + 1)
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Recompute initial expansion when data or initialExpandDepth changes
  useEffect(() => {
    setExpandedPaths(buildInitialExpanded(data, rootPath, initialExpandDepth + 1));
  }, [data, initialExpandDepth]);

  // When search term changes, auto-expand matching paths
  useEffect(() => {
    if (!searchTerm) return;
    const matches = collectMatchingPaths(data, searchTerm, rootPath);
    if (matches.size > 0) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        for (const p of matches) next.add(p);
        return next;
      });
    }
  }, [searchTerm, data]);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedPaths(collectAllPaths(data, rootPath));
  }, [data]);

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set<string>());
  }, []);

  // Theme class resolution
  const themeClass = useMemo(() => {
    if (theme === "dark") return "dark";
    if (theme === "light") return "";
    // "auto" defers to the parent's dark class / prefers-color-scheme
    return "";
  }, [theme]);

  const containerClasses = [
    "font-mono text-sm rounded-lg border overflow-hidden",
    "border-gray-200 dark:border-gray-700",
    "bg-white dark:bg-gray-900",
    "text-gray-800 dark:text-gray-200",
    themeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <Toolbar
        enableSearch={enableSearch}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />
      <div className="px-3 py-2 overflow-x-auto">
        {isExpandable(data) ? (
          <JsonNode
            keyName={rootName}
            value={data}
            depth={0}
            isLast={true}
            initialExpandDepth={initialExpandDepth}
            enableCopy={enableCopy}
            sortKeys={sortKeys}
            quotesOnKeys={quotesOnKeys}
            indentWidth={indentWidth}
            searchTerm={searchTerm}
            expandedPaths={expandedPaths}
            onToggle={handleToggle}
            path={rootPath}
          />
        ) : (
          <div className="leading-6">
            <span className="text-gray-800 dark:text-gray-200">
              {quotesOnKeys ? `"${rootName}"` : rootName}
            </span>
            <span className="text-gray-500 dark:text-gray-400">:&nbsp;</span>
            <PrimitiveValue
              value={data as string | number | boolean | null}
              searchTerm={searchTerm}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { JsonViewer, PrimitiveValue, HighlightText };
export type { JsonValue, JsonViewerProps } from "./json-viewer.types";
