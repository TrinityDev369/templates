import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Skeleton primitives                                                 */
/* ------------------------------------------------------------------ */

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
    />
  );
}

function BadgeCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <Skeleton className="mt-4 h-4 w-24" />
      <Skeleton className="mt-2 h-3 w-36" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-3/4" />
      <Skeleton className="mt-4 h-6 w-20 rounded-full" />
    </div>
  );
}

function FeatureCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="mt-3 h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-2/3" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-950">
      <Skeleton className="mx-auto h-8 w-20" />
      <Skeleton className="mx-auto mt-2 h-4 w-24" />
      <Skeleton className="mx-auto mt-1 h-3 w-32" />
    </div>
  );
}

function PolicyCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-2/3" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading page                                                        */
/* ------------------------------------------------------------------ */

export default function SecurityLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero skeleton */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto mt-6 h-10 w-64" />
          <Skeleton className="mx-auto mt-4 h-4 w-96" />
          <Skeleton className="mx-auto mt-2 h-4 w-80" />
          <div className="mt-8 flex justify-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Trust stats skeleton */}
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-72" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Compliance badges skeleton */}
        <Skeleton className="mt-14 h-5 w-52" />
        <Skeleton className="mt-2 h-3 w-80" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <BadgeCardSkeleton key={i} />
          ))}
        </div>

        {/* Security features skeleton */}
        <Skeleton className="mt-14 h-5 w-36" />
        <Skeleton className="mt-2 h-3 w-72" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <FeatureCardSkeleton key={i} />
          ))}
        </div>

        {/* Data handling skeleton */}
        <Skeleton className="mt-14 h-5 w-32" />
        <Skeleton className="mt-2 h-3 w-56" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <PolicyCardSkeleton key={i} />
          ))}
        </div>

        {/* Security contact skeleton */}
        <div className="mt-14 mb-16 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col items-center sm:flex-row sm:gap-6">
            <Skeleton className="h-14 w-14 flex-shrink-0 rounded-full" />
            <div className="mt-4 w-full sm:mt-0">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-3/4" />
              <div className="mt-4 flex gap-3">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-10 w-40 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
