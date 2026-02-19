"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Grid3X3,
  List,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
  Mail,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Post {
  id: string;
  title: string;
  excerpt: string;
  author: { name: string; initials: string; color: string };
  date: string;
  readTime: string;
  tags: string[];
  category: string;
  featured: boolean;
  gradient: string;
}

interface Category {
  name: string;
  slug: string;
  postCount: number;
}

type ViewMode = "grid" | "list";
type SortKey = "newest" | "oldest" | "popular";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */

const CURRENT_CATEGORY = {
  name: "Web Development",
  slug: "web-development",
  description:
    "Tutorials, guides, and deep-dives into modern web development. From frontend frameworks to backend architecture, stay current with the latest practices.",
};

const POSTS: Post[] = [
  {
    id: "1",
    title: "Building Accessible React Components from Scratch",
    excerpt:
      "Learn how to create fully accessible UI components using ARIA attributes, keyboard navigation, and semantic HTML in React applications.",
    author: { name: "Alina Chen", initials: "AC", color: "#6366f1" },
    date: "Feb 14, 2026",
    readTime: "8 min read",
    tags: ["React", "Accessibility", "UI"],
    category: "Web Development",
    featured: true,
    gradient: "from-indigo-400 to-purple-500",
  },
  {
    id: "2",
    title: "Server Components: The Mental Model Shift",
    excerpt:
      "Understanding the paradigm shift from client-rendered SPAs to React Server Components and how it changes the way we think about data fetching.",
    author: { name: "Marcus Reed", initials: "MR", color: "#0891b2" },
    date: "Feb 11, 2026",
    readTime: "12 min read",
    tags: ["React", "Next.js", "RSC"],
    category: "Web Development",
    featured: false,
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "3",
    title: "CSS Container Queries in Production",
    excerpt:
      "A practical guide to using CSS container queries for truly responsive component design without relying on viewport-based media queries.",
    author: { name: "Sophia Morales", initials: "SM", color: "#059669" },
    date: "Feb 8, 2026",
    readTime: "6 min read",
    tags: ["CSS", "Responsive", "Frontend"],
    category: "Web Development",
    featured: false,
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "4",
    title: "TypeScript 5.5: What You Need to Know",
    excerpt:
      "Exploring the latest TypeScript release with inferred type predicates, isolated declarations, and new control flow narrowing improvements.",
    author: { name: "Alina Chen", initials: "AC", color: "#6366f1" },
    date: "Feb 5, 2026",
    readTime: "10 min read",
    tags: ["TypeScript", "JavaScript", "DX"],
    category: "Web Development",
    featured: true,
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    id: "5",
    title: "Edge Functions: When and Why to Use Them",
    excerpt:
      "Demystifying edge computing for web developers. Learn when edge functions outperform traditional serverless and how to architect for the edge.",
    author: { name: "James Okafor", initials: "JO", color: "#d97706" },
    date: "Feb 2, 2026",
    readTime: "9 min read",
    tags: ["Edge", "Serverless", "Performance"],
    category: "Web Development",
    featured: false,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: "6",
    title: "Micro-Frontends with Module Federation 2.0",
    excerpt:
      "Scaling frontend teams with module federation. A step-by-step walkthrough of setting up independent deploy pipelines for micro-frontend architectures.",
    author: { name: "Sophia Morales", initials: "SM", color: "#059669" },
    date: "Jan 29, 2026",
    readTime: "14 min read",
    tags: ["Architecture", "Webpack", "Scaling"],
    category: "Web Development",
    featured: false,
    gradient: "from-rose-400 to-pink-500",
  },
  {
    id: "7",
    title: "The State of WebAssembly in 2026",
    excerpt:
      "From niche technology to mainstream adoption. How WASM is transforming heavy computation in the browser and opening doors for new web applications.",
    author: { name: "Marcus Reed", initials: "MR", color: "#0891b2" },
    date: "Jan 25, 2026",
    readTime: "11 min read",
    tags: ["WebAssembly", "Performance", "Browser"],
    category: "Web Development",
    featured: true,
    gradient: "from-violet-400 to-purple-500",
  },
  {
    id: "8",
    title: "Designing REST APIs That Developers Love",
    excerpt:
      "Beyond CRUD: patterns for pagination, filtering, error handling, and versioning that make your REST APIs intuitive and a pleasure to integrate with.",
    author: { name: "James Okafor", initials: "JO", color: "#d97706" },
    date: "Jan 21, 2026",
    readTime: "7 min read",
    tags: ["API", "REST", "Backend"],
    category: "Web Development",
    featured: false,
    gradient: "from-sky-400 to-cyan-500",
  },
  {
    id: "9",
    title: "Testing Strategies for Full-Stack Applications",
    excerpt:
      "A pragmatic approach to testing modern web apps. Balancing unit tests, integration tests, and E2E tests for maximum confidence with minimal overhead.",
    author: { name: "Alina Chen", initials: "AC", color: "#6366f1" },
    date: "Jan 17, 2026",
    readTime: "13 min read",
    tags: ["Testing", "Vitest", "Playwright"],
    category: "Web Development",
    featured: false,
    gradient: "from-lime-400 to-green-500",
  },
];

const CATEGORIES: Category[] = [
  { name: "Web Development", slug: "web-development", postCount: 24 },
  { name: "Design Systems", slug: "design-systems", postCount: 18 },
  { name: "DevOps & Infra", slug: "devops-infra", postCount: 12 },
  { name: "AI & Machine Learning", slug: "ai-ml", postCount: 15 },
  { name: "Mobile Development", slug: "mobile-development", postCount: 9 },
  { name: "Career & Productivity", slug: "career-productivity", postCount: 7 },
];

const POPULAR_TAGS = [
  "React",
  "TypeScript",
  "Next.js",
  "CSS",
  "Node.js",
  "Tailwind",
  "GraphQL",
  "Testing",
  "Performance",
  "Accessibility",
  "Docker",
  "PostgreSQL",
];

const POSTS_PER_PAGE = 3;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function sortPosts(posts: Post[], key: SortKey): Post[] {
  const sorted = [...posts];
  switch (key) {
    case "newest":
      return sorted; // already ordered newest first in mock data
    case "oldest":
      return sorted.reverse();
    case "popular":
      // featured posts first, then by title alphabetically
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.title.localeCompare(b.title);
      });
    default:
      return sorted;
  }
}

/* -------------------------------------------------------------------------- */
/*  Sub-Components                                                            */
/* -------------------------------------------------------------------------- */

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
      <ol className="flex items-center gap-1.5">
        <li>
          <a href="#" className="hover:text-neutral-900 transition-colors">
            Home
          </a>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <a href="#" className="hover:text-neutral-900 transition-colors">
            Blog
          </a>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-neutral-900 font-medium" aria-current="page">
          {CURRENT_CATEGORY.name}
        </li>
      </ol>
    </nav>
  );
}

function CategoryHeader({ postCount }: { postCount: number }) {
  return (
    <div className="mb-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
        {CURRENT_CATEGORY.name}
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600 leading-relaxed">
        {CURRENT_CATEGORY.description}
      </p>
      <p className="mt-2 text-sm font-medium text-neutral-500">
        {postCount} {postCount === 1 ? "article" : "articles"}
      </p>
    </div>
  );
}

function FilterBar({
  view,
  onViewChange,
  sort,
  onSortChange,
}: {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <ArrowUpDown size={16} className="text-neutral-400" />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
        <button
          onClick={() => onViewChange("grid")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            view === "grid"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
          aria-label="Grid view"
        >
          <Grid3X3 size={15} />
          <span className="hidden sm:inline">Grid</span>
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            view === "list"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
          aria-label="List view"
        >
          <List size={15} />
          <span className="hidden sm:inline">List</span>
        </button>
      </div>
    </div>
  );
}

function PostCardGrid({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Cover image placeholder */}
      <div
        className={cn(
          "relative h-48 w-full bg-gradient-to-br",
          post.gradient
        )}
      >
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 backdrop-blur-sm">
          {post.category}
        </span>
        {post.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-xs font-semibold text-amber-900 backdrop-blur-sm">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-semibold text-neutral-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center gap-3 border-t border-neutral-100 pt-4 mt-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: post.author.color }}
          >
            {post.author.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-800">
              {post.author.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>{post.date}</span>
              <span aria-hidden="true">&#183;</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function PostCardList({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row">
      {/* Cover image placeholder */}
      <div
        className={cn(
          "relative h-48 w-full shrink-0 bg-gradient-to-br sm:h-auto sm:w-56",
          post.gradient
        )}
      >
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 backdrop-blur-sm">
          {post.category}
        </span>
        {post.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-xs font-semibold text-amber-900 backdrop-blur-sm">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-semibold text-neutral-900 leading-snug group-hover:text-indigo-600 transition-colors">
          {post.title}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center gap-3 border-t border-neutral-100 pt-4 mt-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: post.author.color }}
          >
            {post.author.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-800">
              {post.author.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>{post.date}</span>
              <span aria-hidden="true">&#183;</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-2"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
          currentPage === 1
            ? "cursor-not-allowed border-neutral-200 text-neutral-300"
            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
        )}
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all",
              page === currentPage
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
          currentPage === totalPages
            ? "cursor-not-allowed border-neutral-200 text-neutral-300"
            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
        )}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function SidebarCategories({
  currentSlug,
}: {
  currentSlug: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
        <Grid3X3 size={14} />
        Categories
      </h3>
      <ul className="mt-4 space-y-1">
        {CATEGORIES.map((cat) => (
          <li key={cat.slug}>
            <a
              href="#"
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
                cat.slug === currentSlug
                  ? "bg-indigo-50 font-semibold text-indigo-700"
                  : "text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <span>{cat.name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  cat.slug === currentSlug
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-neutral-100 text-neutral-500"
                )}
              >
                {cat.postCount}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SidebarTags() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
        <Tag size={14} />
        Popular Tags
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {POPULAR_TAGS.map((tag) => (
          <a
            key={tag}
            href="#"
            className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {tag}
          </a>
        ))}
      </div>
    </div>
  );
}

function SidebarNewsletter() {
  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
        <Mail size={20} className="text-indigo-600" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900">
        Stay in the loop
      </h3>
      <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
        Get the best articles delivered straight to your inbox every week.
      </p>
      <div className="mt-4 space-y-2">
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800">
          Subscribe
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

export default function BlogCategoryPage() {
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedPosts = useMemo(() => sortPosts(POSTS, sort), [sort]);

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return sortedPosts.slice(start, start + POSTS_PER_PAGE);
  }, [sortedPosts, currentPage]);

  const handleSortChange = useCallback((newSort: SortKey) => {
    setSort(newSort);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Category header */}
        <CategoryHeader postCount={POSTS.length} />

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <main className="min-w-0 flex-1">
            <FilterBar
              view={view}
              onViewChange={setView}
              sort={sort}
              onSortChange={handleSortChange}
            />

            {/* Post grid */}
            {view === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedPosts.map((post) => (
                  <PostCardGrid key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedPosts.map((post) => (
                  <PostCardList key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {paginatedPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center">
                <User size={40} className="mb-3 text-neutral-300" />
                <p className="text-neutral-500">No articles found.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full shrink-0 space-y-6 lg:w-72 xl:w-80">
            <SidebarCategories currentSlug={CURRENT_CATEGORY.slug} />
            <SidebarTags />
            <SidebarNewsletter />
          </aside>
        </div>
      </div>
    </div>
  );
}
