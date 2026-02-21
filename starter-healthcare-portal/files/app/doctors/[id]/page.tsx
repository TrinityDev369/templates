import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CalendarCheck,
  GraduationCap,
  Globe,
  CalendarDays,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { doctors, getDoctorById } from "@/lib/data";

interface DoctorPageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return doctors.map((doctor) => ({
    id: doctor.id,
  }));
}

export default function DoctorProfilePage({ params }: DoctorPageProps) {
  const doctor = getDoctorById(params.id);

  if (!doctor) {
    notFound();
  }

  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Back Link */}
        <Link
          href="/doctors"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all doctors
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Avatar */}
              <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-full border-4 border-brand-100">
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Name & Specialty */}
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {doctor.name}
                </h1>
                <p className="mt-1 text-sm font-medium text-brand-600">
                  {doctor.title}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {doctor.specialty}
                </p>
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold text-gray-900">
                    {doctor.rating}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({doctor.reviewCount} reviews)
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 space-y-3">
                <Link
                  href="/appointments/book"
                  className="btn-primary w-full justify-center"
                >
                  <CalendarCheck className="h-5 w-5" />
                  Book with {doctor.name.split(" ")[0] === "Dr." ? doctor.name : `Dr. ${doctor.name.split(" ").pop()}`}
                </Link>
                <Link
                  href="/contact"
                  className="btn-secondary w-full justify-center"
                >
                  <MessageSquare className="h-5 w-5" />
                  Send Message
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">About</h2>
              <p className="mt-3 leading-relaxed text-gray-600">
                {doctor.bio}
              </p>
            </div>

            {/* Education */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Education & Training
                </h2>
              </div>
              <ul className="mt-4 space-y-3">
                {doctor.education.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Languages */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Languages
                </h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {doctor.languages.map((language) => (
                  <span
                    key={language}
                    className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Available Days */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Days
                </h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const isAvailable = doctor.availableDays.includes(day);
                  return (
                    <span
                      key={day}
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        isAvailable
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
