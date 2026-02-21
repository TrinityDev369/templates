export default function ReportsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-7 w-40 rounded-md bg-zinc-800" />
          <div className="mt-2 h-4 w-64 rounded-md bg-zinc-800/60" />
        </div>
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-md bg-zinc-800" />
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
            <div className="h-11 w-11 shrink-0 rounded-lg bg-zinc-800" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-24 rounded bg-zinc-800/60" />
              <div className="mt-2 h-6 w-32 rounded bg-zinc-800" />
              <div className="mt-1 h-3 w-20 rounded bg-zinc-800/40" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
            <div className="mb-4 h-4 w-36 rounded bg-zinc-800" />
            <div className="h-[260px] w-full rounded-lg bg-zinc-800/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
