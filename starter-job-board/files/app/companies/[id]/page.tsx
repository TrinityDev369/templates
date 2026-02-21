import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { getCompanyById, getJobsByCompany, companies } from "@/lib/data";
import { JobCard } from "@/components/job-card";

export function generateStaticParams() {
  return companies.map((company) => ({ id: company.id }));
}

export default function CompanyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const company = getCompanyById(params.id);

  if (!company) {
    notFound();
  }

  const companyJobs = getJobsByCompany(company.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/companies"
          className="hover:text-brand-600 transition-colors"
        >
          Companies
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{company.name}</span>
      </nav>

      {/* Company Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-10 h-10 text-brand-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {company.name}
            </h1>
            <p className="text-gray-600 mb-5">{company.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                {company.industry}
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                {company.size} employees
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {company.location}
              </span>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
          <span className="text-sm text-gray-500">
            {companyJobs.length} position{companyJobs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {companyJobs.length > 0 ? (
          <div className="space-y-4">
            {companyJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No open positions
            </h3>
            <p className="text-gray-500">
              This company has no open positions at the moment.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
