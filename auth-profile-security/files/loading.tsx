export default function SecuritySettingsLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
        <div>
          <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* Top row: Password + 2FA skeletons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Password card skeleton */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
            <div>
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
          </div>
        </div>

        {/* 2FA card skeleton */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
            <div>
              <div className="h-4 w-44 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      {/* Sessions card skeleton */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
            <div>
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mt-6 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Trusted devices skeleton */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
          <div>
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-44 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Security events skeleton */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
          <div>
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-44 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-6 space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2 pt-0.5">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-64 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
