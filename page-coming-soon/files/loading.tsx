export default function ComingSoonLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4">
      {/* Brand skeleton */}
      <div className="mb-8 h-5 w-32 animate-pulse rounded-lg bg-white/10" />

      {/* Headline skeleton */}
      <div className="mb-3 h-10 w-72 animate-pulse rounded-lg bg-white/10 sm:h-14 sm:w-96" />

      {/* Subtitle skeleton */}
      <div className="mb-12 h-5 w-64 animate-pulse rounded-lg bg-white/5 sm:w-80" />

      {/* Countdown skeleton */}
      <div className="mb-14 flex items-center gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 animate-pulse rounded-xl bg-white/10 sm:h-24 sm:w-24 md:h-28 md:w-28" />
            <div className="h-3 w-14 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Email capture skeleton */}
      <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/10" />
        <div className="h-12 w-32 animate-pulse rounded-xl bg-white/10" />
      </div>

      {/* Social links skeleton */}
      <div className="mt-16 flex items-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-10 animate-pulse rounded-full bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}
