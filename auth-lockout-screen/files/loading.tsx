export default function LockoutLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Header skeleton */}
          <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-2">
            {/* Lock icon placeholder */}
            <div className="h-20 w-20 rounded-full bg-gray-100 animate-pulse dark:bg-gray-800" />

            {/* Title */}
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-7 w-48 rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
              <div className="h-4 w-64 rounded bg-gray-100 animate-pulse dark:bg-gray-800" />
              <div className="h-4 w-56 rounded bg-gray-100 animate-pulse dark:bg-gray-800" />
            </div>

            {/* Attempt badge */}
            <div className="h-6 w-52 rounded-full bg-gray-100 animate-pulse dark:bg-gray-800" />
          </div>

          {/* Timer skeleton */}
          <div className="flex flex-col items-center gap-3 px-6 py-6">
            <div className="h-40 w-40 rounded-full bg-gray-100 animate-pulse dark:bg-gray-800" />
            <div className="h-4 w-28 rounded bg-gray-100 animate-pulse dark:bg-gray-800" />
          </div>

          {/* Divider */}
          <div className="px-6">
            <div className="border-t border-gray-100 dark:border-gray-800" />
          </div>

          {/* Unlock options skeleton */}
          <div className="space-y-3 px-6 py-6">
            <div className="h-4 w-36 mx-auto rounded bg-gray-100 animate-pulse dark:bg-gray-800" />
            <div className="h-16 w-full rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
            <div className="h-16 w-full rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
          </div>

          {/* Footer skeleton */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
            <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
