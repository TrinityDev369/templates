import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  ArrowLeft,
} from "lucide-react";
import { SpeakerCard } from "@/components/speaker-card";
import { TicketCard } from "@/components/ticket-card";
import { ScheduleTimeline } from "@/components/schedule-timeline";
import { events, getEventById, getScheduleByEvent } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";

interface EventDetailPageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }));
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const event = getEventById(params.id);

  if (!event) {
    notFound();
  }

  const schedule = getScheduleByEvent(event.id);

  const categoryColors: Record<string, string> = {
    conference: "bg-brand-100 text-brand-700",
    workshop: "bg-amber-100 text-amber-700",
    meetup: "bg-emerald-100 text-emerald-700",
    webinar: "bg-sky-100 text-sky-700",
    hackathon: "bg-rose-100 text-rose-700",
  };

  return (
    <>
      {/* Hero Image */}
      <section className="relative h-72 sm:h-96">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/events"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${categoryColors[event.category] ?? "bg-gray-100 text-gray-700"}`}
              >
                {event.category}
              </span>
              {event.featured && (
                <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                  Featured
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Event Meta */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-500" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-500" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-500" />
              <span>
                {event.venue.name}, {event.venue.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-500" />
              <span>Capacity: {event.venue.capacity}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900">
              About This Event
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              {event.description}
            </p>
            {event.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Speakers */}
      {event.speakers.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Speakers
            </h2>
            <p className="mt-2 text-gray-600">
              Meet the experts presenting at this event
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {event.speakers.map((speaker) => (
                <SpeakerCard key={speaker.id} speaker={speaker} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ticket Tiers */}
      {event.ticketTiers.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Choose Your Ticket
              </h2>
              <p className="mt-2 text-gray-600">
                Select the pass that best fits your needs
              </p>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {event.ticketTiers.map((tier, index) => (
                <TicketCard key={tier.id} ticket={tier} isPopular={index === Math.floor(event.ticketTiers.length / 2)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Schedule */}
      {schedule.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Event Schedule
            </h2>
            <p className="mt-2 text-gray-600">
              Plan your day with our detailed timeline
            </p>
            <div className="mt-8">
              <ScheduleTimeline slots={schedule} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
