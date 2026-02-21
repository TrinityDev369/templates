export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Search bar skeleton */}
      <div className="mb-10">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Result count skeleton */}
      <div className="mb-6 h-5 w-36 animate-pulse rounded bg-gray-200" />

      {/* Card skeletons */}
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="mt-4 h-4 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
