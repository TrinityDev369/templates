import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

const categoryColors: Record<string, string> = {
  conference: "bg-purple-100 text-purple-700",
  workshop: "bg-green-100 text-green-700",
  meetup: "bg-blue-100 text-blue-700",
  webinar: "bg-amber-100 text-amber-700",
  hackathon: "bg-rose-100 text-rose-700",
  festival: "bg-pink-100 text-pink-700",
};

function formatDate(dateStr: string): { month: string; day: string } {
  const date = new Date(dateStr);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString(),
  };
}

export function EventCard({ event }: { event: Event }) {
  const { month, day } = formatDate(event.date);
  const categoryClass =
    categoryColors[event.category?.toLowerCase() ?? ""] ??
    "bg-gray-100 text-gray-700";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Category badge */}
        {event.category && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold",
              categoryClass
            )}
          >
            {event.category}
          </span>
        )}

        {/* Featured badge */}
        {event.featured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-900">
            <Star className="h-3 w-3" />
            Featured
          </span>
        )}

        {/* Date badge */}
        <div className="absolute bottom-3 right-3 flex flex-col items-center rounded-lg bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase leading-tight text-purple-600">
            {month}
          </span>
          <span className="text-lg font-bold leading-tight text-gray-900">
            {day}
          </span>
        </div>
      </div>

      {/* Content section */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-purple-600">
          {event.title}
        </h3>

        {event.venue && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {event.venue.name}, {event.venue.city}
          </p>
        )}

        <div className="mt-auto pt-4">
          <p className="text-sm font-semibold text-purple-600">
            From ${event.ticketTiers[0]?.price ?? 0}
          </p>
        </div>
      </div>
    </Link>
  );
}
