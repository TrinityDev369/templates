/* ------------------------------------------------------------------ */
/*  Loading skeleton — mirrors the company detail page layout          */
/* ------------------------------------------------------------------ */

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className ?? ""}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ---- Company Header Skeleton -------------------------------- */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <Pulse className="h-16 w-16 shrink-0 rounded-full" />

          <div className="flex-1 space-y-3">
            {/* Name */}
            <Pulse className="h-7 w-56" />
            {/* Meta row */}
            <div className="flex flex-wrap gap-4">
              <Pulse className="h-4 w-28" />
              <Pulse className="h-4 w-36" />
              <Pulse className="h-4 w-24" />
              <Pulse className="h-4 w-20" />
            </div>
            {/* Description */}
            <Pulse className="h-4 w-full max-w-lg" />
            <Pulse className="h-4 w-3/4 max-w-md" />
          </div>

          {/* Edit button */}
          <Pulse className="h-9 w-20 rounded-md" />
        </div>
      </div>

      {/* ---- Tab Bar Skeleton --------------------------------------- */}
      <div className="mt-6 flex gap-4 border-b border-gray-200 pb-2">
        <Pulse className="h-5 w-20" />
        <Pulse className="h-5 w-16" />
        <Pulse className="h-5 w-20" />
      </div>

      {/* ---- Content Skeleton (contact cards) ----------------------- */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <Pulse className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-32" />
                <Pulse className="h-3 w-24" />
              </div>
            </div>
            <Pulse className="h-3 w-40" />
            <Pulse className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
