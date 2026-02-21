import Image from "next/image";
import { Award } from "lucide-react";
import type { Trainer } from "@/types";

interface TrainerCardProps {
  trainer: Trainer;
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <article className="group rounded-xl border border-gray-800 bg-gray-900 p-6 text-center transition-all duration-300 hover:border-gray-700 hover:shadow-lg hover:shadow-brand-500/5">
      {/* Avatar */}
      <div className="mx-auto mb-5 h-32 w-32 overflow-hidden rounded-full ring-2 ring-gray-700 transition-all duration-300 group-hover:ring-4 group-hover:ring-brand-500">
        <div className="relative h-full w-full">
          <Image
            src={trainer.image}
            alt={trainer.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Name and title */}
      <h3 className="text-lg font-bold text-white">{trainer.name}</h3>
      <p className="mb-1 text-sm text-brand-500">{trainer.title}</p>
      <p className="mb-4 text-xs text-gray-400">
        {trainer.experience} years of experience
      </p>

      {/* Bio */}
      <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-400">
        {trainer.bio}
      </p>

      {/* Specialty tags */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {trainer.specialties.map((specialty) => (
          <span
            key={specialty}
            className="rounded-full border border-brand-500/40 px-3 py-1 text-xs font-medium text-brand-400 transition-colors group-hover:border-brand-500/70"
          >
            {specialty}
          </span>
        ))}
      </div>

      {/* Certifications */}
      {trainer.certifications.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <h4 className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Award className="h-3.5 w-3.5" />
            Certifications
          </h4>
          <ul className="space-y-1">
            {trainer.certifications.map((cert) => (
              <li key={cert} className="text-xs text-gray-400">
                {cert}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
