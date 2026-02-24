import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface CaseStudyHeroProps {
  /** Client / company name */
  clientName: string;
  /** One or two initials for the logo placeholder */
  clientInitials: string;
  /** Gradient classes for the logo placeholder background */
  clientLogoGradient?: string;
  /** Page headline, e.g. "How Acme doubled their conversion rate" */
  title: string;
  /** Short industry tag displayed as a badge */
  industryTag: string;
  /** One-line summary beneath the title */
  summary: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function CaseStudyHero({
  clientName,
  clientInitials,
  clientLogoGradient = "from-indigo-600 to-violet-600",
  title,
  industryTag,
  summary,
}: CaseStudyHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
        {/* Client logo placeholder */}
        <div className="mb-8 flex items-center gap-4">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ring-2 ring-white/10",
              clientLogoGradient
            )}
          >
            <span className="text-lg font-bold text-white">
              {clientInitials}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Case Study</p>
            <p className="text-base font-semibold text-white">{clientName}</p>
          </div>
        </div>

        {/* Industry tag */}
        <span className="mb-6 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          {industryTag}
        </span>

        {/* Title */}
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {/* Summary line */}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
          {summary}
        </p>
      </div>

      {/* Bottom gradient fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
