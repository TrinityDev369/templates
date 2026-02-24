import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface ContentSection {
  /** Section heading, e.g. "The Challenge" */
  heading: string;
  /** One or more paragraphs of body text */
  paragraphs: string[];
  /** Optional bullet points displayed beneath the paragraphs */
  bullets?: string[];
}

export interface CaseStudyContentProps {
  sections: ContentSection[];
}

/* -------------------------------------------------------------------------- */
/*  Accent bar color rotation                                                 */
/* -------------------------------------------------------------------------- */

const ACCENT_COLORS = [
  "bg-rose-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function CaseStudyContent({ sections }: CaseStudyContentProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="space-y-16">
        {sections.map((section, i) => (
          <article key={i}>
            {/* Section heading with left accent bar */}
            <div className="mb-6 flex items-center gap-3">
              <div
                className={cn(
                  "h-8 w-1 rounded-full",
                  ACCENT_COLORS[i % ACCENT_COLORS.length]
                )}
              />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {section.heading}
              </h2>
            </div>

            {/* Paragraphs */}
            <div className="space-y-4">
              {section.paragraphs.map((paragraph, pi) => (
                <p
                  key={pi}
                  className="text-base leading-relaxed text-slate-600 sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Optional bullet points */}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-6 space-y-3">
                {section.bullets.map((bullet, bi) => (
                  <li key={bi} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-2 h-2 w-2 shrink-0 rounded-full",
                        ACCENT_COLORS[i % ACCENT_COLORS.length]
                      )}
                    />
                    <span className="text-base leading-relaxed text-slate-600">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
