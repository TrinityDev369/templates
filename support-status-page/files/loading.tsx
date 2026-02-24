export default function StatusLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-gray-200" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-md bg-gray-200" />
      </div>

      {/* Status banner skeleton */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div>
            <div className="h-6 w-52 animate-pulse rounded bg-gray-200" />
            <div className="mt-1.5 h-4 w-72 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="mt-4 h-3 w-40 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Services skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
              </div>
              <div className="mt-3 flex items-center gap-px">
                {Array.from({ length: 90 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-8 w-[3px] animate-pulse rounded-full bg-gray-200"
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-10 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident timeline skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white"
          >
            <div className="px-6 py-3">
              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-2.5 w-2.5 animate-pulse rounded-full bg-gray-200" />
                <div>
                  <div className="h-5 w-56 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-3">
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex gap-3 pl-4">
                    <div className="mt-1.5 h-2 w-2 animate-pulse rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                      </div>
                      <div className="mt-1 h-4 w-full animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
