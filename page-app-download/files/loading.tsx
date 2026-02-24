import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Skeleton primitive                                                   */
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

/* ------------------------------------------------------------------ */
/* Loading page                                                         */
/* ------------------------------------------------------------------ */
export default function DownloadLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero skeleton */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Text side */}
            <div className="space-y-4 text-center lg:text-left">
              <Skeleton className="mx-auto h-6 w-48 rounded-full lg:mx-0" />
              <Skeleton className="mx-auto h-12 w-72 lg:mx-0" />
              <Skeleton className="mx-auto h-6 w-56 lg:mx-0" />
              <Skeleton className="mx-auto h-5 w-96 lg:mx-0" />
              <Skeleton className="mx-auto h-5 w-80 lg:mx-0" />
              <div className="mt-6 flex justify-center gap-4 lg:justify-start">
                <Skeleton className="h-[50px] w-[150px] rounded-lg" />
                <Skeleton className="h-[50px] w-[150px] rounded-lg" />
              </div>
              <div className="mt-8 flex justify-center gap-8 lg:justify-start">
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-16 w-24" />
              </div>
            </div>

            {/* Phone mockup side */}
            <div className="flex justify-center lg:justify-end">
              <Skeleton className="h-[520px] w-[260px] rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </div>

      {/* Features skeleton */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <Skeleton className="mx-auto h-8 w-80" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
            >
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="mt-4 h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Screenshots skeleton */}
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-5 w-80" />
          <div className="mt-10 flex gap-6 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[220px]">
                <Skeleton className="aspect-[9/16] w-full rounded-2xl" />
                <Skeleton className="mt-3 mx-auto h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR / CTA skeleton */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
          <Skeleton className="mt-4 h-40 w-40 rounded-2xl" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-[50px] w-[150px] rounded-lg" />
            <Skeleton className="h-[50px] w-[150px] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
