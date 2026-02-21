import Link from "next/link";
import {
  Calendar,
  Mic2,
  Users,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { EventCard } from "@/components/event-card";
import { SpeakerCard } from "@/components/speaker-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { getFeaturedEvents } from "@/lib/data";
import { speakers } from "@/lib/data";

const stats = [
  { label: "Events", value: "50+", icon: Calendar },
  { label: "Speakers", value: "100+", icon: Mic2 },
  { label: "Attendees", value: "10K+", icon: Users },
  { label: "Satisfaction", value: "95%", icon: Star },
];

export default function HomePage() {
  const featuredEvents = getFeaturedEvents();
  const highlightedSpeakers = speakers.slice(0, 4);
  const nextFeaturedEvent = featuredEvents[0];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Your gateway to unforgettable experiences</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover Amazing Events
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-brand-100 sm:text-xl">
              Join thousands of attendees at conferences, workshops, and meetups
              that inspire, connect, and transform. Find your next event with
              EventPulse.
            </p>

            {nextFeaturedEvent && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-brand-200">
                  Next Featured Event
                </p>
                <CountdownTimer targetDate={nextFeaturedEvent.date} />
              </div>
            )}

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50 hover:shadow-xl"
              >
                Browse Events
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/20"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Featured Events Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Featured Events
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hand-picked events you will not want to miss
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold transition hover:text-brand-800"
            >
              View all events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Speakers Highlight Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              World-Class Speakers
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Learn from industry leaders and visionary thinkers
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {highlightedSpeakers.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/speakers"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold transition hover:text-brand-800"
            >
              Meet all speakers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-brand-100 bg-brand-50/50 p-8 text-center transition hover:shadow-lg"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100">
                    <Icon className="h-7 w-7 text-brand-600" />
                  </div>
                  <p className="text-3xl font-extrabold text-brand-700">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-500 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Join?
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            Do not miss out on the events that are shaping the future. Register
            today and be part of something extraordinary.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/20"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
