export default function WaitlistLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-16">
      {/* Background glow placeholder */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl space-y-8">
        {/* Title skeleton */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-80 animate-pulse rounded-lg bg-white/10" />
          <div className="h-5 w-64 animate-pulse rounded-md bg-white/10" />
        </div>

        {/* Form skeleton */}
        <div className="mx-auto w-full max-w-md space-y-3">
          <div className="h-12 w-full animate-pulse rounded-lg bg-white/10" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-white/10" />
        </div>

        {/* Stats skeleton */}
        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-16 animate-pulse rounded-md bg-white/10" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-16 animate-pulse rounded-md bg-white/10" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
