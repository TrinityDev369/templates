export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface JsonViewerProps {
  /** The JSON data to render in the tree viewer. */
  data: JsonValue;
  /** How many levels of nesting to expand by default. Default: 1. */
  initialExpandDepth?: number;
  /** Show the search toolbar to filter/highlight keys and values. */
  enableSearch?: boolean;
  /** Show a copy-to-clipboard button on hover for each node. */
  enableCopy?: boolean;
  /** Label for the root node. Default: "root". */
  rootName?: string;
  /** Color theme. "auto" follows prefers-color-scheme. Default: "light". */
  theme?: "light" | "dark" | "auto";
  /** Additional CSS class names for the root container. */
  className?: string;
  /** Sort object keys alphabetically. */
  sortKeys?: boolean;
  /** Wrap keys in double quotes. Default: true. */
  quotesOnKeys?: boolean;
  /** Indentation width in characters. Default: 2. */
  indentWidth?: number;
}

export interface JsonNodeProps {
  keyName: string | null;
  value: JsonValue;
  depth: number;
  isLast: boolean;
  initialExpandDepth: number;
  enableCopy: boolean;
  sortKeys: boolean;
  quotesOnKeys: boolean;
  indentWidth: number;
  searchTerm: string;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  path: string;
}
