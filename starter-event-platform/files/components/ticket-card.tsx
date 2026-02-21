import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TicketTier } from "@/types";

export function TicketCard({
  ticket,
  isPopular = false,
}: {
  ticket: TicketTier;
  isPopular?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8",
        isPopular
          ? "border-purple-200 bg-white ring-2 ring-purple-600"
          : "border-gray-200 bg-white"
      )}
    >
      {/* Most popular badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-purple-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      {/* Tier name */}
      <h3
        className={cn(
          "text-lg font-semibold",
          isPopular ? "text-purple-600" : "text-gray-900"
        )}
      >
        {ticket.name}
      </h3>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-gray-900">
          ${ticket.price}
        </span>
        <span className="text-sm text-gray-500">/ticket</span>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          {ticket.description}
        </p>
      )}

      {/* Feature checklist */}
      {ticket.features && ticket.features.length > 0 && (
        <ul className="mt-6 space-y-3">
          {ticket.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check
                className={cn(
                  "mt-0.5 h-4 w-4 flex-shrink-0",
                  isPopular ? "text-purple-600" : "text-green-500"
                )}
              />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Available count */}
      {ticket.available !== undefined && (
        <p className="mt-6 text-center text-xs font-medium text-gray-400">
          {ticket.available > 0 ? (
            <>
              <span
                className={cn(
                  "font-semibold",
                  ticket.available <= 10 ? "text-amber-600" : "text-gray-600"
                )}
              >
                {ticket.available}
              </span>{" "}
              tickets remaining
            </>
          ) : (
            <span className="font-semibold text-red-500">Sold out</span>
          )}
        </p>
      )}

      {/* CTA button */}
      <div className="mt-auto pt-6">
        <button
          type="button"
          disabled={ticket.available === 0}
          className={cn(
            "w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:cursor-not-allowed disabled:opacity-50",
            isPopular
              ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700"
              : "border border-purple-200 bg-white text-purple-600 hover:bg-purple-50"
          )}
        >
          {ticket.available === 0 ? "Sold Out" : "Select Ticket"}
        </button>
      </div>
    </div>
  );
}
