"use client";

import { Clock, FileText, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleListProps } from "./types";

export function ArticleList({
  articles,
  categories,
  onSelectArticle,
  title,
  emptyMessage = "No articles found.",
  className,
}: ArticleListProps) {
  /** Look up category name by ID */
  function getCategoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? "Uncategorized";
  }

  /** Format an ISO date string into a readable form */
  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  if (articles.length === 0) {
    return (
      <div className={cn("py-12 text-center", className)}>
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      )}

      {articles.map((article) => (
        <button
          key={article.id}
          type="button"
          onClick={() => onSelectArticle(article.id)}
          className="group flex w-full flex-col gap-1.5 rounded-lg border border-transparent bg-card p-4 text-left transition-colors hover:border-border hover:bg-muted/50"
        >
          <h3 className="text-sm font-semibold leading-snug group-hover:text-primary">
            {article.title}
          </h3>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {article.excerpt}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              {getCategoryName(article.categoryId)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min read
            </span>
            <span>{formatDate(article.updatedAt)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
