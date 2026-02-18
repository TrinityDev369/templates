"use client";

import {
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MarkdownPreviewProps {
  /** The raw markdown string. */
  value: string;
  /** Called whenever the user edits the markdown. */
  onChange: (value: string) => void;
  /** Additional CSS class names applied to the root container. */
  className?: string;
  /** Inline styles applied to the root container. */
  style?: CSSProperties;
  /** Placeholder text shown when the editor is empty. */
  placeholder?: string;
  /** Color theme. `"auto"` follows system preference via Tailwind `dark:` prefix. */
  theme?: "light" | "dark" | "auto";
  /** Layout mode: split editor+preview, editor only, or preview only. */
  layout?: "split" | "editor" | "preview";
  /** Minimum height of the component (CSS value). */
  minHeight?: string;
  /** Whether to display line numbers alongside the editor textarea. */
  showLineNumbers?: boolean;
}

// ---------------------------------------------------------------------------
// Sanitizer — strips <script>, on* event handlers, javascript: URIs
// ---------------------------------------------------------------------------

function sanitizeHtml(html: string): string {
  // Remove <script> tags and their content
  let safe = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove standalone <script> tags (self-closing or unclosed)
  safe = safe.replace(/<script[^>]*\/?>/gi, "");
  // Remove on* event handler attributes (onclick, onerror, onload, etc.)
  safe = safe.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Remove javascript: protocol in href/src attributes
  safe = safe.replace(
    /(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi,
    '$1=""',
  );
  // Remove <iframe>, <object>, <embed>, <form> tags
  safe = safe.replace(/<\/?(iframe|object|embed|form)[\s\S]*?>/gi, "");
  return safe;
}

// ---------------------------------------------------------------------------
// Built-in Markdown Parser
// ---------------------------------------------------------------------------

/**
 * A lightweight markdown-to-HTML parser. Handles the most common markdown
 * constructs without any external dependencies.
 */
function parseMarkdown(md: string): string {
  const lines = md.split("\n");
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeLines: string[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];
  let inUnorderedList = false;
  let ulItems: string[] = [];
  let inOrderedList = false;
  let olItems: string[] = [];
  let paragraphLines: string[] = [];

  /** Flush a collected paragraph. */
  function flushParagraph(): void {
    if (paragraphLines.length > 0) {
      const content = paragraphLines.join("\n");
      htmlParts.push(`<p>${parseInline(content)}</p>`);
      paragraphLines = [];
    }
  }

  /** Flush a collected unordered list. */
  function flushUnorderedList(): void {
    if (ulItems.length > 0) {
      const items = ulItems.map((item) => `<li>${parseInline(item)}</li>`).join("");
      htmlParts.push(`<ul>${items}</ul>`);
      ulItems = [];
      inUnorderedList = false;
    }
  }

  /** Flush a collected ordered list. */
  function flushOrderedList(): void {
    if (olItems.length > 0) {
      const items = olItems.map((item) => `<li>${parseInline(item)}</li>`).join("");
      htmlParts.push(`<ol>${items}</ol>`);
      olItems = [];
      inOrderedList = false;
    }
  }

  /** Flush a collected blockquote. */
  function flushBlockquote(): void {
    if (blockquoteLines.length > 0) {
      const inner = parseMarkdown(blockquoteLines.join("\n"));
      htmlParts.push(`<blockquote>${inner}</blockquote>`);
      blockquoteLines = [];
      inBlockquote = false;
    }
  }

  /** Flush all pending block-level constructs. */
  function flushAll(): void {
    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
    flushBlockquote();
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // --- Code blocks (fenced) ---
    if (/^```/.test(line)) {
      if (!inCodeBlock) {
        flushAll();
        inCodeBlock = true;
        codeBlockLang = line.replace(/^```\s*/, "").trim();
        codeLines = [];
      } else {
        const escaped = escapeHtml(codeLines.join("\n"));
        const langAttr = codeBlockLang
          ? ` class="language-${escapeHtml(codeBlockLang)}"`
          : "";
        htmlParts.push(`<pre><code${langAttr}>${escaped}</code></pre>`);
        inCodeBlock = false;
        codeBlockLang = "";
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // --- Horizontal rule ---
    if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
      flushAll();
      htmlParts.push("<hr />");
      continue;
    }

    // --- Headings (ATX-style) ---
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      const text = parseInline(headingMatch[2]);
      htmlParts.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // --- Blockquote ---
    const bqMatch = line.match(/^>\s?(.*)$/);
    if (bqMatch) {
      // Flush non-blockquote blocks first
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      inBlockquote = true;
      blockquoteLines.push(bqMatch[1]);
      continue;
    }
    if (inBlockquote) {
      flushBlockquote();
    }

    // --- Unordered list ---
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      flushOrderedList();
      flushBlockquote();
      inUnorderedList = true;
      ulItems.push(ulMatch[1]);
      continue;
    }
    if (inUnorderedList) {
      flushUnorderedList();
    }

    // --- Ordered list ---
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      flushUnorderedList();
      flushBlockquote();
      inOrderedList = true;
      olItems.push(olMatch[1]);
      continue;
    }
    if (inOrderedList) {
      flushOrderedList();
    }

    // --- Image (standalone on a line) ---
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imgMatch) {
      flushAll();
      const alt = escapeHtml(imgMatch[1]);
      const src = escapeHtml(imgMatch[2]);
      htmlParts.push(
        `<p><img src="${src}" alt="${alt}" style="max-width:100%" /></p>`,
      );
      continue;
    }

    // --- Blank line ---
    if (line.trim() === "") {
      flushAll();
      continue;
    }

    // --- Default: paragraph ---
    paragraphLines.push(line);
  }

  // If we ended while still in a code block, flush it
  if (inCodeBlock && codeLines.length > 0) {
    const escaped = escapeHtml(codeLines.join("\n"));
    const langAttr = codeBlockLang
      ? ` class="language-${escapeHtml(codeBlockLang)}"`
      : "";
    htmlParts.push(`<pre><code${langAttr}>${escaped}</code></pre>`);
  }

  // Flush any remaining blocks
  flushAll();

  return htmlParts.join("\n");
}

// ---------------------------------------------------------------------------
// Inline parser
// ---------------------------------------------------------------------------

/** Parse inline markdown elements (bold, italic, code, links, images, etc.) */
function parseInline(text: string): string {
  let result = escapeHtml(text);

  // Inline code (must come before bold/italic so backtick content isn't mangled)
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images: ![alt](url)
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%" />',
  );

  // Links: [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Bold + Italic (***text*** or ___text___)
  result = result.replace(
    /\*{3}(.+?)\*{3}/g,
    "<strong><em>$1</em></strong>",
  );

  // Bold (**text** or __text__)
  result = result.replace(/\*{2}(.+?)\*{2}/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic (*text* or _text_)
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, "<em>$1</em>");

  // Strikethrough (~~text~~)
  result = result.replace(/~~(.+?)~~/g, "<del>$1</del>");

  return result;
}

// ---------------------------------------------------------------------------
// HTML escape helper
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Toolbar helpers
// ---------------------------------------------------------------------------

interface ToolbarAction {
  label: string;
  icon: string;
  prefix: string;
  suffix: string;
  block: boolean;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "Bold", icon: "B", prefix: "**", suffix: "**", block: false },
  { label: "Italic", icon: "I", prefix: "*", suffix: "*", block: false },
  { label: "Heading", icon: "H", prefix: "## ", suffix: "", block: true },
  { label: "Link", icon: "\u{1F517}", prefix: "[", suffix: "](url)", block: false },
  { label: "Code", icon: "</>", prefix: "`", suffix: "`", block: false },
  { label: "List", icon: "\u{2022}", prefix: "- ", suffix: "", block: true },
  { label: "Quote", icon: "\u{201C}", prefix: "> ", suffix: "", block: true },
];

// ---------------------------------------------------------------------------
// Hook: useDebounce
// ---------------------------------------------------------------------------

function useDebounce(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Line numbers gutter rendered beside the textarea. */
function LineNumbers({ text }: { text: string }) {
  const lineCount = text.split("\n").length;
  const numbers: string[] = [];
  for (let i = 1; i <= lineCount; i++) {
    numbers.push(String(i));
  }
  return (
    <div
      aria-hidden="true"
      className="select-none pr-2 pt-3 text-right font-mono text-xs leading-[1.625rem] text-gray-400 dark:text-gray-600"
      style={{ minWidth: "2.5rem" }}
    >
      {numbers.map((n) => (
        <div key={n}>{n}</div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout toggle icons (inline SVG to avoid deps)
// ---------------------------------------------------------------------------

function IconSplit() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <rect x="1" y="3" width="8" height="14" rx="1" />
      <rect x="11" y="3" width="8" height="14" rx="1" />
    </svg>
  );
}

function IconEditor() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <rect x="2" y="3" width="16" height="14" rx="1" />
      <line
        x1="5"
        y1="7"
        x2="15"
        y2="7"
        stroke="white"
        strokeWidth="1.2"
      />
      <line
        x1="5"
        y1="10"
        x2="12"
        y2="10"
        stroke="white"
        strokeWidth="1.2"
      />
      <line
        x1="5"
        y1="13"
        x2="14"
        y2="13"
        stroke="white"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function IconPreview() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10 4C5 4 1.7 8.3 1 10c.7 1.7 4 6 9 6s8.3-4.3 9-6c-.7-1.7-4-6-9-6Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <circle cx="10" cy="10" r="2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Preview prose styles (injected as a style tag to avoid @apply or external CSS)
// ---------------------------------------------------------------------------

const PREVIEW_STYLE_ID = "md-preview-prose-styles";

const PROSE_CSS = `
.md-preview-prose h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
.md-preview-prose h2 { font-size: 1.5em; font-weight: 600; margin: 0.83em 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
.md-preview-prose h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0; }
.md-preview-prose h4 { font-size: 1em; font-weight: 600; margin: 1em 0; }
.md-preview-prose h5 { font-size: 0.875em; font-weight: 600; margin: 1em 0; }
.md-preview-prose h6 { font-size: 0.85em; font-weight: 600; margin: 1em 0; color: #6b7280; }
.md-preview-prose p { margin: 0.75em 0; line-height: 1.7; }
.md-preview-prose ul { list-style-type: disc; padding-left: 2em; margin: 0.75em 0; }
.md-preview-prose ol { list-style-type: decimal; padding-left: 2em; margin: 0.75em 0; }
.md-preview-prose li { margin: 0.25em 0; line-height: 1.7; }
.md-preview-prose blockquote { border-left: 4px solid #d1d5db; padding: 0.5em 1em; margin: 0.75em 0; color: #6b7280; background: #f9fafb; }
.md-preview-prose pre { background: #1f2937; color: #e5e7eb; padding: 1em; border-radius: 0.375rem; overflow-x: auto; margin: 0.75em 0; font-size: 0.875em; }
.md-preview-prose code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 0.25rem; font-size: 0.875em; }
.md-preview-prose pre code { background: none; padding: 0; border-radius: 0; font-size: inherit; }
.md-preview-prose a { color: #2563eb; text-decoration: underline; }
.md-preview-prose a:hover { color: #1d4ed8; }
.md-preview-prose img { max-width: 100%; border-radius: 0.375rem; margin: 0.5em 0; }
.md-preview-prose hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
.md-preview-prose del { text-decoration: line-through; color: #9ca3af; }
.md-preview-prose strong { font-weight: 700; }
.md-preview-prose em { font-style: italic; }

/* Dark mode overrides */
.dark .md-preview-prose h1,
.dark .md-preview-prose h2 { border-bottom-color: #374151; }
.dark .md-preview-prose h6 { color: #9ca3af; }
.dark .md-preview-prose blockquote { border-left-color: #4b5563; color: #9ca3af; background: #111827; }
.dark .md-preview-prose code { background: #1f2937; color: #e5e7eb; }
.dark .md-preview-prose a { color: #60a5fa; }
.dark .md-preview-prose a:hover { color: #93bbfd; }
.dark .md-preview-prose hr { border-top-color: #374151; }
.dark .md-preview-prose del { color: #6b7280; }
`;

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MarkdownPreview({
  value,
  onChange,
  className,
  style,
  placeholder = "Write markdown here...",
  theme = "auto",
  layout: layoutProp = "split",
  minHeight = "400px",
  showLineNumbers = false,
}: MarkdownPreviewProps) {
  const [currentLayout, setCurrentLayout] = useState<
    "split" | "editor" | "preview"
  >(layoutProp);

  // Sync external layout prop changes
  useEffect(() => {
    setCurrentLayout(layoutProp);
  }, [layoutProp]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounce the markdown value for parsing
  const debouncedValue = useDebounce(value, 150);

  // Parse markdown to HTML (memoized on debounced value)
  const renderedHtml = useMemo(() => {
    const raw = parseMarkdown(debouncedValue);
    return sanitizeHtml(raw);
  }, [debouncedValue]);

  // Inject prose styles once
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(PREVIEW_STYLE_ID)) return;
    const styleEl = document.createElement("style");
    styleEl.id = PREVIEW_STYLE_ID;
    styleEl.textContent = PROSE_CSS;
    document.head.appendChild(styleEl);
  }, []);

  // ---------------------------------------------------------------------------
  // Toolbar action handler
  // ---------------------------------------------------------------------------

  const handleToolbarAction = useCallback(
    (action: ToolbarAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.slice(start, end);
      const before = value.slice(0, start);
      const after = value.slice(end);

      let newValue: string;
      let cursorPos: number;

      if (action.block) {
        // Block-level: insert at the beginning of the current line
        const lineStart = before.lastIndexOf("\n") + 1;
        const linePrefix = value.slice(lineStart, start);
        const fullBefore = value.slice(0, lineStart);

        if (selectedText) {
          newValue =
            fullBefore +
            action.prefix +
            linePrefix +
            selectedText +
            action.suffix +
            after;
          cursorPos =
            lineStart +
            action.prefix.length +
            linePrefix.length +
            selectedText.length +
            action.suffix.length;
        } else {
          newValue =
            fullBefore +
            action.prefix +
            linePrefix +
            action.suffix +
            after;
          cursorPos =
            lineStart + action.prefix.length + linePrefix.length + action.suffix.length;
        }
      } else {
        // Inline: wrap selection or insert placeholder
        const placeholder = selectedText || "text";
        newValue =
          before + action.prefix + placeholder + action.suffix + after;
        cursorPos = start + action.prefix.length + placeholder.length;
      }

      onChange(newValue);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.focus();
        if (selectedText || action.block) {
          textarea.setSelectionRange(cursorPos, cursorPos);
        } else {
          // Select the placeholder word so user can type over it
          const selectStart = start + action.prefix.length;
          const selectEnd = selectStart + "text".length;
          textarea.setSelectionRange(selectStart, selectEnd);
        }
      });
    },
    [value, onChange],
  );

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      if (e.key === "b") {
        e.preventDefault();
        handleToolbarAction(TOOLBAR_ACTIONS[0]); // Bold
      } else if (e.key === "i") {
        e.preventDefault();
        handleToolbarAction(TOOLBAR_ACTIONS[1]); // Italic
      } else if (e.key === "k") {
        e.preventDefault();
        handleToolbarAction(TOOLBAR_ACTIONS[3]); // Link
      }
    },
    [handleToolbarAction],
  );

  // ---------------------------------------------------------------------------
  // Handle textarea change
  // ---------------------------------------------------------------------------

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  // ---------------------------------------------------------------------------
  // Theme class resolution
  // ---------------------------------------------------------------------------

  const themeClass =
    theme === "dark" ? "dark" : theme === "light" ? "" : "";

  // When theme is "auto" we rely on parent or system dark: classes.
  // When explicit, we wrap with the dark class.
  const rootThemeClass = theme === "dark" ? "dark" : "";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const showEditor = currentLayout === "split" || currentLayout === "editor";
  const showPreview =
    currentLayout === "split" || currentLayout === "preview";

  return (
    <div
      className={[
        "flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
        rootThemeClass,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ minHeight, ...style }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
        {/* Formatting buttons */}
        <div className="flex items-center gap-0.5">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              title={action.label}
              aria-label={action.label}
              onClick={() => handleToolbarAction(action)}
              className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded px-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              {action.label === "Bold" ? (
                <span className="font-bold">B</span>
              ) : action.label === "Italic" ? (
                <span className="italic">I</span>
              ) : action.label === "Code" ? (
                <span className="font-mono text-xs">&lt;/&gt;</span>
              ) : (
                <span>{action.icon}</span>
              )}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Layout toggle buttons */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Split view"
            aria-label="Split view"
            aria-pressed={currentLayout === "split"}
            onClick={() => setCurrentLayout("split")}
            className={[
              "inline-flex h-7 items-center justify-center rounded px-1.5 transition-colors",
              currentLayout === "split"
                ? "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100"
                : "text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100",
            ].join(" ")}
          >
            <IconSplit />
          </button>
          <button
            type="button"
            title="Editor only"
            aria-label="Editor only"
            aria-pressed={currentLayout === "editor"}
            onClick={() => setCurrentLayout("editor")}
            className={[
              "inline-flex h-7 items-center justify-center rounded px-1.5 transition-colors",
              currentLayout === "editor"
                ? "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100"
                : "text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100",
            ].join(" ")}
          >
            <IconEditor />
          </button>
          <button
            type="button"
            title="Preview only"
            aria-label="Preview only"
            aria-pressed={currentLayout === "preview"}
            onClick={() => setCurrentLayout("preview")}
            className={[
              "inline-flex h-7 items-center justify-center rounded px-1.5 transition-colors",
              currentLayout === "preview"
                ? "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100"
                : "text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100",
            ].join(" ")}
          >
            <IconPreview />
          </button>
        </div>
      </div>

      {/* Editor + Preview panes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        {showEditor && (
          <div
            className={[
              "flex overflow-hidden",
              currentLayout === "split" ? "w-1/2" : "w-full",
              showPreview ? "border-r border-gray-200 dark:border-gray-700" : "",
            ].join(" ")}
          >
            {showLineNumbers && <LineNumbers text={value} />}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              spellCheck={false}
              className="w-full flex-1 resize-none bg-transparent p-3 font-mono text-sm leading-relaxed text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
              style={{ minHeight: "100%" }}
            />
          </div>
        )}

        {/* Preview pane */}
        {showPreview && (
          <div
            className={[
              "md-preview-prose overflow-auto p-4 text-sm",
              currentLayout === "split" ? "w-1/2" : "w-full",
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        )}
      </div>
    </div>
  );
}

export default MarkdownPreview;
