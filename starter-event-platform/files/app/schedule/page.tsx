import { CalendarDays } from "lucide-react";
import { ScheduleTimeline } from "@/components/schedule-timeline";
import { scheduleSlots, events } from "@/lib/data";

export default function SchedulePage() {
  // Group schedule slots by event
  const slotsByEvent = scheduleSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.eventId]) {
        acc[slot.eventId] = [];
      }
      acc[slot.eventId].push(slot);
      return acc;
    },
    {} as Record<string, typeof scheduleSlots>,
  );

  const eventIds = Object.keys(slotsByEvent);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <CalendarDays className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Event Schedule
            </h1>
            <p className="mt-4 text-lg text-brand-200">
              Plan your experience with our complete event timeline
            </p>
          </div>
        </div>
      </section>

      {/* Schedule Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {eventIds.length > 0 ? (
            <div className="space-y-16">
              {eventIds.map((eventId) => {
                const event = events.find((e) => e.id === eventId);
                const slots = slotsByEvent[eventId];
                return (
                  <div key={eventId}>
                    <div className="mb-6 border-b border-gray-200 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {event?.title ?? "Event"}
                      </h2>
                      {event && (
                        <p className="mt-1 text-sm text-gray-500">
                          {event.date} &middot; {event.venue.name},{" "}
                          {event.venue.city}
                        </p>
                      )}
                    </div>
                    <ScheduleTimeline slots={slots} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 py-20 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No schedule available yet
              </h3>
              <p className="mt-2 text-gray-500">
                The event schedule will be published soon
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
