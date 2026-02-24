"use client";

import { Download, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreBadges } from "./store-badges";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
export interface AppHeroProps {
  appName: string;
  tagline: string;
  description: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  stats: { label: string; value: string }[];
}

/* ------------------------------------------------------------------ */
/* Phone mockup (CSS-only)                                              */
/* ------------------------------------------------------------------ */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px]">
      {/* Outer frame */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[2.5rem] border-[6px] border-gray-900",
          "bg-gray-900 shadow-2xl dark:border-gray-700"
        )}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900 dark:bg-gray-700" />

        {/* Screen content */}
        <div
          className={cn(
            "relative aspect-[9/19.5] w-full overflow-hidden rounded-[2rem]",
            "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
          )}
        >
          {/* Simulated app screen */}
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Download className="h-8 w-8" />
            </div>
            <p className="text-lg font-bold">Your App</p>
            <p className="mt-1 text-xs text-white/80">Preview Screen</p>

            {/* Fake UI elements */}
            <div className="mt-6 w-full space-y-3">
              <div className="h-3 w-full rounded-full bg-white/20" />
              <div className="h-3 w-4/5 rounded-full bg-white/20" />
              <div className="h-3 w-3/5 rounded-full bg-white/20" />
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <div className="h-20 rounded-xl bg-white/15" />
              <div className="h-20 rounded-xl bg-white/15" />
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect behind phone */}
      <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero component                                                       */
/* ------------------------------------------------------------------ */
export function AppHero({
  appName,
  tagline,
  description,
  appStoreUrl,
  playStoreUrl,
  stats,
}: AppHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            {/* Availability badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              Available on iOS and Android
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
              {appName}
            </h1>

            <p className="mt-3 text-xl font-medium text-blue-600 dark:text-blue-400">
              {tagline}
            </p>

            <p className="mt-4 max-w-lg text-lg text-gray-600 dark:text-gray-400 lg:max-w-none">
              {description}
            </p>

            {/* Rating snippet */}
            <div className="mt-6 flex items-center justify-center gap-1 lg:justify-start">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                4.8 / 5
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                (12.4k reviews)
              </span>
            </div>

            {/* Store badges */}
            <StoreBadges
              appStoreUrl={appStoreUrl}
              playStoreUrl={playStoreUrl}
              size="lg"
              className="mt-8 justify-center lg:justify-start"
            />

            {/* Stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 lg:justify-start">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
