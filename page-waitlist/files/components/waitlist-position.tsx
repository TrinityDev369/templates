"use client";

import * as React from "react";
import { Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface WaitlistPositionProps {
  position: number;
  referralLink: string;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Animated counter hook                                                     */
/* -------------------------------------------------------------------------- */

function useAnimatedCounter(target: number, duration = 1200): number {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (target <= 0) {
      setCurrent(0);
      return;
    }

    let start: number | null = null;
    let rafId: number;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return current;
}

/* -------------------------------------------------------------------------- */
/*  Social share URLs                                                         */
/* -------------------------------------------------------------------------- */

function getTwitterShareUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function getLinkedInShareUrl(url: string): string {
  const params = new URLSearchParams({ url });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/* -------------------------------------------------------------------------- */
/*  Twitter / LinkedIn icon SVGs (inlined to avoid extra deps)                */
/* -------------------------------------------------------------------------- */

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  WaitlistPosition                                                          */
/* -------------------------------------------------------------------------- */

export function WaitlistPosition({
  position,
  referralLink,
  className,
}: WaitlistPositionProps) {
  const animatedPosition = useAnimatedCounter(position);
  const [copied, setCopied] = React.useState(false);

  const shareText = `I just joined the waitlist and I'm #${position}! Check it out:`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md space-y-6 text-center",
        className
      )}
    >
      {/* Position display */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-indigo-300">
          You&apos;re on the waitlist!
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-lg text-white/60">You&apos;re</span>
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-5xl font-bold tabular-nums tracking-tight text-transparent">
            #{animatedPosition.toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-white/50">on the waitlist</p>
      </div>

      {/* Referral section */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Share2 className="h-4 w-4 text-indigo-400" aria-hidden="true" />
          <p className="text-sm font-medium text-white">
            Share to move up
          </p>
        </div>
        <p className="mb-4 text-xs text-white/50">
          Each friend who joins moves you higher on the list.
        </p>

        {/* Copy referral link */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
            {referralLink}
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
              copied
                ? "border-green-400/30 bg-green-400/10 text-green-400"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
            )}
            aria-label={copied ? "Link copied" : "Copy referral link"}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Social share buttons */}
        <div className="flex items-center justify-center gap-3">
          <a
            href={getTwitterShareUrl(shareText, referralLink)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/70",
              "transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            )}
            aria-label="Share on Twitter"
          >
            <TwitterIcon />
            <span>Tweet</span>
          </a>
          <a
            href={getLinkedInShareUrl(referralLink)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/70",
              "transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            )}
            aria-label="Share on LinkedIn"
          >
            <LinkedInIcon />
            <span>Share</span>
          </a>
        </div>
      </div>
    </div>
  );
}
