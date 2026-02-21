export function OnboardingWizardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        {/* Header skeleton */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
        </div>

        {/* Progress bar skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-3 w-14 rounded bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full" />
        </div>

        {/* Card skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Title */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 animate-pulse" />
              <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-72 rounded bg-gray-100 animate-pulse" />
            </div>

            {/* Content lines */}
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-4/6 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>

          {/* Navigation skeleton */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="h-9 w-24 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-9 w-28 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
