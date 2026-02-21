import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { schedule } from "@/lib/data";
import { ScheduleTable } from "@/components/schedule-table";

export const metadata = {
  title: "Schedule | Iron Peak Fitness",
  description:
    "View the full weekly class schedule at Iron Peak Fitness. Plan your workouts in advance and never miss a session.",
};

const dayOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export default function SchedulePage() {
  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
            Plan Your Week
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-2">
            Class Schedule
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            We run 50+ classes every week across all disciplines. Find the
            sessions that fit your schedule and book your spot in advance to
            guarantee your place.
          </p>
        </div>

        {/* Full Schedule by Day */}
        <div className="space-y-12">
          {dayOrder.map((day) => {
            const dayEntries = schedule
              .filter((entry) => entry.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={day}>
                <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-brand-500" />
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                  <span className="text-sm font-normal text-gray-500">
                    ({dayEntries.length} {dayEntries.length === 1 ? "class" : "classes"})
                  </span>
                </h2>

                {dayEntries.length > 0 ? (
                  <ScheduleTable schedule={dayEntries} />
                ) : (
                  <div className="rounded-xl border border-gray-800 bg-gray-900 py-8 text-center">
                    <p className="text-gray-500">
                      No classes scheduled for this day.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400">
            Want to lock in your spot? Membership includes unlimited class bookings.
          </p>
          <Link
            href="/membership"
            className="mt-4 inline-flex items-center gap-2 text-brand-500 font-semibold hover:text-brand-400 transition-colors"
          >
            View Membership Plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
