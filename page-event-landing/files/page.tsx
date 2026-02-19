"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowUp,
  ChevronRight,
  Star,
  Ticket,
  Check,
  ExternalLink,
  Twitter,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";

/* ==========================================================================
   Mock Data
   ========================================================================== */

const EVENT = {
  name: "DevConf 2026",
  tagline: "Where engineering excellence meets bold ideas",
  date: "March 15-17, 2026",
  location: "Berlin, Germany",
  venue: "CityCube Berlin",
};

const STATS = [
  { label: "Attendees", value: "2,500+", icon: Users },
  { label: "Speakers", value: "80+", icon: Globe },
  { label: "Days", value: "3", icon: Calendar },
];

const NAV_LINKS = [
  { label: "Speakers", href: "#speakers" },
  { label: "Schedule", href: "#schedule" },
  { label: "Tickets", href: "#registration" },
  { label: "Sponsors", href: "#sponsors" },
];

interface Speaker {
  name: string;
  initials: string;
  title: string;
  company: string;
  topic: string;
  gradient: string;
}

const SPEAKERS: Speaker[] = [
  {
    name: "Dr. Elena Vasquez",
    initials: "EV",
    title: "VP of Engineering",
    company: "Vercel",
    topic: "The Future of Edge Computing",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    name: "Marcus Chen",
    initials: "MC",
    title: "Staff Engineer",
    company: "Stripe",
    topic: "Building Resilient Payment Systems",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    name: "Aisha Patel",
    initials: "AP",
    title: "Head of AI",
    company: "Anthropic",
    topic: "LLMs in Production: Lessons Learned",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    name: "Jonas Eriksson",
    initials: "JE",
    title: "CTO",
    company: "Klarna",
    topic: "Scaling TypeScript Monorepos",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    name: "Sarah Kim",
    initials: "SK",
    title: "Principal Architect",
    company: "Cloudflare",
    topic: "Zero-Trust Security at Scale",
    gradient: "from-fuchsia-500 to-violet-600",
  },
  {
    name: "Tomasz Nowak",
    initials: "TN",
    title: "Open Source Lead",
    company: "Supabase",
    topic: "Postgres as a Platform",
    gradient: "from-emerald-500 to-teal-600",
  },
];

interface ScheduleSlot {
  time: string;
  title: string;
  speaker: string;
  track: string;
  trackColor: string;
}

interface ScheduleDay {
  label: string;
  date: string;
  slots: ScheduleSlot[];
}

const SCHEDULE: ScheduleDay[] = [
  {
    label: "Day 1",
    date: "March 15",
    slots: [
      {
        time: "09:00",
        title: "Opening Keynote: The Next Decade of Software",
        speaker: "Dr. Elena Vasquez",
        track: "Main Stage",
        trackColor: "bg-violet-100 text-violet-700",
      },
      {
        time: "10:30",
        title: "Building Resilient Payment Systems at Scale",
        speaker: "Marcus Chen",
        track: "Architecture",
        trackColor: "bg-blue-100 text-blue-700",
      },
      {
        time: "13:00",
        title: "Workshop: Advanced TypeScript Patterns",
        speaker: "Jonas Eriksson",
        track: "Workshop",
        trackColor: "bg-amber-100 text-amber-700",
      },
      {
        time: "15:00",
        title: "Panel: Open Source Sustainability",
        speaker: "Multiple Speakers",
        track: "Main Stage",
        trackColor: "bg-violet-100 text-violet-700",
      },
      {
        time: "17:00",
        title: "Networking Reception & Lightning Talks",
        speaker: "Community",
        track: "Social",
        trackColor: "bg-emerald-100 text-emerald-700",
      },
    ],
  },
  {
    label: "Day 2",
    date: "March 16",
    slots: [
      {
        time: "09:00",
        title: "LLMs in Production: Lessons from the Trenches",
        speaker: "Aisha Patel",
        track: "Main Stage",
        trackColor: "bg-violet-100 text-violet-700",
      },
      {
        time: "10:30",
        title: "Zero-Trust Security for Modern Applications",
        speaker: "Sarah Kim",
        track: "Security",
        trackColor: "bg-red-100 text-red-700",
      },
      {
        time: "13:00",
        title: "Workshop: Building with Edge Functions",
        speaker: "Dr. Elena Vasquez",
        track: "Workshop",
        trackColor: "bg-amber-100 text-amber-700",
      },
      {
        time: "15:00",
        title: "Scaling TypeScript Monorepos to 500+ Packages",
        speaker: "Jonas Eriksson",
        track: "Architecture",
        trackColor: "bg-blue-100 text-blue-700",
      },
    ],
  },
  {
    label: "Day 3",
    date: "March 17",
    slots: [
      {
        time: "09:00",
        title: "Postgres as a Platform: Beyond the Database",
        speaker: "Tomasz Nowak",
        track: "Main Stage",
        trackColor: "bg-violet-100 text-violet-700",
      },
      {
        time: "10:30",
        title: "Observability-Driven Development",
        speaker: "Marcus Chen",
        track: "DevOps",
        trackColor: "bg-cyan-100 text-cyan-700",
      },
      {
        time: "13:00",
        title: "Workshop: AI-Assisted Code Review Pipelines",
        speaker: "Aisha Patel",
        track: "Workshop",
        trackColor: "bg-amber-100 text-amber-700",
      },
      {
        time: "15:00",
        title: "Closing Keynote: What We Build Next",
        speaker: "All Keynote Speakers",
        track: "Main Stage",
        trackColor: "bg-violet-100 text-violet-700",
      },
      {
        time: "16:30",
        title: "Closing Party & Awards Ceremony",
        speaker: "Everyone",
        track: "Social",
        trackColor: "bg-emerald-100 text-emerald-700",
      },
    ],
  },
];

interface PricingTier {
  name: string;
  price: number;
  badge?: string;
  features: string[];
  highlight: boolean;
}

const PRICING: PricingTier[] = [
  {
    name: "Early Bird",
    price: 199,
    features: [
      "All conference sessions",
      "Lunch & refreshments",
      "Conference swag bag",
      "Access to recordings",
    ],
    highlight: false,
  },
  {
    name: "Regular",
    price: 349,
    features: [
      "All conference sessions",
      "Lunch & refreshments",
      "Conference swag bag",
      "Access to recordings",
      "Workshop access (1 session)",
      "Networking dinner (Day 1)",
    ],
    highlight: false,
  },
  {
    name: "VIP",
    price: 599,
    badge: "Best Value",
    features: [
      "All conference sessions",
      "Lunch & refreshments",
      "Premium swag package",
      "Access to recordings",
      "All workshops included",
      "Networking dinner (all days)",
      "Speaker meet & greet",
      "Priority seating",
    ],
    highlight: true,
  },
];

interface SponsorTier {
  tier: string;
  sponsors: string[];
}

const SPONSORS: SponsorTier[] = [
  {
    tier: "Platinum",
    sponsors: ["TechCorp Global", "CloudScale Systems"],
  },
  {
    tier: "Gold",
    sponsors: ["DevTools Inc.", "DataStream AI", "SecureNet"],
  },
  {
    tier: "Silver",
    sponsors: ["CodeBase Pro", "APIHub", "InfraWorks", "StackBridge"],
  },
];

/* ==========================================================================
   Components
   ========================================================================== */

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Floating accent circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}

function StickyNav({ visible }: { visible: boolean }) {
  const scrollTo = useCallback((href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        visible
          ? "bg-slate-900/95 backdrop-blur-md shadow-lg translate-y-0"
          : "-translate-y-full"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-white font-bold text-lg tracking-tight"
          >
            {EVENT.name}
          </button>
          <div className="hidden sm:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("#registration")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Tickets
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const scrollTo = useCallback((href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 overflow-hidden">
      <DotGrid />

      {/* Top transparent nav */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <span className="text-white font-bold text-lg tracking-tight">
              {EVENT.name}
            </span>
            <div className="hidden sm:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
          <Calendar className="w-4 h-4 text-indigo-300" />
          <span className="text-indigo-200 text-sm font-medium">
            {EVENT.date}
          </span>
          <span className="text-slate-500 mx-1">|</span>
          <MapPin className="w-4 h-4 text-indigo-300" />
          <span className="text-indigo-200 text-sm font-medium">
            {EVENT.location}
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-none mb-6">
          <span className="bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">
            {EVENT.name}
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          {EVENT.tagline}. Join{" "}
          <span className="text-indigo-300 font-semibold">2,500+</span>{" "}
          engineers for three days of talks, workshops, and connections that
          shape how we build software.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollTo("#registration")}
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            <Ticket className="w-5 h-5" />
            Get Tickets
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => scrollTo("#schedule")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-white/10"
          >
            <Clock className="w-5 h-5" />
            View Schedule
          </button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

function StatsBar() {
  return (
    <section className="relative -mt-16 z-20 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
        <div className="grid grid-cols-3 divide-x divide-slate-200">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <stat.icon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 font-medium mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div
        className={cn(
          "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center mb-5 mx-auto ring-4 ring-white shadow-md",
          speaker.gradient
        )}
      >
        <span className="text-white text-xl font-bold">
          {speaker.initials}
        </span>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900">{speaker.name}</h3>
        <p className="text-sm text-slate-500 mt-1">
          {speaker.title},{" "}
          <span className="text-indigo-600 font-medium">
            {speaker.company}
          </span>
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
            &ldquo;{speaker.topic}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

function SpeakersSection() {
  return (
    <section id="speakers" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Featured Speakers
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Learn from the best
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Industry leaders and practitioners sharing real-world insights from
            building software at scale.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPEAKERS.map((speaker) => (
            <SpeakerCard key={speaker.name} speaker={speaker} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScheduleSection() {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section id="schedule" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Conference Schedule
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Three days, endless learning
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Carefully curated sessions spanning architecture, AI, security,
            DevOps, and hands-on workshops.
          </p>
        </div>

        {/* Day tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {SCHEDULE.map((day, i) => (
            <button
              key={day.label}
              onClick={() => setActiveDay(i)}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                activeDay === i
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <span className="block">{day.label}</span>
              <span
                className={cn(
                  "text-xs font-normal",
                  activeDay === i ? "text-indigo-200" : "text-slate-400"
                )}
              >
                {day.date}
              </span>
            </button>
          ))}
        </div>

        {/* Schedule slots */}
        <div className="space-y-3">
          {SCHEDULE[activeDay].slots.map((slot, i) => (
            <div
              key={`${activeDay}-${i}`}
              className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-2 sm:w-20 shrink-0">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-mono font-bold text-slate-700">
                  {slot.time}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 leading-snug">
                  {slot.title}
                </h4>
                <p className="text-sm text-slate-500 mt-1">{slot.speaker}</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold shrink-0",
                  slot.trackColor
                )}
              >
                {slot.track}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-8 transition-all",
        tier.highlight
          ? "bg-gradient-to-b from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/30 scale-105 border-2 border-indigo-400/50"
          : "bg-white text-slate-900 border border-slate-200 hover:border-indigo-200 hover:shadow-lg"
      )}
    >
      {tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            <Star className="w-3 h-3 fill-current" />
            {tier.badge}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3
          className={cn(
            "text-lg font-semibold mb-2",
            tier.highlight ? "text-indigo-100" : "text-slate-500"
          )}
        >
          {tier.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={cn(
              "text-5xl font-extrabold tracking-tight",
              tier.highlight ? "text-white" : "text-slate-900"
            )}
          >
            ${tier.price}
          </span>
          <span
            className={cn(
              "text-sm",
              tier.highlight ? "text-indigo-200" : "text-slate-400"
            )}
          >
            /person
          </span>
        </div>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              className={cn(
                "w-5 h-5 shrink-0 mt-0.5",
                tier.highlight ? "text-indigo-200" : "text-indigo-500"
              )}
            />
            <span
              className={cn(
                "text-sm",
                tier.highlight ? "text-indigo-100" : "text-slate-600"
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={cn(
          "w-full py-3.5 rounded-xl font-semibold text-sm transition-all",
          tier.highlight
            ? "bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg"
            : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-100"
        )}
      >
        Get {tier.name} Ticket
      </button>
    </div>
  );
}

function RegistrationSection() {
  return (
    <section id="registration" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Registration
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Secure your spot
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Early Bird pricing ends February 28. All tickets include full
            conference access and recordings.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PRICING.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorsSection() {
  const tierStyles: Record<string, { height: string; cols: string }> = {
    Platinum: { height: "h-20", cols: "grid-cols-2" },
    Gold: { height: "h-16", cols: "grid-cols-3" },
    Silver: { height: "h-12", cols: "grid-cols-2 sm:grid-cols-4" },
  };

  return (
    <section id="sponsors" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Our Sponsors
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Powered by leaders
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            {EVENT.name} is made possible by the generous support of our
            sponsors.
          </p>
        </div>

        <div className="space-y-14">
          {SPONSORS.map((group) => {
            const style = tierStyles[group.tier];
            return (
              <div key={group.tier}>
                <h3 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
                  {group.tier} Sponsors
                </h3>
                <div
                  className={cn(
                    "grid gap-4 max-w-3xl mx-auto",
                    style?.cols ?? "grid-cols-2"
                  )}
                >
                  {group.sponsors.map((name) => (
                    <div
                      key={name}
                      className={cn(
                        "flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 px-6 hover:border-indigo-200 transition-colors",
                        style?.height ?? "h-16"
                      )}
                    >
                      <span className="text-slate-400 font-semibold text-sm sm:text-base tracking-wide">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Event info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{EVENT.name}</h3>
            <div className="space-y-2 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {EVENT.date}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {EVENT.venue}, {EVENT.location}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => {
                      const id = link.href.replace("#", "");
                      document
                        .getElementById(id)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Github, label: "GitHub" },
                { icon: Globe, label: "Website" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; 2026 {EVENT.name}. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
          >
            Back to top
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================================================
   Page Component
   ========================================================================== */

export default function EventLandingPage() {
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show sticky nav after scrolling past hero (roughly 60vh)
      setNavVisible(window.scrollY > window.innerHeight * 0.6);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white antialiased">
      <StickyNav visible={navVisible} />
      <HeroSection />
      <StatsBar />
      <SpeakersSection />
      <ScheduleSection />
      <RegistrationSection />
      <SponsorsSection />
      <Footer />
    </div>
  );
}
