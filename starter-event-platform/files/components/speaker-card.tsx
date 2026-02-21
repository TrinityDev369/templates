import Image from "next/image";
import { Twitter, Linkedin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Speaker } from "@/types";

const socialIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  website: Globe,
} as const;

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Circular avatar */}
      <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-purple-100 transition-all duration-300 group-hover:ring-purple-200">
        <Image
          src={speaker.avatar}
          alt={speaker.name}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>

      {/* Name */}
      <h3 className="mt-4 text-lg font-bold text-gray-900">{speaker.name}</h3>

      {/* Title & Company */}
      <p className="mt-1 text-sm text-gray-500">
        {speaker.title}
        {speaker.company && (
          <span className="text-gray-400"> at </span>
        )}
        {speaker.company && (
          <span className="font-medium text-gray-600">{speaker.company}</span>
        )}
      </p>

      {/* Topic tags */}
      {speaker.topics && speaker.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {speaker.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Social links */}
      {speaker.socials && (
        <div className="mt-5 flex items-center gap-3">
          {(
            Object.entries(speaker.socials) as [
              keyof typeof socialIcons,
              string | undefined,
            ][]
          ).map(([platform, url]) => {
            if (!url) return null;
            const Icon = socialIcons[platform];
            if (!Icon) return null;

            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors",
                  "hover:bg-purple-50 hover:text-purple-600"
                )}
                aria-label={`${speaker.name} on ${platform}`}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
