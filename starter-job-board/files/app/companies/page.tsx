import { Building2, MapPin, Users } from "lucide-react";
import { companies } from "@/lib/data";
import Link from "next/link";

export default function CompaniesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Companies Hiring Now
        </h1>
        <p className="text-gray-600">
          Discover great places to work and explore their open positions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.id}`}
            className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                <Building2 className="w-7 h-7 text-brand-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                  {company.name}
                </h3>
                <p className="text-sm text-gray-500">{company.industry}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {company.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {company.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {company.size}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-brand-600">
                {company.openPositions} open position
                {company.openPositions !== 1 ? "s" : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
