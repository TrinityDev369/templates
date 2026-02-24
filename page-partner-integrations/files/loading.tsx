export default function IntegrationsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 h-10 w-64 animate-pulse rounded-lg bg-muted" />
            <div className="mx-auto h-5 w-96 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-muted"
              />
            ))}
          </div>
          <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="mb-2 h-5 w-32 animate-pulse rounded-md bg-muted" />
              <div className="mb-1 h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="mb-4 h-4 w-3/4 animate-pulse rounded-md bg-muted" />
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
