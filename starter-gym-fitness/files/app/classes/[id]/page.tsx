import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Flame,
  Users,
  Tag,
  Dumbbell,
  Award,
  ArrowRight,
} from "lucide-react";
import { gymClasses } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return gymClasses.map((gymClass) => ({
    id: gymClass.id,
  }));
}

export function generateMetadata({ params }: Props) {
  const gymClass = gymClasses.find((c) => c.id === params.id);
  if (!gymClass) return { title: "Class Not Found | Iron Peak Fitness" };
  return {
    title: `${gymClass.name} | Iron Peak Fitness`,
    description: gymClass.description,
  };
}

const intensityConfig = {
  beginner: { label: "Beginner", color: "text-green-400 bg-green-400/10" },
  intermediate: { label: "Intermediate", color: "text-yellow-400 bg-yellow-400/10" },
  advanced: { label: "Advanced", color: "text-red-400 bg-red-400/10" },
};

export default function ClassDetailPage({ params }: Props) {
  const gymClass = gymClasses.find((c) => c.id === params.id);
  if (!gymClass) notFound();

  const intensity = intensityConfig[gymClass.intensity];

  const details = [
    { icon: Clock, label: "Duration", value: `${gymClass.duration} min` },
    { icon: Flame, label: "Intensity", value: intensity.label },
    { icon: Tag, label: "Category", value: gymClass.category.charAt(0).toUpperCase() + gymClass.category.slice(1) },
    { icon: Users, label: "Max Capacity", value: `${gymClass.maxCapacity} spots` },
  ];

  return (
    <section className="bg-gray-950 min-h-screen">
      {/* Hero Image Placeholder */}
      <div className="relative h-64 md:h-96 bg-gray-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <Dumbbell className="h-20 w-20 text-gray-800" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
              <Link href="/" className="transition hover:text-brand-500">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/classes" className="transition hover:text-brand-500">
                Classes
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-white">{gymClass.name}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                  intensity.color
                )}
              >
                {intensity.label}
              </span>
              <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                {gymClass.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 text-white">
              {gymClass.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center"
                >
                  <detail.icon className="h-5 w-5 text-brand-500 mx-auto" />
                  <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">
                    {detail.label}
                  </p>
                  <p className="font-bold text-white mt-1">{detail.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                About This Class
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                {gymClass.description}
              </p>
              <p className="mt-4 text-gray-400 leading-relaxed">
                This {gymClass.duration}-minute {gymClass.category} session is
                designed for {gymClass.intensity}-level participants. Each class
                accommodates up to {gymClass.maxCapacity} members to ensure
                personalized attention and optimal coaching. All equipment is
                provided -- just bring water and your determination.
              </p>
            </div>

            {/* What to Expect */}
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                What to Expect
              </h2>
              <ul className="mt-4 space-y-3">
                {[
                  "Dynamic warm-up to prepare your body for peak performance",
                  "Structured workout blocks targeting specific muscle groups or energy systems",
                  "Expert coaching with form corrections and modifications",
                  "Cool-down and mobility work to aid recovery",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Flame className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                    <span className="text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-xl bg-gradient-to-r from-brand-600/20 to-brand-500/10 border border-brand-500/20 p-8 text-center">
              <h3 className="text-2xl font-bold text-white uppercase">
                Ready to Crush It?
              </h3>
              <p className="mt-2 text-gray-400">
                Reserve your spot now. Classes fill up fast.
              </p>
              <button className="mt-6 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold uppercase tracking-wide rounded-lg px-8 py-4 text-sm transition-colors">
                Book This Class
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sidebar -- Trainer Profile */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Your Trainer
              </h3>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {gymClass.trainer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white">{gymClass.trainer.name}</p>
                  <p className="text-sm text-brand-500">{gymClass.trainer.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                {gymClass.trainer.bio}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Award className="h-4 w-4 text-brand-500 shrink-0" />
                  <span>{gymClass.trainer.experience} years experience</span>
                </div>
                {gymClass.trainer.certifications.slice(0, 3).map((cert) => (
                  <div key={cert} className="flex items-center gap-2 text-sm text-gray-400">
                    <Award className="h-4 w-4 text-brand-500 shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {gymClass.trainer.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <Link
                href="/trainers"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 hover:border-gray-500 px-4 py-3 text-sm font-semibold text-white transition-colors"
              >
                View All Trainers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Quick Info */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Quick Info
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Class</dt>
                  <dd className="font-medium text-white">{gymClass.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Duration</dt>
                  <dd className="font-medium text-white">{gymClass.duration} min</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Level</dt>
                  <dd className="font-medium text-white">{intensity.label}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Capacity</dt>
                  <dd className="font-medium text-white">{gymClass.maxCapacity}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
