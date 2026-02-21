import Link from "next/link";
import {
  ArrowRight,
  Dumbbell,
  Users,
  Calendar,
  Star,
  Quote,
  ChevronRight,
  Flame,
} from "lucide-react";
import { gymClasses, testimonials, schedule } from "@/lib/data";
import { ClassCard } from "@/components/class-card";
import { ScheduleTable } from "@/components/schedule-table";

const stats = [
  { value: "10,000+", label: "Active Members" },
  { value: "50+", label: "Classes / Week" },
  { value: "20+", label: "Expert Trainers" },
  { value: "5.0", label: "Star Rated" },
];

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export default function HomePage() {
  const featuredClasses = gymClasses.slice(0, 3);

  const today = days[new Date().getDay()];
  const todaySchedule = schedule.filter((entry) => entry.day === today);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Section 1 -- Hero                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-gray-950 py-32 md:py-44 px-4">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-gray-950 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 mb-8">
            <Flame className="h-4 w-4" />
            No Excuses. Just Results.
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none">
            Transform
            <br />
            <span className="text-brand-500">Your Body</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Premium equipment, world-class trainers, and a community that pushes
            you beyond limits. Iron Peak Fitness is where champions are forged.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold uppercase tracking-wide rounded-lg px-8 py-4 text-sm transition-colors"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/classes"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-600 hover:border-gray-400 text-white font-bold uppercase tracking-wide rounded-lg px-8 py-4 text-sm transition-colors"
            >
              View Classes
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2 -- Stats Bar                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-900 border-y border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-brand-500">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-400 uppercase tracking-wider font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3 -- Featured Classes                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
                Train Hard
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
                Featured Classes
              </h2>
            </div>
            <Link
              href="/classes"
              className="hidden sm:inline-flex items-center gap-1 text-brand-500 font-medium hover:text-brand-400 transition-colors"
            >
              View All Classes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredClasses.map((gymClass) => (
              <ClassCard key={gymClass.id} gymClass={gymClass} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/classes"
              className="inline-flex items-center gap-1 text-brand-500 font-medium"
            >
              View All Classes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4 -- Today's Schedule                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
              Never Miss a Session
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
              Today&apos;s Schedule
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              Check out what&apos;s happening today and lock in your spot. Classes fill up fast.
            </p>
          </div>

          {todaySchedule.length > 0 ? (
            <ScheduleTable schedule={todaySchedule} />
          ) : (
            <div className="text-center py-12 rounded-xl border border-gray-800 bg-gray-950">
              <Calendar className="h-12 w-12 text-gray-600 mx-auto" />
              <p className="mt-4 text-gray-500">
                No classes scheduled for today. Check the{" "}
                <Link href="/schedule" className="text-brand-500 hover:underline">
                  full schedule
                </Link>
                .
              </p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 text-brand-500 font-medium hover:text-brand-400 transition-colors"
            >
              View Full Weekly Schedule
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 5 -- Testimonials                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
              Real Results
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
              What Our Members Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.slice(0, 4).map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
              >
                <Quote className="h-8 w-8 text-brand-500/30" />
                <p className="mt-4 text-gray-300 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex gap-0.5 mt-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-brand-500 text-brand-500"
                    />
                  ))}
                </div>
                <div className="mt-3">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">
                    Member since {testimonial.memberSince}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 6 -- CTA Banner                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
            Ready to Start?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Your first week is on us. No contracts, no commitments. Just show up
            and see what you&apos;re made of.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-600 font-bold uppercase tracking-wide rounded-lg px-8 py-4 text-sm hover:bg-gray-100 transition-colors"
            >
              Claim Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold uppercase tracking-wide rounded-lg px-8 py-4 text-sm transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
