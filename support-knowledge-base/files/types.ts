/** Represents a single knowledge base category */
export interface Category {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** URL-safe slug */
  slug: string;
  /** Short description of the category */
  description?: string;
  /** Lucide icon name (e.g. "BookOpen", "Settings") — used for display */
  icon?: string;
}

/** Represents a single knowledge base article */
export interface Article {
  /** Unique identifier */
  id: string;
  /** Article title */
  title: string;
  /** Short summary shown in article lists */
  excerpt: string;
  /** Full article body content (supports markdown-like formatting) */
  content: string;
  /** ID of the category this article belongs to */
  categoryId: string;
  /** Estimated reading time in minutes */
  readingTime: number;
  /** ISO date string of last update */
  updatedAt: string;
  /** Author name */
  author?: string;
  /** Whether this article appears in the featured/popular section */
  featured?: boolean;
  /** Optional tags for additional filtering */
  tags?: string[];
}

/** Feedback value for "Was this helpful?" */
export type ArticleFeedback = "helpful" | "not-helpful";

/** View state within the knowledge base */
export type KnowledgeBaseView =
  | { type: "home" }
  | { type: "category"; categoryId: string }
  | { type: "article"; articleId: string };

/** Props for the top-level KnowledgeBase component */
export interface KnowledgeBaseProps {
  /** Array of all articles */
  articles: Article[];
  /** Array of all categories */
  categories: Category[];
  /** Called when a user submits feedback on an article */
  onFeedback?: (articleId: string, feedback: ArticleFeedback) => void;
  /** Optional className for the root container */
  className?: string;
}

/** Props for the CategoryNav component */
export interface CategoryNavProps {
  /** Array of all categories */
  categories: Category[];
  /** Array of all articles (used to compute counts) */
  articles: Article[];
  /** Currently active category ID, or null for home */
  activeCategoryId: string | null;
  /** Called when user selects a category */
  onSelectCategory: (categoryId: string) => void;
  /** Called when user clicks the home/all link */
  onGoHome: () => void;
  /** Optional className */
  className?: string;
}

/** Props for the SearchBar component */
export interface SearchBarProps {
  /** Current search query */
  query: string;
  /** Called when query changes */
  onQueryChange: (query: string) => void;
  /** Total result count to display */
  resultCount?: number;
  /** Optional className */
  className?: string;
}

/** Props for the ArticleList component */
export interface ArticleListProps {
  /** Articles to display */
  articles: Article[];
  /** All categories (for label lookup) */
  categories: Category[];
  /** Called when user clicks an article */
  onSelectArticle: (articleId: string) => void;
  /** Title shown above the list */
  title?: string;
  /** Show empty state when no articles */
  emptyMessage?: string;
  /** Optional className */
  className?: string;
}

/** Props for the ArticleDetail component */
export interface ArticleDetailProps {
  /** The article to display */
  article: Article;
  /** The category the article belongs to */
  category: Category | undefined;
  /** Called when user submits feedback */
  onFeedback?: (articleId: string, feedback: ArticleFeedback) => void;
  /** Called when user clicks the category breadcrumb */
  onNavigateCategory: (categoryId: string) => void;
  /** Called when user clicks the home breadcrumb */
  onNavigateHome: () => void;
  /** Optional className */
  className?: string;
}
