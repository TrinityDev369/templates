import { Search } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { events } from "@/lib/data";

export default function EventsPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              All Events
            </h1>
            <p className="mt-4 text-lg text-brand-200">
              Browse our complete collection of upcoming events
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {events.length}
              </span>{" "}
              events
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
              <Search className="h-4 w-4" />
              <span>Search events...</span>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 py-20 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No events found
              </h3>
              <p className="mt-2 text-gray-500">
                Check back soon for new events
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
