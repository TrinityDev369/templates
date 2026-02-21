import { Phone, Mail, Home } from "lucide-react";
import type { Agent } from "@/types";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      {/* Avatar and Info */}
      <div className="flex flex-col items-center text-center">
        {/* Circular Avatar */}
        <div className="relative mb-4">
          <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-brand-50">
            {agent.image ? (
              <img
                src={agent.image}
                alt={agent.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                <span className="text-2xl font-bold text-brand-700">
                  {agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
            )}
          </div>
          {/* Listings Badge */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            <Home className="mr-1 inline-block h-3 w-3" />
            {agent.listingsCount} Listings
          </span>
        </div>

        {/* Name and Title */}
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          {agent.name}
        </h3>
        <p className="text-sm text-gray-500">{agent.title}</p>

        {/* Specialties */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {agent.specialties.map((specialty) => (
            <span
              key={specialty}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Contact Actions */}
      <div className="mt-5 space-y-2 border-t border-gray-100 pt-5">
        <a
          href={`tel:${agent.phone}`}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <Phone className="h-4 w-4" />
          {agent.phone}
        </a>
        <a
          href={`mailto:${agent.email}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Mail className="h-4 w-4" />
          Send Email
        </a>
      </div>
    </div>
  );
}
