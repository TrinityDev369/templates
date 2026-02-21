import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article className="relative flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all duration-300 hover:border-gray-700">
      {/* Decorative quote */}
      <Quote className="absolute right-5 top-5 h-8 w-8 text-gray-800" />

      {/* Star rating */}
      <div className="mb-4 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < testimonial.rating
                ? "fill-brand-500 text-brand-500"
                : "fill-gray-700 text-gray-700"
            )}
          />
        ))}
      </div>

      {/* Quote text */}
      <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-gray-300">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Member info */}
      <div className="flex items-center gap-3 border-t border-gray-800 pt-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-gray-700">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {testimonial.name}
          </p>
          <p className="text-xs text-gray-500">
            Member since {testimonial.memberSince}
          </p>
        </div>
      </div>
    </article>
  );
}
