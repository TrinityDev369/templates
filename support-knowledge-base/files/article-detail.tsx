"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronRight,
  Clock,
  Home,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleDetailProps, ArticleFeedback } from "./types";

/**
 * Renders article body content. Interprets basic markdown-like patterns:
 * - Lines starting with ## become <h2>, ### become <h3>
 * - Lines starting with - become list items
 * - Empty lines become paragraph breaks
 * - **bold** and `code` inline formatting
 * - Everything else renders as paragraph text
 *
 * For production use, replace with a proper markdown renderer (e.g. react-markdown).
 */
function renderContent(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(" ");
      nodes.push(
        <p key={key++} className="mb-4 leading-7 text-foreground/90">
          {formatInline(text)}
        </p>
      );
      paragraphBuffer = [];
    }
  }

  function flushList() {
    if (listBuffer.length > 0) {
      nodes.push(
        <ul key={key++} className="mb-4 list-disc space-y-1 pl-6">
          {listBuffer.map((item, i) => (
            <li key={i} className="leading-7 text-foreground/90">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  }

  /** Parse inline formatting for **bold** and `code` */
  function formatInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(
          <strong key={`b-${match.index}`} className="font-semibold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <code
            key={`c-${match.index}`}
            className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
          >
            {match[3]}
          </code>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Heading 2
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      nodes.push(
        <h2 key={key++} className="mb-3 mt-8 text-xl font-semibold first:mt-0">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      nodes.push(
        <h3
          key={key++}
          className="mb-2 mt-6 text-lg font-semibold first:mt-0"
        >
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    // List item
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2));
      continue;
    }

    // Empty line
    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Default: paragraph text
    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushList();

  return nodes;
}

export function ArticleDetail({
  article,
  category,
  onFeedback,
  onNavigateCategory,
  onNavigateHome,
  className,
}: ArticleDetailProps) {
  const [feedback, setFeedback] = useState<ArticleFeedback | null>(null);

  function handleFeedback(value: ArticleFeedback) {
    setFeedback(value);
    onFeedback?.(article.id, value);
  }

  /** Format an ISO date string into a readable form */
  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  return (
    <article className={cn("space-y-6", className)}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <Home className="h-3.5 w-3.5" />
          Home
        </button>

        <ChevronRight className="h-3.5 w-3.5" />

        {category && (
          <>
            <button
              type="button"
              onClick={() => onNavigateCategory(category.id)}
              className="hover:text-foreground"
            >
              {category.name}
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}

        <span className="truncate font-medium text-foreground">
          {article.title}
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {article.author && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {article.author}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.updatedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTime} min read
          </span>
        </div>
      </header>

      {/* Divider */}
      <hr className="border-border" />

      {/* Article body */}
      <div className="max-w-none">{renderContent(article.content)}</div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <hr className="border-border" />

      {/* Was this helpful? */}
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        {feedback === null ? (
          <>
            <p className="mb-3 text-sm font-medium text-foreground">
              Was this article helpful?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleFeedback("helpful")}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950 dark:hover:border-green-800 dark:hover:text-green-400"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleFeedback("not-helpful")}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950 dark:hover:border-red-800 dark:hover:text-red-400"
              >
                <ThumbsDown className="h-4 w-4" />
                No
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {feedback === "helpful"
              ? "Thanks for your feedback! Glad this was helpful."
              : "Thanks for your feedback. We'll work on improving this article."}
          </p>
        )}
      </div>
    </article>
  );
}
