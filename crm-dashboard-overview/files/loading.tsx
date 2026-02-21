export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-7 w-36 animate-pulse rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-gray-200" />
        </div>

        {/* KPI Card skeletons */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
              </div>
              <div className="mt-3 h-7 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Pipeline skeleton */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          <div className="mt-1.5 h-3.5 w-44 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-gray-200" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1.5 h-2.5 w-2.5 animate-pulse rounded-full bg-gray-200" />
                <div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue chart + Activities skeleton */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Chart skeleton */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                <div className="mt-1.5 h-3.5 w-40 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="mt-4 h-64 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>

          {/* Activities skeleton */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
            <div className="mt-1.5 h-3.5 w-36 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-2 py-2.5">
                  <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-lg bg-gray-100" />
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
