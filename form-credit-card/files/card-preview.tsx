"use client";

import { type CardPreviewProps } from "./credit-card-input.types";

// ---------------------------------------------------------------------------
// Inline SVG card brand icons
// ---------------------------------------------------------------------------

function VisaIcon() {
  return (
    <svg viewBox="0 0 48 32" fill="none" className="h-8 w-12" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path
        d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm11.2-10.2c-.5-.2-1.4-.4-2.4-.4-2.6 0-4.5 1.4-4.5 3.4 0 1.5 1.3 2.3 2.3 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-.9 0-1.6-.2-2.5-.5l-.3-.2-.4 2.2c.6.3 1.8.5 3 .5 2.8 0 4.6-1.4 4.6-3.5 0-1.2-.7-2.1-2.2-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.4-2.1zm6.8 0h-2c-.6 0-1.1.2-1.4.8L30.5 21h2.8l.6-1.5h3.4l.3 1.5H40l-2.2-10.3h-2.3l2 7.2-1-1.7.1.2-1-5.7zm-1 6.6l1.4-3.8.8 3.8h-2.2zM15.3 10.5L12.7 18l-.3-1.4c-.5-1.6-2-3.4-3.7-4.3l2.4 8.7h2.8l4.2-10.5h-2.8z"
        fill="white"
      />
      <path
        d="M10.5 10.5H6.3l-.1.3c3.3.8 5.5 2.9 6.4 5.4l-.9-4.7c-.2-.6-.7-.9-1.2-1z"
        fill="#F9A533"
      />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 32" fill="none" className="h-8 w-12" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path
        d="M24 10.34a8 8 0 0 1 0 11.32 8 8 0 0 1 0-11.32z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg viewBox="0 0 48 32" fill="none" className="h-8 w-12" aria-label="American Express">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <path
        d="M6 15h3l.7-1.6.7 1.6h9.3v-1.2l.8 1.2h4.7l.8-1.3V15h14v-.2c0-.1-.1-.2-.2-.2H36l-.6-1.5h1.3l-.6-1.5h-3.6l-.5 1.1-.5-1.1H26l-1.1 2.4-1.1-2.4H20v1.2l-.9-1.2h-4l-2 4.4-2-4.4H8.2l-2.4 5H6v.2zm5.6-.8L10.1 11h1.7l.9 2 .9-2h1.7l-1.6 3.2v1.9h-1.4v-1.9l-1.7-3.2zm6.5 0V11h4.4l1.3 1.7L25.2 11h1.5v5.1h-1.4v-3.5l-1.6 1.8h-.1l-1.6-1.8v3.5H20.7v-.9h2.3V14h-2.3v-.9h2.3V12h-3.6l-1.3 1.7L16.8 12h-3.6v1.1h2.3V14h-2.3v.9h2.3V16h-2.3v.2h4.7z"
        fill="white"
      />
      <path
        d="M6 17h3.5l.7 1.6.7-1.6h28.9c.5 0 .9.1 1.2.3V17H6zm35 4.5c-.3.3-.7.5-1.3.5H6v-4.4l1 2.2h2l1-2.2v2.2h4l.5-1.2h1.6l.5 1.2h8.3v-1l.7 1h3.8l.7-1v1h3.8v-1l.6 1h3.3l-1.7-2.5L38 18h-3.2l-.5 1.1-.6-1.1h-4.5v1.2l-.8-1.2h-3.7l-.8 1.3V18H20l-.5 1.2h-1l-.5-1.2h-3l-1.7 3.8-1.9-3.8H9.8l-2.3 5H9l.5-1.2h1.6l.5 1.2h3.2v-1l.6 1h2.1l.6-1v1H41v-1.5z"
        fill="white"
      />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg viewBox="0 0 48 32" fill="none" className="h-8 w-12" aria-label="Discover">
      <rect width="48" height="32" rx="4" fill="#fff" />
      <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" stroke="#E5E7EB" />
      <path d="M0 16h48v12a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V16z" fill="#F48120" />
      <circle cx="28" cy="14" r="6" fill="#F48120" />
      <text x="6" y="14" fill="#000" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="bold">
        DISCOVER
      </text>
    </svg>
  );
}

function UnknownCardIcon() {
  return (
    <svg viewBox="0 0 48 32" fill="none" className="h-8 w-12" aria-label="Credit Card">
      <rect width="48" height="32" rx="4" fill="#E5E7EB" />
      <rect x="6" y="10" width="12" height="8" rx="1" fill="#9CA3AF" />
      <rect x="22" y="20" width="20" height="2" rx="1" fill="#9CA3AF" />
      <rect x="22" y="14" width="14" height="2" rx="1" fill="#9CA3AF" />
    </svg>
  );
}

function BrandIcon({ brand }: { brand: CardPreviewProps["brand"] }) {
  switch (brand) {
    case "visa":
      return <VisaIcon />;
    case "mastercard":
      return <MastercardIcon />;
    case "amex":
      return <AmexIcon />;
    case "discover":
      return <DiscoverIcon />;
    default:
      return <UnknownCardIcon />;
  }
}

// ---------------------------------------------------------------------------
// Card chip SVG
// ---------------------------------------------------------------------------

function ChipIcon() {
  return (
    <svg viewBox="0 0 40 30" fill="none" className="h-8 w-10" aria-hidden="true">
      <rect width="40" height="30" rx="4" fill="#D4AF37" />
      <rect x="2" y="2" width="36" height="26" rx="3" fill="#C5A028" />
      <line x1="0" y1="10" x2="40" y2="10" stroke="#D4AF37" strokeWidth="1" />
      <line x1="0" y1="20" x2="40" y2="20" stroke="#D4AF37" strokeWidth="1" />
      <line x1="14" y1="0" x2="14" y2="30" stroke="#D4AF37" strokeWidth="1" />
      <line x1="26" y1="0" x2="26" y2="30" stroke="#D4AF37" strokeWidth="1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Gradient mapping per brand
// ---------------------------------------------------------------------------

function getCardGradient(brand: CardPreviewProps["brand"]): string {
  switch (brand) {
    case "visa":
      return "bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-950";
    case "mastercard":
      return "bg-gradient-to-br from-gray-800 via-gray-900 to-black";
    case "amex":
      return "bg-gradient-to-br from-sky-600 via-sky-800 to-blue-900";
    case "discover":
      return "bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700";
    default:
      return "bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-900";
  }
}

// ---------------------------------------------------------------------------
// Masked / display helpers
// ---------------------------------------------------------------------------

function displayNumber(number: string): string {
  if (!number) return "---- ---- ---- ----";
  // Pad the formatted number to full length with bullet chars for visual effect
  return number;
}

function displayExpiry(expiry: string): string {
  return expiry || "MM/YY";
}

function displayName(name: string): string {
  return name || "CARDHOLDER NAME";
}

// ---------------------------------------------------------------------------
// CardPreview component
// ---------------------------------------------------------------------------

/**
 * A CSS-only card visualization that shows entered data in real-time.
 * Displays the front side with number, name, and expiry.
 * When `cvvFocused` is true, indicates the back side with a visual cue.
 */
export function CardPreview({ number, name, expiry, brand, cvvFocused }: CardPreviewProps) {
  const gradient = getCardGradient(brand);

  return (
    <div className="perspective-[1000px] mx-auto w-full max-w-sm select-none" aria-hidden="true">
      <div
        className={`relative transition-transform duration-500 ${
          cvvFocused ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ---- Front face ---- */}
        <div
          className={`${gradient} relative h-48 w-full rounded-xl p-6 text-white shadow-xl`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Top row: chip + brand */}
          <div className="flex items-start justify-between">
            <ChipIcon />
            <BrandIcon brand={brand} />
          </div>

          {/* Card number */}
          <p className="mt-5 font-mono text-xl tracking-[0.15em] sm:text-2xl">
            {displayNumber(number)}
          </p>

          {/* Bottom row: name + expiry */}
          <div className="mt-4 flex items-end justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-white/60">Card Holder</p>
              <p className="truncate text-sm font-medium uppercase tracking-wider">
                {displayName(name)}
              </p>
            </div>
            <div className="ml-4 text-right">
              <p className="text-[10px] uppercase tracking-wider text-white/60">Expires</p>
              <p className="font-mono text-sm tracking-wider">{displayExpiry(expiry)}</p>
            </div>
          </div>
        </div>

        {/* ---- Back face ---- */}
        <div
          className={`${gradient} absolute inset-0 h-48 w-full rounded-xl shadow-xl [transform:rotateY(180deg)]`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Magnetic stripe */}
          <div className="mt-6 h-10 w-full bg-black/70" />

          {/* Signature strip + CVV area */}
          <div className="mt-4 flex items-center gap-2 px-6">
            <div className="h-8 flex-1 rounded bg-white/90" />
            <div className="flex h-8 w-14 items-center justify-center rounded bg-white font-mono text-sm font-bold text-gray-800">
              CVV
            </div>
          </div>

          {/* Brand icon bottom right */}
          <div className="absolute bottom-4 right-6">
            <BrandIcon brand={brand} />
          </div>
        </div>
      </div>
    </div>
  );
}
