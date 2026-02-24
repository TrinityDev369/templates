"use client";

import * as React from "react";
import { Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { WaitlistForm } from "./components/waitlist-form";
import { WaitlistPosition } from "./components/waitlist-position";

/* -------------------------------------------------------------------------- */
/*  Configuration -- replace with your own values                             */
/* -------------------------------------------------------------------------- */

const PRODUCT_NAME = "YourProduct";
const TAGLINE = "The smarter way to build what matters";
const WAITLIST_COUNT = 2_847;
const DAYS_UNTIL_LAUNCH = 23;

/* -------------------------------------------------------------------------- */
/*  Animated stat counter (inline, small)                                     */
/* -------------------------------------------------------------------------- */

function useCountUp(target: number, duration = 1400): number {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const hasAnimated = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) {
      // Fallback: animate immediately if no element to observe
      runAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();

    function runAnimation() {
      let start: number | null = null;
      function step(ts: number) {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }, [target, duration]);

  return value;
}

function StatCounter({
  value,
  label,
  icon: Icon,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
}) {
  const animatedValue = useCountUp(value);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-indigo-400" aria-hidden="true" />
        <span className="text-2xl font-bold tabular-nums text-white">
          {animatedValue.toLocaleString()}
        </span>
      </div>
      <span className="text-xs text-white/50">{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  WaitlistPage                                                              */
/* -------------------------------------------------------------------------- */

export default function WaitlistPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [referralLink, setReferralLink] = React.useState("");

  async function handleSignup(email: string) {
    // -----------------------------------------------------------
    // TODO: Replace with your actual API call
    // Example:
    //   const res = await fetch("/api/waitlist", {
    //     method: "POST",
    //     body: JSON.stringify({ email }),
    //   });
    //   const data = await res.json();
    //   setPosition(data.position);
    //   setReferralLink(data.referralLink);
    // -----------------------------------------------------------

    // Simulated response for template demo
    await new Promise((resolve) => setTimeout(resolve, 800));
    const simulatedPosition = WAITLIST_COUNT + 1;
    const simulatedRef =
      typeof window !== "undefined"
        ? `${window.location.origin}/waitlist?ref=${btoa(email).slice(0, 8)}`
        : "#";

    setPosition(simulatedPosition);
    setReferralLink(simulatedRef);
    setSubmitted(true);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-16">
      {/* ---- Background effects ---- */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Primary glow */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
        {/* Secondary glow */}
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ---- Content ---- */}
      <div className="relative z-10 mx-auto w-full max-w-xl">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1",
              "text-xs font-medium text-indigo-300"
            )}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
            </span>
            Coming Soon
          </span>
        </div>

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {PRODUCT_NAME}
          </h1>
          <p className="mb-2 text-lg text-white/70 sm:text-xl">{TAGLINE}</p>
          <p className="text-sm text-white/40">
            Be the first to know when we launch.
          </p>
        </div>

        {/* Form or Position */}
        {!submitted ? (
          <WaitlistForm onSubmit={handleSignup} className="mb-10" />
        ) : (
          <WaitlistPosition
            position={position}
            referralLink={referralLink}
            className="mb-10"
          />
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-8">
          <StatCounter
            value={WAITLIST_COUNT}
            label="on the waitlist"
            icon={Users}
          />
          <div className="h-10 w-px bg-white/10" aria-hidden="true" />
          <StatCounter
            value={DAYS_UNTIL_LAUNCH}
            label="days until launch"
            icon={Clock}
          />
        </div>
      </div>

      {/* ---- Footer note ---- */}
      <p className="relative z-10 mt-16 text-center text-xs text-white/30">
        &copy; {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.
      </p>
    </div>
  );
}
