"use client";

import { useMemo, useState } from "react";
import { BookOpen, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArticleDetail } from "./article-detail";
import { ArticleList } from "./article-list";
import { CategoryNav } from "./category-nav";
import { SearchBar } from "./search-bar";
import type { KnowledgeBaseProps, KnowledgeBaseView } from "./types";

export function KnowledgeBase({
  articles,
  categories,
  onFeedback,
  className,
}: KnowledgeBaseProps) {
  const [view, setView] = useState<KnowledgeBaseView>({ type: "home" });
  const [searchQuery, setSearchQuery] = useState("");

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  /** Featured articles for the home view */
  const featuredArticles = useMemo(
    () => articles.filter((a) => a.featured),
    [articles]
  );

  /** Filter articles by search query (instant, case-insensitive) */
  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [articles, searchQuery]);

  /** Articles filtered by the current category view */
  const categoryArticles = useMemo(() => {
    if (view.type !== "category") return [];
    const q = searchQuery.toLowerCase().trim();
    const inCategory = articles.filter(
      (a) => a.categoryId === view.categoryId
    );
    if (!q) return inCategory;
    return inCategory.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    );
  }, [articles, view, searchQuery]);

  /** The display list depends on current view */
  const displayArticles =
    view.type === "category" ? categoryArticles : filteredArticles;

  /** Currently active category ID for the sidebar */
  const activeCategoryId =
    view.type === "category" ? view.categoryId : null;

  /** Look up a single article by ID */
  function findArticle(id: string) {
    return articles.find((a) => a.id === id);
  }

  /** Look up a single category by ID */
  function findCategory(id: string) {
    return categories.find((c) => c.id === id);
  }

  // -------------------------------------------------------------------------
  // Navigation handlers
  // -------------------------------------------------------------------------

  function handleGoHome() {
    setView({ type: "home" });
    setSearchQuery("");
  }

  function handleSelectCategory(categoryId: string) {
    setView({ type: "category", categoryId });
    setSearchQuery("");
  }

  function handleSelectArticle(articleId: string) {
    setView({ type: "article", articleId });
    setSearchQuery("");
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  /** Render the current detail article */
  function renderArticleView() {
    if (view.type !== "article") return null;
    const article = findArticle(view.articleId);
    if (!article) {
      return (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Article not found.
        </div>
      );
    }
    const category = findCategory(article.categoryId);
    return (
      <ArticleDetail
        article={article}
        category={category}
        onFeedback={onFeedback}
        onNavigateCategory={handleSelectCategory}
        onNavigateHome={handleGoHome}
      />
    );
  }

  /** Render the home or category listing view */
  function renderListView() {
    const isHome = view.type === "home";
    const isSearching = searchQuery.trim().length > 0;

    const categoryName =
      view.type === "category"
        ? findCategory(view.categoryId)?.name ?? "Category"
        : null;

    return (
      <div className="space-y-8">
        {/* Search */}
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          resultCount={isSearching ? displayArticles.length : undefined}
        />

        {/* Featured section (home view only, not when searching) */}
        {isHome && !isSearching && featuredArticles.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <h2 className="text-lg font-semibold tracking-tight">
                Popular Articles
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {featuredArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => handleSelectArticle(article.id)}
                  className="group rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/50"
                >
                  <h3 className="text-sm font-semibold leading-snug group-hover:text-primary">
                    {article.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {article.excerpt}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Article listing */}
        <ArticleList
          articles={displayArticles}
          categories={categories}
          onSelectArticle={handleSelectArticle}
          title={
            isSearching
              ? undefined
              : isHome
                ? "All Articles"
                : categoryName ?? undefined
          }
          emptyMessage={
            isSearching
              ? `No articles match "${searchQuery}".`
              : "No articles in this category yet."
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-[400px] gap-8", className)}>
      {/* Sidebar — hidden in article detail on mobile for readability */}
      <aside
        className={cn(
          "hidden w-60 shrink-0 md:block",
          view.type === "article" && "md:block"
        )}
      >
        <div className="sticky top-4 space-y-4">
          <div className="flex items-center gap-2 px-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Knowledge Base</span>
          </div>
          <CategoryNav
            categories={categories}
            articles={articles}
            activeCategoryId={activeCategoryId}
            onSelectCategory={handleSelectCategory}
            onGoHome={handleGoHome}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {view.type === "article" ? renderArticleView() : renderListView()}
      </main>
    </div>
  );
}
