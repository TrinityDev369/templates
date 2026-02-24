"use client";

import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
export interface Screenshot {
  id: string;
  label: string;
  gradient: string;
}

interface AppScreenshotsProps {
  screenshots: Screenshot[];
}

/* ------------------------------------------------------------------ */
/* Single screenshot card (phone-shaped placeholder)                    */
/* ------------------------------------------------------------------ */
function ScreenshotCard({ screenshot }: { screenshot: Screenshot }) {
  return (
    <div className="flex-shrink-0 w-[200px] sm:w-[220px]">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg",
          "dark:border-gray-700 transition-transform hover:scale-[1.03]"
        )}
      >
        {/* Placeholder screen */}
        <div
          className={cn(
            "relative aspect-[9/16] w-full",
            screenshot.gradient
          )}
        >
          {/* Simulated UI */}
          <div className="flex h-full flex-col items-center justify-center p-4 text-center text-white">
            <div className="h-6 w-20 rounded-full bg-white/20" />
            <div className="mt-4 space-y-2 w-full">
              <div className="h-3 w-full rounded-full bg-white/15" />
              <div className="h-3 w-4/5 rounded-full bg-white/15" />
              <div className="h-3 w-3/5 rounded-full bg-white/15" />
            </div>
            <div className="mt-6 grid w-full grid-cols-2 gap-2">
              <div className="h-14 rounded-lg bg-white/10" />
              <div className="h-14 rounded-lg bg-white/10" />
              <div className="h-14 rounded-lg bg-white/10" />
              <div className="h-14 rounded-lg bg-white/10" />
            </div>
            <div className="mt-auto h-8 w-32 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {screenshot.label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exported component                                                   */
/* ------------------------------------------------------------------ */
export function AppScreenshots({ screenshots }: AppScreenshotsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  }

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              See it in action
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Swipe through screenshots of the app experience.
            </p>
          </div>
          <button
            type="button"
            onClick={scrollRight}
            className={cn(
              "hidden sm:flex items-center gap-1 rounded-full border border-gray-300 px-4 py-2",
              "text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100",
              "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            )}
          >
            Scroll
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Horizontal scroll gallery */}
        <div
          ref={scrollRef}
          className={cn(
            "mt-10 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory",
            "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700",
            "-mx-4 px-4 sm:mx-0 sm:px-0"
          )}
        >
          {screenshots.map((screenshot) => (
            <div key={screenshot.id} className="snap-start">
              <ScreenshotCard screenshot={screenshot} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
