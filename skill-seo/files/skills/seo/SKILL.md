---
name: seo
description: Technical SEO audit and optimization skill — meta tags, structured data, Core Web Vitals, sitemap, robots.txt, Open Graph, canonical URLs
---

# Technical SEO

Audit and optimize Next.js / React sites for search engine visibility, social sharing, and Core Web Vitals performance.

## Use this skill when

- Running a technical SEO audit on an existing site
- Adding meta tags, Open Graph, or structured data to pages
- Generating sitemaps, robots.txt, or canonical URLs
- Diagnosing Core Web Vitals issues (LCP, INP, CLS)
- Preparing a site for launch or indexing

## Do not use this skill when

- Writing marketing copy or keyword strategy (use copywriter skill)
- Building UI components with no SEO surface area
- Working on authenticated/private pages that should not be indexed

---

## 1. SEO Audit Checklist

Run through each section systematically. Fix issues in priority order.

### 1.1 Meta Tags

Every page must have:

```tsx
// app/layout.tsx (static)
export const metadata: Metadata = {
  title: {
    default: "Site Name",
    template: "%s | Site Name",
  },
  description: "Concise description under 160 characters.",
  metadataBase: new URL("https://example.com"),
};
```

Verify in `<head>`:
- `<title>` — unique per page, 50-60 characters
- `<meta name="description">` — unique per page, 120-160 characters
- `<meta name="viewport" content="width=device-width, initial-scale=1">` (Next.js adds automatically)
- `<meta charset="utf-8">` (Next.js adds automatically)

**Audit command** (grep for pages missing metadata):

```bash
grep -rL "metadata\|generateMetadata" app/**/page.tsx
```

### 1.2 Open Graph / Twitter Cards

```tsx
export const metadata: Metadata = {
  openGraph: {
    title: "Page Title",
    description: "Page description for social sharing.",
    url: "https://example.com/page",
    siteName: "Site Name",
    images: [
      {
        url: "/og/page.png", // 1200x630
        width: 1200,
        height: 630,
        alt: "Descriptive alt text for OG image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title",
    description: "Page description for Twitter.",
    images: ["/og/page.png"],
  },
};
```

**Checklist:**
- [ ] OG image is 1200x630px (minimum 600x315)
- [ ] OG title differs from `<title>` only if needed for social context
- [ ] `twitter:card` is `summary_large_image` for pages with hero images
- [ ] All OG images have descriptive `alt` text

### 1.3 Canonical URLs

```tsx
export const metadata: Metadata = {
  alternates: {
    canonical: "https://example.com/page",
    languages: {
      "en-US": "https://example.com/en/page",
      "de-DE": "https://example.com/de/page",
    },
  },
};
```

**Rules:**
- Every page has exactly one canonical URL
- Canonical is absolute (includes protocol + domain)
- Paginated pages point canonical to page 1 or use `rel=prev/next`
- Trailing slash usage is consistent site-wide

### 1.4 Structured Data (JSON-LD)

See section 4 for full templates. Verify with:
- Google Rich Results Test: `https://search.google.com/test/rich-results`
- Schema.org Validator: `https://validator.schema.org/`

### 1.5 Sitemap

See section 3.4 for Next.js implementation. Verify:
- [ ] Accessible at `/sitemap.xml`
- [ ] All public pages included
- [ ] No private/authenticated pages
- [ ] `lastmod` dates are accurate
- [ ] Submitted to Google Search Console

### 1.6 robots.txt

See section 3.5 for Next.js implementation. Verify:
- [ ] Accessible at `/robots.txt`
- [ ] Points to sitemap: `Sitemap: https://example.com/sitemap.xml`
- [ ] Blocks private paths (`/api/`, `/admin/`, `/dashboard/`)
- [ ] Does not accidentally block CSS/JS/images

### 1.7 Image Alt Text Audit

```bash
# Find images without alt text
grep -rn "<img" --include="*.tsx" --include="*.jsx" | grep -v "alt="
grep -rn "<Image" --include="*.tsx" --include="*.jsx" | grep -v "alt="
```

**Rules:**
- Informative images: descriptive alt text (what the image shows)
- Decorative images: `alt=""` (empty string, not missing)
- Never start alt text with "Image of" or "Picture of"
- Keep alt text under 125 characters

### 1.8 Heading Hierarchy

```bash
# Audit heading structure
grep -rn "<[Hh][1-6]" --include="*.tsx" --include="*.jsx" | sort
```

**Rules:**
- Exactly one `<h1>` per page
- Headings follow sequential order (h1 > h2 > h3, no skipping)
- Headings describe content structure, not visual styling
- Don't use headings solely for font size (use CSS instead)

### 1.9 Internal Linking

- Every important page is reachable within 3 clicks from homepage
- Use descriptive anchor text (not "click here")
- Breadcrumbs on deep pages (see BreadcrumbList schema in section 4)
- Fix broken internal links: crawl with `next build` warnings or external tool

---

## 2. Core Web Vitals

### 2.1 LCP (Largest Contentful Paint) < 2.5s

**Target**: under 2.5 seconds.

**Image optimization:**

```tsx
import Image from "next/image";

// Hero image — always priority for LCP element
<Image
  src="/hero.webp"
  alt="Hero description"
  width={1200}
  height={600}
  priority           // Disables lazy loading, adds preload
  sizes="100vw"      // Responsive hint
  quality={85}       // Balance quality vs size
/>
```

**Preload critical assets:**

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  other: {
    "link:preload:hero": '<link rel="preload" as="image" href="/hero.webp" />',
  },
};

// Or use next/head in pages router
<link rel="preload" as="image" href="/hero.webp" type="image/webp" />
```

**Quick wins:**
- Use `priority` on above-the-fold `<Image>` components
- Serve WebP/AVIF via `next/image` automatic optimization
- Set explicit `width` and `height` on all images
- Avoid client-side data fetches that block hero content — use RSC or `generateStaticParams`

### 2.2 INP (Interaction to Next Paint) < 200ms

**Target**: under 200 milliseconds.

```tsx
// Break up heavy interactions with startTransition
import { startTransition } from "react";

function handleFilter(value: string) {
  // Urgent: update input
  setInputValue(value);
  // Non-urgent: filter large list
  startTransition(() => {
    setFilteredItems(items.filter((i) => i.name.includes(value)));
  });
}
```

**Quick wins:**
- Use `startTransition` for non-urgent state updates
- Debounce search/filter inputs (300ms)
- Avoid synchronous layout thrashing (read then write DOM in same frame)
- Move heavy computation to Web Workers
- Use `dynamic()` to code-split heavy interactive components

### 2.3 CLS (Cumulative Layout Shift) < 0.1

**Target**: under 0.1.

```tsx
// Always set explicit dimensions to prevent layout shift
<Image src="/photo.webp" alt="Photo" width={800} height={450} />

// Reserve space for dynamic content
<div className="min-h-[400px]">
  <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
    <DynamicContent />
  </Suspense>
</div>

// Prevent font swap shift
// next.config.js — Next.js handles this with next/font
import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",        // Shows fallback immediately
  adjustFontFallback: true // Reduces layout shift from font swap
});
```

**Quick wins:**
- Set `width` and `height` on all `<Image>` and `<img>` elements
- Use `aspect-ratio` CSS for responsive media containers
- Reserve space for ads, embeds, and dynamic content with `min-height`
- Use `font-display: swap` and `adjustFontFallback` with `next/font`
- Avoid injecting content above existing content after load
- Use `Suspense` with appropriately-sized skeleton fallbacks

---

## 3. Next.js App Router SEO Patterns

### 3.1 Static Metadata Export

```tsx
// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our team and mission.",
  openGraph: {
    title: "About Us",
    description: "Learn about our team and mission.",
  },
};

export default function AboutPage() {
  return <main>{/* content */}</main>;
}
```

### 3.2 Dynamic Metadata (generateMetadata)

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    alternates: {
      canonical: `https://example.com/blog/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <article>{/* render post */}</article>;
}
```

### 3.3 OG Image Convention

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Blog post cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          padding: 60,
        }}
      >
        <h1 style={{ fontSize: 64, fontWeight: 700 }}>{post.title}</h1>
        <p style={{ fontSize: 28, color: "#999" }}>{post.excerpt}</p>
      </div>
    ),
    { ...size }
  );
}
```

### 3.4 Sitemap Route Handler

```tsx
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://example.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  // Dynamic pages
  const posts = await getAllPosts();
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages];
}
```

### 3.5 robots.txt Route Handler

```tsx
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/", "/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### 3.6 Not Found and Error Pages

```tsx
// app/not-found.tsx — important for SEO: returns proper 404 status
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Return home</a>
    </main>
  );
}
```

---

## 4. Structured Data Templates (JSON-LD)

### Helper Component

```tsx
// components/json-ld.tsx
type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### 4.1 Organization

```tsx
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Company Name",
    url: "https://example.com",
    logo: "https://example.com/logo.png",
    sameAs: [
      "https://twitter.com/company",
      "https://linkedin.com/company/company",
      "https://github.com/company",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@example.com",
      contactType: "customer service",
    },
  }}
/>
```

### 4.2 Article / BlogPosting

```tsx
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Company Name",
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://example.com/blog/${post.slug}`,
    },
  }}
/>
```

### 4.3 Product

```tsx
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      "@type": "Brand",
      name: "Brand Name",
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://example.com/products/${product.slug}`,
    },
    aggregateRating: product.reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        }
      : undefined,
  }}
/>
```

### 4.4 FAQ

```tsx
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }}
/>
```

### 4.5 BreadcrumbList

```tsx
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: crumb.href
        ? `https://example.com${crumb.href}`
        : undefined,
    })),
  }}
/>
```

### 4.6 LocalBusiness

```tsx
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Business Name",
    description: "Business description.",
    url: "https://example.com",
    telephone: "+1-555-123-4567",
    email: "hello@example.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Main St",
      addressLocality: "City",
      addressRegion: "ST",
      postalCode: "12345",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.7128,
      longitude: -74.006,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    image: "https://example.com/storefront.jpg",
    priceRange: "$$",
  }}
/>
```

---

## 5. Common Fixes

### 5.1 Missing Meta Description

```bash
# Find pages without description
grep -rL "description" app/**/page.tsx app/**/layout.tsx
```

**Fix** — add to page's metadata export:

```tsx
export const metadata: Metadata = {
  description: "Concise, unique description under 160 characters.",
};
```

### 5.2 Duplicate Titles

```bash
# Extract all static titles
grep -rn "title:" app/**/page.tsx | grep -v "template" | sort -t'"' -k2
```

**Fix** — use the layout template pattern:

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "Site Name",
    template: "%s | Site Name",  // Child pages append site name
  },
};

// app/about/page.tsx — renders as "About | Site Name"
export const metadata: Metadata = {
  title: "About",
};
```

### 5.3 Missing Alt Text

```bash
# Find Image/img tags without alt
grep -rn "Image\|<img" --include="*.tsx" | grep -v 'alt='
```

**Fix** — add descriptive alt or empty alt for decorative images:

```tsx
// Informative
<Image src="/team.jpg" alt="Team photo at the 2025 company retreat" ... />

// Decorative
<Image src="/bg-pattern.svg" alt="" aria-hidden="true" ... />
```

### 5.4 Broken Canonical

**Symptoms**: canonical points to wrong URL, uses relative path, or is missing.

```bash
# Check all canonical definitions
grep -rn "canonical" app/ --include="*.tsx" --include="*.ts"
```

**Fix** — set `metadataBase` once in root layout:

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
};

// app/blog/[slug]/page.tsx — canonical auto-resolves from metadataBase
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: {
      canonical: `/blog/${slug}`, // Resolves to https://example.com/blog/slug
    },
  };
}
```

### 5.5 Missing hreflang

For multi-language sites:

```tsx
// app/[locale]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const locales = ["en", "de", "fr"];
  const languages: Record<string, string> = {};

  for (const loc of locales) {
    languages[loc] = `https://example.com/${loc}`;
  }
  languages["x-default"] = "https://example.com/en";

  return {
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages,
    },
  };
}
```

### 5.6 Noindex on Pages That Should Be Indexed

```bash
# Find pages with noindex that may be accidental
grep -rn "noindex\|robots.*index.*false" app/ --include="*.tsx" --include="*.ts"
```

**Fix** — only apply noindex to genuinely private pages:

```tsx
// Private pages (correct)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Public pages should NOT have robots metadata (defaults to index, follow)
```

---

## Quick Audit Script

Run this from project root to get a summary of SEO issues:

```bash
echo "=== SEO Audit ==="

echo ""
echo "--- Pages missing metadata export ---"
grep -rL "metadata\|generateMetadata" app/**/page.tsx 2>/dev/null || echo "  (none found or no app dir)"

echo ""
echo "--- Images missing alt text ---"
grep -rn "Image\|<img" --include="*.tsx" app/ components/ 2>/dev/null | grep -v 'alt=' || echo "  All images have alt text"

echo ""
echo "--- Missing canonical URLs ---"
grep -rL "canonical\|alternates" app/**/page.tsx 2>/dev/null | head -20 || echo "  (check manually)"

echo ""
echo "--- Sitemap exists ---"
[ -f "app/sitemap.ts" ] || [ -f "app/sitemap.tsx" ] && echo "  OK" || echo "  MISSING: create app/sitemap.ts"

echo ""
echo "--- robots.txt exists ---"
[ -f "app/robots.ts" ] || [ -f "app/robots.tsx" ] && echo "  OK" || echo "  MISSING: create app/robots.ts"

echo ""
echo "--- Heading hierarchy ---"
grep -rn "<[Hh]1" --include="*.tsx" app/ 2>/dev/null | wc -l | xargs -I{} echo "  h1 tags found: {}"

echo ""
echo "=== Done ==="
```
