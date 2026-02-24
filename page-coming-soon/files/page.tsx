"use client";

import { Twitter, Github, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "./components/countdown-timer";
import { EmailCapture } from "./components/email-capture";

/* ==========================================================================
   Configuration — update these to match your brand
   ========================================================================== */

/** Set your launch date here. The countdown targets this moment. */
const LAUNCH_DATE = new Date("2026-06-01T00:00:00");

const BRAND = {
  name: "Acme Inc.",
  headline: "Something Amazing is Coming",
  subtitle:
    "We are building a new experience that will change the way you work. Be the first to know when we go live.",
};

interface SocialLink {
  label: string;
  href: string;
  icon: typeof Twitter;
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: "Twitter", href: "https://twitter.com/example", icon: Twitter },
  { label: "GitHub", href: "https://github.com/example", icon: Github },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/example",
    icon: Linkedin,
  },
];

/* ==========================================================================
   Page Component
   ========================================================================== */

export default function ComingSoonPage() {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16",
        "bg-neutral-950"
      )}
    >
      {/* Background gradient layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Primary radial glow */}
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl" />
        {/* Secondary accent */}
        <div className="absolute bottom-0 left-0 h-[400px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tr from-cyan-600/10 to-transparent blur-3xl" />
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Brand */}
        <p className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-white/40">
          {BRAND.name}
        </p>

        {/* Headline */}
        <h1
          className={cn(
            "text-4xl font-bold leading-tight tracking-tight text-white",
            "sm:text-5xl md:text-6xl"
          )}
        >
          {BRAND.headline}
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-lg text-base leading-relaxed text-white/50 sm:text-lg">
          {BRAND.subtitle}
        </p>

        {/* Countdown */}
        <div className="mt-12 w-full">
          <CountdownTimer targetDate={LAUNCH_DATE} />
        </div>

        {/* Email capture */}
        <div className="mt-14 flex w-full justify-center">
          <EmailCapture
            onSubscribe={async (email) => {
              // Replace with your API call, e.g.:
              // await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) });
              console.log("Subscriber:", email);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }}
          />
        </div>

        {/* Social links */}
        <nav className="mt-16" aria-label="Social links">
          <ul className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    "border border-white/10 bg-white/5",
                    "text-white/50 transition-all duration-200",
                    "hover:border-white/20 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer note */}
        <p className="mt-12 text-xs text-white/20">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
