import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Building2,
  Globe,
  Users,
  Share2,
  ChevronRight,
  Tag,
  CheckCircle2,
  Gift,
} from "lucide-react";
import { getJobById, jobs } from "@/lib/data";
import { formatSalary, timeAgo } from "@/lib/utils";

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = getJobById(params.id);

  if (!job) {
    notFound();
  }

  const typeLabels: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    remote: "Remote",
  };

  const levelLabels: Record<string, string> = {
    junior: "Junior",
    mid: "Mid-level",
    senior: "Senior",
    lead: "Lead",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/jobs" className="hover:text-brand-600 transition-colors">
          Jobs
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{job.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-brand-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {job.title}
                </h1>
                <Link
                  href={`/companies/${job.company.id}`}
                  className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  {job.company.name}
                </Link>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium">
                <Briefcase className="w-3.5 h-3.5" />
                {typeLabels[job.type]}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                <Users className="w-3.5 h-3.5" />
                {levelLabels[job.level]}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                {formatSalary(job.salary.min, job.salary.max)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Posted {timeAgo(job.postedAt)}
            </div>
          </div>

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              About This Role
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </section>

          {/* Requirements */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              Requirements
            </h2>
            <ul className="space-y-3">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Benefits */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-600" />
              Benefits
            </h2>
            <ul className="space-y-3">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Tags */}
          {job.tags.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-500" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            {/* Apply CTA */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <Link
                href={`/jobs/${job.id}/apply`}
                className="block w-full text-center bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors mb-3"
              >
                Apply Now
              </Link>
              <button className="flex items-center justify-center gap-2 w-full text-gray-600 hover:text-gray-900 px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Company Info */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                About {job.company.name}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {job.company.industry}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {job.company.size} employees
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {job.company.location}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    {job.company.website}
                  </a>
                </div>
              </div>
              <Link
                href={`/companies/${job.company.id}`}
                className="block mt-4 text-sm text-center text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                View Company Profile
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
