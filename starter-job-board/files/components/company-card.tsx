import Link from "next/link";
import { MapPin, Users, Briefcase } from "lucide-react";
import type { Company } from "@/types";

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="group block rounded-xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Logo placeholder */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-base font-bold text-gray-400">
          {company.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
            {company.name}
          </h3>
          <span className="mt-1 inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {company.industry}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {company.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {company.size}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5" />
          {company.openPositions} open{" "}
          {company.openPositions === 1 ? "position" : "positions"}
        </span>
      </div>
    </Link>
  );
}
