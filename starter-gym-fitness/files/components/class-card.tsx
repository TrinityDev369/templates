import Image from "next/image";
import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GymClass } from "@/types";

const categoryColors: Record<GymClass["category"], string> = {
  strength: "bg-red-500/20 text-red-400",
  cardio: "bg-sky-500/20 text-sky-400",
  yoga: "bg-emerald-500/20 text-emerald-400",
  hiit: "bg-amber-500/20 text-amber-400",
  boxing: "bg-purple-500/20 text-purple-400",
  cycling: "bg-pink-500/20 text-pink-400",
};

const intensityColors: Record<GymClass["intensity"], string> = {
  beginner: "bg-emerald-500/20 text-emerald-400",
  intermediate: "bg-amber-500/20 text-amber-400",
  advanced: "bg-red-500/20 text-red-400",
};

interface ClassCardProps {
  gymClass: GymClass;
}

export function ClassCard({ gymClass }: ClassCardProps) {
  return (
    <Link href={`/classes/${gymClass.id}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:border-gray-700 hover:shadow-lg hover:shadow-brand-500/5">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={gymClass.image}
            alt={gymClass.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

          {/* Category badge */}
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize",
              categoryColors[gymClass.category]
            )}
          >
            {gymClass.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-brand-500">
            {gymClass.name}
          </h3>

          <p className="mb-4 line-clamp-2 text-sm text-gray-400">
            {gymClass.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              {gymClass.duration} min
            </span>

            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                intensityColors[gymClass.intensity]
              )}
            >
              {gymClass.intensity}
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <Users className="h-3.5 w-3.5" />
              Max {gymClass.maxCapacity}
            </span>
          </div>

          {/* Trainer */}
          <div className="mt-4 flex items-center gap-2 border-t border-gray-800 pt-3">
            <div className="relative h-7 w-7 overflow-hidden rounded-full ring-1 ring-gray-700">
              <Image
                src={gymClass.trainer.image}
                alt={gymClass.trainer.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs text-gray-400">
              with{" "}
              <span className="font-medium text-gray-300">
                {gymClass.trainer.name}
              </span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
