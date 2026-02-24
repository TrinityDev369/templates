export default function CaseStudyLoading() {
  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Hero skeleton */}
      <div className="bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
          {/* Client badge */}
          <div className="mb-8 flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-800" />
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
              <div className="h-4 w-28 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
          {/* Industry tag */}
          <div className="mb-6 h-6 w-36 animate-pulse rounded-full bg-slate-800" />
          {/* Title */}
          <div className="mt-4 space-y-3">
            <div className="h-10 w-full max-w-2xl animate-pulse rounded-lg bg-slate-800" />
            <div className="h-10 w-3/4 max-w-xl animate-pulse rounded-lg bg-slate-800" />
          </div>
          {/* Summary */}
          <div className="mt-6 h-6 w-full max-w-lg animate-pulse rounded bg-slate-800" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="relative z-20 -mt-12 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-5 w-5 animate-pulse rounded bg-slate-100" />
                <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              {/* Section heading */}
              <div className="mb-6 flex items-center gap-3">
                <div className="h-8 w-1 animate-pulse rounded-full bg-slate-200" />
                <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-100" />
              </div>
              {/* Paragraphs */}
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              </div>
              {/* Bullets */}
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((_, bi) => (
                  <div key={bi} className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial skeleton */}
      <div className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="space-y-3">
              <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA skeleton */}
      <div className="bg-indigo-600 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto h-9 w-80 animate-pulse rounded-lg bg-indigo-500" />
          <div className="mx-auto mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-indigo-500" />
          <div className="mx-auto mt-8 h-14 w-44 animate-pulse rounded-xl bg-indigo-500" />
        </div>
      </div>
    </div>
  );
}
