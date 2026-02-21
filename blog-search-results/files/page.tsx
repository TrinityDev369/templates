import Link from "next/link";
import { Search } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTimeMinutes: number;
}

interface SearchResult {
  posts: Post[];
  total: number;
}

// ---------------------------------------------------------------------------
// Data fetching stub
// ---------------------------------------------------------------------------

const POSTS_PER_PAGE = 10;

/**
 * TODO: Replace this stub with your own data source.
 *
 * Connect to a database, CMS, or search index (e.g. Algolia, Meilisearch)
 * and return matching posts with their total count.
 */
async function searchPosts(
  query: string,
  page: number,
): Promise<SearchResult> {
  // --- demo data (remove when connecting a real source) ---
  const demo: Post[] = [
    {
      slug: "getting-started-with-nextjs",
      title: "Getting Started with Next.js",
      excerpt:
        "Learn how to build modern web applications with Next.js, the React framework for production. This guide covers routing, data fetching, and deployment.",
      category: "Tutorial",
      publishedAt: "2026-02-10",
      readTimeMinutes: 8,
    },
    {
      slug: "understanding-server-components",
      title: "Understanding React Server Components",
      excerpt:
        "A deep dive into React Server Components and how they change the way we think about rendering, data fetching, and bundle size in modern applications.",
      category: "Deep Dive",
      publishedAt: "2026-02-05",
      readTimeMinutes: 12,
    },
    {
      slug: "tailwind-css-best-practices",
      title: "Tailwind CSS Best Practices for 2026",
      excerpt:
        "Practical patterns for writing maintainable Tailwind CSS. Covers component extraction, responsive design strategies, and design system integration.",
      category: "Best Practices",
      publishedAt: "2026-01-28",
      readTimeMinutes: 6,
    },
  ];

  const q = query.toLowerCase();
  const matched = demo.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );

  const start = (page - 1) * POSTS_PER_PAGE;
  return {
    posts: matched.slice(start, start + POSTS_PER_PAGE),
    total: matched.length,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wraps every occurrence of `query` words inside `text` with a <mark> tag.
 * Returns an array of React nodes suitable for rendering inline.
 */
function highlightMatches(
  text: string,
  query: string,
): React.ReactNode[] {
  if (!query.trim()) return [text];

  // Escape special regex characters and split on whitespace to get terms.
  const terms = query
    .trim()
    .split(/\s+/)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);

  if (terms.length === 0) return [text];

  const pattern = new RegExp(`(${terms.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    // Re-test each part with a fresh regex to avoid lastIndex issues from
    // the global flag used in split().
    const isMatch = new RegExp(`^(?:${terms.join("|")})$`, "i").test(part);
    return isMatch ? (
      <mark
        key={i}
        className="rounded-sm bg-yellow-200/70 px-0.5 text-inherit"
      >
        {part}
      </mark>
    ) : (
      part
    );
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function BlogSearchPage(props: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";
  const currentPage = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const { posts, total } = query
    ? await searchPosts(query, currentPage)
    : { posts: [] as Post[], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ---- Search form ---- */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Search the Blog
        </h1>

        <form action="/blog/search" method="GET" className="mt-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search articles..."
              aria-label="Search articles"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </form>
      </header>

      {/* ---- Results ---- */}
      {query ? (
        <>
          <p className="mb-6 text-sm text-gray-500">
            {total > 0 ? (
              <>
                <span className="font-medium text-gray-700">{total}</span>{" "}
                {total === 1 ? "result" : "results"} for{" "}
                <span className="font-medium text-gray-700">
                  &lsquo;{query}&rsquo;
                </span>
              </>
            ) : (
              <>
                No results for{" "}
                <span className="font-medium text-gray-700">
                  &lsquo;{query}&rsquo;
                </span>
              </>
            )}
          </p>

          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  {/* Meta row */}
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      {post.category}
                    </span>
                    <time
                      dateTime={post.publishedAt}
                      className="text-gray-400"
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                    <span className="text-gray-300" aria-hidden="true">
                      &middot;
                    </span>
                    <span className="text-gray-400">
                      {post.readTimeMinutes} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                    {highlightMatches(post.title, query)}
                  </h2>

                  {/* Excerpt */}
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {highlightMatches(post.excerpt, query)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            /* ---- Empty state ---- */
            <div className="rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center">
              <Search
                className="mx-auto h-10 w-10 text-gray-300"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No articles found
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search term or browse all articles.
              </p>
              <Link
                href="/blog"
                className="mt-4 inline-block text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900"
              >
                Browse all articles
              </Link>
            </div>
          )}

          {/* ---- Pagination ---- */}
          {totalPages > 1 && (
            <nav
              aria-label="Search results pagination"
              className="mt-10 flex items-center justify-between"
            >
              {currentPage > 1 ? (
                <Link
                  href={`/blog/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  &larr; Previous
                </Link>
              ) : (
                <span className="rounded-lg border border-gray-100 px-4 py-2 text-sm font-medium text-gray-300">
                  &larr; Previous
                </span>
              )}

              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/blog/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Next &rarr;
                </Link>
              ) : (
                <span className="rounded-lg border border-gray-100 px-4 py-2 text-sm font-medium text-gray-300">
                  Next &rarr;
                </span>
              )}
            </nav>
          )}
        </>
      ) : (
        /* ---- Initial state (no query yet) ---- */
        <div className="rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center">
          <Search
            className="mx-auto h-10 w-10 text-gray-300"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Search for articles
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Type a query above to find blog posts.
          </p>
        </div>
      )}
    </div>
  );
}
