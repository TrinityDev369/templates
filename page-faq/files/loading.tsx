export default function FaqLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero skeleton */}
      <section className="px-4 pt-24 pb-12 text-center">
        <div className="mx-auto mb-4 h-10 w-80 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <div className="mx-auto mb-8 h-5 w-96 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800/60" />
        {/* Search bar skeleton */}
        <div className="mx-auto h-12 w-full max-w-2xl animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800/60" />
      </section>

      {/* Category pills skeleton */}
      <div className="flex justify-center gap-2 px-4 pb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800/60"
          />
        ))}
      </div>

      {/* Accordion skeleton */}
      <div className="mx-auto max-w-3xl divide-y divide-neutral-200 px-4 dark:divide-neutral-700">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="py-5">
            <div className="flex items-center justify-between">
              <div
                className="h-5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
                style={{ width: `${60 + (i % 3) * 10}%` }}
              />
              <div className="h-5 w-5 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
