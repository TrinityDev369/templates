import { cn } from "@/lib/utils";
import { Quote, ArrowRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface TestimonialData {
  /** The quote text */
  quote: string;
  /** Person's full name */
  personName: string;
  /** Person's role / title */
  role: string;
  /** Company name */
  company: string;
  /** Initials for the avatar placeholder */
  avatarInitials: string;
  /** Gradient classes for avatar background */
  avatarGradient?: string;
}

export interface CaseStudyTestimonialProps {
  testimonial: TestimonialData;
  /** CTA heading, defaults to "Ready to achieve similar results?" */
  ctaHeading?: string;
  /** CTA description text */
  ctaDescription?: string;
  /** CTA button label, defaults to "Get in Touch" */
  ctaButtonLabel?: string;
  /** CTA button href, defaults to "/contact" */
  ctaButtonHref?: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function CaseStudyTestimonial({
  testimonial,
  ctaHeading = "Ready to achieve similar results?",
  ctaDescription = "Let us help you transform your business with a tailored solution. Our team is ready to understand your challenges and deliver measurable outcomes.",
  ctaButtonLabel = "Get in Touch",
  ctaButtonHref = "/contact",
}: CaseStudyTestimonialProps) {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/*  Testimonial Block                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            {/* Decorative quote icon */}
            <Quote className="absolute -top-4 left-8 h-8 w-8 text-indigo-500" />

            {/* Quote */}
            <blockquote className="mt-2 text-lg font-medium italic leading-relaxed text-slate-700 sm:text-xl">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            {/* Attribution */}
            <div className="mt-8 flex items-center gap-4">
              {/* Avatar placeholder */}
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-sm",
                  testimonial.avatarGradient ?? "from-indigo-500 to-violet-600"
                )}
              >
                <span className="text-sm font-bold text-white">
                  {testimonial.avatarInitials}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {testimonial.personName}
                </p>
                <p className="text-sm text-slate-500">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Call to Action                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {ctaHeading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-indigo-100 sm:text-lg">
            {ctaDescription}
          </p>
          <div className="mt-8">
            <a
              href={ctaButtonHref}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
            >
              {ctaButtonLabel}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
