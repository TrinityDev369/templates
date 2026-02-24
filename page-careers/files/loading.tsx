import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Skeleton primitives                                                 */
/* ------------------------------------------------------------------ */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-3/4" />
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading page                                                        */
/* ------------------------------------------------------------------ */
export default function CareersLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="mx-auto h-10 w-64" />
        <Skeleton className="mx-auto h-5 w-96" />
        <div className="mt-6 flex justify-center gap-8">
          <Skeleton className="h-16 w-28" />
          <Skeleton className="h-16 w-28" />
          <Skeleton className="h-16 w-28" />
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>

      {/* Card skeletons */}
      <div className="mt-8 grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
