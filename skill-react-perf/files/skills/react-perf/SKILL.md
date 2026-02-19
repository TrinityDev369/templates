---
name: react-perf
description: React performance optimization and profiling — memoization, code splitting, bundle analysis, rendering patterns, Core Web Vitals
---

# React Performance Optimization

Systematic approach to measuring, diagnosing, and fixing React performance issues. Measure first, optimize second, verify always.

## 1. When to Optimize

Do NOT prematurely optimize. Most React apps are fast enough by default. Optimize only when:

- Users report sluggishness or jank
- Lighthouse scores drop below thresholds (LCP > 2.5s, INP > 200ms, CLS > 0.1)
- Profiler shows wasted renders exceeding 16ms per frame
- Bundle size exceeds 200KB gzipped for initial load

### Measure First

```bash
# Lighthouse CI (automated)
npx lhci autorun

# Bundle analysis
ANALYZE=true next build

# React DevTools Profiler
# Chrome > React DevTools > Profiler > Record > Interact > Stop
```

### Common Bottleneck Checklist

- [ ] Unnecessary re-renders from unstable references
- [ ] Large component trees re-rendering on every state change
- [ ] Unoptimized images (no `next/image`, no sizing)
- [ ] Barrel file imports pulling in entire libraries
- [ ] Client components that could be Server Components
- [ ] Waterfall data fetching (sequential instead of parallel)
- [ ] Unvirtualized long lists (>100 items)
- [ ] Missing code splitting for heavy routes/components

## 2. Rendering Optimization

### React.memo

Wrap components that receive the same props frequently but whose parent re-renders often.

```tsx
// GOOD: Pure display component with stable props
const ExpensiveChart = React.memo(function ExpensiveChart({
  data,
  config,
}: ChartProps) {
  return <canvas>{/* heavy rendering */}</canvas>;
});

// BAD: Don't memo components that:
// - Receive children as props (always new reference)
// - Receive new object/array literals every render
// - Are cheap to render (simple DOM, no computation)
// - Almost always receive different props
```

### useMemo / useCallback

Use for referential stability and expensive computations, not as a default.

```tsx
function Dashboard({ items, filter }: DashboardProps) {
  // GOOD: Expensive computation, stable reference for child
  const filtered = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [items, filter]
  );

  // GOOD: Stable callback passed to memoized child
  const handleSelect = useCallback(
    (id: string) => {
      setSelected((prev) => [...prev, id]);
    },
    [] // no deps — uses updater function
  );

  // BAD: Memoizing cheap operations
  // const label = useMemo(() => `Count: ${items.length}`, [items.length]);

  return <ItemList items={filtered} onSelect={handleSelect} />;
}
```

**Anti-patterns to avoid:**
- Memoizing values only used in JSX (React already diffs efficiently)
- Missing dependency array items (stale closures)
- Memoizing inside loops or conditionals

### Key Prop Best Practices

```tsx
// GOOD: Stable unique identifier
{users.map((user) => (
  <UserCard key={user.id} user={user} />
))}

// BAD: Array index for dynamic lists (breaks on reorder/insert/delete)
{users.map((user, index) => (
  <UserCard key={index} user={user} />  // DO NOT do this
))}

// ACCEPTABLE: Array index for static lists that never reorder
{menuItems.map((item, i) => (
  <MenuItem key={i} label={item} />
))}
```

### Virtualization for Long Lists

Use `@tanstack/react-virtual` (preferred) or `react-window` for lists exceeding ~100 items.

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vItem) => (
          <div
            key={vItem.key}
            style={{
              position: "absolute",
              top: 0,
              transform: `translateY(${vItem.start}px)`,
              height: vItem.size,
              width: "100%",
            }}
          >
            <Row item={items[vItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### State Colocation

Keep state as close to its consumers as possible. Lift state only when siblings need it.

```tsx
// BAD: State at root forces entire tree to re-render
function App() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <Layout>
      <Sidebar />
      <SearchBar query={searchQuery} onChange={setSearchQuery} />
      <Results query={searchQuery} />
    </Layout>
  );
}

// GOOD: Search state colocated with its consumers
function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <>
      <SearchBar query={searchQuery} onChange={setSearchQuery} />
      <Results query={searchQuery} />
    </>
  );
}

function App() {
  return (
    <Layout>
      <Sidebar />
      <SearchSection />
    </Layout>
  );
}
```

### Context Splitting

Separate frequently changing values from rarely changing ones.

```tsx
// BAD: Single context — every consumer re-renders on ANY change
const AppContext = createContext<{
  theme: Theme;
  user: User;
  notifications: Notification[];
}>(/* ... */);

// GOOD: Split by update frequency
const ThemeContext = createContext<Theme>(defaultTheme); // Rare changes
const UserContext = createContext<User | null>(null); // Session-level
const NotificationContext = createContext<Notification[]>([]); // Frequent
```

### Concurrent Features

```tsx
import { useTransition, useDeferredValue } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Mark expensive update as non-urgent
  const handleSearch = (value: string) => {
    setQuery(value); // Urgent: update input immediately
    startTransition(() => {
      setSearchResults(filterLargeDataset(value)); // Non-urgent: can be interrupted
    });
  };

  // Or defer the value itself
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <HeavyResults query={deferredQuery} />
    </>
  );
}
```

## 3. Code Splitting & Lazy Loading

### React.lazy + Suspense

```tsx
// Split heavy components (charts, editors, maps)
const RichTextEditor = lazy(() => import("./RichTextEditor"));
const ChartDashboard = lazy(() => import("./ChartDashboard"));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      {showEditor && <RichTextEditor />}
    </Suspense>
  );
}
```

### Next.js dynamic()

```tsx
import dynamic from "next/dynamic";

// Client-only component (no SSR)
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Named export
const Chart = dynamic(
  () => import("./charts").then((mod) => mod.BarChart),
  { loading: () => <ChartSkeleton /> }
);
```

### Route-Based Splitting

In App Router, each `page.tsx` is automatically code-split. Enhance with:

```
app/
  dashboard/
    page.tsx         # Auto-split route
    loading.tsx      # Streaming fallback (instant skeleton)
    error.tsx        # Error boundary per route
  settings/
    page.tsx
    loading.tsx
```

### Component-Level Splitting

Split any component over ~50KB or that uses heavy dependencies:

```tsx
// Heavy deps: chart libraries, code editors, PDF viewers, map SDKs
const CodeEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-[400px] animate-pulse bg-muted" />,
});
```

## 4. Bundle Optimization

### Tree-Shaking: Named Imports vs Barrel Exports

```tsx
// BAD: Barrel import pulls in everything
import { Button } from "@/components";
// This imports ALL components if @/components/index.ts re-exports everything

// GOOD: Direct import from source
import { Button } from "@/components/ui/button";

// BAD: Full library import
import _ from "lodash";
_.debounce(fn, 300);

// GOOD: Cherry-pick
import debounce from "lodash/debounce";
```

### Bundle Analyzer Setup

```js
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // ... rest of config
});
```

```bash
ANALYZE=true next build
# Opens interactive treemap in browser
```

### Heavy Library Alternatives

| Heavy | Light Alternative | Savings |
|-------|-------------------|---------|
| `moment` (300KB) | `date-fns` (tree-shakeable) | ~250KB |
| `lodash` (72KB) | `lodash-es` or cherry-pick | ~60KB |
| `chart.js` (200KB) | `lightweight-charts` | ~150KB |
| `axios` (30KB) | Native `fetch` | ~30KB |
| `uuid` (12KB) | `crypto.randomUUID()` | ~12KB |

### Image Optimization

```tsx
import Image from "next/image";

// GOOD: Optimized with blur placeholder and proper sizing
<Image
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
  placeholder="blur"
  blurDataURL={shimmer}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold} // LCP image: add priority
/>

// BAD: Unoptimized <img> tag
<img src="/hero.jpg" alt="Hero" />
```

## 5. Server Components (Next.js App Router)

### Default to Server Components

Server Components run on the server, send zero JS to the client, and can directly access databases and APIs.

```tsx
// app/dashboard/page.tsx — Server Component by default
// No "use client" needed. Zero client JS for this component.
async function DashboardPage() {
  const metrics = await db.query("SELECT * FROM metrics");
  return <MetricsGrid data={metrics} />;
}
```

### Push "use client" to Leaf Nodes

```tsx
// BAD: "use client" at the page level — entire tree becomes client
"use client";
export default function Page() { /* ... */ }

// GOOD: Only the interactive piece is a client component
// app/dashboard/page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();
  return (
    <div>
      <StaticHeader />           {/* Server Component */}
      <DataTable data={data} />  {/* Server Component */}
      <InteractiveFilter />      {/* Client Component (leaf) */}
    </div>
  );
}

// components/InteractiveFilter.tsx
"use client";
export function InteractiveFilter() {
  const [filter, setFilter] = useState("");
  return <input value={filter} onChange={(e) => setFilter(e.target.value)} />;
}
```

### Streaming with Suspense

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Fast data streams immediately */}
      <Suspense fallback={<MetricsSkeleton />}>
        <SlowMetrics />
      </Suspense>
      {/* Independent slow section streams when ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowCharts />
      </Suspense>
    </div>
  );
}
```

### Server Actions for Mutations

```tsx
// app/actions.ts
"use server";

export async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string;
  await db.query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);
  revalidatePath("/profile");
}
```

## 6. Data Fetching Patterns

### Parallel Fetching

```tsx
// BAD: Sequential waterfall
async function Page() {
  const user = await getUser();      // 200ms
  const posts = await getPosts();    // 300ms
  const comments = await getComments(); // 150ms
  // Total: 650ms

  return <Dashboard user={user} posts={posts} comments={comments} />;
}

// GOOD: Parallel with Promise.all
async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),      // 200ms
    getPosts(),     // 300ms ← these run simultaneously
    getComments(),  // 150ms
  ]);
  // Total: 300ms (slowest request)

  return <Dashboard user={user} posts={posts} comments={comments} />;
}
```

### Request Deduplication with cache()

```tsx
import { cache } from "react";

// Deduplicated: called in multiple components, only executes once per request
export const getUser = cache(async (userId: string) => {
  const res = await fetch(`/api/users/${userId}`);
  return res.json() as Promise<User>;
});
```

### Optimistic Updates

```tsx
"use client";
import { useOptimistic } from "react";

function TodoList({ todos, addTodoAction }: Props) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state: Todo[], newTodo: string) => [
      ...state,
      { id: crypto.randomUUID(), text: newTodo, pending: true },
    ]
  );

  return (
    <form
      action={async (formData: FormData) => {
        const text = formData.get("text") as string;
        addOptimistic(text);
        await addTodoAction(text);
      }}
    >
      <input name="text" />
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

### Client-Side Fetching (SWR)

```tsx
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function LiveMetrics() {
  const { data, error, isLoading } = useSWR<Metrics>(
    "/api/metrics",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  return <MetricsDisplay data={data!} />;
}
```

## 7. Profiling & Debugging

### React DevTools Profiler Workflow

1. Open React DevTools > Profiler tab
2. Click Record, interact with the app, click Stop
3. Look for: long bars (slow renders), gray bars (skipped renders), frequent re-renders
4. Sort by "Render duration" to find the worst offenders
5. Click a component to see "Why did this render?"

### Programmatic Profiler

```tsx
import { Profiler, ProfilerOnRenderCallback } from "react";

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (actualDuration > 16) {
    console.warn(
      `[Perf] ${id} took ${actualDuration.toFixed(1)}ms (phase: ${phase})`
    );
  }
};

function App() {
  return (
    <Profiler id="Dashboard" onRender={onRender}>
      <Dashboard />
    </Profiler>
  );
}
```

### Why Did You Render

```tsx
// _app.tsx or layout.tsx (dev only)
if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    logOnDifferentValues: true,
  });
}

// On specific components:
MyComponent.whyDidYouRender = true;
```

### Chrome Performance Tab

1. Open DevTools > Performance
2. Click Record, interact, Stop
3. Look for: Long Tasks (>50ms), Layout Thrashing, excessive Scripting time
4. Filter to "Main" thread, zoom into slow frames
5. Check "Bottom-Up" for functions consuming the most time

## 8. Quick Wins Checklist

1. **Use Server Components by default** — add `"use client"` only when you need hooks, event handlers, or browser APIs
2. **Add `loading.tsx`** to every route segment for instant perceived performance
3. **Replace barrel imports** — import directly from source files, not index re-exports
4. **Add `priority` to LCP images** — the hero image above the fold in `next/image`
5. **Parallelize data fetching** — `Promise.all()` for independent requests, Suspense boundaries for streaming
6. **Virtualize long lists** — any list >100 items should use `@tanstack/react-virtual`
7. **Dynamic import heavy components** — charts, editors, maps, PDF viewers with `next/dynamic({ ssr: false })`
8. **Split contexts by update frequency** — theme/auth (rare) vs notifications/live-data (frequent)
9. **Audit bundle with analyzer** — `ANALYZE=true next build`, target <200KB gzipped first load
10. **Set up Lighthouse CI** — automate Core Web Vitals checks in CI pipeline
