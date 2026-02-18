"use client";

/**
 * DiffViewer -- A self-contained side-by-side and inline diff viewer.
 *
 * Implements an LCS-based line diff algorithm (equivalent to the core of
 * Myers diff). Optionally highlights word-level changes within modified
 * lines. No external diff libraries required.
 *
 * Features:
 * - Split (side-by-side) and inline view modes
 * - Line numbers in gutter
 * - Collapsible unchanged sections (first/last 3 lines shown, middle collapsed)
 * - Word-level highlighting within changed lines
 * - Whitespace visualization option
 * - Light / dark / auto theme support via Tailwind `dark:` classes
 * - Summary bar with addition/deletion/unchanged counts
 */

import React, {
  useState,
  useMemo,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export type DiffViewMode = "split" | "inline";
export type DiffTheme = "light" | "dark" | "auto";

export interface DiffViewerProps {
  /** The original (old) text. */
  oldText: string;
  /** The modified (new) text. */
  newText: string;
  /** Label for the old text column. @default "Original" */
  oldTitle?: string;
  /** Label for the new text column. @default "Modified" */
  newTitle?: string;
  /** Display mode: side-by-side or interleaved. @default "split" */
  mode?: DiffViewMode;
  /** Color theme. @default "auto" */
  theme?: DiffTheme;
  /** Show line numbers in the gutter. @default true */
  showLineNumbers?: boolean;
  /** Additional CSS class on the root element. */
  className?: string;
  /** Additional inline styles on the root element. */
  style?: CSSProperties;
  /** Highlight whitespace characters (spaces, tabs). @default false */
  highlightWhitespace?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Diff algorithm -- LCS-based line diff                              */
/* ------------------------------------------------------------------ */

/** The type of change for each diff hunk. */
type ChangeKind = "equal" | "add" | "delete";

interface DiffLine {
  kind: ChangeKind;
  oldLineNo: number | null;
  newLineNo: number | null;
  oldContent: string;
  newContent: string;
}

/**
 * Compute the longest common subsequence table (bottom-up DP).
 * Returns a 2D array where lcs[i][j] = length of LCS of
 * oldLines[0..i-1] and newLines[0..j-1].
 */
function buildLcsTable(oldLines: string[], newLines: string[]): number[][] {
  const m = oldLines.length;
  const n = newLines.length;

  const table: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
  }

  return table;
}

/**
 * Backtrack through the LCS table to produce a sequence of DiffLine entries.
 * Prioritizes deletions before additions when the LCS values are equal,
 * producing output consistent with standard unified-diff conventions.
 */
function backtrackDiff(
  oldLines: string[],
  newLines: string[],
  table: number[][]
): DiffLine[] {
  const result: DiffLine[] = [];
  let i = oldLines.length;
  let j = newLines.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({
        kind: "equal",
        oldLineNo: i,
        newLineNo: j,
        oldContent: oldLines[i - 1],
        newContent: newLines[j - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
      result.push({
        kind: "add",
        oldLineNo: null,
        newLineNo: j,
        oldContent: "",
        newContent: newLines[j - 1],
      });
      j--;
    } else {
      result.push({
        kind: "delete",
        oldLineNo: i,
        newLineNo: null,
        oldContent: oldLines[i - 1],
        newContent: "",
      });
      i--;
    }
  }

  return result.reverse();
}

/**
 * Top-level diff: split text into lines, compute LCS, return DiffLine[].
 */
function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const table = buildLcsTable(oldLines, newLines);
  return backtrackDiff(oldLines, newLines, table);
}

/* ------------------------------------------------------------------ */
/*  Word-level diff for highlighting intra-line changes                */
/* ------------------------------------------------------------------ */

interface WordSpan {
  text: string;
  highlighted: boolean;
}

/**
 * Tokenize a string into alternating word and whitespace tokens
 * for fine-grained intra-line comparison.
 */
function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  for (const ch of line) {
    if (ch === " " || ch === "\t") {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(ch);
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

/**
 * Merge adjacent spans that share the same highlight state
 * to reduce the number of DOM nodes.
 */
function mergeSpans(spans: WordSpan[]): WordSpan[] {
  if (spans.length === 0) return spans;
  const merged: WordSpan[] = [{ ...spans[0] }];
  for (let k = 1; k < spans.length; k++) {
    const last = merged[merged.length - 1];
    if (last.highlighted === spans[k].highlighted) {
      last.text += spans[k].text;
    } else {
      merged.push({ ...spans[k] });
    }
  }
  return merged;
}

/**
 * Compute word-level diff between two strings using LCS on tokens.
 * Returns parallel arrays of WordSpan for the old and new sides.
 */
function computeWordDiff(
  oldLine: string,
  newLine: string
): { oldSpans: WordSpan[]; newSpans: WordSpan[] } {
  const oldWords = tokenize(oldLine);
  const newWords = tokenize(newLine);

  const m = oldWords.length;
  const n = newWords.length;

  // Build LCS table for tokens
  const tbl: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        tbl[i][j] = tbl[i - 1][j - 1] + 1;
      } else {
        tbl[i][j] = Math.max(tbl[i - 1][j], tbl[i][j - 1]);
      }
    }
  }

  // Backtrack to build spans
  const tmpOld: WordSpan[] = [];
  const tmpNew: WordSpan[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      tmpOld.push({ text: oldWords[i - 1], highlighted: false });
      tmpNew.push({ text: newWords[j - 1], highlighted: false });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || tbl[i][j - 1] >= tbl[i - 1][j])) {
      tmpNew.push({ text: newWords[j - 1], highlighted: true });
      j--;
    } else {
      tmpOld.push({ text: oldWords[i - 1], highlighted: true });
      i--;
    }
  }

  tmpOld.reverse();
  tmpNew.reverse();

  return { oldSpans: mergeSpans(tmpOld), newSpans: mergeSpans(tmpNew) };
}

/* ------------------------------------------------------------------ */
/*  Collapsible section grouping                                       */
/* ------------------------------------------------------------------ */

/** Context lines shown at the edges of collapsed blocks. */
const CONTEXT_LINES = 3;

/** Minimum unchanged block size before we collapse its middle. */
const COLLAPSE_THRESHOLD = CONTEXT_LINES * 2 + 1; // 7

type DiffGroup =
  | { type: "lines"; lines: DiffLine[] }
  | { type: "collapsed"; lines: DiffLine[]; id: number };

/**
 * Group diff lines into renderable sections.
 * Long unchanged stretches are split into head / collapsed-middle / tail.
 * Each collapsed section gets a deterministic numeric id for toggle state.
 */
function groupDiffLines(diff: DiffLine[]): DiffGroup[] {
  const groups: DiffGroup[] = [];
  let currentUnchanged: DiffLine[] = [];
  let collapseId = 0;

  function flushUnchanged() {
    if (currentUnchanged.length === 0) return;

    if (currentUnchanged.length >= COLLAPSE_THRESHOLD) {
      const head = currentUnchanged.slice(0, CONTEXT_LINES);
      const middle = currentUnchanged.slice(
        CONTEXT_LINES,
        currentUnchanged.length - CONTEXT_LINES
      );
      const tail = currentUnchanged.slice(
        currentUnchanged.length - CONTEXT_LINES
      );

      if (head.length > 0) groups.push({ type: "lines", lines: head });
      groups.push({ type: "collapsed", lines: middle, id: collapseId++ });
      if (tail.length > 0) groups.push({ type: "lines", lines: tail });
    } else {
      groups.push({ type: "lines", lines: [...currentUnchanged] });
    }
    currentUnchanged = [];
  }

  for (const line of diff) {
    if (line.kind === "equal") {
      currentUnchanged.push(line);
    } else {
      flushUnchanged();
      const last = groups[groups.length - 1];
      if (last && last.type === "lines") {
        last.lines.push(line);
      } else {
        groups.push({ type: "lines", lines: [line] });
      }
    }
  }
  flushUnchanged();

  return groups;
}

/* ------------------------------------------------------------------ */
/*  Paired rows for split mode alignment                               */
/* ------------------------------------------------------------------ */

interface SplitRow {
  leftLine: DiffLine | null;
  rightLine: DiffLine | null;
}

/**
 * Pair deletions on the left with additions on the right for
 * side-by-side display. Equal lines appear on both sides.
 */
function buildSplitRows(lines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.kind === "equal") {
      rows.push({ leftLine: line, rightLine: line });
      i++;
      continue;
    }

    if (line.kind === "delete") {
      // Collect consecutive deletes then consecutive adds
      const deletes: DiffLine[] = [];
      while (i < lines.length && lines[i].kind === "delete") {
        deletes.push(lines[i]);
        i++;
      }
      const adds: DiffLine[] = [];
      while (i < lines.length && lines[i].kind === "add") {
        adds.push(lines[i]);
        i++;
      }
      const maxLen = Math.max(deletes.length, adds.length);
      for (let k = 0; k < maxLen; k++) {
        rows.push({
          leftLine: k < deletes.length ? deletes[k] : null,
          rightLine: k < adds.length ? adds[k] : null,
        });
      }
      continue;
    }

    // Standalone add (no preceding delete)
    rows.push({ leftLine: null, rightLine: line });
    i++;
  }

  return rows;
}

/* ------------------------------------------------------------------ */
/*  Whitespace visualization helpers                                   */
/* ------------------------------------------------------------------ */

function renderWhitespace(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let buffer = "";
  let idx = 0;

  for (const ch of text) {
    if (ch === " ") {
      if (buffer) {
        parts.push(<span key={`t${idx}`}>{buffer}</span>);
        buffer = "";
      }
      parts.push(
        <span
          key={`ws${idx}`}
          className="opacity-40 border-b border-dotted border-current"
        >
          {"\u00B7"}
        </span>
      );
    } else if (ch === "\t") {
      if (buffer) {
        parts.push(<span key={`t${idx}`}>{buffer}</span>);
        buffer = "";
      }
      parts.push(
        <span
          key={`tab${idx}`}
          className="opacity-40 border-b border-dotted border-current"
        >
          {"\u2192   "}
        </span>
      );
    } else {
      buffer += ch;
    }
    idx++;
  }
  if (buffer) {
    parts.push(<span key={`t${idx}`}>{buffer}</span>);
  }

  return parts;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DiffViewer({
  oldText,
  newText,
  oldTitle = "Original",
  newTitle = "Modified",
  mode = "split",
  theme = "auto",
  showLineNumbers = true,
  className,
  style,
  highlightWhitespace = false,
}: DiffViewerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpanded = useCallback((id: number) => {
    setExpandedIds((prev: Set<number>) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Compute line-level diff
  const diff = useMemo(
    () => computeDiff(oldText, newText),
    [oldText, newText]
  );

  // Statistics
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;
    for (const line of diff) {
      switch (line.kind) {
        case "add":
          additions++;
          break;
        case "delete":
          deletions++;
          break;
        case "equal":
          unchanged++;
          break;
      }
    }
    return { additions, deletions, unchanged };
  }, [diff]);

  // Group lines for collapsible rendering
  const groups = useMemo(() => groupDiffLines(diff), [diff]);

  // Theme: "dark" forces dark class, "light" forces nothing, "auto" defers to parent
  const themeClass = theme === "dark" ? "dark" : "";

  /* ---- Content rendering with optional word-level highlighting ---- */

  const renderContent = useCallback(
    (
      text: string,
      side: "old" | "new",
      pairedLine?: DiffLine | null
    ): ReactNode => {
      // Word-level diff when there is a paired modification
      if (pairedLine) {
        const { oldSpans, newSpans } = computeWordDiff(
          pairedLine.oldContent,
          pairedLine.newContent
        );
        const spans = side === "old" ? oldSpans : newSpans;
        return (
          <>
            {spans.map((span, idx) => {
              if (span.highlighted) {
                const hlClass =
                  side === "old"
                    ? "bg-red-300/60 dark:bg-red-500/40 rounded-sm"
                    : "bg-green-300/60 dark:bg-green-500/40 rounded-sm";
                return (
                  <span key={idx} className={hlClass}>
                    {highlightWhitespace
                      ? renderWhitespace(span.text)
                      : span.text}
                  </span>
                );
              }
              return (
                <span key={idx}>
                  {highlightWhitespace
                    ? renderWhitespace(span.text)
                    : span.text}
                </span>
              );
            })}
          </>
        );
      }

      if (highlightWhitespace) {
        return <>{renderWhitespace(text)}</>;
      }
      return text;
    },
    [highlightWhitespace]
  );

  /* ---- Line number cell ---- */

  const renderLineNo = useCallback(
    (num: number | null) => {
      if (!showLineNumbers) return null;
      return (
        <td className="select-none w-12 min-w-[3rem] px-2 text-right text-xs text-gray-400 dark:text-gray-500 align-top border-r border-gray-200 dark:border-gray-700">
          {num ?? ""}
        </td>
      );
    },
    [showLineNumbers]
  );

  /* ---- Line background color by change kind ---- */

  const lineBg = useCallback((kind: ChangeKind): string => {
    if (kind === "delete") return "bg-red-50 dark:bg-red-950/30";
    if (kind === "add") return "bg-green-50 dark:bg-green-950/30";
    return "";
  }, []);

  /* ---- Inline-mode prefix symbol and color ---- */

  const linePrefix = useCallback((kind: ChangeKind): string => {
    if (kind === "delete") return "- ";
    if (kind === "add") return "+ ";
    return "  ";
  }, []);

  const prefixColor = useCallback((kind: ChangeKind): string => {
    if (kind === "delete") return "text-red-600 dark:text-red-400";
    if (kind === "add") return "text-green-600 dark:text-green-400";
    return "text-gray-400 dark:text-gray-500";
  }, []);

  /* ---- Render a group of visible lines ---- */

  const renderLinesGroup = useCallback(
    (lines: DiffLine[], keyPrefix: string) => {
      if (mode === "split") {
        const rows = buildSplitRows(lines);
        return (
          <>
            {rows.map((row, idx) => {
              const leftKind = row.leftLine?.kind ?? "equal";
              const rightKind = row.rightLine?.kind ?? "equal";

              // Build a word-diff reference when left=delete paired with right=add
              const isPair =
                row.leftLine?.kind === "delete" &&
                row.rightLine?.kind === "add";
              const pairRef: DiffLine | null = isPair
                ? {
                    kind: "equal",
                    oldLineNo: row.leftLine?.oldLineNo ?? null,
                    newLineNo: row.rightLine?.newLineNo ?? null,
                    oldContent: row.leftLine?.oldContent ?? "",
                    newContent: row.rightLine?.newContent ?? "",
                  }
                : null;

              return (
                <tr key={`${keyPrefix}-${idx}`}>
                  {renderLineNo(row.leftLine?.oldLineNo ?? null)}
                  <td
                    className={`px-3 py-0.5 whitespace-pre font-mono text-sm align-top ${lineBg(leftKind)} ${
                      row.leftLine ? "text-gray-800 dark:text-gray-200" : ""
                    }`}
                  >
                    {row.leftLine
                      ? renderContent(
                          row.leftLine.oldContent,
                          "old",
                          isPair ? pairRef : null
                        )
                      : ""}
                  </td>
                  {renderLineNo(row.rightLine?.newLineNo ?? null)}
                  <td
                    className={`px-3 py-0.5 whitespace-pre font-mono text-sm align-top ${lineBg(rightKind)} ${
                      row.rightLine ? "text-gray-800 dark:text-gray-200" : ""
                    }`}
                  >
                    {row.rightLine
                      ? renderContent(
                          row.rightLine.newContent,
                          "new",
                          isPair ? pairRef : null
                        )
                      : ""}
                  </td>
                </tr>
              );
            })}
          </>
        );
      }

      // Inline mode
      return (
        <>
          {lines.map((line, idx) => {
            const content =
              line.kind === "delete" ? line.oldContent : line.newContent;
            return (
              <tr
                key={`${keyPrefix}-${idx}`}
                className={lineBg(line.kind)}
              >
                {renderLineNo(line.oldLineNo)}
                {renderLineNo(line.newLineNo)}
                <td className="px-3 py-0.5 whitespace-pre font-mono text-sm align-top text-gray-800 dark:text-gray-200">
                  <span
                    className={`select-none ${prefixColor(line.kind)}`}
                  >
                    {linePrefix(line.kind)}
                  </span>
                  {highlightWhitespace ? renderWhitespace(content) : content}
                </td>
              </tr>
            );
          })}
        </>
      );
    },
    [
      mode,
      renderLineNo,
      lineBg,
      renderContent,
      prefixColor,
      linePrefix,
      highlightWhitespace,
    ]
  );

  /* ---- Render a collapsible bar ---- */

  const renderCollapsedBar = useCallback(
    (group: DiffGroup & { type: "collapsed" }, groupIdx: number) => {
      const isExpanded = expandedIds.has(group.id);
      const count = group.lines.length;
      const colSpan =
        mode === "split"
          ? showLineNumbers
            ? 4
            : 2
          : showLineNumbers
            ? 3
            : 1;

      if (isExpanded) {
        return (
          <React.Fragment key={`cg${groupIdx}`}>
            <tr>
              <td
                colSpan={colSpan}
                className="text-center text-xs py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors border-y border-blue-200 dark:border-blue-800"
                onClick={() => toggleExpanded(group.id)}
              >
                Collapse {count} unchanged{" "}
                {count === 1 ? "line" : "lines"}
              </td>
            </tr>
            {renderLinesGroup(group.lines, `exp${groupIdx}`)}
          </React.Fragment>
        );
      }

      return (
        <tr key={`cg${groupIdx}`}>
          <td
            colSpan={colSpan}
            className="text-center text-xs py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border-y border-gray-200 dark:border-gray-700"
            onClick={() => toggleExpanded(group.id)}
          >
            Show {count} unchanged {count === 1 ? "line" : "lines"}
          </td>
        </tr>
      );
    },
    [expandedIds, mode, showLineNumbers, toggleExpanded, renderLinesGroup]
  );

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <div
      className={[
        themeClass,
        className ?? "",
        "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">
        <span className="text-green-700 dark:text-green-400">
          +{stats.additions}{" "}
          {stats.additions === 1 ? "addition" : "additions"}
        </span>
        <span className="text-red-700 dark:text-red-400">
          -{stats.deletions}{" "}
          {stats.deletions === 1 ? "deletion" : "deletions"}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {stats.unchanged} unchanged
        </span>
      </div>

      {/* Column headers (split mode only) */}
      {mode === "split" && (
        <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 truncate">
            {oldTitle}
          </div>
          <div className="px-4 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 truncate">
            {newTitle}
          </div>
        </div>
      )}

      {/* Diff table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {groups.map((group, gIdx) => {
              if (group.type === "collapsed") {
                return renderCollapsedBar(
                  group as DiffGroup & { type: "collapsed" },
                  gIdx
                );
              }
              return (
                <React.Fragment key={`g${gIdx}`}>
                  {renderLinesGroup(group.lines, `g${gIdx}`)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DiffViewer;
