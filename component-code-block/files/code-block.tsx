"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { codeToHtml } from "shiki";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CodeBlockProps {
  /** The source code string to display */
  code: string;
  /** Language identifier for syntax highlighting (e.g. "tsx", "python") */
  language?: string;
  /** Show line numbers in the gutter */
  showLineNumbers?: boolean;
  /** Array of 1-based line numbers to highlight */
  highlightLines?: number[];
  /** Optional filename or title shown in the header bar */
  title?: string;
  /** Additional class names merged onto the root container */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHIKI_THEME = "github-dark";
const COPY_FEEDBACK_MS = 2000;

/** Friendly display names for common languages */
const LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  tsx: "TSX",
  py: "Python",
  rb: "Ruby",
  rs: "Rust",
  go: "Go",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  mdx: "MDX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sql: "SQL",
  graphql: "GraphQL",
  dockerfile: "Dockerfile",
  toml: "TOML",
  xml: "XML",
  swift: "Swift",
  kotlin: "Kotlin",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  php: "PHP",
  lua: "Lua",
  zig: "Zig",
  prisma: "Prisma",
  plaintext: "Text",
  text: "Text",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLanguageLabel(language: string): string {
  return LANGUAGE_LABELS[language] ?? language.toUpperCase();
}

/**
 * Split highlighted HTML produced by shiki into individual line strings.
 *
 * Shiki wraps each line in a `<span class="line">...</span>`. We extract
 * those so we can render line numbers and per-line highlights independently.
 */
function splitHtmlIntoLines(html: string): string[] {
  const lineRegex = /<span class="line">(.*?)<\/span>/gs;
  const lines: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = lineRegex.exec(html)) !== null) {
    lines.push(match[1]);
  }

  // Fallback: if parsing yields nothing, return the raw HTML as a single line
  if (lines.length === 0) {
    return [html];
  }

  return lines;
}

/**
 * Extract background-color and color from shiki's root `<pre>` tag so we can
 * reuse them on our custom wrapper.
 */
function extractPreColors(html: string): {
  backgroundColor: string;
  color: string;
} {
  const bgMatch = html.match(/background-color:\s*([^;"]+)/);
  const colorMatch = html.match(/(?:^|;)\s*color:\s*([^;"]+)/);

  return {
    backgroundColor: bgMatch?.[1] ?? "#24292e",
    color: colorMatch?.[1] ?? "#e1e4e8",
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, COPY_FEEDBACK_MS);
    } catch {
      // Clipboard API may fail in insecure contexts -- fail silently
    }
  }, [code]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 text-muted-foreground transition-colors",
              "hover:bg-white/10 hover:text-foreground",
              copied && "text-emerald-400 hover:text-emerald-400"
            )}
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {copied ? "Copied!" : "Copy code"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function LineNumbers({
  count,
  highlightLines,
}: {
  count: number;
  highlightLines: Set<number>;
}) {
  return (
    <div
      aria-hidden="true"
      className="sticky left-0 z-10 select-none text-right font-mono text-xs leading-6 text-muted-foreground/40"
    >
      {Array.from({ length: count }, (_, i) => {
        const lineNum = i + 1;
        return (
          <div
            key={lineNum}
            className={cn(
              "px-3",
              highlightLines.has(lineNum) && "text-muted-foreground/70"
            )}
          >
            {lineNum}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function CodeBlock({
  code,
  language = "plaintext",
  showLineNumbers = true,
  highlightLines = [],
  title,
  className,
}: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const highlightSet = new Set(highlightLines);

  // Run shiki highlighting
  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: SHIKI_THEME,
        });

        if (!cancelled) {
          setHighlightedHtml(html);
        }
      } catch {
        // If the language is not supported, fall back to plaintext
        if (!cancelled) {
          try {
            const fallback = await codeToHtml(code, {
              lang: "plaintext",
              theme: SHIKI_THEME,
            });
            if (!cancelled) {
              setHighlightedHtml(fallback);
            }
          } catch {
            // Total failure -- leave as null to use the plain fallback
          }
        }
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  // Derive display values
  const languageLabel = getLanguageLabel(language);
  const lines = highlightedHtml ? splitHtmlIntoLines(highlightedHtml) : code.split("\n");
  const colors = highlightedHtml
    ? extractPreColors(highlightedHtml)
    : { backgroundColor: "#24292e", color: "#e1e4e8" };
  const showLanguage = language !== "plaintext";
  const hasHeader = Boolean(title) || showLanguage;

  return (
    <div
      className={cn(
        "not-prose group relative w-full overflow-hidden rounded-lg border border-border",
        className
      )}
    >
      {/* ---- Header bar ---- */}
      {hasHeader && (
        <div
          className="flex items-center justify-between border-b border-white/5 px-4 py-2"
          style={{
            backgroundColor: "rgb(36, 41, 46)",
          }}
        >
          <div className="flex items-center gap-2">
            {/* Language badge */}
            <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
              {languageLabel}
            </span>

            {/* Title / filename */}
            {title && (
              <span className="text-xs text-muted-foreground/70">{title}</span>
            )}
          </div>

          {/* Copy button */}
          <CopyButton code={code} />
        </div>
      )}

      {/* ---- Code body ---- */}
      <ScrollArea className="w-full">
        <div
          className="relative font-mono text-[13px] leading-6"
          style={{
            backgroundColor: colors.backgroundColor,
            color: colors.color,
          }}
        >
          <div className="flex min-w-fit">
            {/* Line numbers gutter */}
            {showLineNumbers && (
              <LineNumbers
                count={lines.length}
                highlightLines={highlightSet}
              />
            )}

            {/* Code lines */}
            <div className="flex-1 overflow-x-visible py-0">
              {lines.map((line, i) => {
                const lineNum = i + 1;
                const isHighlighted = highlightSet.has(lineNum);

                return (
                  <div
                    key={lineNum}
                    className={cn(
                      "px-4 leading-6",
                      isHighlighted &&
                        "bg-white/[0.06] shadow-[inset_2px_0_0_0_rgb(59,130,246)]"
                    )}
                  >
                    {highlightedHtml ? (
                      <span
                        className="[&>span]:font-mono"
                        dangerouslySetInnerHTML={{ __html: line }}
                      />
                    ) : (
                      <span className="text-muted-foreground">{line}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating copy button when there is no header */}
          {!hasHeader && (
            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
              <CopyButton code={code} />
            </div>
          )}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export { CodeBlock };
export type { CodeBlockProps };
