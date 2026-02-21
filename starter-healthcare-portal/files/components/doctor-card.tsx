import Link from "next/link";
import { Star, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/types";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Link
      href={`/doctors/${doctor.id}`}
      className="group block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-lg"
    >
      {/* Avatar + Info */}
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xl font-bold text-brand-600 ring-2 ring-brand-100 transition-all duration-300 group-hover:ring-4 group-hover:ring-brand-200">
          {doctor.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name */}
          <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-brand-700">
            {doctor.name}
          </h3>

          {/* Specialty badge */}
          <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {doctor.specialty}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div className="mt-4 flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.floor(doctor.rating)
                  ? "fill-amber-400 text-amber-400"
                  : i < doctor.rating
                    ? "fill-amber-400/50 text-amber-400"
                    : "fill-gray-200 text-gray-200"
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {doctor.rating.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400">
          ({doctor.reviewCount} reviews)
        </span>
      </div>

      {/* Languages */}
      {doctor.languages.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="text-xs text-gray-500">
            {doctor.languages.join(", ")}
          </span>
        </div>
      )}

      {/* Available days */}
      {doctor.availableDays.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {doctor.availableDays.map((day) => (
            <span
              key={day}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
            >
              {day.slice(0, 3)}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
